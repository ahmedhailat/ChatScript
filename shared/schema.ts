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
