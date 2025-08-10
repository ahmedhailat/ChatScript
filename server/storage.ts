import { type Patient, type InsertPatient, type Consultation, type InsertConsultation } from "@shared/schema";
import { randomUUID } from "crypto";

interface ImageMetadata {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

interface AIProcessingResult {
  processedImageUrl: string;
  confidence: number;
  processingTime: number;
  metadata: {
    procedureType: string;
    analysisPoints: string[];
    recommendations: string[];
  };
}

export interface IStorage {
  // Patient operations
  getAllPatients(): Promise<Patient[]>;
  getPatient(id: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;

  // Consultation operations
  getAllConsultations(): Promise<Consultation[]>;
  getConsultation(id: string): Promise<Consultation | undefined>;
  createConsultation(consultation: InsertConsultation): Promise<Consultation>;
  updateConsultation(id: string, updates: Partial<Consultation>): Promise<Consultation | undefined>;

  // Image operations
  storeImageMetadata(metadata: Omit<ImageMetadata, "uploadedAt">): Promise<ImageMetadata>;
  getImageMetadata(id: string): Promise<ImageMetadata | undefined>;
  processImageWithAI(imageId: string, procedureType: string): Promise<AIProcessingResult>;
}

export class MemStorage implements IStorage {
  private patients: Map<string, Patient>;
  private consultations: Map<string, Consultation>;
  private imageMetadata: Map<string, ImageMetadata>;

  constructor() {
    this.patients = new Map();
    this.consultations = new Map();
    this.imageMetadata = new Map();
  }

  // Patient operations
  async getAllPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = randomUUID();
    const patient: Patient = { 
      ...insertPatient, 
      id,
      age: insertPatient.age || null,
      medicalHistory: insertPatient.medicalHistory || null,
      createdAt: new Date()
    };
    this.patients.set(id, patient);
    return patient;
  }

  // Consultation operations
  async getAllConsultations(): Promise<Consultation[]> {
    return Array.from(this.consultations.values());
  }

  async getConsultation(id: string): Promise<Consultation | undefined> {
    return this.consultations.get(id);
  }

  async createConsultation(insertConsultation: InsertConsultation): Promise<Consultation> {
    const id = randomUUID();
    const consultation: Consultation = {
      ...insertConsultation,
      id,
      patientId: insertConsultation.patientId || null,
      beforeImageUrl: insertConsultation.beforeImageUrl || null,
      afterImageUrl: insertConsultation.afterImageUrl || null,
      notes: insertConsultation.notes || null,
      isProcessing: false,
      aiMetadata: null,
      createdAt: new Date()
    };
    this.consultations.set(id, consultation);
    return consultation;
  }

  async updateConsultation(id: string, updates: Partial<Consultation>): Promise<Consultation | undefined> {
    const existing = this.consultations.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.consultations.set(id, updated);
    return updated;
  }

  // Image operations
  async storeImageMetadata(metadata: Omit<ImageMetadata, "uploadedAt">): Promise<ImageMetadata> {
    const fullMetadata: ImageMetadata = {
      ...metadata,
      uploadedAt: new Date()
    };
    this.imageMetadata.set(metadata.id, fullMetadata);
    return fullMetadata;
  }

  async getImageMetadata(id: string): Promise<ImageMetadata | undefined> {
    return this.imageMetadata.get(id);
  }

  async processImageWithAI(imageId: string, procedureType: string): Promise<AIProcessingResult> {
    const imageMetadata = await this.getImageMetadata(imageId);
    if (!imageMetadata) {
      throw new Error("Image not found");
    }

    // Mock AI processing - simulate different results based on procedure type
    const mockResults: Record<string, AIProcessingResult> = {
      rhinoplasty: {
        processedImageUrl: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        confidence: 0.92,
        processingTime: 2340,
        metadata: {
          procedureType: "rhinoplasty",
          analysisPoints: [
            "Nasal bridge alignment",
            "Tip projection angle",
            "Nostril symmetry",
            "Overall facial harmony"
          ],
          recommendations: [
            "Slight reduction in nasal bridge height",
            "Refined tip projection for better profile",
            "Enhanced nostril symmetry"
          ]
        }
      },
      dental: {
        processedImageUrl: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        confidence: 0.88,
        processingTime: 1890,
        metadata: {
          procedureType: "dental",
          analysisPoints: [
            "Tooth alignment",
            "Color uniformity",
            "Gum line symmetry",
            "Overall smile aesthetics"
          ],
          recommendations: [
            "Orthodontic alignment for front teeth",
            "Professional whitening treatment",
            "Gum contouring for symmetry"
          ]
        }
      },
      facelift: {
        processedImageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        confidence: 0.85,
        processingTime: 2890,
        metadata: {
          procedureType: "facelift",
          analysisPoints: [
            "Skin elasticity",
            "Facial volume distribution",
            "Jawline definition",
            "Neck contour"
          ],
          recommendations: [
            "Mini facelift for lower face",
            "Volume restoration in cheek area",
            "Neck skin tightening"
          ]
        }
      },
      scar_removal: {
        processedImageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        confidence: 0.90,
        processingTime: 1560,
        metadata: {
          procedureType: "scar_removal",
          analysisPoints: [
            "Scar tissue depth",
            "Surrounding skin texture",
            "Color matching potential",
            "Treatment area size"
          ],
          recommendations: [
            "Laser resurfacing treatment",
            "Multiple session approach",
            "Post-treatment skincare regimen"
          ]
        }
      }
    };

    return mockResults[procedureType] || mockResults.rhinoplasty;
  }
}

export const storage = new MemStorage();
