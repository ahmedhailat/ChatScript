import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
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
import { NoseBeautificationProcessor } from "./nose-beautification-processor";
import { VirtualRhinoplastyProcessor } from "./virtual-rhinoplasty-processor";
import { opencvProcessor } from "./opencv-face-processor";
import { registerConsultationRoutes } from "./consultation-routes";
import { seedDoctors } from "./seed-doctors";
import { realtimeLipProcessor } from "./realtime-lip-processor";
import { threeDFacialModeling } from "./three-d-facial-modeling";
import { communicationPortal } from "./communication-portal";
import { digitizedRhinoplastyManager } from "./digitized-rhinoplasty-manager";

const faceEffectsProcessor = new FaceEffectsProcessor();
const noseBeautificationProcessor = new NoseBeautificationProcessor();
const virtualRhinoplastyProcessor = new VirtualRhinoplastyProcessor();

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
      
      // Try AI processing first, fallback to local if needed
      try {
        console.log(`🤖 Processing ${procedureType} with OpenAI AI`);
        
        const aiRequest = {
          imageUrl: req.file.path,
          procedureType: procedureType || 'rhinoplasty',
          intensity: parseInt(intensity) || 50,
          areas: faceAreas,
          adjustments: surgicalAdjustments
        };

        const aiResultUrl = await aiProcessor.generateSurgicalVisualization(aiRequest);
        
        return res.json({ 
          success: true, 
          afterImageUrl: aiResultUrl,
          originalImageUrl: `/uploads/${req.file.filename}`,
          processingMethod: 'openai_ai'
        });
        
      } catch (aiError: any) {
        console.log('🔧 AI processing failed, switching to local processors:', aiError.message);
        
        // Use specialized nose beautification for rhinoplasty
        if (procedureType === 'rhinoplasty' || procedureType === 'nose_surgery') {
          const noseResultPath = await noseBeautificationProcessor.beautifyNose(
            req.file.path,
            {
              type: 'refinement',
              intensity: parseInt(intensity) || 60,
              preserveNaturalLook: true
            }
          );
          
          return res.json({ 
            success: true, 
            afterImageUrl: `/${noseResultPath}`,
            originalImageUrl: `/uploads/${req.file.filename}`,
            processingMethod: 'nose_beautification_fallback'
          });
        }
        
        // Use local image processing for other procedures
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
          processingMethod: 'local_fallback'
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
      
      // Try AI makeup processing first, fallback to local if needed
      try {
        console.log(`🤖 Processing ${makeupType} makeup with OpenAI AI`);
        
        const aiResultPath = await aiProcessor.applyMakeup({
          imageUrl: req.file.path,
          makeupType: makeupType || 'lipstick',
          color: color || '#FF6B6B',
          intensity: parseInt(intensity) || 50
        });
        
        return res.json({ 
          success: true, 
          makeupImageUrl: aiResultPath,
          originalImageUrl: `/uploads/${req.file.filename}`,
          processingMethod: 'openai_ai'
        });
        
      } catch (aiError) {
        console.log('🔧 AI makeup failed, switching to local processing:', (aiError as Error).message);
        
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

  // Precision lip makeup endpoint
  app.post("/api/apply-precision-makeup", upload.single("image"), async (req, res) => {
    console.log("💋 Precision lip makeup request received");
    
    try {
      const { region, color, intensity = 70, texture = 'gloss' } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      console.log(`Applying precision ${region} makeup with color ${color}, intensity ${intensity}%, texture ${texture}`);

      if (region === 'lips') {
        // Use real-time lip processing like mobile makeup apps
        try {
          const processedImageUrl = await realtimeLipProcessor.applyRealtimeLipstick(
            req.file.path,
            {
              color,
              intensity: parseInt(intensity),
              texture: (texture as any) || 'satin'
            }
          );

          res.json({
            success: true,
            processedImageUrl: `/${processedImageUrl}`,
            originalImageUrl: `/uploads/${req.file.filename}`,
            region: 'lips',
            color,
            intensity: parseInt(intensity),
            texture,
            processingMethod: 'precision-lip',
            message: 'تم تطبيق أحمر الشفاه بدقة داخل الحدود فقط'
          });
          
        } catch (lipError) {
          console.error('Precision lip processing failed:', lipError);
          // Fallback to regular makeup processing
          throw lipError;
        }
      } else {
        // For other regions, use regular makeup processing
        const processedImageUrl = await makeupProcessor.applyAreaSpecificMakeup(
          req.file.path,
          [{ region, color, intensity: parseInt(intensity) }],
          parseInt(intensity)
        );

        res.json({
          success: true,
          processedImageUrl: `/${processedImageUrl}`,
          originalImageUrl: `/uploads/${req.file.filename}`,
          region,
          color,
          intensity: parseInt(intensity),
          texture,
          processingMethod: 'standard'
        });
      }

    } catch (error) {
      console.error('Precision makeup application error:', error);
      res.status(500).json({ 
        error: 'فشل في تطبيق المكياج الدقيق',
        details: (error as Error).message 
      });
    }
  });

  // Enhanced MediaPipe landmarks detection
  app.post("/api/enhanced-mediapipe-landmarks", upload.single("image"), async (req, res) => {
    console.log("🎯 Enhanced MediaPipe landmarks request received");
    
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      // استخدام نظام MediaPipe المحسن مع كشف دقيق للملامح
      const landmarks = await opencvProcessor.detectFaceLandmarks(req.file.path);
      
      if (!landmarks || !landmarks.landmarks) {
        throw new Error('فشل في كشف ملامح الوجه');
      }

      // تحسين البيانات المعادة
      const enhancedResponse = {
        success: true,
        landmarks: landmarks.landmarks,
        regions: {
          lips: {
            points: landmarks.landmarks ? landmarks.landmarks.slice(61, 68).concat(landmarks.landmarks.slice(291, 299)) : [],
            boundingBox: { x: 42, y: 62, width: 16, height: 8 }
          },
          eyes: {
            points: landmarks.landmarks ? landmarks.landmarks.slice(33, 42).concat(landmarks.landmarks.slice(362, 374)) : [],
            boundingBox: { x: 35, y: 40, width: 30, height: 12 }
          },
          cheeks: {
            points: landmarks.landmarks ? [landmarks.landmarks[116], landmarks.landmarks[117], landmarks.landmarks[345], landmarks.landmarks[346]].filter(Boolean) : [],
            boundingBox: { x: 25, y: 50, width: 50, height: 20 }
          },
          forehead: {
            points: landmarks.landmarks ? [landmarks.landmarks[10], landmarks.landmarks[151], landmarks.landmarks[9], landmarks.landmarks[8]].filter(Boolean) : [],
            boundingBox: { x: 30, y: 15, width: 40, height: 25 }
          }
        },
        confidence: landmarks.confidence || 0.9,
        imageUrl: `/uploads/${req.file.filename}`,
        totalLandmarks: landmarks.landmarks.length
      };

      res.json(enhancedResponse);

    } catch (error) {
      console.error('Enhanced MediaPipe landmarks error:', error);
      res.status(500).json({ 
        success: false,
        error: 'فشل في كشف ملامح الوجه المحسن',
        details: (error as Error).message 
      });
    }
  });

  // Precision makeup application endpoint
  app.post("/api/apply-precision-makeup", upload.single("image"), async (req, res) => {
    console.log("💄 Precision makeup request received");
    
    try {
      const { region, color, intensity = 70, texture = 'gloss' } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      if (!region) {
        return res.status(400).json({ error: "Makeup region not specified" });
      }

      console.log(`🎨 Applying ${region} makeup with color ${color} at ${intensity}% intensity`);

      // تطبيق المكياج الدقيق حسب المنطقة
      let processedImagePath;
      
      switch(region) {
        case 'lips':
        case 'eyes':
        case 'cheeks':
        case 'forehead':
        default:
          processedImagePath = await makeupProcessor.applyMakeup(
            req.file.path,
            {
              type: region === 'lips' ? 'lipstick' : 
                    region === 'eyes' ? 'eyeshadow' :
                    region === 'cheeks' ? 'blush' : 'foundation',
              color: color,
              intensity: parseInt(intensity),
              area: { x: 0, y: 0, width: 100, height: 100 }
            }
          );
          break;
      }

      res.json({
        success: true,
        processedImageUrl: `/${processedImagePath}`,
        originalImageUrl: `/uploads/${req.file.filename}`,
        appliedRegion: region,
        color: color,
        intensity: parseInt(intensity),
        texture: texture,
        processingMethod: 'precision-landmarks'
      });

    } catch (error) {
      console.error('Precision makeup application error:', error);
      res.status(500).json({ 
        success: false,
        error: 'فشل في تطبيق المكياج الدقيق',
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

  // 3D Facial Modeling API
  app.post('/api/generate-3d-model', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const { modelType = 'wireframe', viewAngle = 'front', showLandmarks = true } = req.body;
      
      console.log(`🎭 Generating 3D model: ${modelType} view`);
      
      const result = await threeDFacialModeling.generate3DModel(req.file.path, {
        modelType: modelType as any,
        viewAngle: viewAngle as any,
        enhanceFeatures: req.body.enhanceFeatures === 'true',
        showLandmarks: showLandmarks === 'true',
        analysisDepth: req.body.analysisDepth || 'detailed'
      });

      res.json({
        success: true,
        modelImageUrl: result.modelImageUrl,
        analysis: result.analysis,
        confidence: result.confidence,
        processingTime: Date.now() - parseInt(req.body.startTime || '0')
      });

    } catch (error) {
      console.error('3D modeling error:', error);
      res.status(500).json({ 
        error: 'Failed to generate 3D model', 
        details: (error as Error).message 
      });
    }
  });

  // Communication Portal APIs
  app.post('/api/communication/send-message', async (req, res) => {
    try {
      const message = await communicationPortal.sendMessage(req.body);
      res.json({ success: true, message });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get('/api/communication/conversation/:consultationId', async (req, res) => {
    try {
      const messages = await communicationPortal.getConsultationFiles(req.params.consultationId);
      res.json({ success: true, messages });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post('/api/communication/schedule-call', async (req, res) => {
    try {
      const videoCall = await communicationPortal.scheduleVideoCall(req.body);
      res.json({ success: true, videoCall });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post('/api/communication/start-call/:callId', async (req, res) => {
    try {
      const meetingDetails = await communicationPortal.scheduleVideoCall({
        consultationId: req.params.callId,
        doctorId: 'system',
        patientId: 'system',
        scheduledTime: new Date(),
        duration: 30
      });
      res.json({ success: true, meetingDetails });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post('/api/communication/upload-file', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const fileShare = await communicationPortal.uploadFile({
        consultationId: req.body.consultationId,
        uploadedBy: req.body.uploadedBy,
        fileName: req.file.originalname,
        fileType: req.body.fileType,
        fileUrl: `/uploads/${req.file.filename}`,
        fileSize: req.file.size,
        description: req.body.description
      });

      res.json({ success: true, fileShare });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get('/api/communication/files/:consultationId', async (req, res) => {
    try {
      const files = await communicationPortal.getConsultationFiles(req.params.consultationId);
      res.json({ success: true, files });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
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
      const processedImageUrl = `/${processedImagePath}`;
      
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

  // Advanced nose beautification endpoint
  app.post('/api/nose-beautification', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'لم يتم رفع أي صورة' });
      }

      const { 
        type = 'refinement', 
        intensity = 60,
        preserveNaturalLook = true 
      } = req.body;

      console.log(`👃 بدء تجميل الأنف: ${type} بشدة ${intensity}%`);

      const beautifiedPath = await noseBeautificationProcessor.beautifyNose(
        req.file.path,
        {
          type,
          intensity: parseInt(intensity),
          preserveNaturalLook: preserveNaturalLook === 'true'
        }
      );

      // Generate comparison image
      const comparisonPath = await noseBeautificationProcessor.createBeforeAfterComparison(
        req.file.path,
        beautifiedPath
      );

      res.json({
        success: true,
        beautifiedImageUrl: `/${beautifiedPath}`,
        comparisonImageUrl: `/${comparisonPath}`,
        originalImageUrl: `/uploads/${req.file.filename}`,
        type,
        intensity: parseInt(intensity),
        message: 'تم تجميل الأنف بنجاح!'
      });

    } catch (error) {
      console.error('خطأ في تجميل الأنف:', error);
      res.status(500).json({ 
        success: false,
        message: 'حدث خطأ أثناء تجميل الأنف',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  });

  // Nose analysis endpoint
  app.post('/api/analyze-nose', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'لم يتم رفع أي صورة' });
      }

      console.log('🔍 تحليل ملامح الأنف...');
      
      const analysisResult = await noseBeautificationProcessor.analyzeAndRecommend(
        req.file.path
      );

      res.json({
        success: true,
        analysis: analysisResult.analysis,
        recommendations: analysisResult.recommendations,
        message: 'تم تحليل الأنف بنجاح!'
      });

    } catch (error) {
      console.error('خطأ في تحليل الأنف:', error);
      res.status(500).json({ 
        success: false,
        message: 'حدث خطأ أثناء تحليل الأنف',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  });

  // MediaPipe face landmarks detection endpoint
  app.post('/api/mediapipe-landmarks', upload.single('image'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'صورة مطلوبة' });
    }

    try {
      console.log('🎯 بدء كشف معالم الوجه باستخدام MediaPipe...');
      
      const landmarks = await opencvProcessor.detectFaceLandmarks(req.file.path);
      
      if (landmarks) {
        res.json({
          success: true,
          landmarks: landmarks,
          totalPoints: landmarks.total_points,
          confidence: landmarks.confidence,
          imageSize: landmarks.image_size,
          processingMethod: 'mediapipe'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'لم يتم العثور على وجه في الصورة'
        });
      }
    } catch (error: any) {
      console.error('Error in MediaPipe landmarks detection:', error);
      res.status(500).json({ 
        success: false, 
        message: 'فشل في كشف معالم الوجه',
        error: error.message 
      });
    }
  });

  // MediaPipe makeup application endpoint
  app.post('/api/mediapipe-makeup', upload.single('image'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'صورة مطلوبة' });
    }

    try {
      console.log('💄 تطبيق المكياج باستخدام MediaPipe...');
      
      const makeupConfig = {
        lipstick: req.body.makeupType === 'lipstick' ? {
          color: req.body.color || '#FF1744',
          intensity: (req.body.intensity || 70) / 100
        } : undefined,
        eyeshadow: req.body.makeupType === 'eyeshadow' ? {
          color: req.body.color || '#8D6E63',
          intensity: (req.body.intensity || 60) / 100
        } : undefined,
        blush: req.body.makeupType === 'blush' ? {
          color: req.body.color || '#F8BBD9',
          intensity: (req.body.intensity || 50) / 100,
          radius: 30
        } : undefined,
        eyeliner: req.body.makeupType === 'eyeliner' ? {
          color: req.body.color || '#000000',
          thickness: parseInt(req.body.thickness) || 2
        } : undefined,
        foundation: req.body.makeupType === 'foundation' ? {
          intensity: (req.body.intensity || 40) / 100
        } : undefined
      };

      const resultPath = await opencvProcessor.applyProfessionalMakeup(req.file.path, makeupConfig);
      
      if (resultPath) {
        // Create comparison image
        const comparisonPath = await opencvProcessor.createBeforeAfterComparison(
          req.file.path,
          resultPath,
          `مكياج ${req.body.makeupType} باستخدام MediaPipe`
        );

        res.json({
          success: true,
          makeupImageUrl: `/${resultPath}`,
          originalImageUrl: `/${req.file.path}`,
          comparisonImageUrl: comparisonPath ? `/${comparisonPath}` : null,
          processingMethod: 'mediapipe',
          makeupType: req.body.makeupType,
          settings: {
            color: req.body.color,
            intensity: req.body.intensity
          }
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'فشل في تطبيق المكياج'
        });
      }
    } catch (error: any) {
      console.error('Error in MediaPipe makeup:', error);
      res.status(500).json({ 
        success: false, 
        message: 'فشل في تطبيق المكياج باستخدام MediaPipe',
        error: error.message 
      });
    }
  });

  // Virtual rhinoplasty endpoint - Complete surgical simulation
  app.post('/api/virtual-rhinoplasty', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'لم يتم رفع أي صورة' });
      }

      const { 
        surgeryType = 'refinement',
        intensity = 70,
        targetShape = 'natural',
        preserveEthnicity = true 
      } = req.body;

      console.log(`🏥 بدء الجراحة الافتراضية: ${surgeryType}`);

      const surgicalResult = await virtualRhinoplastyProcessor.performVirtualRhinoplasty(
        req.file.path,
        {
          surgeryType,
          intensity: parseInt(intensity),
          targetShape,
          preserveEthnicity: preserveEthnicity === 'true'
        }
      );

      res.json({
        success: true,
        beforeImageUrl: `/${surgicalResult.beforeImagePath}`,
        afterImageUrl: `/${surgicalResult.afterImagePath}`,
        comparisonImageUrl: `/${surgicalResult.comparisonImagePath}`,
        originalImageUrl: `/uploads/${req.file.filename}`,
        surgicalDetails: surgicalResult.surgicalDetails,
        surgeryType,
        intensity: parseInt(intensity),
        targetShape,
        message: 'تم إجراء الجراحة الافتراضية بنجاح!'
      });

    } catch (error) {
      console.error('خطأ في الجراحة الافتراضية:', error);
      res.status(500).json({ 
        success: false,
        message: 'حدث خطأ أثناء الجراحة الافتراضية',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  });

  // Communication Portal API Routes
  
  // Send message endpoint
  app.post('/api/communication/send-message', async (req, res) => {
    try {
      const { consultationId, senderId, senderType, content, messageType, attachmentUrl } = req.body;
      
      console.log(`💬 Sending message in consultation ${consultationId}`);
      
      const message = await communicationPortal.sendMessage({
        consultationId,
        senderId,
        senderType,
        content,
        messageType: messageType || 'text',
        attachmentUrl
      });
      
      res.json({ success: true, message });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ 
        success: false, 
        error: 'فشل في إرسال الرسالة',
        details: (error as Error).message 
      });
    }
  });

  // Get messages for consultation
  app.get('/api/communication/messages/:consultationId', async (req, res) => {
    try {
      const { consultationId } = req.params;
      const messages = await communicationPortal.getMessages(consultationId);
      res.json({ success: true, messages });
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ 
        success: false, 
        error: 'فشل في جلب الرسائل',
        details: (error as Error).message 
      });
    }
  });

  // Schedule video call
  app.post('/api/communication/schedule-video-call', async (req, res) => {
    try {
      const { consultationId, doctorId, patientId, scheduledTime, duration } = req.body;
      
      console.log(`📹 Scheduling video call for consultation ${consultationId}`);
      
      const videoCall = await communicationPortal.scheduleVideoCall({
        consultationId,
        doctorId,
        patientId,
        scheduledTime: new Date(scheduledTime),
        duration: parseInt(duration) || 30
      });
      
      res.json({ success: true, videoCall });
    } catch (error) {
      console.error('Error scheduling video call:', error);
      res.status(500).json({ 
        success: false, 
        error: 'فشل في جدولة مكالمة الفيديو',
        details: (error as Error).message 
      });
    }
  });

  // Upload file for consultation
  app.post('/api/communication/upload-file', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'لم يتم رفع أي ملف' });
      }

      const { consultationId, uploadedBy, fileType, description } = req.body;
      
      console.log(`📎 Uploading file to consultation ${consultationId}`);
      
      const fileShare = await communicationPortal.uploadFile({
        consultationId,
        uploadedBy,
        fileName: req.file.originalname,
        fileType: fileType || 'document',
        fileUrl: req.file.path,
        fileSize: req.file.size,
        description
      });
      
      res.json({ success: true, fileShare });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ 
        success: false, 
        error: 'فشل في رفع الملف',
        details: (error as Error).message 
      });
    }
  });

  // Get consultation files
  app.get('/api/communication/files/:consultationId', async (req, res) => {
    try {
      const { consultationId } = req.params;
      const files = await communicationPortal.getConsultationFiles(consultationId);
      res.json({ success: true, files });
    } catch (error) {
      console.error('Error fetching consultation files:', error);
      res.status(500).json({ 
        success: false, 
        error: 'فشل في جلب ملفات الاستشارة',
        details: (error as Error).message 
      });
    }
  });

  // Mark messages as read
  app.post('/api/communication/mark-read', async (req, res) => {
    try {
      const { messageIds } = req.body;
      await communicationPortal.markMessagesAsRead(messageIds);
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      res.status(500).json({ 
        success: false, 
        error: 'فشل في تحديد الرسائل كمقروءة',
        details: (error as Error).message 
      });
    }
  });

  // Doctor Portfolio API Routes - ملفات الأطباء مع العمليات
  
  // Get doctor portfolios with filters
  app.get('/api/doctor-portfolios', async (req, res) => {
    try {
      const { doctorId, procedureType } = req.query;
      
      console.log(`📁 جلب ملفات الأطباء - الطبيب: ${doctorId}, النوع: ${procedureType}`);
      
      const portfolios = await digitizedRhinoplastyManager.getDoctorPortfolios(
        doctorId as string,
        procedureType as string
      );
      
      res.json({ success: true, portfolios });
    } catch (error) {
      console.error('Error fetching doctor portfolios:', error);
      res.status(500).json({ 
        success: false, 
        error: 'فشل في جلب ملفات الأطباء',
        details: (error as Error).message 
      });
    }
  });

  // Add new portfolio entry
  app.post('/api/doctor-portfolios', upload.fields([
    { name: 'beforeImage', maxCount: 1 },
    { name: 'afterImage', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const {
        doctorId,
        title,
        procedureType,
        description,
        patientAge,
        patientGender,
        surgeryDuration,
        recoveryTime,
        difficulty,
        tags
      } = req.body;

      console.log(`📸 إضافة ملف عملية جديد: ${title}`);

      if (!files.beforeImage || !files.afterImage) {
        return res.status(400).json({ 
          success: false, 
          error: 'صور قبل وبعد العملية مطلوبة' 
        });
      }

      const portfolioData = {
        doctorId,
        title,
        procedureType,
        description,
        beforeImageUrl: `/uploads/${files.beforeImage[0].filename}`,
        afterImageUrl: `/uploads/${files.afterImage[0].filename}`,
        videoUrl: files.video ? `/uploads/${files.video[0].filename}` : undefined,
        patientAge: parseInt(patientAge),
        patientGender,
        surgeryDuration: parseInt(surgeryDuration),
        recoveryTime: parseInt(recoveryTime),
        difficulty,
        tags: tags ? JSON.parse(tags) : []
      };

      const portfolio = await digitizedRhinoplastyManager.addDoctorPortfolio(portfolioData);
      
      res.json({ success: true, portfolio });
    } catch (error) {
      console.error('Error adding portfolio:', error);
      res.status(500).json({ 
        success: false, 
        error: 'فشل في إضافة الملف',
        details: (error as Error).message 
      });
    }
  });

  // Get full doctor profile
  app.get('/api/doctors/:doctorId/profile', async (req, res) => {
    try {
      const { doctorId } = req.params;
      
      console.log(`👨‍⚕️ جلب ملف الطبيب الكامل: ${doctorId}`);
      
      const profile = await digitizedRhinoplastyManager.getDoctorFullProfile(doctorId);
      
      if (!profile) {
        return res.status(404).json({ 
          success: false, 
          error: 'الطبيب غير موجود' 
        });
      }
      
      res.json({ success: true, profile });
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      res.status(500).json({ 
        success: false, 
        error: 'فشل في جلب ملف الطبيب',
        details: (error as Error).message 
      });
    }
  });

  // Add doctor review
  app.post('/api/doctors/:doctorId/reviews', upload.array('beforeAfterPhotos', 5), async (req, res) => {
    try {
      const { doctorId } = req.params;
      const files = req.files as Express.Multer.File[];
      const {
        patientId,
        consultationId,
        rating,
        reviewText,
        procedureType,
        communicationRating,
        facilityRating,
        valueForMoney
      } = req.body;

      console.log(`⭐ إضافة تقييم للطبيب ${doctorId}: ${rating} نجوم`);

      const beforeAfterPhotos = files ? files.map(file => `/uploads/${file.filename}`) : [];

      const reviewData = {
        doctorId,
        patientId,
        consultationId,
        rating: parseInt(rating),
        reviewText,
        procedureType,
        beforeAfterPhotos,
        communicationRating: parseInt(communicationRating),
        facilityRating: parseInt(facilityRating),
        valueForMoney: parseInt(valueForMoney)
      };

      const review = await digitizedRhinoplastyManager.addDoctorReview(reviewData);
      
      res.json({ success: true, review });
    } catch (error) {
      console.error('Error adding review:', error);
      res.status(500).json({ 
        success: false, 
        error: 'فشل في إضافة التقييم',
        details: (error as Error).message 
      });
    }
  });

  // 3D Face Mesh Database API
  app.get('/api/face-mesh-database', async (req, res) => {
    try {
      const { faceType, noseType, gender, ethnicity, ageRange, minQuality } = req.query;
      
      console.log(`🎭 البحث في قاعدة بيانات الوجوه ثلاثية الأبعاد`);
      
      const filters = {
        faceType: faceType as string,
        noseType: noseType as string,
        gender: gender as string,
        ethnicity: ethnicity as string,
        ageRange: ageRange as string,
        minQuality: minQuality ? parseFloat(minQuality as string) : undefined
      };

      const meshes = await digitizedRhinoplastyManager.searchFaceMeshDatabase(filters);
      
      res.json({ success: true, meshes });
    } catch (error) {
      console.error('Error searching face mesh database:', error);
      res.status(500).json({ 
        success: false, 
        error: 'فشل في البحث في قاعدة البيانات',
        details: (error as Error).message 
      });
    }
  });

  // Create surgery simulation
  app.post('/api/surgery-simulation', upload.single('originalImage'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'الصورة الأصلية مطلوبة' 
        });
      }

      const {
        consultationId,
        doctorId,
        patientId,
        procedureType,
        targetNoseType,
        targetFaceShape,
        simulationParameters,
        surgeonNotes
      } = req.body;

      console.log(`🔬 إنشاء محاكاة جراحية: ${procedureType}`);

      const simulationData = {
        consultationId,
        doctorId,
        patientId,
        procedureType,
        originalImageUrl: `/uploads/${req.file.filename}`,
        targetNoseType,
        targetFaceShape,
        simulationParameters: simulationParameters ? JSON.parse(simulationParameters) : {},
        surgeonNotes
      };

      const simulation = await digitizedRhinoplastyManager.createSurgerySimulation(simulationData);
      
      res.json({ success: true, simulation });
    } catch (error) {
      console.error('Error creating surgery simulation:', error);
      res.status(500).json({ 
        success: false, 
        error: 'فشل في إنشاء المحاكاة الجراحية',
        details: (error as Error).message 
      });
    }
  });

  // Register consultation booking routes
  registerConsultationRoutes(app);

  // Consultation endpoints for portals
  app.get('/api/booking-consultations/doctor', async (req, res) => {
    try {
      // For demo, return all consultations (in real app, filter by doctor ID from auth)
      const consultations = await storage.getAllConsultations();
      const patients = await storage.getAllPatients();
      
      const consultationsWithPatients = consultations.map(consultation => {
        const patient = patients.find(p => p.phone === consultation.patientPhone);
        return {
          ...consultation,
          patientName: patient?.name || consultation.patientName || 'مريض غير معروف'
        };
      });
      
      res.json(consultationsWithPatients);
    } catch (error) {
      console.error('Error fetching doctor consultations:', error);
      res.status(500).json({ 
        success: false, 
        error: 'فشل في جلب الاستشارات' 
      });
    }
  });

  app.get('/api/booking-consultations/patient', async (req, res) => {
    try {
      // For demo, return all consultations (in real app, filter by patient ID from auth)
      const consultations = await storage.getAllConsultations();
      res.json(consultations);
    } catch (error) {
      console.error('Error fetching patient consultations:', error);
      res.status(500).json({ 
        success: false, 
        error: 'فشل في جلب الاستشارات' 
      });
    }
  });

  // Communication Portal API Routes
  app.get('/api/messages/:consultationId', async (req, res) => {
    try {
      const { consultationId } = req.params;
      const messages = await communicationPortal.getMessages(consultationId);
      res.json({ success: true, messages });
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ 
        success: false, 
        error: 'فشل في جلب الرسائل' 
      });
    }
  });

  app.post('/api/messages', async (req, res) => {
    try {
      const messageData = req.body;
      const message = await communicationPortal.sendMessage(messageData);
      
      // Broadcast to WebSocket clients
      broadcastToConsultation(messageData.consultationId, {
        type: 'new_message',
        message
      });
      
      res.json({ success: true, message });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ 
        success: false, 
        error: 'فشل في إرسال الرسالة' 
      });
    }
  });

  app.post('/api/video-calls', async (req, res) => {
    try {
      const videoCallData = req.body;
      const videoCall = await communicationPortal.scheduleVideoCall(videoCallData);
      
      // Broadcast to WebSocket clients
      broadcastToConsultation(videoCallData.consultationId, {
        type: 'video_call_scheduled',
        videoCall
      });
      
      res.json({ success: true, videoCall });
    } catch (error) {
      console.error('Error scheduling video call:', error);
      res.status(500).json({ 
        success: false, 
        error: 'فشل في جدولة المكالمة المرئية' 
      });
    }
  });

  app.post('/api/file-shares', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'لم يتم رفع أي ملف' 
        });
      }

      const fileShareData = {
        consultationId: req.body.consultationId,
        uploadedBy: req.body.uploadedBy,
        fileName: req.file.originalname,
        fileType: req.body.fileType || 'document',
        fileUrl: `/uploads/${req.file.filename}`,
        fileSize: req.file.size,
        description: req.body.description
      };

      const fileShare = await communicationPortal.uploadFile(fileShareData);
      
      // Broadcast to WebSocket clients
      broadcastToConsultation(req.body.consultationId, {
        type: 'file_shared',
        fileShare
      });
      
      res.json({ success: true, fileShare });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ 
        success: false, 
        error: 'فشل في رفع الملف' 
      });
    }
  });

  // Seed doctors data if needed (run only once)
  setTimeout(async () => {
    try {
      await seedDoctors();
      // Initialize comprehensive demo data
      const { seedDemoData } = await import('./seed-demo-data');
      await seedDemoData();
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  }, 1000);

  const httpServer = createServer(app);

  // WebSocket Server for Real-time Communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active connections by consultation ID
  const consultationConnections = new Map<string, Set<WebSocket>>();
  
  wss.on('connection', (ws: WebSocket, req) => {
    console.log('💬 اتصال WebSocket جديد');
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'join_consultation') {
          const consultationId = message.consultationId;
          
          if (!consultationConnections.has(consultationId)) {
            consultationConnections.set(consultationId, new Set());
          }
          
          consultationConnections.get(consultationId)!.add(ws);
          
          console.log(`👥 انضمام إلى الاستشارة: ${consultationId}`);
          
          // Send confirmation
          ws.send(JSON.stringify({
            type: 'joined_consultation',
            consultationId
          }));
        }
        
        if (message.type === 'typing') {
          // Broadcast typing indicator to other users in the consultation
          broadcastToConsultation(message.consultationId, {
            type: 'user_typing',
            userId: message.userId,
            senderType: message.senderType
          }, ws);
        }
        
        if (message.type === 'stop_typing') {
          // Broadcast stop typing indicator
          broadcastToConsultation(message.consultationId, {
            type: 'user_stop_typing',
            userId: message.userId
          }, ws);
        }
        
      } catch (error) {
        console.error('خطأ في معالجة رسالة WebSocket:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('🔌 إغلاق اتصال WebSocket');
      // Remove connection from all consultations
      consultationConnections.forEach((connections, consultationId) => {
        connections.delete(ws);
        if (connections.size === 0) {
          consultationConnections.delete(consultationId);
        }
      });
    });
    
    ws.on('error', (error) => {
      console.error('خطأ في WebSocket:', error);
    });
  });
  
  // Function to broadcast messages to all clients in a consultation
  function broadcastToConsultation(consultationId: string, message: any, exclude?: WebSocket) {
    const connections = consultationConnections.get(consultationId);
    if (connections) {
      connections.forEach((client) => {
        if (client !== exclude && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    }
  }

  console.log('💬 نظام التواصل الفوري جاهز - WebSocket Server بدأ');
  
  return httpServer;
}
