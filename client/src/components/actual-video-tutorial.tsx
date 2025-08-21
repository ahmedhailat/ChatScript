import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, FastForward, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export function ActualVideoTutorial() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(0);

  // Video chapters
  const chapters = [
    { title: "مقدمة عن FaceApp Studio", startTime: 0, duration: 45 },
    { title: "كيفية تسجيل الدخول", startTime: 45, duration: 60 },
    { title: "رفع وتصوير الصور", startTime: 105, duration: 75 },
    { title: "تأثيرات العمر (أصغر/أكبر)", startTime: 180, duration: 90 },
    { title: "تحويل الجنس والملامح", startTime: 270, duration: 85 },
    { title: "إضافة الابتسامة والتعبيرات", startTime: 355, duration: 70 },
    { title: "المكياج الافتراضي", startTime: 425, duration: 95 },
    { title: "تأثيرات الشعر والعيون", startTime: 520, duration: 80 },
    { title: "تحسين الجمال والبشرة", startTime: 600, duration: 75 },
    { title: "حفظ ومشاركة النتائج", startTime: 675, duration: 60 }
  ];

  // Video source (demo video)
  const videoSrc = "/attached_assets/WhatsApp Video 2025-08-10 at 22.39.34_0ae55de1_1754854909628.mp4";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const updateChapter = () => {
      const newChapter = chapters.findIndex((chapter, index) => {
        const nextChapter = chapters[index + 1];
        return video.currentTime >= chapter.startTime && 
               (!nextChapter || video.currentTime < nextChapter.startTime);
      });
      if (newChapter !== -1) setCurrentChapter(newChapter);
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('timeupdate', updateChapter);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('play', () => setIsPlaying(true));
    video.addEventListener('pause', () => setIsPlaying(false));

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('timeupdate', updateChapter);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('play', () => setIsPlaying(true));
      video.removeEventListener('pause', () => setIsPlaying(false));
    };
  }, [chapters]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  const changePlaybackRate = () => {
    if (videoRef.current) {
      const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
      const currentIndex = rates.indexOf(playbackRate);
      const newRate = rates[(currentIndex + 1) % rates.length];
      videoRef.current.playbackRate = newRate;
      setPlaybackRate(newRate);
    }
  };

  const seek = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      videoRef.current.currentTime = newTime;
    }
  };

  const seekToTime = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto p-6" dir="rtl">
      <Card className="shadow-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-red-600 to-pink-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl mb-2">
                🎬 فيديو تعليمي شامل - FaceApp Studio
              </CardTitle>
              <p className="text-lg opacity-90">
                تعلم جميع ميزات تحرير الوجه خطوة بخطوة
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white">
                🔴 مباشر
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                4K HD
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Video Player */}
          <div className="relative bg-black">
            <video
              ref={videoRef}
              className="w-full aspect-video"
              src={videoSrc}
              poster="/attached_assets/image_1755760857743.png"
            />
            
            {/* Video Overlay Controls */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20">
              {/* Center Play Button */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    onClick={togglePlay}
                    size="lg"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/50 backdrop-blur-sm w-20 h-20 rounded-full"
                  >
                    <Play className="w-8 h-8 mr-1" />
                  </Button>
                </div>
              )}

              {/* Current Chapter Indicator */}
              <div className="absolute top-4 left-4 right-4">
                <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center justify-between text-white">
                    <span className="text-sm font-medium">
                      الفصل {currentChapter + 1}: {chapters[currentChapter]?.title}
                    </span>
                    <span className="text-xs opacity-75">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-1 mt-2" />
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center justify-between gap-4">
                  {/* Left Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={togglePlay}
                      size="sm"
                      variant="secondary"
                      className="bg-white/20 hover:bg-white/30 text-white"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>

                    <Button
                      onClick={() => seek(-10)}
                      size="sm"
                      variant="secondary"
                      className="bg-white/20 hover:bg-white/30 text-white"
                    >
                      <SkipBack className="w-4 h-4" />
                    </Button>

                    <Button
                      onClick={() => seek(10)}
                      size="sm"
                      variant="secondary"
                      className="bg-white/20 hover:bg-white/30 text-white"
                    >
                      <SkipForward className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Right Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={changePlaybackRate}
                      size="sm"
                      variant="secondary"
                      className="bg-white/20 hover:bg-white/30 text-white text-xs"
                    >
                      {playbackRate}x
                    </Button>

                    <Button
                      onClick={toggleMute}
                      size="sm"
                      variant="secondary"
                      className="bg-white/20 hover:bg-white/30 text-white"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>

                    <Button
                      onClick={toggleFullscreen}
                      size="sm"
                      variant="secondary"
                      className="bg-white/20 hover:bg-white/30 text-white"
                    >
                      <Maximize className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chapter Navigation */}
          <div className="p-6 bg-gray-50">
            <h4 className="font-bold text-xl mb-4">فصول الفيديو التعليمي</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {chapters.map((chapter, index) => (
                <Button
                  key={index}
                  onClick={() => seekToTime(chapter.startTime)}
                  variant={currentChapter === index ? "default" : "outline"}
                  size="sm"
                  className="h-auto p-3 text-right justify-start"
                >
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      الفصل {index + 1}
                    </div>
                    <div className="text-sm font-medium leading-tight">
                      {chapter.title}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {formatTime(chapter.startTime)}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Video Info */}
          <div className="p-6 border-t">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h5 className="font-bold text-lg mb-2">📱 عن التطبيق</h5>
                <p className="text-sm text-gray-600">
                  FaceApp Studio هو أول تطبيق عربي لتحرير الوجه بالذكاء الاصطناعي. 
                  يتضمن جميع ميزات FaceApp الأصلي مع واجهة عربية كاملة.
                </p>
              </div>
              
              <div>
                <h5 className="font-bold text-lg mb-2">⭐ الميزات الرئيسية</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• تأثيرات العمر والجنس</li>
                  <li>• مكياج افتراضي احترافي</li>
                  <li>• تحسين الجمال والبشرة</li>
                  <li>• حفظ ومشاركة بجودة عالية</li>
                </ul>
              </div>
              
              <div>
                <h5 className="font-bold text-lg mb-2">🎯 الهدف من الفيديو</h5>
                <p className="text-sm text-gray-600">
                  هذا الفيديو يعلمك كيفية استخدام جميع ميزات التطبيق 
                  للحصول على أفضل النتائج في تحرير صور الوجه.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}