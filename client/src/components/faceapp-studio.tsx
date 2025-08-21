import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { 
  Camera, 
  Upload, 
  Download, 
  RotateCcw, 
  Eye, 
  Smile, 
  Heart, 
  Sparkles, 
  User, 
  Baby, 
  UserCheck,
  Palette,
  Scissors,
  Zap,
  RefreshCw,
  Save,
  Share,
  Settings
} from "lucide-react";

interface FaceEffect {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  description: string;
  intensity: number;
}

const faceEffects: FaceEffect[] = [
  // Age Effects
  { id: "young", name: "أصغر سناً", category: "age", icon: <Baby />, description: "اجعل الوجه يبدو أصغر", intensity: 50 },
  { id: "old", name: "أكبر سناً", category: "age", icon: <User />, description: "اجعل الوجه يبدو أكبر", intensity: 50 },
  
  // Gender Effects
  { id: "male", name: "ذكر", category: "gender", icon: <UserCheck />, description: "تحويل إلى مظهر ذكوري", intensity: 70 },
  { id: "female", name: "أنثى", category: "gender", icon: <Heart />, description: "تحويل إلى مظهر أنثوي", intensity: 70 },
  
  // Smile Effects
  { id: "smile", name: "ابتسامة", category: "expression", icon: <Smile />, description: "إضافة ابتسامة طبيعية", intensity: 60 },
  { id: "laugh", name: "ضحكة", category: "expression", icon: <Smile />, description: "ضحكة عريضة", intensity: 80 },
  
  // Beauty Effects
  { id: "beauty", name: "تجميل", category: "beauty", icon: <Sparkles />, description: "تحسين ملامح الوجه", intensity: 40 },
  { id: "makeup", name: "مكياج", category: "beauty", icon: <Palette />, description: "مكياج طبيعي", intensity: 50 },
  
  // Hair Effects
  { id: "hair_color", name: "لون الشعر", category: "hair", icon: <Scissors />, description: "تغيير لون الشعر", intensity: 60 },
  { id: "beard", name: "لحية", category: "hair", icon: <User />, description: "إضافة لحية", intensity: 70 },
  
  // Eye Effects
  { id: "eye_color", name: "لون العيون", category: "eyes", icon: <Eye />, description: "تغيير لون العيون", intensity: 80 },
  { id: "eye_size", name: "حجم العيون", category: "eyes", icon: <Eye />, description: "تكبير العيون", intensity: 30 },
  
  // Special Effects
  { id: "glow", name: "إشراق", category: "special", icon: <Zap />, description: "إشراق طبيعي للبشرة", intensity: 40 },
  { id: "smooth", name: "نعومة", category: "special", icon: <Sparkles />, description: "نعومة البشرة", intensity: 50 }
];

const categories = [
  { id: "age", name: "العمر", icon: <Baby /> },
  { id: "gender", name: "الجنس", icon: <UserCheck /> },
  { id: "expression", name: "التعبير", icon: <Smile /> },
  { id: "beauty", name: "التجميل", icon: <Sparkles /> },
  { id: "hair", name: "الشعر", icon: <Scissors /> },
  { id: "eyes", name: "العيون", icon: <Eye /> },
  { id: "special", name: "تأثيرات خاصة", icon: <Zap /> }
];

export function FaceAppStudio() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("beauty");
  const [appliedEffects, setAppliedEffects] = useState<Record<string, number>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSelectedImage(result);
      setProcessedImage(result);
      setAppliedEffects({});
    };
    reader.readAsDataURL(file);
  };

  const applyEffect = async (effect: FaceEffect) => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setProcessingProgress(0);

    // Simulate processing progress
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Convert image to blob for upload
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('image', blob, 'photo.jpg');
      formData.append('effect', effect.id);
      formData.append('intensity', effect.intensity.toString());
      formData.append('category', effect.category);

      const apiResponse = await fetch('/api/apply-face-effect', {
        method: 'POST',
        body: formData,
      });

      const result = await apiResponse.json();
      
      if (result.success && result.processedImageUrl) {
        setProcessedImage(result.processedImageUrl);
        setAppliedEffects(prev => ({
          ...prev,
          [effect.id]: effect.intensity
        }));
      }
    } catch (error) {
      console.error('Error applying effect:', error);
    } finally {
      clearInterval(progressInterval);
      setProcessingProgress(100);
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingProgress(0);
      }, 500);
    }
  };

  const adjustEffectIntensity = (effectId: string, intensity: number) => {
    const effect = faceEffects.find(e => e.id === effectId);
    if (effect) {
      const adjustedEffect = { ...effect, intensity };
      applyEffect(adjustedEffect);
    }
  };

  const resetAllEffects = () => {
    setProcessedImage(selectedImage);
    setAppliedEffects({});
  };

  const saveImage = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.download = 'faceapp-edited.jpg';
      link.href = processedImage;
      link.click();
    }
  };

  const filteredEffects = faceEffects.filter(effect => effect.category === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white" dir="rtl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-pink-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
            FaceApp Studio
          </h1>
        </div>
        <p className="text-gray-600">أفضل تطبيق لتحرير الوجه بالذكاء الاصطناعي</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Panel - Image Upload */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                رفع الصورة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedImage ? (
                <div className="space-y-3">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    اختر صورة
                  </Button>
                  
                  <Button
                    onClick={() => cameraInputRef.current?.click()}
                    variant="outline"
                    className="w-full"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    التقط صورة
                  </Button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                  
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <img
                    src={selectedImage}
                    alt="Original"
                    className="w-full rounded-lg border-2 border-gray-200"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      تغيير
                    </Button>
                    <Button
                      onClick={resetAllEffects}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      إعادة تعيين
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Applied Effects */}
          {Object.keys(appliedEffects).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  التأثيرات المطبقة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(appliedEffects).map(([effectId, intensity]) => {
                  const effect = faceEffects.find(e => e.id === effectId);
                  if (!effect) return null;
                  
                  return (
                    <div key={effectId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{effect.name}</span>
                        <Badge variant="secondary">{intensity}%</Badge>
                      </div>
                      <Slider
                        value={[intensity]}
                        onValueChange={([value]) => adjustEffectIntensity(effectId, value)}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Center Panel - Result */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  النتيجة
                </span>
                {processedImage && (
                  <div className="flex gap-2">
                    <Button onClick={saveImage} size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      حفظ
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share className="w-4 h-4 mr-1" />
                      مشاركة
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {processedImage ? (
                <div className="space-y-4">
                  <img
                    src={processedImage}
                    alt="Processed"
                    className="w-full rounded-lg border-2 border-blue-200"
                  />
                  
                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>جارٍ المعالجة...</span>
                        <span>{processingProgress}%</span>
                      </div>
                      <Progress value={processingProgress} className="w-full" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>ارفع صورة لبدء التحرير</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Effects */}
        <div className="lg:col-span-1 space-y-4">
          {/* Category Selector */}
          <Card>
            <CardHeader>
              <CardTitle>فئات التأثيرات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className="justify-start text-sm h-auto p-3"
                  >
                    <div className="flex items-center gap-2">
                      {category.icon}
                      <span>{category.name}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Effects Grid */}
          <Card>
            <CardHeader>
              <CardTitle>
                {categories.find(c => c.id === selectedCategory)?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                {filteredEffects.map((effect) => (
                  <Button
                    key={effect.id}
                    onClick={() => applyEffect(effect)}
                    disabled={!selectedImage || isProcessing}
                    variant={appliedEffects[effect.id] ? "default" : "outline"}
                    className="justify-start text-right h-auto p-4"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {effect.icon}
                      </div>
                      <div className="text-right flex-1">
                        <div className="font-medium">{effect.name}</div>
                        <div className="text-xs text-gray-500">{effect.description}</div>
                      </div>
                      {appliedEffects[effect.id] && (
                        <Badge variant="secondary" className="mr-auto">
                          {appliedEffects[effect.id]}%
                        </Badge>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}