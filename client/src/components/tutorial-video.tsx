import { useState } from "react";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// استيراد الفيديو التعليمي
const tutorialVideoUrl = "/attached_assets/WhatsApp Video 2025-08-10 at 22.39.34_0ae55de1_1754854909628.mp4";

interface TutorialStep {
  time: number;
  title: string;
  description: string;
  icon: string;
}

export default function TutorialVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  const tutorialSteps: TutorialStep[] = [
    {
      time: 0,
      title: "مرحباً بك في MedVision AI",
      description: "منصة التصور الجراحي المتقدمة بالذكاء الاصطناعي",
      icon: "🎯"
    },
    {
      time: 5,
      title: "التقاط الصورة",
      description: "استخدم الكاميرا لالتقاط صورة واضحة للوجه أو ارفع صورة من الجهاز",
      icon: "📸"
    },
    {
      time: 15,
      title: "اختيار نوع العملية",
      description: "حدد نوع العملية الجراحية المرغوبة (أنف، أسنان، نحت وجه، إزالة ندبات)",
      icon: "⚕️"
    },
    {
      time: 25,
      title: "تحديد المناطق",
      description: "استخدم أداة تحديد المناطق لاختيار المنطقة المحددة للمعالجة",
      icon: "🎯"
    },
    {
      time: 35,
      title: "تطبيق المكياج",
      description: "اختبر أدوات المكياج المختلفة (أحمر شفاه، ظلال عيون، بلاشر) لمعاينة التأثيرات",
      icon: "💄"
    },
    {
      time: 45,
      title: "إنتاج المعاينة بالذكاء الاصطناعي",
      description: "اضغط على زر إنتاج المعاينة للحصول على النتيجة المتوقعة بالذكاء الاصطناعي",
      icon: "🤖"
    },
    {
      time: 55,
      title: "مراجعة النتائج",
      description: "قارن بين الصورة الأصلية والنتيجة المتوقعة واحفظ النتائج",
      icon: "✅"
    }
  ];

  const handlePlayPause = () => {
    if (videoRef) {
      if (isPlaying) {
        videoRef.pause();
      } else {
        videoRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef) {
      videoRef.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef) {
      setCurrentTime(videoRef.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef) {
      setDuration(videoRef.duration);
    }
  };

  const skipToStep = (time: number) => {
    if (videoRef) {
      videoRef.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getCurrentStep = () => {
    return tutorialSteps.find((step, index) => {
      const nextStep = tutorialSteps[index + 1];
      return currentTime >= step.time && (!nextStep || currentTime < nextStep.time);
    }) || tutorialSteps[0];
  };

  const currentStep = getCurrentStep();

  return (
    <div className="space-y-6" dir="rtl">
      {/* Video Player Card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-medical-blue to-ai-purple text-white">
          <CardTitle className="flex items-center gap-3">
            <Play className="w-6 h-6" />
            فيديو شرح التطبيق
          </CardTitle>
          <CardDescription className="text-blue-100">
            دليل شامل لاستخدام منصة MedVision AI للتصور الجراحي
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Video Container */}
          <div className="relative bg-black">
            <video
              ref={setVideoRef}
              className="w-full h-auto max-h-96 object-contain"
              src={tutorialVideoUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 600'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%2364748b' font-size='24' font-family='Arial'%3EMedVision AI Tutorial%3C/text%3E%3C/svg%3E"
            />
            
            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={handlePlayPause}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                
                <Button
                  onClick={handleMuteToggle}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                
                <div className="flex-1">
                  <div className="bg-white/30 rounded-full h-1">
                    <div 
                      className="bg-white rounded-full h-1 transition-all duration-100"
                      style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                
                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Step Display */}
      <Card className="border-2 border-medical-blue/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-3xl">{currentStep.icon}</div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{currentStep.title}</h3>
              <p className="text-slate-600">{currentStep.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>الخطوة الحالية:</span>
            <span className="font-medium">
              {tutorialSteps.findIndex(step => step === currentStep) + 1} من {tutorialSteps.length}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Tutorial Steps Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <SkipForward className="w-5 h-5" />
            خطوات الشرح
          </CardTitle>
          <CardDescription>
            انقر على أي خطوة للانتقال إليها في الفيديو مباشرة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {tutorialSteps.map((step, index) => (
              <button
                key={index}
                onClick={() => skipToStep(step.time)}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-right hover:bg-slate-50 ${
                  currentStep === step 
                    ? 'border-medical-blue bg-medical-blue/5' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-2xl">{step.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900">{step.title}</h4>
                  <p className="text-sm text-slate-600">{step.description}</p>
                </div>
                <div className="text-sm text-slate-500">
                  {formatTime(step.time)}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <RotateCcw className="w-5 h-5" />
            إجراءات سريعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={() => skipToStep(0)}
              variant="outline"
              className="justify-start"
            >
              <SkipBack className="w-4 h-4 ml-2" />
              إعادة تشغيل الفيديو
            </Button>
            <Button 
              onClick={() => skipToStep(25)}
              variant="outline"
              className="justify-start"
            >
              <Play className="w-4 h-4 ml-2" />
              انتقال للعرض العملي
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional Resources */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-green-800 mb-3">
            📚 موارد إضافية للتعلم
          </h3>
          <div className="grid gap-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-green-600">•</span>
              <span>للحصول على أفضل النتائج، تأكد من وضوح الإضاءة في الصورة</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600">•</span>
              <span>التقط الصورة من زاوية مواجهة مباشرة للحصول على تحليل دقيق</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600">•</span>
              <span>جرب أدوات المكياج المختلفة لمعاينة التأثيرات قبل العملية</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600">•</span>
              <span>استخدم أداة تحديد المناطق لتطبيق التأثيرات على مناطق محددة</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}