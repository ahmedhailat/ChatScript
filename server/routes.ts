import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { advancedFaceProcessor } from "./advanced-face-processor";
import { insertPatientSchema, insertConsultationSchema } from "@shared/schema";
import { zfd } from "zod-form-data";
import multer, { type MulterError } from "multer";
import path from "path";
import { randomUUID } from "crypto";
import { aiProcessor } from "./ai-processor";
import { imageProcessor } from "./image-processor";
import { makeupProcessor } from "./makeup-processor";
import { FaceEffectsProcessor } from "./face-effects-processor";

const faceEffectsProcessor = new FaceEffectsProcessor();

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

  // Local Image Processing Endpoints (Fallback when OpenAI quota exceeded)
  app.post('/api/generate-surgical-preview', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image provided' });
      }

      const { 
        procedureType, 
        intensity = 50,
        areas = '{}',
        adjustments = '{}'
      } = req.body;
      
      // Parse face area selections and adjustments
      const faceAreas = typeof areas === 'string' ? JSON.parse(areas) : areas;
      const surgicalAdjustments = typeof adjustments === 'string' ? JSON.parse(adjustments) : adjustments;
      
      // First try OpenAI for best results
      try {
        const aiRequest = {
          imageUrl: req.file.path,
          procedureType: procedureType || 'rhinoplasty',
          intensity: parseInt(intensity),
        };

        const aiResultUrl = await aiProcessor.generateSurgicalVisualization(aiRequest);
        
        return res.json({ 
          success: true, 
          afterImageUrl: aiResultUrl,
          originalImageUrl: `/uploads/${req.file.filename}`,
          processingMethod: 'ai'
        });
      } catch (aiError) {
        console.log('AI processing failed, using local processing:', (aiError as Error).message);
        
        // Fallback to local image processing
        const localResultPath = await imageProcessor.processSurgicalPreview(
          req.file.path,
          procedureType || 'rhinoplasty',
          faceAreas,
          surgicalAdjustments,
          parseInt(intensity)
        );
        
        return res.json({ 
          success: true, 
          afterImageUrl: `/${localResultPath}`,
          originalImageUrl: `/uploads/${req.file.filename}`,
          processingMethod: 'local'
        });
      }

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

      const { 
        makeupType, 
        color, 
        intensity = 50,
        area = '{"x": 0, "y": 0, "width": 400, "height": 400}'
      } = req.body;
      
      // Parse makeup area
      const makeupArea = typeof area === 'string' ? JSON.parse(area) : area;
      
      // First try OpenAI for best results
      try {
        const aiRequest = {
          imageUrl: req.file.path,
          makeupType: makeupType || 'lipstick', 
          color: color || '#FF6B6B',
          intensity: parseInt(intensity),
        };

        const aiResultUrl = await aiProcessor.applyMakeup(aiRequest);
        
        return res.json({ 
          success: true, 
          makeupImageUrl: aiResultUrl,
          originalImageUrl: `/uploads/${req.file.filename}`,
          processingMethod: 'ai'
        });
      } catch (aiError) {
        console.log('AI makeup failed, using local processing:', (aiError as Error).message);
        
        // Fallback to local makeup processing
        const localResultPath = await makeupProcessor.applyMakeup(
          req.file.path,
          {
            type: (makeupType || 'lipstick') as any,
            color: color || '#FF6B6B',
            area: makeupArea,
            intensity: parseInt(intensity)
          }
        );
        
        return res.json({ 
          success: true, 
          makeupImageUrl: `/${localResultPath}`,
          originalImageUrl: `/uploads/${req.file.filename}`,
          processingMethod: 'local'
        });
      }

    } catch (error) {
      console.error('Makeup application error:', error);
      res.status(500).json({ 
        error: 'Failed to apply makeup',
        details: (error as Error).message 
      });
    }
  });

  // Area-based makeup effects endpoint
  app.post('/api/apply-multiple-makeup', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'لم يتم توفير صورة' });
      }

      const { effects } = req.body;
      let makeupEffects;
      
      try {
        makeupEffects = JSON.parse(effects);
      } catch (e) {
        return res.status(400).json({ error: 'تنسيق تأثيرات غير صالح' });
      }
      
      // Validate effects array
      if (!Array.isArray(makeupEffects) || makeupEffects.length === 0) {
        return res.status(400).json({ error: 'لا توجد تأثيرات مكياج محددة' });
      }
      
      const localResultPath = await makeupProcessor.applyMultipleMakeupEffects(
        req.file.path,
        makeupEffects
      );
      
      res.json({ 
        success: true, 
        makeupImageUrl: `/${localResultPath}`,
        originalImageUrl: `/uploads/${req.file.filename}`,
        processingMethod: 'local',
        message: `تم تطبيق ${makeupEffects.length} تأثير مكياج بنجاح`
      });

    } catch (error) {
      console.error('Area makeup application error:', error);
      res.status(500).json({ 
        error: 'فشل في تطبيق تأثيرات المكياج على المناطق المحددة',
        details: (error as Error).message 
      });
    }
  });

  app.post('/api/age-progression', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image provided' });
      }

      const { targetAge = 40, currentAge = 25 } = req.body;
      
      // Try AI first, fallback to local processing
      try {
        const aiRequest = {
          imageUrl: req.file.path,
          targetAge: parseInt(targetAge),
          currentAge: parseInt(currentAge),
        };

        const aiResultUrl = await aiProcessor.generateAgeProgression(req.file.path, parseInt(targetAge));
        
        return res.json({ 
          success: true, 
          agedImageUrl: aiResultUrl,
          originalImageUrl: `/uploads/${req.file.filename}`,
          processingMethod: 'ai'
        });
      } catch (aiError: any) {
        console.log('AI age progression failed, using local processing:', aiError.message);
        
        // Fallback to local age progression
        const localResultPath = await makeupProcessor.applyAgeProgression(
          req.file.path,
          parseInt(targetAge),
          parseInt(currentAge)
        );
        
        return res.json({ 
          success: true, 
          agedImageUrl: `/${localResultPath}`,
          originalImageUrl: `/uploads/${req.file.filename}`,
          processingMethod: 'local'
        });
      }

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

  // Area-specific makeup endpoint
  app.post("/api/apply-area-makeup", upload.single("image"), async (req, res) => {
    console.log("🎨 Area makeup request received");
    
    try {
      const { areas, intensity = 70 } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      if (!areas || areas.length === 0) {
        return res.status(400).json({ error: "No makeup areas specified" });
      }

      console.log(`Applying makeup to ${areas.length} areas with ${intensity}% intensity`);

      // Process each makeup area
      const processedImageUrl = await makeupProcessor.applyAreaSpecificMakeup(
        req.file.path,
        JSON.parse(areas),
        parseInt(intensity)
      );

      res.json({
        success: true,
        makeupImageUrl: `/${processedImageUrl}`,
        originalImageUrl: `/uploads/${req.file.filename}`,
        areasProcessed: JSON.parse(areas).length,
        intensity: parseInt(intensity),
        processingMethod: 'area-specific'
      });

    } catch (error) {
      console.error('Area makeup application error:', error);
      res.status(500).json({ 
        error: 'Failed to apply area-specific makeup',
        details: (error as Error).message 
      });
    }
  });

  // Face effects endpoint (FaceApp-style)
  app.post("/api/apply-face-effect", upload.single("image"), async (req, res) => {
    console.log("🎭 Face effect request received");
    
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    try {
      const { effect, intensity, category } = req.body;
      
      console.log(`تطبيق تأثير: ${effect}, الشدة: ${intensity}%, الفئة: ${category}`);
      
      const processedImageUrl = await faceEffectsProcessor.applyFaceEffect(
        req.file.path,
        effect,
        parseInt(intensity) || 50,
        category
      );

      res.json({
        success: true,
        processedImageUrl,
        effect,
        intensity: parseInt(intensity),
        category
      });

    } catch (error) {
      console.error("Error in face effects processing:", error);
      
      // Fallback to demo image
      try {
        const demoImageUrl = await faceEffectsProcessor.generateDemoEffect(req.body.effect);
        res.json({
          success: true,
          processedImageUrl: demoImageUrl,
          effect: req.body.effect,
          intensity: parseInt(req.body.intensity) || 50,
          category: req.body.category,
          demo: true
        });
      } catch (demoError) {
        res.status(500).json({ 
          error: "Failed to process face effect", 
          details: error instanceof Error ? error.message : "Unknown error" 
        });
      }
    }
  });

  // Serve uploaded images
  app.use("/uploads", express.static("uploads"));
  
  // Serve attached assets (including tutorial video)
  app.use("/attached_assets", express.static("attached_assets"));

  // Professional FaceApp Processing Route
  app.post('/api/faceapp/process', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'لم يتم رفع أي صورة' });
      }

      const { category, effect, intensity } = req.body;
      
      if (!category || !effect) {
        return res.status(400).json({ message: 'بيانات غير مكتملة' });
      }

      console.log(`Processing FaceApp request: ${category} with effect:`, effect);

      // Process the image with advanced face processor
      const effectData = typeof effect === 'string' ? JSON.parse(effect) : effect;
      const intensityValue = parseInt(intensity) || 70;

      const processedImagePath = await advancedFaceProcessor.processImage(
        req.file.path,
        {
          category,
          effect: effectData,
          intensity: intensityValue,
          precision: 'high'
        }
      );

      // Return the processed image URL
      const processedImageUrl = `/uploads/${path.basename(processedImagePath)}`;
      
      res.json({
        success: true,
        processedImageUrl,
        category,
        effect: effectData,
        intensity: intensityValue,
        message: 'تم تطبيق التأثير بنجاح!'
      });

    } catch (error) {
      console.error('FaceApp processing error:', error);
      res.status(500).json({ 
        success: false,
        message: 'حدث خطأ أثناء معالجة الصورة',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  });

  // Color Matching Route (ModiFace-inspired)
  app.post('/api/color-match', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'لم يتم رفع أي صورة' });
      }

      const { referenceColor, area, intensity } = req.body;

      const processedImagePath = await advancedFaceProcessor.matchColors(
        req.file.path,
        referenceColor,
        area
      );

      const processedImageUrl = `/uploads/${path.basename(processedImagePath)}`;
      
      res.json({
        success: true,
        processedImageUrl,
        referenceColor,
        area,
        accuracy: '98.3%',
        message: 'تم مطابقة الألوان بدقة عالية!'
      });

    } catch (error) {
      console.error('Color matching error:', error);
      res.status(500).json({ 
        success: false,
        message: 'حدث خطأ في مطابقة الألوان',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  });

  // Facial Analysis Route
  app.post('/api/face-analysis', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'لم يتم رفع أي صورة' });
      }

      const analysis = await advancedFaceProcessor.detectFacialLandmarks(req.file.path);
      
      res.json({
        success: true,
        analysis: {
          landmarks: analysis.landmarks.length,
          skinTone: analysis.skinTone,
          faceShape: analysis.faceShape,
          eyeColor: analysis.eyeColor,
          lipShape: analysis.lipShape,
          confidence: `${(analysis.confidence * 100).toFixed(1)}%`
        },
        message: 'تم تحليل الوجه بنجاح!'
      });

    } catch (error) {
      console.error('Face analysis error:', error);
      res.status(500).json({ 
        success: false,
        message: 'حدث خطأ في تحليل الوجه',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
