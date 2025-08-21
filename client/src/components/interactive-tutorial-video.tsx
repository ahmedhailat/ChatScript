import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  SkipForward, 
  SkipBack,
  Download,
  Settings,
  BookOpen,
  User,
  Camera,
  Wand2,
  Eye,
  CheckCircle,
  ArrowRight,
  PlayCircle
} from "lucide-react";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  duration: number;
  content: string;
  visual: string;
  tips: string[];
}

const tutorialSteps: TutorialStep[] = [
  {
    id: "intro",
    title: "مرحباً بك في MedVision AI",
    description: "منصة التصور الجراحي بالذكاء الاصطناعي للمهنيين الطبيين",
    duration: 15,
    content: "مرحباً بك في منصة MedVision AI، المنصة الرائدة في مجال التصور الجراحي بالذكاء الاصطناعي. تم تصميم هذه المنصة خصيصاً للمهنيين الطبيين لمساعدتهم في عرض النتائج المحتملة للعمليات الجراحية على المرضى بطريقة آمنة ومتوافقة مع معايير HIPAA.",
    visual: "🏥",
    tips: [
      "المنصة متوافقة 100% مع معايير HIPAA",
      "جميع البيانات مشفرة بالكامل",
      "تقنية الذكاء الاصطناعي الطبي المتقدمة"
    ]
  },
  {
    id: "registration",
    title: "إنشاء حساب جديد",
    description: "كيفية التسجيل والاشتراك في المنصة",
    duration: 20,
    content: "للبدء في استخدام المنصة، ستحتاج إلى إنشاء حساب جديد. انقر على زر 'إنشاء حساب جديد' في الصفحة الرئيسية. أدخل بياناتك الطبية المهنية بما في ذلك الاسم ورقم الترخيص الطبي والتخصص. بعد التحقق من بياناتك، ستتمكن من اختيار الاشتراك المناسب لاحتياجاتك.",
    visual: "👨‍⚕️",
    tips: [
      "أدخل رقم الترخيص الطبي الصحيح للتحقق",
      "اختر التخصص الطبي المناسب",
      "تأكد من صحة البريد الإلكتروني للتفعيل"
    ]
  },
  {
    id: "subscription",
    title: "اختيار خطة الاشتراك",
    description: "الخطط المتاحة وكيفية اختيار الأنسب",
    duration: 25,
    content: "نوفر ثلاث خطط اشتراك مصممة لتلبية احتياجات مختلف المهنيين الطبيين. الخطة الأساسية مناسبة للأطباء الجدد، الخطة المتقدمة للممارسين المعتادين، والخطة الاحترافية للعيادات والمستشفيات. كل خطة تتضمن عدد معين من التصورات الشهرية، دعم فني، وميزات متقدمة حسب المستوى.",
    visual: "💳",
    tips: [
      "الخطة الأساسية: 50 تصور شهرياً",
      "الخطة المتقدمة: 200 تصور شهرياً",
      "الخطة الاحترافية: تصورات غير محدودة"
    ]
  },
  {
    id: "camera-setup",
    title: "إعداد الكاميرا والتصوير",
    description: "كيفية التقاط صور عالية الجودة للمرضى",
    duration: 30,
    content: "للحصول على أفضل النتائج، من المهم التقاط صور عالية الجودة. تأكد من وجود إضاءة جيدة ومتوازنة، ضع الكاميرا على مستوى وجه المريض، واحرص على أن يكون الوجه في منتصف الإطار. تجنب الظلال القوية واستخدم خلفية محايدة. يمكنك استخدام الكاميرا المدمجة في الجهاز أو رفع صورة من الجهاز.",
    visual: "📸",
    tips: [
      "استخدم إضاءة طبيعية أو LED بيضاء",
      "تأكد من وضوح تفاصيل الوجه",
      "تجنب استخدام الفلاش المباشر",
      "احرص على استقامة الرأس والنظر للأمام"
    ]
  },
  {
    id: "procedure-selection",
    title: "اختيار نوع العملية",
    description: "كيفية تحديد نوع الإجراء الطبي المطلوب",
    duration: 20,
    content: "بعد التقاط الصورة، ستختار نوع العملية الجراحية من القائمة المتاحة. تشمل الخيارات: عمليات تجميل الأنف، تبييض وتقويم الأسنان، شد الوجه ونحت الخدود، وإزالة الندبات. كل نوع له خوارزميات متخصصة مدربة على آلاف الحالات الطبية الحقيقية لضمان دقة النتائج.",
    visual: "🔧",
    tips: [
      "عمليات الأنف: تشمل تصغير، تكبير، تعديل الشكل",
      "الأسنان: تبييض، تقويم، زراعة",
      "شد الوجه: رفع الخدود، شد الجلد",
      "الندبات: تقليل الظهور، تحسين الملمس"
    ]
  },
  {
    id: "ai-generation",
    title: "توليد الصورة بالذكاء الاصطناعي",
    description: "كيفية استخدام ميزة التوقع الذكي",
    duration: 35,
    content: "هذه هي أهم ميزة في المنصة. انقر على زر 'توقع الشكل بعد العملية' لبدء عملية التحليل بالذكاء الاصطناعي. ستستغرق العملية بين 20-60 ثانية حسب تعقيد الإجراء. النظام يحلل بنية الوجه، يحدد المناطق المناسبة للتدخل، ويطبق التغييرات المتوقعة بناءً على خبرة آلاف الحالات المشابهة. النتيجة صورة واقعية تظهر الشكل المتوقع بعد العملية.",
    visual: "🤖",
    tips: [
      "تأكد من اتصال الإنترنت قبل البدء",
      "لا تغلق الصفحة أثناء المعالجة",
      "يمكن ضبط شدة التأثير من 1-100",
      "النتائج تعتمد على جودة الصورة الأصلية"
    ]
  },
  {
    id: "area-selection",
    title: "تحديد المناطق بدقة",
    description: "استخدام أداة تحديد مناطق الوجه المتقدمة",
    duration: 25,
    content: "للحصول على نتائج أكثر دقة، يمكنك استخدام أداة تحديد المناطق المتقدمة. هذه الأداة تتيح لك تحديد مناطق معينة في الوجه للتركيز عليها أثناء المعالجة. يمكنك رسم مناطق حول الأنف، الشفاه، الخدود، أو الذقن. كلما كان التحديد أكثر دقة، كانت النتائج أكثر واقعية ومطابقة لتوقعاتك الطبية.",
    visual: "🎯",
    tips: [
      "استخدم حركات دقيقة عند التحديد",
      "يمكن تحديد عدة مناطق في نفس الصورة",
      "تأكد من تغطية كامل المنطقة المطلوبة",
      "يمكن إعادة تعديل التحديد قبل المعالجة"
    ]
  },
  {
    id: "makeup-studio",
    title: "استوديو المكياج الافتراضي",
    description: "تطبيق المكياج الرقمي للتجميل",
    duration: 30,
    content: "ميزة إضافية مفيدة للتجميل وإظهار التحسينات البسيطة. يمكنك تطبيق مكياج افتراضي للشفاه، العيون، الخدود، وكامل الوجه. اختر الألوان المناسبة من اللوحة، وحدد شدة التطبيق، ثم انقر على المنطقة المراد تجميلها. هذه الميزة مفيدة خاصة لعرض التحسينات التجميلية البسيطة أو لإظهار الشكل المتوقع مع المكياج بعد عمليات معينة.",
    visual: "💄",
    tips: [
      "ابدأ بألوان خفيفة ثم زد الشدة تدريجياً",
      "اختر ألوان تناسب لون البشرة",
      "يمكن مزج عدة ألوان للحصول على التأثير المطلوب",
      "استخدم فرشة ناعمة للحصول على مظهر طبيعي"
    ]
  },
  {
    id: "results-analysis",
    title: "تحليل النتائج والمقارنة",
    description: "كيفية عرض ومقارنة الصور قبل وبعد",
    duration: 20,
    content: "بعد إنتاج الصورة المتوقعة، ستحصل على عرض مقارن يظهر الصورة الأصلية والنتيجة المتوقعة جنباً إلى جنب. يمكنك التبديل بين العرض المنفصل والعرض المدمج. استخدم هذه المقارنة لشرح النتائج المتوقعة للمريض بوضوح. يمكنك أيضاً حفظ النتائج في ملف المريض أو طباعتها للمراجعة اللاحقة.",
    visual: "📊",
    tips: [
      "اعرض النتائج على شاشة كبيرة للوضوح",
      "اشرح للمريض أن النتائج تقديرية",
      "احفظ النتائج في ملف المريض",
      "ناقش التوقعات الواقعية مع المريض"
    ]
  },
  {
    id: "consultation",
    title: "إدارة الاستشارات",
    description: "كيفية توثيق الاستشارة وحفظ البيانات",
    duration: 25,
    content: "يتضمن النظام نموذج استشارة شامل لتوثيق جلسة العمل مع المريض. أدخل بيانات المريض الأساسية، نوع الإجراء المقترح، الملاحظات الطبية، والتوصيات. يمكن حفظ جميع البيانات بشكل آمن ومشفر. هذا التوثيق مهم للمتابعة الطبية ولضمان استمرارية الرعاية الطبية وفقاً للمعايير المهنية.",
    visual: "📋",
    tips: [
      "أدخل جميع البيانات المطلوبة بدقة",
      "اكتب ملاحظات واضحة ومفصلة",
      "احفظ نسخة احتياطية من التقرير",
      "راجع البيانات قبل الحفظ النهائي"
    ]
  },
  {
    id: "best-practices",
    title: "أفضل الممارسات والنصائح",
    description: "نصائح للحصول على أفضل النتائج",
    duration: 30,
    content: "للحصول على أفضل النتائج من المنصة: استخدم دائماً صور عالية الجودة بإضاءة جيدة، ناقش التوقعات الواقعية مع المرضى، احفظ نسخ احتياطية من جميع النتائج، حافظ على تحديث النظام للحصول على أحدث الميزات، واستفد من الدعم الفني المتاح 24/7. تذكر أن هذه الأداة مساعدة للتصور وليست بديلاً عن الخبرة الطبية والتقييم الشخصي.",
    visual: "✨",
    tips: [
      "اتبع المعايير الطبية المهنية دائماً",
      "احترم خصوصية المرضى",
      "استخدم النتائج كأداة تصور فقط",
      "استمر في التعلم والتطوير المهني"
    ]
  }
];

export function InteractiveTutorialVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalDuration = tutorialSteps.reduce((sum, step) => sum + step.duration, 0);

  useEffect(() => {
    if (isPlaying && !isCompleted) {
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + (playbackSpeed / tutorialSteps[currentStep].duration);
          
          if (newProgress >= 100) {
            if (currentStep < tutorialSteps.length - 1) {
              setCurrentStep(curr => curr + 1);
              return 0;
            } else {
              setIsCompleted(true);
              setIsPlaying(false);
              return 100;
            }
          }
          
          return newProgress;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentStep, playbackSpeed, isCompleted]);

  const handlePlayPause = () => {
    if (isCompleted) {
      // Reset to beginning
      setCurrentStep(0);
      setProgress(0);
      setIsCompleted(false);
    }
    setIsPlaying(!isPlaying);
  };

  const handleStepChange = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setProgress(0);
    setIsPlaying(false);
  };

  const handleSkipForward = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setProgress(0);
    }
  };

  const handleSkipBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setProgress(0);
    }
  };

  const getCurrentStepTime = () => {
    const elapsed = Math.floor((progress / 100) * tutorialSteps[currentStep].duration);
    return `${elapsed}:${(elapsed % 60).toString().padStart(2, '0')}`;
  };

  const getTotalElapsed = () => {
    const previousStepsTime = tutorialSteps.slice(0, currentStep)
      .reduce((sum, step) => sum + step.duration, 0);
    const currentStepTime = (progress / 100) * tutorialSteps[currentStep].duration;
    const total = Math.floor(previousStepsTime + currentStepTime);
    return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, '0')}`;
  };

  const currentTutorialStep = tutorialSteps[currentStep];

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden" dir="rtl">
      {/* Video Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">دليل استخدام MedVision AI</h2>
            <p className="text-blue-100">شرح تفصيلي شامل لجميع ميزات المنصة</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">{currentTutorialStep.visual}</div>
            <Badge variant="secondary" className="text-xs">
              الخطوة {currentStep + 1} من {tutorialSteps.length}
            </Badge>
          </div>
        </div>
      </div>

      {/* Video Content Area */}
      <div className="p-6">
        <div className="bg-slate-900 rounded-lg mb-6 relative overflow-hidden" style={{ minHeight: '300px' }}>
          {/* Video Simulation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">{currentTutorialStep.visual}</div>
              <h3 className="text-white text-xl font-bold mb-2">{currentTutorialStep.title}</h3>
              <p className="text-gray-300 text-sm max-w-md">{currentTutorialStep.description}</p>
            </div>
          </div>

          {/* Play/Pause Overlay */}
          {!isPlaying && !isCompleted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <Button
                onClick={handlePlayPause}
                className="bg-blue-600 hover:bg-blue-700 rounded-full p-4"
                size="lg"
              >
                <PlayCircle className="w-8 h-8" />
              </Button>
            </div>
          )}

          {/* Completion Overlay */}
          {isCompleted && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-white text-xl font-bold mb-4">تم إكمال الدورة التدريبية!</h3>
                <Button
                  onClick={handlePlayPause}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  إعادة تشغيل
                </Button>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <Progress value={progress} className="h-2 bg-gray-800" />
          </div>

          {/* Time Display */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            {getTotalElapsed()} / {Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, '0')}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkipBack}
              disabled={currentStep === 0}
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={handlePlayPause}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkipForward}
              disabled={currentStep === tutorialSteps.length - 1}
            >
              <SkipForward className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>

            <select 
              value={playbackSpeed} 
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Current Step Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {currentTutorialStep.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed mb-4">
              {currentTutorialStep.content}
            </p>
            
            {currentTutorialStep.tips.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">نصائح مهمة:</h4>
                <ul className="space-y-1">
                  {currentTutorialStep.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {tutorialSteps.map((step, index) => (
            <Button
              key={step.id}
              variant={currentStep === index ? "default" : "outline"}
              size="sm"
              onClick={() => handleStepChange(index)}
              className="justify-start text-xs h-auto p-2"
            >
              <div className="text-left">
                <div className="font-medium truncate">{step.title}</div>
                <div className="text-xs opacity-70">{step.duration}ث</div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}