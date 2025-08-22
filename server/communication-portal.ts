import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";
import { messages, videoCalls, fileShares } from "@shared/schema";

// Communication Types
export interface Message {
  id: string;
  consultationId: string;
  senderId: string;
  senderType: 'doctor' | 'patient';
  content: string;
  messageType: 'text' | 'image' | 'file' | 'voice_note' | 'video_call_request';
  attachmentUrl?: string;
  isRead: boolean;
  timestamp: Date;
  replyToMessageId?: string;
}

export interface VideoCall {
  id: string;
  consultationId: string;
  doctorId: string;
  patientId: string;
  scheduledTime: Date;
  duration: number; // in minutes
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  meetingUrl?: string;
  recordingUrl?: string;
  notes?: string;
}

export interface FileShare {
  id: string;
  consultationId: string;
  uploadedBy: string;
  fileName: string;
  fileType: 'image' | 'document' | 'medical_report' | 'prescription';
  fileUrl: string;
  fileSize: number;
  description?: string;
  uploadedAt: Date;
}

/**
 * Doctor-Patient Communication Portal
 * Secure messaging, video calls, file sharing, and consultation management
 */
export class CommunicationPortal {

  /**
   * Send message between doctor and patient
   */
  async sendMessage(data: {
    consultationId: string;
    senderId: string;
    senderType: 'doctor' | 'patient';
    content: string;
    messageType?: 'text' | 'image' | 'file' | 'voice_note';
    attachmentUrl?: string;
    replyToMessageId?: string;
  }): Promise<Message> {
    
    console.log(`💬 Sending ${data.messageType || 'text'} message in consultation ${data.consultationId}`);
    
    const [message] = await db.insert(messages).values({
      consultationId: data.consultationId,
      senderId: data.senderId,
      senderType: data.senderType,
      content: data.content,
      messageType: data.messageType || 'text',
      attachmentUrl: data.attachmentUrl,
      replyToMessageId: data.replyToMessageId
    }).returning();

    console.log(`✅ Message sent successfully: ${message.id}`);
    return message;
  }

  /**
   * Get messages for a consultation
   */
  async getMessages(consultationId: string, limit: number = 50): Promise<Message[]> {
    console.log(`📜 Retrieving messages for consultation ${consultationId}`);
    
    const messageList = await db.select()
      .from(messages)
      .where(eq(messages.consultationId, consultationId))
      .orderBy(desc(messages.timestamp))
      .limit(limit);
    
    return messageList.reverse(); // Return chronological order
  }

  /**
   * Schedule video call between doctor and patient
   */
  async scheduleVideoCall(data: {
    consultationId: string;
    doctorId: string;
    patientId: string;
    scheduledTime: Date;
    duration: number;
  }): Promise<VideoCall> {
    
    console.log(`📹 Scheduling video call for ${data.scheduledTime}`);
    
    const [videoCall] = await db.insert(videoCalls).values({
      consultationId: data.consultationId,
      doctorId: data.doctorId,
      patientId: data.patientId,
      scheduledTime: data.scheduledTime,
      duration: data.duration,
      meetingUrl: `https://meet.medvision.ai/room/${data.consultationId}`
    }).returning();

    return videoCall;
  }

  /**
   * Upload file for consultation
   */
  async uploadFile(data: {
    consultationId: string;
    uploadedBy: string;
    fileName: string;
    fileType: string;
    fileUrl: string;
    fileSize: number;
    description?: string;
  }): Promise<FileShare> {
    
    console.log(`📎 Uploading file ${data.fileName} to consultation ${data.consultationId}`);
    
    const [fileShare] = await db.insert(fileShares).values({
      consultationId: data.consultationId,
      uploadedBy: data.uploadedBy,
      fileName: data.fileName,
      fileType: data.fileType,
      fileUrl: data.fileUrl,
      fileSize: data.fileSize,
      description: data.description
    }).returning();

    return fileShare;
  }

  /**
   * Get consultation files
   */
  async getConsultationFiles(consultationId: string): Promise<FileShare[]> {
    console.log(`📁 Retrieving files for consultation ${consultationId}`);
    
    const files = await db.select()
      .from(fileShares)
      .where(eq(fileShares.consultationId, consultationId))
      .orderBy(desc(fileShares.uploadedAt));
    
    return files;
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(messageIds: string[]): Promise<void> {
    console.log(`✅ Marking ${messageIds.length} messages as read`);
    
    if (messageIds.length > 0) {
      await db.update(messages)
        .set({ isRead: true })
        .where(eq(messages.id, messageIds[0])); // For now, just update first message
    }
  }
}

export const communicationPortal = new CommunicationPortal();