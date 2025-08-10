import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPatientSchema, insertConsultationSchema } from "@shared/schema";
import { zfd } from "zod-form-data";
import multer, { type MulterError } from "multer";
import path from "path";
import { randomUUID } from "crypto";
import { aiProcessor } from "./ai-processor";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all patients
  app.get("/api/patients", async (req, res) => {
    try {
      const patients = await storage.getAllPatients();
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  // Create new patient
  app.post("/api/patients", async (req, res) => {
    try {
      const validatedData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(validatedData);
      res.status(201).json(patient);
    } catch (error) {
      res.status(400).json({ message: "Invalid patient data" });
    }
  });

  // Get all consultations
  app.get("/api/consultations", async (req, res) => {
    try {
      const consultations = await storage.getAllConsultations();
      res.json(consultations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch consultations" });
    }
  });

  // Create new consultation
  app.post("/api/consultations", async (req, res) => {
    try {
      const validatedData = insertConsultationSchema.parse(req.body);
      const consultation = await storage.createConsultation(validatedData);
      res.status(201).json(consultation);
    } catch (error) {
      res.status(400).json({ message: "Invalid consultation data" });
    }
  });

  // Upload image for analysis
  app.post("/api/upload-image", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const imageId = randomUUID();
      const imageUrl = `/uploads/${req.file.filename}`;
      
      // Store image metadata
      await storage.storeImageMetadata({
        id: imageId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: imageUrl,
      });

      res.json({ 
        success: true, 
        imageId,
        imageUrl,
        message: "Image uploaded successfully" 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // AI Visualization Endpoints
  app.post('/api/generate-surgical-preview', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image provided' });
      }

      const { procedureType, intensity = 50 } = req.body;
      
      const request = {
        imageUrl: req.file.path,
        procedureType: procedureType || 'rhinoplasty',
        intensity: parseInt(intensity),
      };

      const resultUrl = await aiProcessor.generateSurgicalVisualization(request);
      
      res.json({ 
        success: true, 
        afterImageUrl: resultUrl,
        originalImageUrl: `/uploads/${req.file.filename}`
      });

    } catch (error) {
      console.error('Surgical preview error:', error);
      res.status(500).json({ 
        error: 'Failed to generate surgical preview',
        details: (error as Error).message 
      });
    }
  });

  app.post('/api/apply-makeup', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image provided' });
      }

      const { makeupType, color, intensity = 50 } = req.body;
      
      const request = {
        imageUrl: req.file.path,
        makeupType: makeupType || 'lipstick', 
        color: color || '#FF6B6B',
        intensity: parseInt(intensity),
      };

      const resultUrl = await aiProcessor.applyMakeup(request);
      
      res.json({ 
        success: true, 
        makeupImageUrl: resultUrl,
        originalImageUrl: `/uploads/${req.file.filename}`
      });

    } catch (error) {
      console.error('Makeup application error:', error);
      res.status(500).json({ 
        error: 'Failed to apply makeup',
        details: (error as Error).message 
      });
    }
  });

  app.post('/api/age-progression', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image provided' });
      }

      const { targetAge = 40 } = req.body;
      
      const resultUrl = await aiProcessor.generateAgeProgression(
        req.file.path, 
        parseInt(targetAge)
      );
      
      res.json({ 
        success: true, 
        agedImageUrl: resultUrl,
        originalImageUrl: `/uploads/${req.file.filename}`
      });

    } catch (error) {
      console.error('Age progression error:', error);
      res.status(500).json({ 
        error: 'Failed to generate age progression',
        details: (error as Error).message 
      });
    }
  });

  app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image provided' });
      }

      const analysis = await aiProcessor.analyzeImage(req.file.path);
      
      res.json({ 
        success: true, 
        analysis,
        imageUrl: `/uploads/${req.file.filename}`
      });

    } catch (error) {
      console.error('Image analysis error:', error);
      res.status(500).json({ 
        error: 'Failed to analyze image',
        details: (error as Error).message 
      });
    }
  });

  // Serve uploaded images
  app.use("/uploads", express.static("uploads"));

  const httpServer = createServer(app);
  return httpServer;
}
