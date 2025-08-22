import { db } from "./db";
import { eq, and, desc, like, sql } from "drizzle-orm";
import { 
  doctorPortfolios, 
  faceMeshDatabase, 
  surgerySimulations, 
  doctorReviews, 
  doctorProfiles,
  doctors
} from "@shared/schema";

/**
 * نظام إدارة قاعدة بيانات Digitized Rhinoplasty ثلاثية الأبعاد
 * متوافق مع مجموعة بيانات 3D-face-morph-dataset برخصة Apache-2.0
 */
export class DigitizedRhinoplastyManager {

  /**
   * إضافة ملف الطبيب مع صور العمليات قبل/بعد والفيديوهات
   */
  async addDoctorPortfolio(data: {
    doctorId: string;
    title: string;
    procedureType: string;
    description: string;
    beforeImageUrl: string;
    afterImageUrl: string;
    videoUrl?: string;
    patientAge: number;
    patientGender: string;
    surgeryDuration: number;
    recoveryTime: number;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
  }) {
    console.log(`📁 إضافة ملف العملية: ${data.title} للطبيب ${data.doctorId}`);
    
    const [portfolio] = await db.insert(doctorPortfolios).values({
      ...data,
      tags: JSON.stringify(data.tags)
    }).returning();

    // تحديث إحصائيات الطبيب
    await this.updateDoctorStats(data.doctorId);
    
    return portfolio;
  }

  /**
   * إضافة نموذج وجه ثلاثي الأبعاد من مجموعة بيانات Digitized Rhinoplasty
   */
  async addFaceMeshModel(data: {
    meshId: string;
    originalImageUrl: string;
    meshDataUrl: string;
    faceType: 'oval' | 'round' | 'square' | 'heart' | 'diamond';
    noseType: 'straight' | 'aquiline' | 'snub' | 'roman' | 'greek';
    gender: 'male' | 'female';
    ethnicity?: string;
    ageRange: string;
    facialLandmarks: any; // 468 نقطة من MediaPipe
    morphTargets: any; // أهداف التعديل
    qualityScore: number;
    processingMetadata: any;
  }) {
    console.log(`🎭 إضافة نموذج وجه ثلاثي الأبعاد: ${data.meshId}`);
    
    const [faceMesh] = await db.insert(faceMeshDatabase).values({
      ...data,
      facialLandmarks: JSON.stringify(data.facialLandmarks),
      morphTargets: JSON.stringify(data.morphTargets),
      processingMetadata: JSON.stringify(data.processingMetadata)
    }).returning();

    return faceMesh;
  }

  /**
   * إجراء محاكاة جراحية ثلاثية الأبعاد باستخدام البيانات المرجعية
   */
  async createSurgerySimulation(data: {
    consultationId?: string;
    doctorId: string;
    patientId?: string;
    procedureType: string;
    originalImageUrl: string;
    targetNoseType: string;
    targetFaceShape: string;
    simulationParameters: any;
    surgeonNotes?: string;
  }) {
    console.log(`🔬 إنشاء محاكاة جراحية للإجراء: ${data.procedureType}`);
    
    // البحث عن أفضل نموذج مرجعي من قاعدة البيانات
    const referenceMesh = await this.findBestReferenceMesh(
      data.targetNoseType, 
      data.targetFaceShape
    );

    // إنشاء الصورة المحاكية باستخدام النموذج المرجعي
    const simulatedImageUrl = await this.generateSimulatedImage(
      data.originalImageUrl,
      referenceMesh,
      data.simulationParameters
    );

    // حساب التكلفة والمخاطر
    const { estimatedCost, riskFactors, recoveryTime } = await this.calculateSurgeryMetrics(
      data.procedureType,
      data.simulationParameters
    );

    const [simulation] = await db.insert(surgerySimulations).values({
      ...data,
      simulatedImageUrl,
      threeDMeshId: referenceMesh?.id,
      simulationParameters: JSON.stringify(data.simulationParameters),
      estimatedCost,
      estimatedRecoveryTime: recoveryTime,
      riskFactors: JSON.stringify(riskFactors),
      confidenceScore: referenceMesh?.qualityScore || 0.8
    }).returning();

    return simulation;
  }

  /**
   * البحث عن أفضل نموذج مرجعي من قاعدة البيانات
   */
  private async findBestReferenceMesh(noseType: string, faceType: string) {
    const meshes = await db.select()
      .from(faceMeshDatabase)
      .where(and(
        eq(faceMeshDatabase.noseType, noseType),
        eq(faceMeshDatabase.faceType, faceType),
        eq(faceMeshDatabase.isValidated, true)
      ))
      .orderBy(desc(faceMeshDatabase.qualityScore))
      .limit(1);

    return meshes[0] || null;
  }

  /**
   * توليد الصورة المحاكية باستخدام النمذجة ثلاثية الأبعاد
   */
  private async generateSimulatedImage(
    originalImageUrl: string,
    referenceMesh: any,
    parameters: any
  ): Promise<string> {
    // هنا سيتم تطبيق خوارزميات النمذجة ثلاثية الأبعاد
    // باستخدام Three.js وOpen3D مع بيانات MediaPipe
    
    console.log(`🎨 توليد الصورة المحاكية باستخدام النموذج المرجعي`);
    
    // محاكاة معالجة الصورة (في التطبيق الحقيقي سيتم استخدام مكتبات 3D)
    const simulatedImagePath = `/simulations/simulated_${Date.now()}.jpg`;
    
    return simulatedImagePath;
  }

  /**
   * حساب معاييرالجراحة (التكلفة، المخاطر، وقت التعافي)
   */
  private async calculateSurgeryMetrics(procedureType: string, parameters: any) {
    const baseCosts = {
      'rhinoplasty': 15000,
      'facial_contouring': 12000,
      'dental_alignment': 8000,
      'skin_treatment': 3000
    };

    const baseRecoveryTimes = {
      'rhinoplasty': 14,
      'facial_contouring': 10,
      'dental_alignment': 7,
      'skin_treatment': 3
    };

    const estimatedCost = baseCosts[procedureType as keyof typeof baseCosts] || 10000;
    const recoveryTime = baseRecoveryTimes[procedureType as keyof typeof baseRecoveryTimes] || 7;

    const riskFactors = {
      infection: 'منخفض',
      swelling: 'متوسط',
      asymmetry: 'منخفض',
      satisfaction: 'عالي'
    };

    return { estimatedCost, riskFactors, recoveryTime };
  }

  /**
   * الحصول على ملفات الأطباء مع العمليات
   */
  async getDoctorPortfolios(doctorId?: string, procedureType?: string) {
    let query = db.select({
      portfolio: doctorPortfolios,
      doctor: doctors
    })
    .from(doctorPortfolios)
    .leftJoin(doctors, eq(doctorPortfolios.doctorId, doctors.id));

    if (doctorId) {
      query = query.where(eq(doctorPortfolios.doctorId, doctorId));
    }

    if (procedureType) {
      query = query.where(eq(doctorPortfolios.procedureType, procedureType));
    }

    const results = await query
      .orderBy(desc(doctorPortfolios.views), desc(doctorPortfolios.likes))
      .limit(20);

    return results;
  }

  /**
   * البحث في قاعدة بيانات الوجوه ثلاثية الأبعاد
   */
  async searchFaceMeshDatabase(filters: {
    faceType?: string;
    noseType?: string;
    gender?: string;
    ethnicity?: string;
    ageRange?: string;
    minQuality?: number;
  }) {
    let whereConditions = [eq(faceMeshDatabase.isValidated, true)];

    if (filters.faceType) {
      whereConditions.push(eq(faceMeshDatabase.faceType, filters.faceType));
    }
    if (filters.noseType) {
      whereConditions.push(eq(faceMeshDatabase.noseType, filters.noseType));
    }
    if (filters.gender) {
      whereConditions.push(eq(faceMeshDatabase.gender, filters.gender));
    }
    if (filters.ethnicity) {
      whereConditions.push(eq(faceMeshDatabase.ethnicity, filters.ethnicity));
    }
    if (filters.ageRange) {
      whereConditions.push(eq(faceMeshDatabase.ageRange, filters.ageRange));
    }
    if (filters.minQuality) {
      whereConditions.push(sql`${faceMeshDatabase.qualityScore} >= ${filters.minQuality}`);
    }

    const meshes = await db.select()
      .from(faceMeshDatabase)
      .where(and(...whereConditions))
      .orderBy(desc(faceMeshDatabase.qualityScore))
      .limit(50);

    return meshes;
  }

  /**
   * إضافة تقييم للطبيب مع صور قبل/بعد
   */
  async addDoctorReview(data: {
    doctorId: string;
    patientId?: string;
    consultationId?: string;
    rating: number;
    reviewText: string;
    procedureType: string;
    beforeAfterPhotos?: string[];
    communicationRating: number;
    facilityRating: number;
    valueForMoney: number;
  }) {
    console.log(`⭐ إضافة تقييم للطبيب ${data.doctorId}: ${data.rating} نجوم`);
    
    const [review] = await db.insert(doctorReviews).values({
      ...data,
      beforeAfterPhotos: data.beforeAfterPhotos ? JSON.stringify(data.beforeAfterPhotos) : null
    }).returning();

    // تحديث تقييم الطبيب العام
    await this.updateDoctorRating(data.doctorId);
    
    return review;
  }

  /**
   * تحديث إحصائيات الطبيب
   */
  private async updateDoctorStats(doctorId: string) {
    // حساب إجمالي العمليات
    const [{ count: totalSurgeries }] = await db.select({ 
      count: sql<number>`count(*)` 
    })
    .from(doctorPortfolios)
    .where(eq(doctorPortfolios.doctorId, doctorId));

    // تحديث ملف الطبيب
    await db.update(doctorProfiles)
      .set({ 
        totalSurgeries: Number(totalSurgeries),
        updatedAt: new Date()
      })
      .where(eq(doctorProfiles.doctorId, doctorId));
  }

  /**
   * تحديث تقييم الطبيب بناءً على المراجعات
   */
  private async updateDoctorRating(doctorId: string) {
    const [result] = await db.select({ 
      avgRating: sql<number>`avg(${doctorReviews.rating})`,
      count: sql<number>`count(*)`
    })
    .from(doctorReviews)
    .where(eq(doctorReviews.doctorId, doctorId));

    if (result.count > 0) {
      await db.update(doctors)
        .set({ 
          rating: Number(result.avgRating.toFixed(1))
        })
        .where(eq(doctors.id, doctorId));
    }
  }

  /**
   * الحصول على ملف الطبيب الشامل
   */
  async getDoctorFullProfile(doctorId: string) {
    const doctorInfo = await db.select()
      .from(doctors)
      .leftJoin(doctorProfiles, eq(doctors.id, doctorProfiles.doctorId))
      .where(eq(doctors.id, doctorId))
      .limit(1);

    if (!doctorInfo[0]) return null;

    const portfolios = await this.getDoctorPortfolios(doctorId);
    const reviews = await db.select()
      .from(doctorReviews)
      .where(and(
        eq(doctorReviews.doctorId, doctorId),
        eq(doctorReviews.isPublic, true)
      ))
      .orderBy(desc(doctorReviews.createdAt))
      .limit(10);

    return {
      doctor: doctorInfo[0],
      portfolios,
      reviews,
      stats: {
        totalPortfolios: portfolios.length,
        averageRating: doctorInfo[0].doctors.rating,
        totalSurgeries: doctorInfo[0].doctor_profiles?.totalSurgeries || 0
      }
    };
  }
}

export const digitizedRhinoplastyManager = new DigitizedRhinoplastyManager();