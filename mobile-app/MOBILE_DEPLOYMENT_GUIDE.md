# 📱 دليل نشر MedVision AI Mobile على iOS و Android

## نظرة عامة
تم إنشاء تطبيق MedVision AI Mobile باستخدام React Native + Expo للحصول على تطبيق موحد يعمل على نظامي iOS و Android.

## المتطلبات الأساسية

### 1. تثبيت Node.js و npm
```bash
# تحقق من تثبيت Node.js
node --version  # يجب أن يكون 16.0.0 أو أحدث
npm --version
```

### 2. تثبيت Expo CLI
```bash
npm install -g @expo/cli
npm install -g eas-cli
```

### 3. إنشاء حساب Expo
- اذهب إلى https://expo.dev/signup
- أنشئ حساب جديد
- احفظ بيانات الدخول

## إعداد المشروع

### 1. التنقل إلى مجلد التطبيق المحمول
```bash
cd mobile-app
```

### 2. تثبيت التبعيات
```bash
npm install
```

### 3. تثبيت مكونات إضافية للكاميرا والصور
```bash
npx expo install expo-image-picker expo-camera expo-media-library
```

## تشغيل التطبيق للتطوير

### 1. تشغيل على Expo Go (للاختبار السريع)
```bash
npx expo start
```

### 2. تشغيل على محاكي iOS (macOS فقط)
```bash
npx expo start --ios
```

### 3. تشغيل على محاكي Android
```bash
npx expo start --android
```

## إعداد البناء للنشر

### 1. تسجيل الدخول إلى Expo
```bash
npx expo login
```

### 2. إعداد EAS Build
```bash
npx eas build:configure
```

### 3. إنشاء ملف eas.json (إذا لم يكن موجوداً)
```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "ios": {
        "autoIncrement": true
      },
      "android": {
        "autoIncrement": true
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## بناء التطبيق

### 1. بناء نسخة Android (APK)
```bash
npx eas build --platform android --profile production
```

### 2. بناء نسخة iOS (بحاجة لحساب Apple Developer)
```bash
npx eas build --platform ios --profile production
```

### 3. بناء كلا النظامين
```bash
npx eas build --platform all --profile production
```

## متطلبات إضافية للنشر

### لنظام iOS:
1. **حساب Apple Developer** ($99/سنة)
   - اذهب إلى https://developer.apple.com
   - أنشئ حساب Developer
   - ادفع الاشتراك السنوي

2. **إعداد شهادات iOS**
```bash
npx eas credentials
```

3. **تحديد Bundle Identifier فريد**
```json
"ios": {
  "bundleIdentifier": "com.yourcompany.medvision"
}
```

### لنظام Android:
1. **إعداد Google Play Console**
   - اذهب إلى https://play.google.com/console
   - ادفع رسوم التسجيل لمرة واحدة ($25)

2. **إنشاء مفتاح توقيع**
```bash
npx eas credentials
```

## نشر التطبيق

### 1. تحميل إلى App Store (iOS)
```bash
npx eas submit --platform ios
```

### 2. تحميل إلى Google Play Store (Android)
```bash
npx eas submit --platform android
```

## إعداد الخادم الخلفي

### 1. تحديث رابط الخادم
```javascript
// في ملف app.json
"extra": {
  "serverUrl": "https://your-actual-server.com"
}
```

### 2. إعداد CORS في الخادم
```javascript
// في server/routes.ts
app.use(cors({
  origin: ['exp://192.168.1.100:19000', 'https://your-app-domain.com'],
  credentials: true
}));
```

## الميزات المتاحة في التطبيق المحمول

### ✅ مكتملة:
- **واجهة رئيسية** بعرض الميزات والإحصائيات
- **استوديو تحرير الوجه** مع 5 تأثيرات أساسية
- **التقاط الصور** من الكاميرا أو المعرض
- **معالجة الصور** مع الاتصال بالخادم
- **واجهة عربية** مع تصميم RTL
- **تنقل سفلي** بين الأقسام المختلفة

### 🔄 قيد التطوير:
- **النمذجة ثلاثية الأبعاد**
- **نظام الاستشارات الطبية**
- **دردشة فورية مع الأطباء**
- **جدولة المواعيد**

## اختبار التطبيق

### 1. اختبار على أجهزة فعلية
```bash
# تثبيت Expo Go من متجر التطبيقات
# مسح QR Code من الطرفية
npx expo start
```

### 2. اختبار البناء النهائي
```bash
# إنشاء بناء تجريبي
npx eas build --platform android --profile preview
# تنزيل APK واختباره
```

## استكشاف الأخطاء

### مشاكل شائعة:

1. **خطأ في تثبيت التبعيات**
```bash
rm -rf node_modules package-lock.json
npm install
```

2. **مشاكل الكاميرا على iOS**
```json
"ios": {
  "infoPlist": {
    "NSCameraUsageDescription": "This app needs camera access"
  }
}
```

3. **مشاكل الصلاحيات على Android**
```json
"android": {
  "permissions": ["CAMERA", "READ_EXTERNAL_STORAGE"]
}
```

## الخطوات التالية

1. **اختبار التطبيق** على أجهزة مختلفة
2. **إكمال الميزات المتبقية** (3D، استشارات)
3. **اختبار الأداء** والتحسين
4. **إعداد التحليلات** (Analytics)
5. **تحضير مواد التسويق** (أيقونات، لقطات شاشة)
6. **نشر النسخة النهائية** على المتاجر

## روابط مفيدة

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Guide](https://docs.expo.dev/build/introduction/)
- [React Native Performance](https://reactnative.dev/docs/performance)
- [App Store Guidelines](https://developer.apple.com/app-store/guidelines/)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)

---

## 📞 الدعم الفني

إذا واجهت أي مشاكل في النشر، تواصل مع فريق التطوير مع توضيح:
1. نظام التشغيل المستخدم
2. رسالة الخطأ الكاملة
3. الخطوات المتبعة قبل حدوث المشكلة