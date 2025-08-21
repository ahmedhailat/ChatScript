import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, FastForward, Volume2, VolumeX, Camera, Sparkles, User, Eye, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export function InteractiveTutorialVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Comprehensive tutorial steps for FaceApp Studio
  const tutorialSteps = [
    {
      title: "مرحباً بك في FaceApp Studio",
      content: "أقوى تطبيق لتحرير الوجه بالذكاء الاصطناعي في العالم العربي",
      duration: 4000,
      icon: <Sparkles className="w-12 h-12 text-yellow-400" />,
      actions: ["عرض الواجهة الرئيسية", "شرح الميزات الأساسية", "التعرف على الأدوات"]
    },
    {
      title: "تسجيل الدخول والاشتراك",
      content: "إنشاء حساب جديد والاشتراك في الخطة المناسبة",
      duration: 5000,
      icon: <User className="w-12 h-12 text-blue-400" />,
      actions: ["إنشاء حساب جديد", "اختيار خطة الاشتراك", "طرق الدفع المتاحة", "تفعيل الحساب"]
    },
    {
      title: "رفع الصور والتقاط الصور",
      content: "تعلم كيفية رفع الصور من المعرض أو التقاطها بالكاميرا",
      duration: 4500,
      icon: <Camera className="w-12 h-12 text-green-400" />,
      actions: ["رفع صورة من المعرض", "التقاط صورة جديدة", "متطلبات جودة الصورة", "نصائح للحصول على أفضل نتائج"]
    },
    {
      title: "تأثيرات العمر - اجعل نفسك أصغر أو أكبر",
      content: "تطبيق تأثيرات العمر لتبدو أصغر سناً أو أكبر بواقعية",
      duration: 6000,
      icon: <User className="w-12 h-12 text-purple-400" />,
      actions: ["تأثير أصغر سناً", "تأثير أكبر سناً", "ضبط شدة التأثير", "معاينة النتيجة النهائية"]
    },
    {
      title: "تحويل الجنس - ذكر إلى أنثى والعكس",
      content: "تجربة مظهرك بملامح الجنس الآخر بطريقة واقعية",
      duration: 5500,
      icon: <User className="w-12 h-12 text-pink-400" />,
      actions: ["تحويل إلى مظهر أنثوي", "تحويل إلى مظهر ذكوري", "ضبط قوة التحويل", "الحفاظ على الملامح الطبيعية"]
    },
    {
      title: "إضافة الابتسامة والتعبيرات",
      content: "تطبيق تعبيرات مختلفة مثل الابتسامة والضحك",
      duration: 4500,
      icon: <Eye className="w-12 h-12 text-orange-400" />,
      actions: ["إضافة ابتسامة طبيعية", "ضحكة عريضة", "تعبيرات العيون", "ضبط طبيعية التعبير"]
    },
    {
      title: "تطبيق المكياج الافتراضي",
      content: "إضافة مكياج احترافي وألوان متنوعة للشفاه والعيون",
      duration: 7000,
      icon: <Palette className="w-12 h-12 text-red-400" />,
      actions: ["أحمر شفاه بألوان مختلفة", "مكياج العيون", "كحل وماسكارا", "أساس وبودرة", "ضبط شدة المكياج"]
    },
    {
      title: "تأثيرات الشعر والعيون",
      content: "تغيير لون الشعر والعيون وإضافة اللحية",
      duration: 5500,
      icon: <Sparkles className="w-12 h-12 text-teal-400" />,
      actions: ["تغيير لون الشعر", "تغيير لون العيون", "إضافة لحية أو شارب", "تكبير حجم العيون"]
    },
    {
      title: "تأثيرات الجمال والإشراق",
      content: "تحسين ملامح الوجه وإضافة إشراق طبيعي للبشرة",
      duration: 5000,
      icon: <Sparkles className="w-12 h-12 text-amber-400" />,
      actions: ["نعومة البشرة", "إشراق طبيعي", "تحسين الملامح", "إزالة العيوب"]
    },
    {
      title: "التحكم بشدة التأثيرات",
      content: "كيفية ضبط قوة كل تأثير للحصول على النتيجة المثالية",
      duration: 4000,
      icon: <Eye className="w-12 h-12 text-indigo-400" />,
      actions: ["استخدام شريط التحكم", "معاينة مباشرة", "دمج عدة تأثيرات", "الحصول على نتيجة طبيعية"]
    },
    {
      title: "حفظ ومشاركة النتائج",
      content: "تصدير الصور النهائية ومشاركتها على وسائل التواصل",
      duration: 4500,
      icon: <Camera className="w-12 h-12 text-cyan-400" />,
      actions: ["حفظ بجودة عالية", "مشاركة مباشرة", "حفظ في المعرض", "مقارنة قبل وبعد"]
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentStep < tutorialSteps.length) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + (100 / (tutorialSteps[currentStep].duration / 100)) * speed;
          
          if (newProgress >= 100) {
            if (currentStep < tutorialSteps.length - 1) {
              setCurrentStep(prev => prev + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return 100;
            }
          }
          
          return newProgress;
        });
      }, 100);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, speed, tutorialSteps.length]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const restart = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsPlaying(true);
  };

  const toggleSpeed = () => {
    setSpeed(speed === 1 ? 2 : speed === 2 ? 0.5 : 1);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setProgress(0);
  };

  const currentStepData = tutorialSteps[currentStep];

  return (
    <div className="max-w-6xl mx-auto p-6" dir="rtl">
      <Card className="shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardTitle className="text-3xl text-center">
            🎭 الدليل الشامل لـ FaceApp Studio
          </CardTitle>
          <p className="text-center text-lg opacity-90">
            تعلم جميع ميزات تحرير الوجه بالذكاء الاصطناعي خطوة بخطوة
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {/* Video Display Area */}
          <div className="aspect-video bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white p-8 max-w-2xl">
                <div className="mb-6 animate-bounce">
                  {currentStepData?.icon}
                </div>
                <h3 className="text-4xl font-bold mb-4 leading-tight">
                  {currentStepData?.title}
                </h3>
                <p className="text-xl opacity-90 mb-6">
                  {currentStepData?.content}
                </p>
                
                {/* Demo Actions */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {currentStepData?.actions.slice(0, 4).map((action, index) => (
                    <div 
                      key={index} 
                      className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-sm animate-pulse"
                      style={{ animationDelay: `${index * 0.5}s` }}
                    >
                      ✨ {action}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  مباشر
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  HD
                </Badge>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
              <Progress value={progress} className="h-3 mb-2" />
              <div className="flex justify-between text-white text-sm">
                <span>الخطوة {currentStep + 1} من {tutorialSteps.length}</span>
                <span>{Math.round(progress)}% مكتمل</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="p-6 bg-gray-50">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Button onClick={togglePlay} size="lg" className="bg-blue-600 hover:bg-blue-700">
                {isPlaying ? <Pause className="w-6 h-6 ml-2" /> : <Play className="w-6 h-6 ml-2" />}
                {isPlaying ? "إيقاف مؤقت" : "تشغيل"}
              </Button>
              
              <Button onClick={restart} variant="outline" size="lg">
                <RotateCcw className="w-5 h-5 ml-2" />
                إعادة تشغيل
              </Button>
              
              <Button onClick={toggleSpeed} variant="outline">
                <FastForward className="w-5 h-5 ml-2" />
                السرعة {speed}x
              </Button>
              
              <Button onClick={toggleMute} variant="outline">
                {isMuted ? <VolumeX className="w-5 h-5 ml-2" /> : <Volume2 className="w-5 h-5 ml-2" />}
                {isMuted ? "إلغاء كتم" : "كتم الصوت"}
              </Button>
            </div>

            {/* Quick Navigation */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {tutorialSteps.map((step, index) => (
                <Button
                  key={index}
                  onClick={() => goToStep(index)}
                  variant={currentStep === index ? "default" : "outline"}
                  size="sm"
                  className="min-w-[120px]"
                >
                  {index + 1}. {step.title.split(' - ')[0]}
                </Button>
              ))}
            </div>
          </div>

          {/* Step Details */}
          <div className="p-6">
            <h4 className="font-bold text-2xl mb-4 text-center">محتويات الدورة التدريبية</h4>
            <div className="grid md:grid-cols-2 gap-4">
              {tutorialSteps.map((step, index) => (
                <Card 
                  key={index} 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    currentStep === index 
                      ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => goToStep(index)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <Badge 
                            variant={currentStep === index ? "default" : "secondary"}
                            className="mb-2"
                          >
                            الخطوة {index + 1}
                          </Badge>
                          {currentStep === index && isPlaying && (
                            <div className="flex items-center gap-1 text-green-600">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs">قيد التشغيل</span>
                            </div>
                          )}
                        </div>
                        <h5 className="font-bold text-lg mb-2">{step.title}</h5>
                        <p className="text-gray-600 mb-3">{step.content}</p>
                        
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-gray-700">ما ستتعلمه:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {step.actions.map((action, actionIndex) => (
                              <li key={actionIndex} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}