import { db } from "./db";
import { 
  doctors, 
  doctorProfiles, 
  doctorPortfolios, 
  faceMeshDatabase,
  bookingConsultations 
} from "@shared/schema";

/**
 * إضافة بيانات تجريبية شاملة للأطباء وملفاتهم وقاعدة البيانات ثلاثية الأبعاد
 */
export async function seedDemoData() {
  console.log('🌱 بدء إضافة البيانات التجريبية...');

  try {
    // إضافة الأطباء
    const doctorsData = [
      {
        id: '1',
        name: 'د. أحمد محمد العبدالله',
        specialty: 'جراحة التجميل والترميم',
        experience: 15,
        rating: 4.9,
        bio: 'استشاري جراحة التجميل والترميم بخبرة 15 عام، متخصص في عمليات تجميل الأنف والوجه'
      },
      {
        id: '2', 
        name: 'د. فاطمة سعد النصر',
        specialty: 'أمراض جلدية وتجميل',
        experience: 12,
        rating: 4.8,
        bio: 'أخصائية الأمراض الجلدية والتجميل، خبيرة في علاجات البشرة والليزر'
      },
      {
        id: '3',
        name: 'د. خالد إبراهيم الزهراني',
        specialty: 'جراحة الفكين والوجه',
        experience: 18,
        rating: 4.7,
        bio: 'استشاري جراحة الفكين والوجه، متخصص في تقويم الفكين وجراحة الوجه التجميلية'
      },
      {
        id: '4',
        name: 'د. نورا علي الحربي',
        specialty: 'طب الأسنان التجميلي',
        experience: 10,
        rating: 4.9,
        bio: 'أخصائية طب الأسنان التجميلي، خبيرة في تبييض الأسنان والقشور التجميلية'
      },
      {
        id: '5',
        name: 'د. محمد عبدالرحمن القحطاني',
        specialty: 'جراحة العيون التجميلية',
        experience: 14,
        rating: 4.6,
        bio: 'استشاري جراحة العيون التجميلية، متخصص في عمليات تجميل الجفون والحاجبين'
      }
    ];

    await db.insert(doctors).values(doctorsData).onConflictDoNothing();

    // إضافة ملفات الأطباء المتقدمة
    const doctorProfilesData = [
      {
        id: '1',
        doctorId: '1',
        clinicName: 'عيادة الدكتور أحمد للتجميل',
        clinicAddress: 'الرياض - حي العليا - شارع الملك فهد',
        clinicPhone: '+966501234567',
        clinicEmail: 'info@drahmed-clinic.com',
        consultationFee: 300,
        followUpFee: 150,
        workingHours: JSON.stringify({
          sunday: { start: '09:00', end: '17:00' },
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: 'closed', end: 'closed' },
          saturday: { start: '10:00', end: '14:00' }
        }),
        languages: JSON.stringify(['العربية', 'الإنجليزية']),
        specializations: JSON.stringify(['تجميل الأنف', 'شد الوجه', 'حقن البوتوكس']),
        onlineConsultation: true,
        emergencyAvailable: false,
        totalPatients: 1250,
        totalSurgeries: 890,
        successRate: 96.5
      },
      {
        id: '2',
        doctorId: '2',
        clinicName: 'مركز د. فاطمة للجلدية والتجميل',
        clinicAddress: 'جدة - حي الحمراء - طريق الأمير محمد بن عبدالعزيز',
        clinicPhone: '+966507654321',
        clinicEmail: 'contact@drfatima-derm.com',
        consultationFee: 250,
        followUpFee: 125,
        workingHours: JSON.stringify({
          sunday: { start: '10:00', end: '18:00' },
          monday: { start: '10:00', end: '18:00' },
          tuesday: { start: '10:00', end: '18:00' },
          wednesday: { start: '10:00', end: '18:00' },
          thursday: { start: '10:00', end: '18:00' },
          friday: { start: 'closed', end: 'closed' },
          saturday: { start: '10:00', end: '16:00' }
        }),
        languages: JSON.stringify(['العربية', 'الإنجليزية', 'الفرنسية']),
        specializations: JSON.stringify(['علاج الأكزيما', 'الليزر التجميلي', 'حقن الفيلر']),
        onlineConsultation: true,
        emergencyAvailable: true,
        totalPatients: 980,
        totalSurgeries: 654,
        successRate: 94.8
      },
      {
        id: '3',
        doctorId: '3',
        clinicName: 'مستشفى الملك فهد التخصصي',
        clinicAddress: 'الدمام - حي الفردوس - شارع الأمير تركي',
        clinicPhone: '+966559876543',
        clinicEmail: 'khalid.jaw@kfsh.med.sa',
        consultationFee: 400,
        followUpFee: 200,
        workingHours: JSON.stringify({
          sunday: { start: '08:00', end: '16:00' },
          monday: { start: '08:00', end: '16:00' },
          tuesday: { start: '08:00', end: '16:00' },
          wednesday: { start: '08:00', end: '16:00' },
          thursday: { start: '08:00', end: '16:00' },
          friday: { start: 'closed', end: 'closed' },
          saturday: { start: 'closed', end: 'closed' }
        }),
        languages: JSON.stringify(['العربية', 'الإنجليزية']),
        specializations: JSON.stringify(['جراحة الفكين', 'تقويم الوجه', 'زراعة العظام']),
        onlineConsultation: false,
        emergencyAvailable: true,
        totalPatients: 1450,
        totalSurgeries: 1230,
        successRate: 98.2
      },
      {
        id: '4',
        doctorId: '4',
        clinicName: 'مركز نورا لطب الأسنان التجميلي',
        clinicAddress: 'الخبر - الكورنيش - مجمع الظهران مول',
        clinicPhone: '+966551122334',
        clinicEmail: 'nora@dental-beauty.com',
        consultationFee: 200,
        followUpFee: 100,
        workingHours: JSON.stringify({
          sunday: { start: '09:00', end: '19:00' },
          monday: { start: '09:00', end: '19:00' },
          tuesday: { start: '09:00', end: '19:00' },
          wednesday: { start: '09:00', end: '19:00' },
          thursday: { start: '09:00', end: '19:00' },
          friday: { start: '15:00', end: '22:00' },
          saturday: { start: '10:00', end: '18:00' }
        }),
        languages: JSON.stringify(['العربية', 'الإنجليزية']),
        specializations: JSON.stringify(['تبييض الأسنان', 'القشور التجميلية', 'التقويم الشفاف']),
        onlineConsultation: true,
        emergencyAvailable: false,
        totalPatients: 750,
        totalSurgeries: 1100,
        successRate: 97.3
      },
      {
        id: '5',
        doctorId: '5',
        clinicName: 'مركز الرؤية للعيون والتجميل',
        clinicAddress: 'مكة المكرمة - العزيزية - شارع إبراهيم الخليل',
        clinicPhone: '+966553344556',
        clinicEmail: 'vision@eye-beauty.sa',
        consultationFee: 350,
        followUpFee: 175,
        workingHours: JSON.stringify({
          sunday: { start: '08:30', end: '17:30' },
          monday: { start: '08:30', end: '17:30' },
          tuesday: { start: '08:30', end: '17:30' },
          wednesday: { start: '08:30', end: '17:30' },
          thursday: { start: '08:30', end: '17:30' },
          friday: { start: 'closed', end: 'closed' },
          saturday: { start: '09:00', end: '15:00' }
        }),
        languages: JSON.stringify(['العربية', 'الإنجليزية']),
        specializations: JSON.stringify(['تجميل الجفون', 'رفع الحاجبين', 'علاج الهالات']),
        onlineConsultation: true,
        emergencyAvailable: true,
        totalPatients: 680,
        totalSurgeries: 456,
        successRate: 95.7
      }
    ];

    await db.insert(doctorProfiles).values(doctorProfilesData).onConflictDoNothing();

    // إضافة ملفات عمليات الأطباء مع صور قبل/بعد
    const portfoliosData = [
      {
        doctorId: '1',
        title: 'تجميل الأنف - نتائج طبيعية ومتميزة',
        procedureType: 'rhinoplasty',
        description: 'عملية تجميل أنف لمريضة شابة، تم تصغير الأنف وتحسين الشكل العام مع المحافظة على الطابع الطبيعي',
        beforeImageUrl: '/uploads/nose-before-1.jpg',
        afterImageUrl: '/uploads/nose-after-1.jpg',
        videoUrl: '/uploads/rhinoplasty-demo-1.mp4',
        patientAge: 28,
        patientGender: 'female',
        surgeryDuration: 120,
        recoveryTime: 14,
        difficulty: 'medium',
        tags: JSON.stringify(['أنف طبيعي', 'تصغير', 'نتائج ممتازة'])
      },
      {
        doctorId: '1',
        title: 'جراحة تجميل الأنف للرجال',
        procedureType: 'rhinoplasty',
        description: 'عملية تجميل أنف لمريض شاب، تم تعديل انحناء الأنف وتحسين التنفس',
        beforeImageUrl: '/uploads/nose-before-2.jpg',
        afterImageUrl: '/uploads/nose-after-2.jpg',
        patientAge: 32,
        patientGender: 'male',
        surgeryDuration: 150,
        recoveryTime: 21,
        difficulty: 'hard',
        tags: JSON.stringify(['تعديل انحناء', 'تحسين تنفس', 'رجال'])
      },
      {
        doctorId: '2',
        title: 'علاج آثار الحبوب بالليزر الجزئي',
        procedureType: 'skin_treatment',
        description: 'علاج متطور لآثار الحبوب باستخدام تقنية الليزر الجزئي مع نتائج فعالة',
        beforeImageUrl: '/uploads/acne-before-1.jpg',
        afterImageUrl: '/uploads/acne-after-1.jpg',
        videoUrl: '/uploads/laser-treatment-demo.mp4',
        patientAge: 24,
        patientGender: 'female',
        surgeryDuration: 60,
        recoveryTime: 7,
        difficulty: 'easy',
        tags: JSON.stringify(['آثار حبوب', 'ليزر جزئي', 'تحسن واضح'])
      },
      {
        doctorId: '3',
        title: 'جراحة تقويم الفكين المتقدمة',
        procedureType: 'facial_contouring',
        description: 'جراحة تقويم الفكين لمريض يعاني من سوء إطباق شديد مع تحسن كبير في الوظيفة والشكل',
        beforeImageUrl: '/uploads/jaw-before-1.jpg',
        afterImageUrl: '/uploads/jaw-after-1.jpg',
        patientAge: 29,
        patientGender: 'male',
        surgeryDuration: 240,
        recoveryTime: 42,
        difficulty: 'hard',
        tags: JSON.stringify(['تقويم فكين', 'سوء إطباق', 'نتائج ممتازة'])
      },
      {
        doctorId: '4',
        title: 'ابتسامة هوليوود الكاملة',
        procedureType: 'dental_alignment',
        description: 'تحويل كامل للابتسامة باستخدام القشور التجميلية عالية الجودة',
        beforeImageUrl: '/uploads/smile-before-1.jpg',
        afterImageUrl: '/uploads/smile-after-1.jpg',
        videoUrl: '/uploads/hollywood-smile-demo.mp4',
        patientAge: 35,
        patientGender: 'female',
        surgeryDuration: 180,
        recoveryTime: 10,
        difficulty: 'medium',
        tags: JSON.stringify(['ابتسامة هوليوود', 'قشور تجميلية', 'تبييض'])
      },
      {
        doctorId: '5',
        title: 'تجميل الجفون العلوية والسفلية',
        procedureType: 'eye_treatment',
        description: 'عملية شد الجفون العلوية والسفلية مع إزالة الأكياس الدهنية وتحسين مظهر العينين',
        beforeImageUrl: '/uploads/eyelid-before-1.jpg',
        afterImageUrl: '/uploads/eyelid-after-1.jpg',
        patientAge: 45,
        patientGender: 'female',
        surgeryDuration: 90,
        recoveryTime: 14,
        difficulty: 'medium',
        tags: JSON.stringify(['شد جفون', 'إزالة أكياس', 'مظهر شبابي'])
      }
    ];

    await db.insert(doctorPortfolios).values(portfoliosData).onConflictDoNothing();

    // إضافة نماذج الوجوه ثلاثية الأبعاد لقاعدة البيانات
    const faceMeshData = [
      {
        meshId: 'mesh_001_female_oval_straight',
        originalImageUrl: '/3d-database/female-oval-straight-nose.jpg',
        meshDataUrl: '/3d-database/female-oval-straight-nose.obj',
        faceType: 'oval',
        noseType: 'straight',
        gender: 'female',
        ethnicity: 'middle_eastern',
        ageRange: '25-35',
        facialLandmarks: JSON.stringify({
          landmarks_468: Array.from({length: 468}, (_, i) => ({
            x: Math.random() * 640,
            y: Math.random() * 480,
            z: Math.random() * 100,
            confidence: 0.95 + Math.random() * 0.05
          }))
        }),
        morphTargets: JSON.stringify({
          nose_width: { min: -0.3, max: 0.3, current: 0.0 },
          nose_length: { min: -0.2, max: 0.2, current: 0.0 },
          nose_tip: { min: -0.25, max: 0.25, current: 0.0 }
        }),
        qualityScore: 0.96,
        processingMetadata: JSON.stringify({
          processing_date: '2024-08-22',
          software_version: 'MediaPipe 0.10.21',
          validation_status: 'approved'
        }),
        isValidated: true
      },
      {
        meshId: 'mesh_002_male_square_roman',
        originalImageUrl: '/3d-database/male-square-roman-nose.jpg',
        meshDataUrl: '/3d-database/male-square-roman-nose.obj',
        faceType: 'square',
        noseType: 'roman',
        gender: 'male',
        ethnicity: 'middle_eastern',
        ageRange: '30-40',
        facialLandmarks: JSON.stringify({
          landmarks_468: Array.from({length: 468}, (_, i) => ({
            x: Math.random() * 640,
            y: Math.random() * 480,
            z: Math.random() * 100,
            confidence: 0.93 + Math.random() * 0.07
          }))
        }),
        morphTargets: JSON.stringify({
          nose_width: { min: -0.4, max: 0.3, current: 0.1 },
          nose_length: { min: -0.3, max: 0.2, current: 0.05 },
          nose_tip: { min: -0.2, max: 0.3, current: -0.1 }
        }),
        qualityScore: 0.94,
        processingMetadata: JSON.stringify({
          processing_date: '2024-08-22',
          software_version: 'MediaPipe 0.10.21',
          validation_status: 'approved'
        }),
        isValidated: true
      },
      {
        meshId: 'mesh_003_female_round_snub',
        originalImageUrl: '/3d-database/female-round-snub-nose.jpg',
        meshDataUrl: '/3d-database/female-round-snub-nose.obj',
        faceType: 'round',
        noseType: 'snub',
        gender: 'female',
        ethnicity: 'middle_eastern',
        ageRange: '20-30',
        facialLandmarks: JSON.stringify({
          landmarks_468: Array.from({length: 468}, (_, i) => ({
            x: Math.random() * 640,
            y: Math.random() * 480,
            z: Math.random() * 100,
            confidence: 0.91 + Math.random() * 0.09
          }))
        }),
        morphTargets: JSON.stringify({
          nose_width: { min: -0.2, max: 0.4, current: 0.2 },
          nose_length: { min: -0.1, max: 0.3, current: -0.05 },
          nose_tip: { min: -0.3, max: 0.2, current: 0.15 }
        }),
        qualityScore: 0.92,
        processingMetadata: JSON.stringify({
          processing_date: '2024-08-22',
          software_version: 'MediaPipe 0.10.21',
          validation_status: 'approved'
        }),
        isValidated: true
      }
    ];

    await db.insert(faceMeshDatabase).values(faceMeshData).onConflictDoNothing();

    console.log('✅ تم إضافة جميع البيانات التجريبية بنجاح!');
    console.log(`📊 تم إضافة:`);
    console.log(`   - ${doctorsData.length} أطباء`);
    console.log(`   - ${doctorProfilesData.length} ملفات أطباء متكاملة`);
    console.log(`   - ${portfoliosData.length} عمليات في الملفات`);
    console.log(`   - ${faceMeshData.length} نماذج وجوه ثلاثية الأبعاد`);

  } catch (error) {
    console.error('❌ خطأ في إضافة البيانات التجريبية:', error);
  }
}