import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, jsonb, integer, date, time, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  age: text("age"),
  medicalHistory: text("medical_history"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const consultations = pgTable("consultations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id),
  procedureType: text("procedure_type").notNull(),
  beforeImageUrl: text("before_image_url"),
  afterImageUrl: text("after_image_url"),
  notes: text("notes"),
  isProcessing: boolean("is_processing").default(false),
  aiMetadata: jsonb("ai_metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
});

export const insertConsultationSchema = createInsertSchema(consultations).omit({
  id: true,
  createdAt: true,
  isProcessing: true,
  aiMetadata: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Real-time Consultation and Booking System
export const bookingConsultations = pgTable("booking_consultations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  doctorId: varchar("doctor_id").references(() => doctors.id).notNull(),
  appointmentDate: timestamp("appointment_date").notNull(),
  duration: integer("duration").default(30), // minutes
  status: varchar("status").default("pending"), // pending, confirmed, completed, cancelled
  consultationType: varchar("consultation_type").notNull(), // rhinoplasty, facial, dental, etc.
  notes: text("notes"),
  meetingLink: varchar("meeting_link"),
  price: integer("price").default(0), // in cents
  patientName: varchar("patient_name").notNull(),
  patientPhone: varchar("patient_phone").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const doctors = pgTable("doctors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  specialty: varchar("specialty").notNull(),
  experience: integer("experience").default(0),
  rating: real("rating").default(0.0),
  avatar: varchar("avatar"),
  bio: text("bio"),
  hourlyRate: integer("hourly_rate").default(10000), // in cents
  availability: jsonb("availability"), // JSON with days and time slots
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const timeSlots = pgTable("time_slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  doctorId: varchar("doctor_id").references(() => doctors.id).notNull(),
  date: date("date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  isAvailable: boolean("is_available").default(true),
  consultationId: varchar("consultation_id").references(() => bookingConsultations.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export type BookingConsultation = typeof bookingConsultations.$inferSelect;
export type InsertBookingConsultation = typeof bookingConsultations.$inferInsert;
export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = typeof doctors.$inferInsert;
export type TimeSlot = typeof timeSlots.$inferSelect;
export type InsertTimeSlot = typeof timeSlots.$inferInsert;
// Communication Portal Tables
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultationId: varchar("consultation_id").references(() => bookingConsultations.id).notNull(),
  senderId: varchar("sender_id").notNull(),
  senderType: varchar("sender_type").notNull(), // 'doctor' | 'patient'
  content: text("content").notNull(),
  messageType: varchar("message_type").default("text"), // 'text' | 'image' | 'file' | 'voice_note'
  attachmentUrl: varchar("attachment_url"),
  isRead: boolean("is_read").default(false),
  replyToMessageId: varchar("reply_to_message_id"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const videoCalls = pgTable("video_calls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultationId: varchar("consultation_id").references(() => bookingConsultations.id).notNull(),
  doctorId: varchar("doctor_id").references(() => doctors.id).notNull(),
  patientId: varchar("patient_id").references(() => users.id).notNull(),
  scheduledTime: timestamp("scheduled_time").notNull(),
  duration: integer("duration").default(30), // minutes
  status: varchar("status").default("scheduled"), // 'scheduled' | 'active' | 'completed' | 'cancelled'
  meetingUrl: varchar("meeting_url"),
  recordingUrl: varchar("recording_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fileShares = pgTable("file_shares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultationId: varchar("consultation_id").references(() => bookingConsultations.id).notNull(),
  uploadedBy: varchar("uploaded_by").notNull(),
  fileName: varchar("file_name").notNull(),
  fileType: varchar("file_type").notNull(), // 'image' | 'document' | 'medical_report' | 'prescription'
  fileUrl: varchar("file_url").notNull(),
  fileSize: integer("file_size").default(0),
  description: text("description"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertConsultation = z.infer<typeof insertConsultationSchema>;
export type Consultation = typeof consultations.$inferSelect;

// Communication Portal Types
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type VideoCall = typeof videoCalls.$inferSelect;
export type InsertVideoCall = typeof videoCalls.$inferInsert;
export type FileShare = typeof fileShares.$inferSelect;
export type InsertFileShare = typeof fileShares.$inferInsert;

// Doctor Portfolio System - ملفات الأطباء مع الصور والفيديوهات
export const doctorPortfolios = pgTable("doctor_portfolios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  doctorId: varchar("doctor_id").references(() => doctors.id).notNull(),
  title: varchar("title").notNull(), // عنوان العملية
  procedureType: varchar("procedure_type").notNull(), // نوع العملية: rhinoplasty, facial, dental, etc.
  description: text("description"), // وصف العملية
  beforeImageUrl: varchar("before_image_url").notNull(), // صورة قبل
  afterImageUrl: varchar("after_image_url").notNull(), // صورة بعد
  videoUrl: varchar("video_url"), // فيديو توضيحي للعملية
  patientAge: integer("patient_age"), // عمر المريض
  patientGender: varchar("patient_gender"), // جنس المريض
  surgeryDuration: integer("surgery_duration"), // مدة العملية بالدقائق
  recoveryTime: integer("recovery_time"), // فترة التعافي بالأيام
  difficulty: varchar("difficulty").default("medium"), // صعوبة العملية: easy, medium, hard
  tags: jsonb("tags"), // علامات للبحث
  isPublic: boolean("is_public").default(true), // هل العملية معروضة للعامة
  likes: integer("likes").default(0), // عدد الإعجابات
  views: integer("views").default(0), // عدد المشاهدات
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 3D Face Database - قاعدة بيانات الوجوه ثلاثية الأبعاد
export const faceMeshDatabase = pgTable("face_mesh_database", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  meshId: varchar("mesh_id").notNull().unique(), // معرف فريد للـ 3D mesh
  originalImageUrl: varchar("original_image_url").notNull(), // الصورة الأصلية
  meshDataUrl: varchar("mesh_data_url").notNull(), // ملف الـ 3D mesh (.obj, .ply)
  faceType: varchar("face_type").notNull(), // نوع الوجه: oval, round, square, heart, diamond
  noseType: varchar("nose_type").notNull(), // نوع الأنف: straight, aquiline, snub, roman, greek
  gender: varchar("gender").notNull(), // male, female
  ethnicity: varchar("ethnicity"), // العرق
  ageRange: varchar("age_range"), // فئة العمر: 18-25, 26-35, etc.
  facialLandmarks: jsonb("facial_landmarks"), // 468 نقطة من MediaPipe
  morphTargets: jsonb("morph_targets"), // أهداف التعديل المختلفة
  qualityScore: real("quality_score").default(0.0), // جودة الـ mesh (0-1)
  processingMetadata: jsonb("processing_metadata"), // بيانات المعالجة
  licenseType: varchar("license_type").default("Apache-2.0"), // نوع الترخيص
  source: varchar("source").default("Digitized-Rhinoplasty"), // مصدر البيانات
  isValidated: boolean("is_validated").default(false), // هل تم التحقق من البيانات
  useCount: integer("use_count").default(0), // عدد مرات الاستخدام
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Surgery Simulations - محاكاة العمليات الجراحية
export const surgerySimulations = pgTable("surgery_simulations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultationId: varchar("consultation_id").references(() => bookingConsultations.id),
  doctorId: varchar("doctor_id").references(() => doctors.id).notNull(),
  patientId: varchar("patient_id").references(() => users.id),
  procedureType: varchar("procedure_type").notNull(),
  originalImageUrl: varchar("original_image_url").notNull(),
  simulatedImageUrl: varchar("simulated_image_url"),
  threeDMeshId: varchar("three_d_mesh_id").references(() => faceMeshDatabase.id),
  simulationParameters: jsonb("simulation_parameters"), // معاملات المحاكاة
  confidenceScore: real("confidence_score"), // درجة الثقة في النتيجة
  estimatedCost: integer("estimated_cost"), // التكلفة المقدرة
  estimatedRecoveryTime: integer("estimated_recovery_time"), // وقت التعافي المقدر
  riskFactors: jsonb("risk_factors"), // عوامل الخطر
  surgeonNotes: text("surgeon_notes"), // ملاحظات الجراح
  patientApproval: boolean("patient_approval").default(false), // موافقة المريض
  status: varchar("status").default("draft"), // draft, approved, scheduled, completed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Patient Reviews and Ratings - تقييمات المرضى
export const doctorReviews = pgTable("doctor_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  doctorId: varchar("doctor_id").references(() => doctors.id).notNull(),
  patientId: varchar("patient_id").references(() => users.id),
  consultationId: varchar("consultation_id").references(() => bookingConsultations.id),
  rating: integer("rating").notNull(), // 1-5 stars
  reviewText: text("review_text"),
  procedureType: varchar("procedure_type"),
  beforeAfterPhotos: jsonb("before_after_photos"), // صور قبل وبعد من المريض
  wouldRecommend: boolean("would_recommend").default(true),
  communicationRating: integer("communication_rating"), // تقييم التواصل
  facilityRating: integer("facility_rating"), // تقييم المرفق
  valueForMoney: integer("value_for_money"), // تقييم القيمة مقابل المال
  isVerified: boolean("is_verified").default(false), // مراجعة محققة
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced Doctor Profile - ملف الطبيب المحسن
export const doctorProfiles = pgTable("doctor_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  doctorId: varchar("doctor_id").references(() => doctors.id).notNull(),
  profileImageUrl: varchar("profile_image_url"),
  coverImageUrl: varchar("cover_image_url"),
  clinicName: varchar("clinic_name"),
  clinicAddress: text("clinic_address"),
  clinicPhone: varchar("clinic_phone"),
  clinicEmail: varchar("clinic_email"),
  workingHours: jsonb("working_hours"), // ساعات العمل
  languages: jsonb("languages"), // اللغات المتحدثة
  education: jsonb("education"), // التعليم والشهادات
  certifications: jsonb("certifications"), // الشهادات والتراخيص
  specializations: jsonb("specializations"), // التخصصات الفرعية
  achievements: jsonb("achievements"), // الإنجازات والجوائز
  socialMedia: jsonb("social_media"), // روابط وسائل التواصل
  consultationFee: integer("consultation_fee"), // رسم الاستشارة
  followUpFee: integer("follow_up_fee"), // رسم المتابعة
  emergencyAvailable: boolean("emergency_available").default(false),
  onlineConsultation: boolean("online_consultation").default(true),
  acceptsInsurance: boolean("accepts_insurance").default(false),
  paymentMethods: jsonb("payment_methods"), // طرق الدفع المقبولة
  totalPatients: integer("total_patients").default(0), // إجمالي المرضى
  totalSurgeries: integer("total_surgeries").default(0), // إجمالي العمليات
  successRate: real("success_rate").default(0.0), // معدل النجاح
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for new tables
export const insertDoctorPortfolioSchema = createInsertSchema(doctorPortfolios).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  likes: true,
  views: true,
});

export const insertFaceMeshSchema = createInsertSchema(faceMeshDatabase).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  useCount: true,
});

export const insertSurgerySimulationSchema = createInsertSchema(surgerySimulations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDoctorReviewSchema = createInsertSchema(doctorReviews).omit({
  id: true,
  createdAt: true,
});

export const insertDoctorProfileSchema = createInsertSchema(doctorProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalPatients: true,
  totalSurgeries: true,
});

// Type exports for new tables
export type DoctorPortfolio = typeof doctorPortfolios.$inferSelect;
export type InsertDoctorPortfolio = z.infer<typeof insertDoctorPortfolioSchema>;

export type FaceMesh = typeof faceMeshDatabase.$inferSelect;
export type InsertFaceMesh = z.infer<typeof insertFaceMeshSchema>;

export type SurgerySimulation = typeof surgerySimulations.$inferSelect;
export type InsertSurgerySimulation = z.infer<typeof insertSurgerySimulationSchema>;

export type DoctorReview = typeof doctorReviews.$inferSelect;
export type InsertDoctorReview = z.infer<typeof insertDoctorReviewSchema>;

export type DoctorProfile = typeof doctorProfiles.$inferSelect;
export type InsertDoctorProfile = z.infer<typeof insertDoctorProfileSchema>;
