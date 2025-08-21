import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, 
  Eye, 
  Smile, 
  Heart,
  Sparkles,
  Brush,
  Download,
  Undo2,
  Camera,
  Zap,
  Droplets,
  Lightbulb,
  Layers,
  Target,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FaceLandmark {
  x: number;
  y: number;
  z?: number;
}

interface FaceRegion {
  type: 'lips' | 'eyes' | 'cheeks' | 'forehead' | 'nose' | 'eyebrows';
  points: FaceLandmark[];
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface PreciseMakeupEffect {
  id: string;
  region: FaceRegion['type'];
  color: string;
  intensity: number;
  appliedPoints: FaceLandmark[];
  blendMode: string;
  texture: 'matte' | 'gloss' | 'shimmer' | 'metallic';
  timestamp: number;
}

interface PreciseMakeupStudioProps {
  image: string;
  onMakeupComplete?: (result: string) => void;
}

export default function PreciseMakeupStudio({ 
  image, 
  onMakeupComplete 
}: PreciseMakeupStudioProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [effects, setEffects] = useState<PreciseMakeupEffect[]>([]);
  const [faceRegions, setFaceRegions] = useState<FaceRegion[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<FaceRegion['type']>('lips');
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');
  const [intensity, setIntensity] = useState([70]);
  const [selectedTexture, setSelectedTexture] = useState<'matte' | 'gloss' | 'shimmer' | 'metallic'>('gloss');
  const [isProcessing, setIsProcessing] = useState(false);
  const [landmarksDetected, setLandmarksDetected] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { toast } = useToast();

  // دقة الألوان المتخصصة لكل منطقة
  const preciseColorPalettes = {
    lips: {
      reds: ['#DC143C', '#B22222', '#8B0000', '#CD5C5C', '#F08080'],
      pinks: ['#FF69B4', '#FF1493', '#DB7093', '#C71585', '#FF91A4'],
      nudes: ['#DEB887', '#D2B48C', '#F5DEB3', '#FFDAB9', '#FFE4E1'],
      berries: ['#8B008B', '#9370DB', '#9932CC', '#BA55D3', '#DDA0DD']
    },
    eyes: {
      neutrals: ['#D2B48C', '#F4A460', '#DEB887', '#BC9A6A', '#A0826D'],
      smoky: ['#2F4F4F', '#696969', '#708090', '#778899', '#B0C4DE'],
      colorful: ['#4169E1', '#32CD32', '#FF6347', '#9370DB', '#FFD700']
    },
    cheeks: {
      natural: ['#FFB6C1', '#FFA0B4', '#FF91A4', '#FF82AB', '#FF69B4'],
      coral: ['#FF7F50', '#FF6347', '#FF4500', '#FFA07A', '#FA8072'],
      rose: ['#BC8F8F', '#F08080', '#CD919E', '#D8BFD8', '#DDA0DD']
    },
    forehead: {
      highlight: ['#F5F5DC', '#FFFACD', '#FAFAD2', '#F0F8FF', '#F8F8FF'],
      contour: ['#D2B48C', '#BC9A6A', '#A0826D', '#8B7D6B', '#696969']
    }
  };

  // أدوات المكياج المتخصصة
  const precisionTools = [
    { 
      id: 'lips' as const, 
      name: 'شفاه', 
      icon: <Smile className="w-4 h-4" />, 
      color: '#FF69B4',
      description: 'تطبيق دقيق على الشفاه فقط'
    },
    { 
      id: 'eyes' as const, 
      name: 'عيون', 
      icon: <Eye className="w-4 h-4" />, 
      color: '#8B5CF6',
      description: 'تطبيق على منطقة العين والجفون'
    },
    { 
      id: 'cheeks' as const, 
      name: 'خدود', 
      icon: <Heart className="w-4 h-4" />, 
      color: '#FF7F50',
      description: 'تطبيق على عظام الخد'
    },
    { 
      id: 'forehead' as const, 
      name: 'جبهة', 
      icon: <Lightbulb className="w-4 h-4" />, 
      color: '#FFD700',
      description: 'تطبيق على منطقة الجبهة'
    },
    { 
      id: 'eyebrows' as const, 
      name: 'حواجب', 
      icon: <Brush className="w-4 h-4" />, 
      color: '#8B4513',
      description: 'تحديد وتشكيل الحواجب'
    },
    { 
      id: 'nose' as const, 
      name: 'أنف', 
      icon: <Target className="w-4 h-4" />, 
      color: '#D2691E',
      description: 'كنتور وهايلايت الأنف'
    }
  ];

  // كشف ملامح الوجه باستخدام MediaPipe
  const detectFaceLandmarks = useCallback(async () => {
    if (!imageRef.current) return;

    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      
      // تحويل الصورة إلى blob
      const response = await fetch(image);
      const blob = await response.blob();
      formData.append('image', blob, 'face.jpg');

      const result = await fetch('/api/enhanced-mediapipe-landmarks', {
        method: 'POST',
        body: formData
      });

      if (!result.ok) {
        throw new Error('فشل في كشف ملامح الوجه');
      }

      const landmarks = await result.json();
      
      if (landmarks.success && landmarks.regions) {
        // استخدام المناطق المحسنة من الخادم
        const regions = Object.keys(landmarks.regions).map(regionKey => ({
          type: regionKey as FaceRegion['type'],
          points: landmarks.regions[regionKey].points || [],
          boundingBox: landmarks.regions[regionKey].boundingBox
        }));
        
        setFaceRegions(regions);
        setLandmarksDetected(true);
        
        toast({
          title: "تم كشف ملامح الوجه",
          description: `تم اكتشاف ${regions.length} منطقة وجه بدقة ${Math.round((landmarks.confidence || 0.9) * 100)}%`,
        });
      } else {
        throw new Error('فشل في معالجة الصورة');
      }
    } catch (error) {
      console.error('Face detection error:', error);
      // استخدام نظام بديل للكشف
      createFallbackRegions();
      toast({
        title: "تم استخدام النظام البديل",
        description: "سيتم تطبيق المكياج باستخدام النظام البديل",
        variant: "default"
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [image]);

  // تحويل النقاط المكتشفة إلى مناطق الوجه
  const mapLandmarksToRegions = (landmarks: any[]): FaceRegion[] => {
    const regions: FaceRegion[] = [];
    
    if (landmarks && landmarks.length > 0) {
      const points = landmarks[0];
      
      // منطقة الشفاه (النقاط 61-68 و 291-299)
      const lipPoints = points.slice(61, 68).concat(points.slice(291, 299));
      if (lipPoints.length > 0) {
        regions.push(createRegion('lips', lipPoints));
      }
      
      // منطقة العينين (النقاط 33-42 للعين اليمنى، 362-374 للعين اليسرى)
      const rightEyePoints = points.slice(33, 42);
      const leftEyePoints = points.slice(362, 374);
      if (rightEyePoints.length > 0 && leftEyePoints.length > 0) {
        regions.push(createRegion('eyes', rightEyePoints.concat(leftEyePoints)));
      }
      
      // منطقة الخدود (تقدير من نقاط الوجه)
      const cheekPoints = [
        points[116], points[117], points[118], // الخد الأيمن
        points[345], points[346], points[347]  // الخد الأيسر
      ].filter(Boolean);
      if (cheekPoints.length > 0) {
        regions.push(createRegion('cheeks', cheekPoints));
      }
      
      // منطقة الجبهة (تقدير)
      const foreheadPoints = [
        points[10], points[151], points[9], points[8]
      ].filter(Boolean);
      if (foreheadPoints.length > 0) {
        regions.push(createRegion('forehead', foreheadPoints));
      }
      
      // منطقة الحواجب
      const rightBrowPoints = points.slice(70, 80);
      const leftBrowPoints = points.slice(296, 306);
      if (rightBrowPoints.length > 0 && leftBrowPoints.length > 0) {
        regions.push(createRegion('eyebrows', rightBrowPoints.concat(leftBrowPoints)));
      }
      
      // منطقة الأنف
      const nosePoints = points.slice(1, 17);
      if (nosePoints.length > 0) {
        regions.push(createRegion('nose', nosePoints));
      }
    }
    
    return regions;
  };

  // إنشاء منطقة من النقاط
  const createRegion = (type: FaceRegion['type'], points: any[]): FaceRegion => {
    const validPoints: FaceLandmark[] = points.map(point => ({
      x: point.x * 100, // تحويل إلى نسبة مئوية
      y: point.y * 100,
      z: point.z
    }));
    
    // حساب الصندوق المحيط
    const xs = validPoints.map(p => p.x);
    const ys = validPoints.map(p => p.y);
    
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    return {
      type,
      points: validPoints,
      boundingBox: {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      }
    };
  };

  // نظام بديل لإنشاء المناطق
  const createFallbackRegions = () => {
    const fallbackRegions: FaceRegion[] = [
      {
        type: 'lips',
        points: [],
        boundingBox: { x: 42, y: 62, width: 16, height: 8 }
      },
      {
        type: 'eyes',
        points: [],
        boundingBox: { x: 35, y: 40, width: 30, height: 12 }
      },
      {
        type: 'cheeks',
        points: [],
        boundingBox: { x: 25, y: 50, width: 50, height: 20 }
      },
      {
        type: 'forehead',
        points: [],
        boundingBox: { x: 30, y: 15, width: 40, height: 25 }
      }
    ];
    
    setFaceRegions(fallbackRegions);
    setLandmarksDetected(true);
  };

  // تطبيق المكياج بدقة على المنطقة المحددة
  const applyPreciseMakeup = async (region: FaceRegion['type']) => {
    const targetRegion = faceRegions.find(r => r.type === region);
    if (!targetRegion) {
      toast({
        title: "خطأ في التطبيق",
        description: `لم يتم العثور على منطقة ${precisionTools.find(t => t.id === region)?.name}`,
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // استخدام API الجديد لتطبيق المكياج الدقيق
      const formData = new FormData();
      const response = await fetch(image);
      const blob = await response.blob();
      formData.append('image', blob, 'face.jpg');
      formData.append('region', region);
      formData.append('color', selectedColor);
      formData.append('intensity', intensity[0].toString());
      formData.append('texture', selectedTexture);

      const result = await fetch('/api/apply-precision-makeup', {
        method: 'POST',
        body: formData
      });

      if (!result.ok) {
        throw new Error('فشل في تطبيق المكياج الدقيق');
      }

      const makeupResult = await result.json();

      if (makeupResult.success) {
        // إضافة التأثير إلى القائمة المحلية للعرض المرئي
        const newEffect: PreciseMakeupEffect = {
          id: Date.now().toString(),
          region,
          color: selectedColor,
          intensity: intensity[0],
          appliedPoints: targetRegion.points.length > 0 ? targetRegion.points : [],
          blendMode: getRegionBlendMode(region),
          texture: selectedTexture,
          timestamp: Date.now()
        };

        setEffects(prev => [...prev, newEffect]);
        
        toast({
          title: "تم تطبيق المكياج بدقة",
          description: `تم تطبيق ${precisionTools.find(t => t.id === region)?.name} على المنطقة المحددة فقط بنجاح`,
        });

        if (onMakeupComplete) {
          onMakeupComplete(makeupResult.processedImageUrl);
        }
      } else {
        throw new Error(makeupResult.error || 'فشل في تطبيق المكياج');
      }
      
    } catch (error) {
      console.error('Precision makeup error:', error);
      toast({
        title: "خطأ في تطبيق المكياج",
        description: error instanceof Error ? error.message : 'خطأ غير معروف',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getRegionBlendMode = (region: FaceRegion['type']) => {
    switch (region) {
      case 'lips': return 'multiply';
      case 'eyes': return 'overlay';
      case 'cheeks': return 'soft-light';
      case 'forehead': return 'screen';
      case 'eyebrows': return 'multiply';
      case 'nose': return 'overlay';
      default: return 'multiply';
    }
  };

  // رسم المكياج على Canvas
  const renderMakeupEffects = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    
    if (!canvas || !img) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // تنظيف الكانفاس
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // رسم الصورة الأساسية
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // رسم تأثيرات المكياج
    effects.forEach(effect => {
      const region = faceRegions.find(r => r.type === effect.region);
      if (!region) return;
      
      ctx.save();
      
      // تطبيق اللون والشفافية
      const alpha = effect.intensity / 100;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = effect.color;
      
      // تطبيق نمط الدمج
      ctx.globalCompositeOperation = effect.blendMode as GlobalCompositeOperation;
      
      // رسم في المنطقة المحددة فقط
      if (effect.appliedPoints.length > 0) {
        // استخدام النقاط الدقيقة
        ctx.beginPath();
        effect.appliedPoints.forEach((point, index) => {
          const x = (point.x / 100) * canvas.width;
          const y = (point.y / 100) * canvas.height;
          
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.closePath();
        ctx.fill();
      } else {
        // استخدام الصندوق المحيط
        const x = (region.boundingBox.x / 100) * canvas.width;
        const y = (region.boundingBox.y / 100) * canvas.height;
        const width = (region.boundingBox.width / 100) * canvas.width;
        const height = (region.boundingBox.height / 100) * canvas.height;
        
        // تطبيق تأثير النعومة للحواف
        const gradient = ctx.createRadialGradient(
          x + width/2, y + height/2, 0,
          x + width/2, y + height/2, Math.max(width, height)/2
        );
        gradient.addColorStop(0, effect.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);
      }
      
      ctx.restore();
    });
  }, [effects, faceRegions]);

  // تحديث الكانفاس عند تغيير التأثيرات
  useEffect(() => {
    renderMakeupEffects();
  }, [renderMakeupEffects]);

  // تحميل الصورة وكشف الملامح
  useEffect(() => {
    if (image) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (imageRef.current) {
          imageRef.current.src = image;
        }
        
        // ضبط حجم الكانفاس
        if (canvasRef.current) {
          canvasRef.current.width = img.width;
          canvasRef.current.height = img.height;
        }
        
        // كشف ملامح الوجه تلقائياً
        detectFaceLandmarks();
      };
      img.src = image;
    }
  }, [image, detectFaceLandmarks]);

  const clearAllEffects = () => {
    setEffects([]);
    toast({
      title: "تم المسح",
      description: "تم إزالة جميع تأثيرات المكياج",
    });
  };

  const downloadResult = async () => {
    if (!canvasRef.current) return;
    
    setIsProcessing(true);
    
    try {
      const dataURL = canvasRef.current.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.download = `precision-makeup-${Date.now()}.jpg`;
      link.href = dataURL;
      link.click();
      
      toast({
        title: "تم الحفظ بنجاح",
        description: `تم حفظ الصورة مع ${effects.length} تأثير مكياج دقيق`,
      });
      
      if (onMakeupComplete) {
        onMakeupComplete(dataURL);
      }
    } catch (error) {
      toast({
        title: "خطأ في الحفظ",
        description: "فشل في حفظ الصورة",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-6 max-w-6xl mx-auto" dir="rtl">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Target className="ml-2 w-6 h-6 text-pink-600" />
            استوديو المكياج الدقيق
          </div>
          <div className="flex items-center gap-2">
            {landmarksDetected ? (
              <Badge variant="default" className="flex items-center bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 ml-1" />
                ملامح مكتشفة
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center">
                <AlertCircle className="w-3 h-3 ml-1" />
                جاري الكشف...
              </Badge>
            )}
            <Badge variant="outline" className="flex items-center">
              <Sparkles className="w-3 h-3 ml-1" />
              {effects.length} تأثير
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-0">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* منطقة الصورة */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border-2 border-pink-200">
              <img 
                ref={imageRef}
                src={image} 
                alt="صورة للمكياج" 
                className="w-full h-auto max-h-96 object-contain"
                style={{ display: 'none' }}
              />
              <canvas
                ref={canvasRef}
                className="w-full h-auto max-h-96 object-contain cursor-crosshair"
                onClick={() => {
                  if (landmarksDetected) {
                    applyPreciseMakeup(selectedRegion);
                  }
                }}
              />
              
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p>جاري تحليل ملامح الوجه...</p>
                  </div>
                </div>
              )}
              
              {landmarksDetected && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
                  ✓ تم كشف {faceRegions.length} منطقة
                </div>
              )}
            </div>
            
            {/* معلومات المناطق المكتشفة */}
            {landmarksDetected && (
              <div className="grid grid-cols-3 gap-2 text-xs">
                {faceRegions.map((region) => (
                  <div 
                    key={region.type}
                    className="bg-gray-100 p-2 rounded text-center"
                  >
                    <div className="font-medium">
                      {precisionTools.find(t => t.id === region.type)?.name}
                    </div>
                    <div className="text-gray-600">
                      {region.points.length > 0 ? `${region.points.length} نقطة` : 'منطقة محددة'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* أدوات المكياج الدقيقة */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center">
                <Brush className="w-4 h-4 ml-1" />
                أدوات المكياج الدقيقة
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                {precisionTools.map((tool) => (
                  <Button
                    key={tool.id}
                    variant={selectedRegion === tool.id ? "default" : "outline"}
                    className="h-auto p-3 flex flex-col items-center space-y-1"
                    style={{ 
                      backgroundColor: selectedRegion === tool.id ? tool.color : undefined,
                      borderColor: tool.color 
                    }}
                    onClick={() => setSelectedRegion(tool.id)}
                  >
                    {tool.icon}
                    <span className="text-xs">{tool.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* لوحة الألوان الدقيقة */}
            <div className="space-y-3">
              <h4 className="font-medium">ألوان {precisionTools.find(t => t.id === selectedRegion)?.name}</h4>
              
              <div className="grid grid-cols-5 gap-1">
                {selectedRegion === 'lips' && preciseColorPalettes.lips.reds.map((color, index) => (
                  <button
                    key={`lips-red-${index}`}
                    className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                    style={{ 
                      backgroundColor: color,
                      borderColor: selectedColor === color ? '#000' : 'transparent'
                    }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
                
                {selectedRegion === 'eyes' && preciseColorPalettes.eyes.neutrals.map((color, index) => (
                  <button
                    key={`eyes-neutral-${index}`}
                    className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                    style={{ 
                      backgroundColor: color,
                      borderColor: selectedColor === color ? '#000' : 'transparent'
                    }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
                
                {selectedRegion === 'cheeks' && preciseColorPalettes.cheeks.natural.map((color, index) => (
                  <button
                    key={`cheeks-natural-${index}`}
                    className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                    style={{ 
                      backgroundColor: color,
                      borderColor: selectedColor === color ? '#000' : 'transparent'
                    }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
                
                {selectedRegion === 'forehead' && preciseColorPalettes.forehead.highlight.map((color, index) => (
                  <button
                    key={`forehead-highlight-${index}`}
                    className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                    style={{ 
                      backgroundColor: color,
                      borderColor: selectedColor === color ? '#000' : 'transparent'
                    }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>

            {/* إعدادات التطبيق */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  شدة المكياج: {intensity[0]}%
                </label>
                <Slider
                  value={intensity}
                  onValueChange={setIntensity}
                  max={100}
                  min={10}
                  step={5}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">نوع التأثير</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['matte', 'gloss', 'shimmer', 'metallic'] as const).map((texture) => (
                    <Button
                      key={texture}
                      variant={selectedTexture === texture ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTexture(texture)}
                    >
                      {texture === 'matte' && 'مات'}
                      {texture === 'gloss' && 'لامع'}
                      {texture === 'shimmer' && 'متلألئ'}
                      {texture === 'metallic' && 'معدني'}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* أزرار التحكم */}
            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => applyPreciseMakeup(selectedRegion)}
                disabled={!landmarksDetected || isProcessing}
                className="w-full"
              >
                <Sparkles className="w-4 h-4 ml-1" />
                تطبيق على {precisionTools.find(t => t.id === selectedRegion)?.name}
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  onClick={clearAllEffects}
                  disabled={effects.length === 0}
                >
                  <Undo2 className="w-4 h-4 ml-1" />
                  مسح الكل
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={downloadResult}
                  disabled={effects.length === 0 || isProcessing}
                >
                  <Download className="w-4 h-4 ml-1" />
                  حفظ
                </Button>
              </div>
              
              <Button 
                variant="secondary"
                onClick={detectFaceLandmarks}
                disabled={isAnalyzing}
              >
                <Camera className="w-4 h-4 ml-1" />
                إعادة كشف الملامح
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}