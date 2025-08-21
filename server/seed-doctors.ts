import { db } from "./db";
import { doctors, timeSlots } from "@shared/schema";

export async function seedDoctors() {
  try {
    console.log('🏥 بدء إضافة الأطباء والمواعيد المتاحة...');

    // Add sample doctors
    const sampleDoctors = [
      {
        name: 'د. أحمد محمد',
        specialty: 'جراحة تجميل الأنف',
        experience: 15,
        rating: 4.9,
        bio: 'استشاري جراحة التجميل مع خبرة 15 عاماً في جراحات الأنف التجميلية والوظيفية',
        hourlyRate: 50000, // 500 ريال
        isActive: true
      },
      {
        name: 'د. فاطمة العلي',
        specialty: 'طب تجميل الوجه',
        experience: 12,
        rating: 4.8,
        bio: 'طبيبة تجميل متخصصة في علاجات الوجه غير الجراحية والليزر',
        hourlyRate: 40000, // 400 ريال
        isActive: true
      },
      {
        name: 'د. خالد الشمري',
        specialty: 'تجميل الأسنان',
        experience: 10,
        rating: 4.7,
        bio: 'استشاري تجميل الأسنان متخصص في التقويم الشفاف والابتسامة الهوليودية',
        hourlyRate: 35000, // 350 ريال
        isActive: true
      },
      {
        name: 'د. سارة الحربي',
        specialty: 'العناية بالبشرة',
        experience: 8,
        rating: 4.6,
        bio: 'طبيبة جلدية متخصصة في علاج مشاكل البشرة والعلاجات التجميلية',
        hourlyRate: 30000, // 300 ريال
        isActive: true
      },
      {
        name: 'د. محمد القحطاني',
        specialty: 'جراحة الوجه والفكين',
        experience: 18,
        rating: 4.9,
        bio: 'استشاري جراحة الوجه والفكين مع خبرة واسعة في العمليات التجميلية المعقدة',
        hourlyRate: 60000, // 600 ريال
        isActive: true
      },
      {
        name: 'د. نورا المطيري',
        specialty: 'طب تجميل متكامل',
        experience: 14,
        rating: 4.8,
        bio: 'استشارية طب تجميل متكامل متخصصة في العلاجات الجراحية وغير الجراحية',
        hourlyRate: 45000, // 450 ريال
        isActive: true
      }
    ];

    // Insert doctors
    const insertedDoctors = await db.insert(doctors).values(sampleDoctors).returning();
    console.log(`✅ تم إضافة ${insertedDoctors.length} أطباء`);

    // Generate time slots for the next 30 days
    const timeSlots_data = [];
    const today = new Date();
    
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + dayOffset);
      const dateString = currentDate.toISOString().split('T')[0];
      
      // Skip weekends (Friday and Saturday in Saudi Arabia)
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek === 5 || dayOfWeek === 6) continue;
      
      for (const doctor of insertedDoctors) {
        // Morning slots: 9:00 AM to 12:00 PM
        const morningSlots = [
          { start: '09:00', end: '09:30' },
          { start: '09:30', end: '10:00' },
          { start: '10:00', end: '10:30' },
          { start: '10:30', end: '11:00' },
          { start: '11:00', end: '11:30' },
          { start: '11:30', end: '12:00' }
        ];
        
        // Evening slots: 4:00 PM to 8:00 PM
        const eveningSlots = [
          { start: '16:00', end: '16:30' },
          { start: '16:30', end: '17:00' },
          { start: '17:00', end: '17:30' },
          { start: '17:30', end: '18:00' },
          { start: '18:00', end: '18:30' },
          { start: '18:30', end: '19:00' },
          { start: '19:00', end: '19:30' },
          { start: '19:30', end: '20:00' }
        ];
        
        const allSlots = [...morningSlots, ...eveningSlots];
        
        for (const slot of allSlots) {
          timeSlots_data.push({
            doctorId: doctor.id,
            date: dateString,
            startTime: slot.start,
            endTime: slot.end,
            isAvailable: true
          });
        }
      }
    }

    // Insert time slots in batches
    const batchSize = 100;
    for (let i = 0; i < timeSlots_data.length; i += batchSize) {
      const batch = timeSlots_data.slice(i, i + batchSize);
      await db.insert(timeSlots).values(batch);
    }

    console.log(`✅ تم إضافة ${timeSlots_data.length} موعد متاح`);
    console.log('🎉 تم الانتهاء من إعداد نظام الحجز بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في إعداد البيانات:', error);
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDoctors().then(() => process.exit(0));
}