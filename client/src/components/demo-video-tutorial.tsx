import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MakeupAreaSelector } from "@/components/makeup-area-selector";
import { OpenSourceTutorial } from "@/components/open-source-tutorial";

export function DemoVideoTutorial() {
  const [activeDemo, setActiveDemo] = useState<'video' | 'interactive' | 'opensource'>('opensource');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const demoSteps = [
    {
      title: "مقدمة عن أدوات المكياج الافتراضي",
      description: "تعرف على واجهة التطبيق وأدوات التحديد المختلفة",
      duration: "2:30 دقيقة",
      features: ["واجهة المستخدم", "أدوات التحديد", "لوحة الألوان"]
    },
    {
      title: "تحديد منطقة الشفاه وتطبيق أحمر الشفاه",
      description: "تعلم كيفية تحديد الشفاه بدقة وتطبيق الألوان المختلفة",
      duration: "3:15 دقيقة", 
      features: ["تحديد الشفاه", "اختيار الألوان", "ضبط الشدة"]
    },
    {
      title: "مكياج العيون والرموش",
      description: "تطبيق مكياج العيون وكحل وماسكارا افتراضي",
      duration: "4:20 دقيقة",
      features: ["كحل العيون", "ظلال العيون", "الماسكارا"]
    },
    {
      title: "تحديد الخدود وتطبيق البلاشر",
      description: "إضافة إشراق طبيعي للخدود مع ألوان متنوعة",
      duration: "2:45 دقيقة",
      features: ["تحديد الخدود", "ألوان البلاشر", "المزج الطبيعي"]
    },
    {
      title: "تشكيل الحواجب وتحسينها",
      description: "تحديد وتشكيل الحواجب للحصول على مظهر مثالي",
      duration: "3:00 دقيقة",
      features: ["تشكيل الحواجب", "ملء الفراغات", "تحديد الشكل"]
    },
    {
      title: "حفظ ومشاركة النتائج النهائية",
      description: "طرق حفظ الصور ومشاركتها بجودة عالية",
      duration: "1:50 دقيقة",
      features: ["حفظ عالي الجودة", "مشاركة سريعة", "مقارنة النتائج"]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      <Card className="shadow-2xl overflow-hidden mb-6">
        <CardHeader className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white">
          <div className="text-center">
            <CardTitle className="text-3xl mb-2">
              🎬 فيديو توضيحي شامل - تطبيق المكياج بتحديد المناطق
            </CardTitle>
            <p className="text-lg opacity-90">
              تعلم استخدام جميع أدوات المكياج الافتراضي خطوة بخطوة
            </p>
          </div>
          
          <div className="flex justify-center gap-3 mt-4">
            <Button
              variant={activeDemo === 'video' ? 'secondary' : 'outline'}
              onClick={() => setActiveDemo('video')}
              className="text-white border-white hover:bg-white/20"
            >
              📹 الفيديو المرجعي
            </Button>
            <Button
              variant={activeDemo === 'interactive' ? 'secondary' : 'outline'}
              onClick={() => setActiveDemo('interactive')}
              className="text-white border-white hover:bg-white/20"
            >
              🎨 التجربة التفاعلية
            </Button>
            <Button
              variant={activeDemo === 'opensource' ? 'secondary' : 'outline'}
              onClick={() => setActiveDemo('opensource')}
              className="text-white border-white hover:bg-white/20"
            >
              🆓 فيديوهات مفتوحة المصدر
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {activeDemo === 'video' ? (
            // Video Tutorial Section
            <div>
              {/* Video Player */}
              <div className="relative bg-black">
                <video
                  className="w-full aspect-video"
                  src="/attached_assets/WhatsApp Video 2025-08-21 at 11.55.34_5cfd9223_1755766720369.mp4"
                  poster="/attached_assets/image_1755760857743.png"
                  controls
                />
                
                {/* Video Overlay */}
                <div className="absolute top-4 left-4 right-4">
                  <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center justify-between text-white text-sm">
                      <span>الخطوة {currentStep + 1}: {demoSteps[currentStep].title}</span>
                      <Badge className="bg-red-600">
                        🔴 مباشر
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Steps Navigation */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">خطوات الفيديو التوضيحي</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {demoSteps.map((step, index) => (
                    <Card
                      key={index}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        currentStep === index ? 'border-pink-500 bg-pink-50' : ''
                      }`}
                      onClick={() => setCurrentStep(index)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                            ${currentStep === index 
                              ? 'bg-pink-500 text-white' 
                              : 'bg-gray-200 text-gray-700'
                            }
                          `}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
                            <p className="text-xs text-gray-600 mb-2">{step.description}</p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {step.duration}
                              </Badge>
                              {currentStep === index && (
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                  <span className="text-xs text-red-600">نشط</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-2">
                              <div className="text-xs text-gray-500 mb-1">الميزات:</div>
                              <div className="flex flex-wrap gap-1">
                                {step.features.map((feature, fIndex) => (
                                  <Badge key={fIndex} variant="secondary" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Video Information */}
              <div className="p-6 bg-gradient-to-r from-pink-50 to-purple-50 border-t">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🎯</div>
                    <h4 className="font-bold mb-2">هدف الفيديو</h4>
                    <p className="text-sm text-gray-600">
                      تعلم تطبيق المكياج الافتراضي بطريقة احترافية مع تحديد المناطق بدقة
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl mb-2">⏱️</div>
                    <h4 className="font-bold mb-2">المدة الإجمالية</h4>
                    <p className="text-sm text-gray-600">
                      17 دقيقة و 40 ثانية من التعلم المركز
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl mb-2">📱</div>
                    <h4 className="font-bold mb-2">متوافق مع</h4>
                    <p className="text-sm text-gray-600">
                      جميع الأجهزة والمتصفحات الحديثة
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : activeDemo === 'interactive' ? (
            // Interactive Demo Section
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">🎨 التجربة التفاعلية</h3>
                <p className="text-gray-600">
                  جرب أدوات المكياج الافتراضي بنفسك واكتشف جميع الميزات
                </p>
              </div>
              
              <MakeupAreaSelector />
            </div>
          ) : (
            // Open Source Videos Section
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">🆓 فيديوهات تعليمية مفتوحة المصدر</h3>
                <p className="text-gray-600">
                  مجموعة شاملة من الفيديوهات التعليمية عالية الجودة متاحة مجاناً
                </p>
              </div>
              
              <OpenSourceTutorial />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Highlights */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <div className="text-2xl mb-2">🎯</div>
          <h3 className="font-semibold mb-1">تحديد دقيق</h3>
          <p className="text-xs text-gray-600">تحديد المناطق بدقة عالية</p>
        </Card>
        
        <Card className="text-center p-4">
          <div className="text-2xl mb-2">🌈</div>
          <h3 className="font-semibold mb-1">ألوان متنوعة</h3>
          <p className="text-xs text-gray-600">مجموعة كبيرة من الألوان</p>
        </Card>
        
        <Card className="text-center p-4">
          <div className="text-2xl mb-2">✨</div>
          <h3 className="font-semibold mb-1">تأثيرات واقعية</h3>
          <p className="text-xs text-gray-600">نتائج طبيعية ومقنعة</p>
        </Card>
        
        <Card className="text-center p-4">
          <div className="text-2xl mb-2">💾</div>
          <h3 className="font-semibold mb-1">حفظ بجودة عالية</h3>
          <p className="text-xs text-gray-600">تصدير بدقة احترافية</p>
        </Card>
      </div>
    </div>
  );
}