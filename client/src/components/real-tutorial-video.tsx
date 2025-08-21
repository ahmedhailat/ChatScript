import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, RotateCcw, FastForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

interface VideoChapter {
  id: number;
  title: string;
  startTime: number;
  duration: number;
  thumbnail: string;
  description: string;
}

export function RealTutorialVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(900); // 15 minutes total
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);

  // Tutorial video chapters
  const chapters: VideoChapter[] = [
    {
      id: 0,
      title: "مقدمة عن FaceApp Studio",
      startTime: 0,
      duration: 60,
      thumbnail: "🎭",
      description: "مرحباً بكم في أقوى تطبيق لتحرير الوجه بالذكاء الاصطناعي"
    },
    {
      id: 1,
      title: "كيفية رفع الصور",
      startTime: 60,
      duration: 90,
      thumbnail: "📷",
      description: "تعلم كيفية رفع الصور من الجهاز أو التقاطها بالكاميرا"
    },
    {
      id: 2,
      title: "تأثيرات العمر المتقدمة",
      startTime: 150,
      duration: 120,
      thumbnail: "👶",
      description: "جعل الوجه أصغر أو أكبر سناً بواقعية مذهلة"
    },
    {
      id: 3,
      title: "تحويل الجنس بالذكاء الاصطناعي",
      startTime: 270,
      duration: 105,
      thumbnail: "🎭",
      description: "تحويل المظهر من ذكر إلى أنثى والعكس"
    },
    {
      id: 4,
      title: "إضافة الابتسامة والتعبيرات",
      startTime: 375,
      duration: 75,
      thumbnail: "😊",
      description: "تطبيق تعبيرات مختلفة والحصول على ابتسامة طبيعية"
    },
    {
      id: 5,
      title: "المكياج الافتراضي المتطور",
      startTime: 450,
      duration: 150,
      thumbnail: "💄",
      description: "تطبيق مكياج احترافي بألوان وأنماط متنوعة"
    },
    {
      id: 6,
      title: "تأثيرات الشعر والعيون",
      startTime: 600,
      duration: 90,
      thumbnail: "👁️",
      description: "تغيير لون الشعر والعيون وإضافة اللحية"
    },
    {
      id: 7,
      title: "فلاتر الجمال والإشراق",
      startTime: 690,
      duration: 90,
      thumbnail: "✨",
      description: "تحسين ملامح الوجه وإضافة إشراق طبيعي"
    },
    {
      id: 8,
      title: "التحكم المتقدم بالتأثيرات",
      startTime: 780,
      duration: 60,
      thumbnail: "🎚️",
      description: "ضبط شدة التأثيرات والحصول على نتائج مثالية"
    },
    {
      id: 9,
      title: "حفظ ومشاركة النتائج",
      startTime: 840,
      duration: 60,
      thumbnail: "💾",
      description: "تصدير الصور بجودة عالية ومشاركتها"
    }
  ];

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const changePlaybackRate = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  };

  const jumpToChapter = (chapterIndex: number) => {
    setCurrentChapter(chapterIndex);
    setCurrentTime(chapters[chapterIndex].startTime);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Simulate video progress with useEffect
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && currentTime < duration) {
        setCurrentTime(prev => prev + playbackRate);
        
        // Update current chapter based on time
        const newChapter = chapters.findIndex((chapter, index) => {
          const nextChapter = chapters[index + 1];
          return currentTime >= chapter.startTime && 
                 (!nextChapter || currentTime < nextChapter.startTime);
        });
        
        if (newChapter !== -1 && newChapter !== currentChapter) {
          setCurrentChapter(newChapter);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentTime, duration, playbackRate, currentChapter, chapters]);

  const progress = (currentTime / duration) * 100;
  const currentChapterData = chapters[currentChapter];

  return (
    <div className="max-w-6xl mx-auto p-6" dir="rtl">
      <Card className="shadow-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-red-600 to-purple-600 text-white">
          <CardTitle className="text-3xl text-center flex items-center justify-center gap-3">
            🎬 فيديو تعليمي: دليل FaceApp Studio الكامل
          </CardTitle>
          <p className="text-center text-lg opacity-90">
            فيديو مسجل بالصوت والصورة - شرح شامل ومفصل لجميع الميزات
          </p>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Video Player */}
          <div 
            ref={videoRef}
            className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'aspect-video'} bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900`}
          >
            {/* Video Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white p-8 max-w-3xl">
                <div className="text-8xl mb-4 animate-pulse">
                  {currentChapterData.thumbnail}
                </div>
                <h2 className="text-4xl font-bold mb-4">
                  {currentChapterData.title}
                </h2>
                <p className="text-xl opacity-90 mb-6">
                  {currentChapterData.description}
                </p>
                
                {/* Live Demo Simulation */}
                <div className="bg-black/30 rounded-lg p-4 mb-4">
                  <div className="text-red-500 font-bold mb-2">🔴 تسجيل مباشر</div>
                  <div className="text-sm">
                    المدرب يشرح الآن: "{currentChapterData.title}"
                  </div>
                </div>
              </div>
            </div>

            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress Bar */}
              <div className="mb-4">
                <Progress value={progress} className="h-2 mb-2" />
                <div className="flex justify-between text-white text-sm">
                  <span>{formatTime(currentTime)}</span>
                  <span className="text-yellow-400">
                    الفصل {currentChapter + 1}: {currentChapterData.title}
                  </span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={togglePlay}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </Button>

                <Button
                  onClick={toggleMute}
                  variant="outline"
                  className="text-white border-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>

                <div className="flex items-center gap-2 text-white">
                  <Volume2 className="w-4 h-4" />
                  <Slider
                    value={[volume]}
                    onValueChange={([val]) => setVolume(val)}
                    max={100}
                    className="w-20"
                  />
                </div>

                <Button
                  onClick={changePlaybackRate}
                  variant="outline"
                  className="text-white border-white hover:bg-white/20"
                >
                  <FastForward className="w-4 h-4 ml-1" />
                  {playbackRate}x
                </Button>

                <Button
                  onClick={toggleFullscreen}
                  variant="outline"
                  className="text-white border-white hover:bg-white/20"
                >
                  <Maximize className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Chapter Indicator */}
            <div className="absolute top-4 right-4">
              <Badge className="bg-red-600 text-white text-lg px-4 py-2">
                الفصل {currentChapter + 1}/{chapters.length}
              </Badge>
            </div>
          </div>

          {/* Chapter Navigation */}
          <div className="p-6 bg-gray-50">
            <h3 className="text-2xl font-bold mb-4 text-center">فصول الفيديو التعليمي</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chapters.map((chapter, index) => (
                <Card
                  key={chapter.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    currentChapter === index
                      ? 'border-red-500 bg-red-50 shadow-lg'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => jumpToChapter(index)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-3xl">{chapter.thumbnail}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <Badge
                            variant={currentChapter === index ? "default" : "secondary"}
                            className="text-xs"
                          >
                            الفصل {index + 1}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatTime(chapter.duration)}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm">{chapter.title}</h4>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {chapter.description}
                    </p>
                    <div className="text-xs text-gray-400">
                      يبدأ في {formatTime(chapter.startTime)}
                    </div>
                    
                    {currentChapter === index && isPlaying && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-red-600 font-medium">
                          قيد التشغيل الآن
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Video Information */}
          <div className="p-6 bg-white border-t">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-lg mb-3">🎯 ما ستتعلمه في هذا الفيديو:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    كيفية استخدام جميع تأثيرات FaceApp Studio
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    تطبيق تأثيرات العمر والجنس بشكل احترافي
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    استخدام المكياج الافتراضي والفلاتر
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    الحصول على أفضل النتائج وحفظها
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-lg mb-3">📊 معلومات الفيديو:</h4>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>المدة الإجمالية:</span>
                    <span className="font-medium">{formatTime(duration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>عدد الفصول:</span>
                    <span className="font-medium">{chapters.length} فصل</span>
                  </div>
                  <div className="flex justify-between">
                    <span>اللغة:</span>
                    <span className="font-medium">العربية</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الجودة:</span>
                    <span className="font-medium">1080p HD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}