import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Upload, RotateCcw, Eye, Zap, Target, Info, CheckCircle } from 'lucide-react';

interface FacialAnalysis3D {
  faceShape: string;
  symmetryScore: number;
  facialProportions: {
    foreheadRatio: number;
    eyeRatio: number;
    noseRatio: number;
    lipRatio: number;
    chinRatio: number;
  };
  landmarks3D: Array<{
    id: number;
    name: string;
    x: number;
    y: number;
    z: number;
    confidence: number;
  }>;
  recommendations: string[];
}

export default function ThreeDFacialModeling() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [modelImage, setModelImage] = useState<string>('');
  const [analysis, setAnalysis] = useState<FacialAnalysis3D | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modelType, setModelType] = useState<string>('wireframe');
  const [viewAngle, setViewAngle] = useState<string>('front');
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [enhanceFeatures, setEnhanceFeatures] = useState(false);
  const [confidence, setConfidence] = useState<number>(0);
  
  const { toast } = useToast();

  const handleImageSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "حجم الملف كبير جداً",
          description: "يرجى اختيار صورة أصغر من 10 ميجابايت",
          variant: "destructive",
        });
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Reset previous results
      setModelImage('');
      setAnalysis(null);
      setConfidence(0);
    }
  }, [toast]);

  const generate3DModel = async () => {
    if (!selectedImage) {
      toast({
        title: "لم يتم اختيار صورة",
        description: "يرجى اختيار صورة أولاً",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('modelType', modelType);
      formData.append('viewAngle', viewAngle);
      formData.append('showLandmarks', showLandmarks.toString());
      formData.append('enhanceFeatures', enhanceFeatures.toString());
      formData.append('analysisDepth', 'detailed');
      formData.append('startTime', Date.now().toString());

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await apiRequest('POST', '/api/generate-3d-model', formData);
      
      clearInterval(progressInterval);
      setProgress(100);

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          setModelImage(result.modelImageUrl);
          setAnalysis(result.analysis);
          setConfidence(result.confidence);
          
          toast({
            title: "✅ تم إنشاء النموذج ثلاثي الأبعاد",
            description: `تم التحليل بنجاح بثقة ${result.confidence}%`,
          });
        } else {
          throw new Error(result.error || 'فشل في إنشاء النموذج');
        }
      } else {
        throw new Error('فشل في الاتصال بالخادم');
      }
    } catch (error) {
      console.error('3D modeling error:', error);
      toast({
        title: "خطأ في إنشاء النموذج",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <Card className="max-w-6xl mx-auto" dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <RotateCcw className="ml-2 w-6 h-6 text-blue-600" />
            النمذجة ثلاثية الأبعاد للوجه
          </div>
          <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CheckCircle className="w-3 h-3 ml-1" />
            تقنية التصوير المجسم
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        
        {/* Image Upload Section */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold">رفع الصورة</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Upload Area */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="3d-image-upload"
                  data-testid="input-3d-image"
                />
                <label 
                  htmlFor="3d-image-upload" 
                  className="cursor-pointer flex flex-col items-center space-y-2"
                  data-testid="button-upload-3d"
                >
                  <Upload className="w-12 h-12 text-gray-400" />
                  <span className="text-sm text-gray-600">اضغط لاختيار صورة الوجه</span>
                </label>
              </div>
              
              {imagePreview && (
                <div className="space-y-2">
                  <img 
                    src={imagePreview} 
                    alt="معاينة الصورة" 
                    className="w-full h-64 object-cover rounded-lg"
                    data-testid="img-preview"
                  />
                  <p className="text-sm text-gray-600 text-center">الصورة المختارة</p>
                </div>
              )}
            </div>
            
            {/* 3D Model Result */}
            <div className="space-y-4">
              {modelImage ? (
                <div className="space-y-2">
                  <img 
                    src={modelImage} 
                    alt="النموذج ثلاثي الأبعاد" 
                    className="w-full h-64 object-cover rounded-lg border"
                    data-testid="img-3d-model"
                  />
                  <div className="flex items-center justify-center space-x-2">
                    <Badge variant="secondary">
                      دقة النموذج: {confidence}%
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Target className="w-12 h-12 text-gray-400 mx-auto" />
                    <p className="text-gray-500">النموذج ثلاثي الأبعاد سيظهر هنا</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Model Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="model-type">نوع النموذج</Label>
            <Select value={modelType} onValueChange={setModelType}>
              <SelectTrigger data-testid="select-model-type">
                <SelectValue placeholder="اختر نوع النموذج" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wireframe">إطار سلكي</SelectItem>
                <SelectItem value="textured">محكم</SelectItem>
                <SelectItem value="anatomical">تشريحي</SelectItem>
                <SelectItem value="surgical">جراحي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="view-angle">زاوية العرض</Label>
            <Select value={viewAngle} onValueChange={setViewAngle}>
              <SelectTrigger data-testid="select-view-angle">
                <SelectValue placeholder="اختر زاوية العرض" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="front">أمامي</SelectItem>
                <SelectItem value="side">جانبي</SelectItem>
                <SelectItem value="three_quarter">ثلاثة أرباع</SelectItem>
                <SelectItem value="360">دوراني 360</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Switch 
                checked={showLandmarks} 
                onCheckedChange={setShowLandmarks}
                data-testid="switch-show-landmarks"
              />
              <span>عرض النقاط المرجعية</span>
            </Label>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Switch 
                checked={enhanceFeatures} 
                onCheckedChange={setEnhanceFeatures}
                data-testid="switch-enhance-features"
              />
              <span>تحسين الملامح</span>
            </Label>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={generate3DModel}
          disabled={!selectedImage || isProcessing}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          size="lg"
          data-testid="button-generate-3d"
        >
          {isProcessing ? (
            <>
              <Zap className="w-5 h-5 ml-2 animate-spin" />
              جاري إنشاء النموذج ثلاثي الأبعاد...
            </>
          ) : (
            <>
              <RotateCcw className="w-5 h-5 ml-2" />
              إنشاء النموذج ثلاثي الأبعاد
            </>
          )}
        </Button>

        {/* Progress Bar */}
        {isProcessing && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-center text-gray-600">
              {progress < 30 ? 'تحليل الصورة...' :
               progress < 60 ? 'كشف النقاط المرجعية...' :
               progress < 90 ? 'إنشاء النموذج ثلاثي الأبعاد...' :
               'إنهاء المعالجة...'}
            </p>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <Tabs defaultValue="analysis" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="analysis" data-testid="tab-analysis">التحليل</TabsTrigger>
              <TabsTrigger value="proportions" data-testid="tab-proportions">النسب</TabsTrigger>
              <TabsTrigger value="recommendations" data-testid="tab-recommendations">التوصيات</TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">شكل الوجه</h3>
                    <p className="text-lg" data-testid="text-face-shape">{analysis.faceShape}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">درجة التماثل</h3>
                    <div className="flex items-center space-x-2">
                      <Progress value={analysis.symmetryScore} className="flex-1" />
                      <span className="text-sm font-medium" data-testid="text-symmetry-score">
                        {analysis.symmetryScore}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="proportions" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(analysis.facialProportions).map(([key, value]) => (
                  <Card key={key}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">
                        {key === 'foreheadRatio' ? 'الجبهة' :
                         key === 'eyeRatio' ? 'العيون' :
                         key === 'noseRatio' ? 'الأنف' :
                         key === 'lipRatio' ? 'الشفاه' :
                         key === 'chinRatio' ? 'الذقن' : key}
                      </h3>
                      <Progress value={value * 100} className="w-full" />
                      <p className="text-sm text-gray-600 mt-1">
                        نسبة: {(value * 100).toFixed(1)}%
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <div className="space-y-3">
                {analysis.recommendations.map((recommendation, index) => (
                  <Alert key={index}>
                    <Info className="h-4 w-4" />
                    <AlertDescription data-testid={`text-recommendation-${index}`}>
                      {recommendation}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}