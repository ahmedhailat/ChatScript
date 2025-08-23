import type { Express } from "express";
import { db } from "./db";
import { doctors, timeSlots, bookingConsultations, doctorProfiles } from "@shared/schema";
import { eq, and, gte, desc } from "drizzle-orm";

export function registerConsultationRoutes(app: Express) {
  // Register new doctor - simplified version
  app.post('/api/register-doctor', async (req, res) => {
    try {
      const { name, email, phone, specialty, experience, bio, hourlyRate } = req.body;

      // Basic validation
      if (!name || !email || !phone || !specialty) {
        return res.status(400).json({ error: 'جميع الحقول المطلوبة يجب ملؤها' });
      }

      // Create new doctor (simplified approach - skip complex profile for now)
      const [newDoctor] = await db.insert(doctors).values({
        name: name,
        specialty: specialty,
        experience: parseInt(experience) || 0,
        rating: 4.5, // Default good rating
        bio: bio || `طبيب متخصص في ${specialty}`,
        hourlyRate: parseInt(hourlyRate) * 100 || 40000, // Convert to cents (default 400 SAR)
        isActive: true, // Auto-approve for demo
      }).returning();

      res.json({
        success: true,
        id: newDoctor.id,
        message: 'تم تسجيل الطبيب بنجاح! 🎉',
        doctor: {
          id: newDoctor.id,
          name: newDoctor.name,
          specialty: newDoctor.specialty,
          status: 'approved'
        }
      });

    } catch (error) {
      console.error('Error registering doctor:', error);
      res.status(500).json({ error: 'فشل في تسجيل الطبيب. يرجى المحاولة مرة أخرى' });
    }
  });

  // Get available doctors by specialty
  app.get('/api/doctors', async (req, res) => {
    try {
      const { specialty } = req.query;
      
      let whereConditions = [eq(doctors.isActive, true)];
      
      if (specialty) {
        // Match specialty keywords for consultation types
        const specialtyMap: Record<string, string> = {
          'rhinoplasty': 'جراحة تجميل الأنف',
          'facial': 'طب تجميل الوجه', 
          'dental': 'تجميل الأسنان',
          'skincare': 'العناية بالبشرة'
        };
        
        const mappedSpecialty = specialtyMap[specialty as string] || specialty as string;
        whereConditions.push(eq(doctors.specialty, mappedSpecialty));
      }
      
      const availableDoctors = await db.select().from(doctors).where(
        whereConditions.length > 1 ? 
          and(...whereConditions) : 
          whereConditions[0]
      );
      
      res.json(availableDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      res.status(500).json({ error: 'فشل في جلب قائمة الأطباء' });
    }
  });

  // Get available time slots for a doctor on a specific date
  app.get('/api/time-slots', async (req, res) => {
    try {
      const { doctorId, date } = req.query;
      
      if (!doctorId || !date) {
        return res.status(400).json({ error: 'معرف الطبيب والتاريخ مطلوبان' });
      }

      const availableSlots = await db.select()
        .from(timeSlots)
        .where(
          and(
            eq(timeSlots.doctorId, doctorId as string),
            eq(timeSlots.date, date as string),
            eq(timeSlots.isAvailable, true)
          )
        );
      
      res.json(availableSlots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      res.status(500).json({ error: 'فشل في جلب الأوقات المتاحة' });
    }
  });

  // Create a new consultation booking
  app.post('/api/appointments', async (req, res) => {
    try {
      const {
        doctorId,
        timeSlotId,
        appointmentDate,
        consultationType,
        notes,
        patientName,
        patientPhone,
        duration = 30
      } = req.body;

      if (!doctorId || !timeSlotId || !appointmentDate || !consultationType || !patientName || !patientPhone) {
        return res.status(400).json({ error: 'جميع الحقول المطلوبة يجب ملؤها' });
      }

      // Get doctor details for pricing
      const [doctor] = await db.select().from(doctors).where(eq(doctors.id, doctorId));
      if (!doctor) {
        return res.status(404).json({ error: 'الطبيب غير موجود' });
      }

      // Create the consultation booking
      const [newConsultation] = await db.insert(bookingConsultations).values({
        userId: 'guest', // For now, allow guest bookings
        doctorId,
        appointmentDate: new Date(appointmentDate),
        duration,
        consultationType,
        notes: notes || '',
        patientName,
        patientPhone,
        price: doctor.hourlyRate,
        status: 'pending'
      }).returning();

      // Mark the time slot as unavailable
      await db.update(timeSlots)
        .set({ 
          isAvailable: false, 
          consultationId: newConsultation.id 
        })
        .where(eq(timeSlots.id, timeSlotId));

      // Generate a meeting link (in a real app, this would integrate with Zoom, Teams, etc.)
      const meetingLink = `https://meet.medvision.ai/room/${newConsultation.id}`;
      
      await db.update(bookingConsultations)
        .set({ meetingLink })
        .where(eq(bookingConsultations.id, newConsultation.id));

      res.json({
        id: newConsultation.id,
        message: 'تم حجز الاستشارة بنجاح',
        consultation: {
          ...newConsultation,
          meetingLink,
          doctor: doctor.name
        }
      });

    } catch (error) {
      console.error('Error creating consultation:', error);
      res.status(500).json({ error: 'فشل في حجز الاستشارة' });
    }
  });

  // Get consultation details
  app.get('/api/consultations/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const [consultation] = await db.select({
        consultation: bookingConsultations,
        doctor: doctors
      })
      .from(bookingConsultations)
      .leftJoin(doctors, eq(bookingConsultations.doctorId, doctors.id))
      .where(eq(bookingConsultations.id, id));

      if (!consultation) {
        return res.status(404).json({ error: 'الاستشارة غير موجودة' });
      }

      res.json(consultation);
    } catch (error) {
      console.error('Error fetching consultation:', error);
      res.status(500).json({ error: 'فشل في جلب تفاصيل الاستشارة' });
    }
  });

  // Get user's consultations
  app.get('/api/my-consultations', async (req, res) => {
    try {
      const { phone } = req.query;
      
      if (!phone) {
        return res.status(400).json({ error: 'رقم الهاتف مطلوب' });
      }

      const userConsultations = await db.select({
        consultation: bookingConsultations,
        doctor: doctors
      })
      .from(bookingConsultations)
      .leftJoin(doctors, eq(bookingConsultations.doctorId, doctors.id))
      .where(eq(bookingConsultations.patientPhone, phone as string))
      .orderBy(desc(bookingConsultations.createdAt));

      res.json(userConsultations);
    } catch (error) {
      console.error('Error fetching user consultations:', error);
      res.status(500).json({ error: 'فشل في جلب الاستشارات' });
    }
  });

  // Update consultation status
  app.patch('/api/consultations/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'حالة غير صحيحة' });
      }

      await db.update(bookingConsultations)
        .set({ status, updatedAt: new Date() })
        .where(eq(bookingConsultations.id, id));

      res.json({ message: 'تم تحديث حالة الاستشارة بنجاح' });
    } catch (error) {
      console.error('Error updating consultation status:', error);
      res.status(500).json({ error: 'فشل في تحديث حالة الاستشارة' });
    }
  });
}