# 📱 MedVision AI Mobile

## نظرة عامة
تطبيق MedVision AI المحمول - تطبيق موحد لنظامي iOS و Android مبني بتقنية React Native + Expo.

## الميزات الرئيسية

### ✅ مكتمل:
- **واجهة رئيسية** مع عرض الميزات والإحصائيات
- **استوديو تحرير الوجه** مع 5 تأثيرات:
  - 💄 مكياج احترافي
  - ⏰ تغيير العمر  
  - 👥 تحويل الجنس
  - ✨ تجميل الوجه
  - 🎭 نمذجة ثلاثية الأبعاد
- **التقاط وتحديد الصور** من الكاميرا أو المعرض
- **معالجة الصور** مع الاتصال بخادم MedVision AI
- **واجهة عربية كاملة** مع دعم RTL
- **تصميم محمول محسن** للشاشات الصغيرة
- **تنقل سفلي** بين الأقسام

### 🔄 قيد التطوير:
- **النمذجة ثلاثية الأبعاد الكاملة**
- **نظام الاستشارات الطبية**
- **دردشة فورية مع الأطباء**  
- **جدولة المواعيد**
- **مشاركة النتائج**

## البناء والنشر

### متطلبات النشر:
1. **iOS**: حساب Apple Developer ($99/سنة)
2. **Android**: Google Play Console ($25 مرة واحدة)

### أوامر البناء:
```bash
# Android APK
npx eas build --platform android --profile production

# iOS App
npx eas build --platform ios --profile production

# كلا النظامين
npx eas build --platform all --profile production
```

### النشر على المتاجر:
```bash
# نشر iOS
npx eas submit --platform ios

# نشر Android  
npx eas submit --platform android
```

## تشغيل للتطوير

```bash
# تثبيت التبعيات
npm install

# تشغيل على Expo Go
npx expo start

# تشغيل على محاكي
npx expo start --ios     # iOS (macOS فقط)
npx expo start --android # Android
```

## الملفات المهمة

- `App.tsx` - نقطة الدخول الرئيسية
- `src/components/SimpleMobileFaceApp.tsx` - استوديو تحرير الوجه  
- `app.json` - إعداد Expo والأذونات
- `MOBILE_DEPLOYMENT_GUIDE.md` - دليل النشر الكامل

## إعداد الخادم

التطبيق يتصل بخادم MedVision AI الرئيسي:
```javascript
serverUrl: "https://your-replit-app.replit.app"
```

## الصلاحيات المطلوبة

### iOS:
- `NSCameraUsageDescription` - الوصول للكاميرا
- `NSPhotoLibraryUsageDescription` - الوصول للصور

### Android:
- `CAMERA` - الوصول للكاميرا
- `READ_EXTERNAL_STORAGE` - قراءة الصور
- `INTERNET` - الاتصال بالإنترنت

## تقنيات مستخدمة

- **React Native** - إطار العمل الأساسي
- **Expo** - أدوات التطوير والنشر
- **TypeScript** - لغة البرمجة
- **Expo Image Picker** - اختيار الصور
- **Expo Camera** - التقاط الصور

## حالة المشروع

🎯 **جاهز للنشر الأولي** - التطبيق الأساسي مكتمل ويمكن نشره على المتاجر.

المرحلة التالية: إكمال الميزات المتقدمة (3D، استشارات طبية) وتحسينات الأداء.