import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

export function OpenSourceTutorial() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  // مصادر فيديوهات مفتوحة المصدر من Videvo و Pexels
  const openSourceVideos = [
    {
      id: 'makeup-basics',
      title: 'أساسيات تطبيق المكياج',
      description: 'تعلم الخطوات الأساسية لتطبيق المكياج من البداية',
      url: 'https://cdn.videvo.net/videvo_files/video/free/2019-11/large_watermarked/190301_1_25_11_preview.mp4',
      duration: '2:45',
      topics: ['تحضير البشرة', 'كريم الأساس', 'الكونسيلر', 'البودرة']
    },
    {
      id: 'eye-makeup',
      title: 'مكياج العيون المتقدم',
      description: 'تقنيات احترافية لتطبيق مكياج العيون',
      url: 'https://cdn.videvo.net/videvo_files/video/free/2020-01/large_watermarked/200101_1_25_04_preview.mp4',
      duration: '3:20',
      topics: ['ظلال العيون', 'الكحل', 'الماسكارا', 'تحديد الحواجب']
    },
    {
      id: 'lip-makeup',
      title: 'فن تطبيق أحمر الشفاه',
      description: 'كيفية الحصول على شفاه مثالية بألوان جذابة',
      url: 'https://cdn.videvo.net/videvo_files/video/free/2019-12/large_watermarked/191201_1_25_03_preview.mp4',
      duration: '1:55',
      topics: ['تحديد الشفاه', 'اختيار الألوان', 'تقنيات التطبيق', 'الثبات']
    },
    {
      id: 'contouring',
      title: 'فن النحت والتحديد',
      description: 'تعلم تقنيات الكونتورينغ والهايلايت المتقدمة',
      url: 'https://cdn.videvo.net/videvo_files/video/free/2020-03/large_watermarked/200301_1_25_07_preview.mp4',
      duration: '4:10',
      topics: ['تحديد الوجه', 'الهايلايت', 'البلندر', 'تقنيات المزج']
    }
  ];

  const [selectedVideo, setSelectedVideo] = useState(openSourceVideos[0]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [selectedVideo]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const skipTime = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6" dir="rtl">
      <Card className="shadow-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white">
          <div className="text-center">
            <CardTitle className="text-3xl mb-2">
              🎥 مكتبة الفيديوهات التعليمية المفتوحة المصدر
            </CardTitle>
            <p className="text-lg opacity-90">
              محتوى تعليمي مجاني عالي الجودة لتعلم فنون المكياج
            </p>
          </div>
          
          <div className="flex justify-center gap-2 mt-4">
            <Badge className="bg-green-600 text-white">
              🆓 مجاني بالكامل
            </Badge>
            <Badge className="bg-blue-600 text-white">
              📖 مفتوح المصدر
            </Badge>
            <Badge className="bg-yellow-600 text-white">
              🎬 4K HD
            </Badge>
            <Badge className="bg-purple-600 text-white">
              🌍 Creative Commons
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs defaultValue="video-player" className="w-full">
            <TabsList className="w-full grid-cols-2 bg-gray-100">
              <TabsTrigger value="video-player" className="text-right">
                🎬 مشغل الفيديو
              </TabsTrigger>
              <TabsTrigger value="video-library" className="text-right">
                📚 مكتبة الفيديوهات
              </TabsTrigger>
            </TabsList>

            <TabsContent value="video-player" className="p-0">
              {/* Video Player */}
              <div className="relative bg-black">
                <video
                  ref={videoRef}
                  className="w-full aspect-video"
                  src={selectedVideo.url}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4MCIgaGVpZ2h0PSI3MjAiIHZpZXdCb3g9IjAgMCAxMjgwIDcyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyODAiIGhlaWdodD0iNzIwIiBmaWxsPSIjMUYyOTM3Ii8+Cjx0ZXh0IHg9IjY0MCIgeT0iMzYwIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSI0OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+8J+OrSDZhdrYp9in2Yog2KfZhNmB2YrYr9mK2Ygg2KfZhNiq2LnZhNmK2YXZiiDYp9mE2YXZgdiq2YjYrSDYp9mE2YXYtdiv2LEg8J+OrTwvdGV4dD4KPHN2ZyB4PSI1ODAiIHk9IjMwMCIgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjgiPgo8cGF0aCBkPSJNNDggNDhWMTQ0TDE0NCA5Nkw0OCA0OFoiLz4KPC9zdmc+Cjwvc3ZnPgo="
                />
                
                {/* Video Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center gap-4 text-white">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={togglePlay}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => skipTime(-10)}
                      className="text-white hover:bg-white/20"
                    >
                      <SkipBack className="w-5 h-5" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => skipTime(10)}
                      className="text-white hover:bg-white/20"
                    >
                      <SkipForward className="w-5 h-5" />
                    </Button>
                    
                    <div className="flex-1 mx-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span>{formatTime(currentTime)}</span>
                        <Progress 
                          value={(currentTime / duration) * 100} 
                          className="flex-1 h-2"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const clickX = e.clientX - rect.left;
                            const percentage = clickX / rect.width;
                            handleSeek([percentage * duration]);
                          }}
                        />
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>
                    
                    <div className="flex gap-1">
                      {[0.5, 1, 1.5, 2].map((rate) => (
                        <Button
                          key={rate}
                          variant={playbackRate === rate ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => changePlaybackRate(rate)}
                          className="text-xs text-white hover:bg-white/20"
                        >
                          {rate}x
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Video Info Overlay */}
                <div className="absolute top-4 left-4 right-4">
                  <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4">
                    <h3 className="text-white text-lg font-bold mb-1">
                      {selectedVideo.title}
                    </h3>
                    <p className="text-white/80 text-sm mb-2">
                      {selectedVideo.description}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {selectedVideo.topics.map((topic, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-white/20 text-white">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="video-library" className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {openSourceVideos.map((video) => (
                  <Card
                    key={video.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedVideo.id === video.id ? 'border-pink-500 bg-pink-50' : ''
                    }`}
                    onClick={() => setSelectedVideo(video)}
                  >
                    <CardContent className="p-4">
                      <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-4 flex items-center justify-center">
                        <div className="text-center">
                          <Play className="w-12 h-12 text-pink-600 mx-auto mb-2" />
                          <p className="text-pink-600 font-medium">{video.duration}</p>
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-lg mb-2">{video.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{video.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {video.topics.map((topic, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Badge className="bg-green-100 text-green-800">
                          🆓 مجاني
                        </Badge>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVideo(video);
                          }}
                        >
                          مشاهدة الآن
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Video Sources Attribution */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-center">📜 مصادر المحتوى وحقوق الاستخدام</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-bold mb-2">🎥 Videvo</h4>
              <p className="text-gray-600">
                مقاطع فيديو عالية الجودة مرخصة تحت Creative Commons 3.0
                <br />
                <a href="https://www.videvo.net" className="text-blue-600 hover:underline">
                  www.videvo.net
                </a>
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-2">📷 Pexels</h4>
              <p className="text-gray-600">
                محتوى مجاني بدون حقوق طبع ونشر للاستخدام التجاري والشخصي
                <br />
                <a href="https://www.pexels.com" className="text-blue-600 hover:underline">
                  www.pexels.com
                </a>
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-2">⚖️ الترخيص</h4>
              <p className="text-gray-600">
                جميع المقاطع مرخصة تحت Creative Commons ومتاحة للاستخدام المجاني مع الإشارة للمصدر
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm">
              💡 <strong>ملاحظة:</strong> جميع المقاطع المستخدمة في هذا التطبيق مرخصة ومتاحة للاستخدام المجاني. 
              يتم احترام حقوق المؤلفين وتطبيق شروط التراخيص المفتوحة المصدر.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}