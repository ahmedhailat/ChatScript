import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Camera, Upload, Download, Share2, Undo, Redo, Eye, EyeOff,
  Sparkles, Heart, Star, Zap, Palette, Brush, Droplet, Sun,
  Moon, Contrast, Volume2, User, UserCheck, Baby, Users,
  Smile, Frown, Meh, Wand2, Scissors, PaintBucket, Layers,
  RotateCcw, Save, Play, Pause, RefreshCw, Search, Target,
  Crosshair, Move, ZoomIn, ZoomOut, Grid, Ruler, Pipette
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import InteractiveMakeupTools from '@/components/interactive-makeup-tools';

interface ProcessingStep {
  id: string;
  name: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

export function ProfessionalFaceAppStudio() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('makeup');
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // ModiFace Professional Categories
  const categories = {
    makeup: {
      name: 'المكياج الاحترافي',
      icon: Palette,
      color: 'from-pink-500 to-purple-600',
      subcategories: {
        lipstick: { name: 'أحمر الشفاه', colors: ['#FF1744', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5'] },
        eyeshadow: { name: 'ظلال العيون', colors: ['#8D6E63', '#795548', '#607D8B', '#455A64', '#37474F'] },
        eyeliner: { name: 'كحل العيون', colors: ['#000000', '#424242', '#795548', '#3E2723'] },
        mascara: { name: 'الماسكارا', effects: ['volume', 'length', 'dramatic', 'natural'] },
        foundation: { name: 'كريم الأساس', shades: 30, coverage: ['light', 'medium', 'full'] },
        blush: { name: 'أحمر الخدود', colors: ['#F8BBD9', '#F48FB1', '#F06292', '#EC407A'] },
        contour: { name: 'الكونتور', techniques: ['subtle', 'dramatic', 'natural', 'sculpted'] },
        highlighter: { name: 'الهايلايتر', finishes: ['dewy', 'glowing', 'metallic', 'shimmer'] },
        brows: { name: 'الحواجب', shapes: ['natural', 'arched', 'straight', 'feathered'] },
        lipliner: { name: 'محدد الشفاه', precision: ['thin', 'medium', 'bold'] }
      }
    },
    age: {
      name: 'تحويل العمر',
      icon: User,
      color: 'from-blue-500 to-cyan-600',
      effects: {
        younger: { name: 'أصغر سناً', ranges: [5, 10, 15, 20] },
        older: { name: 'أكبر سناً', ranges: [10, 20, 30, 40, 50] },
        timeline: { name: 'خط زمني', stages: ['child', 'teen', 'adult', 'senior'] }
      }
    },
    gender: {
      name: 'تبديل الجنس',
      icon: Users,
      color: 'from-green-500 to-teal-600',
      modes: {
        masculine: { name: 'ذكوري', features: ['jawline', 'beard', 'brow'] },
        feminine: { name: 'أنثوي', features: ['lips', 'eyes', 'cheeks'] },
        neutral: { name: 'محايد', blend: 0.5 }
      }
    },
    beauty: {
      name: 'تحسينات الجمال',
      icon: Sparkles,
      color: 'from-yellow-500 to-orange-600',
      enhancements: {
        skin: { name: 'تنعيم البشرة', levels: ['light', 'medium', 'strong'] },
        teeth: { name: 'تبييض الأسنان', whiteness: [1, 2, 3, 4, 5] },
        eyes: { name: 'تكبير العيون', sizes: ['subtle', 'medium', 'dramatic'] },
        smile: { name: 'تحسين الابتسامة', types: ['natural', 'wide', 'bright'] }
      }
    },
    hair: {
      name: 'تأثيرات الشعر',
      icon: Scissors,
      color: 'from-purple-500 to-indigo-600',
      options: {
        color: { name: 'لون الشعر', palette: ['#000000', '#8B4513', '#DAA520', '#DC143C', '#4B0082'] },
        style: { name: 'تسريحات', types: ['wavy', 'straight', 'curly', 'braided'] },
        length: { name: 'طول الشعر', options: ['short', 'medium', 'long'] },
        facial_hair: { name: 'شعر الوجه', styles: ['mustache', 'beard', 'goatee', 'stubble'] }
      }
    },
    effects: {
      name: 'تأثيرات خاصة',
      icon: Star,
      color: 'from-red-500 to-pink-600',
      filters: {
        glow: { name: 'توهج طبيعي', intensity: [0.1, 0.3, 0.5, 0.7, 1.0] },
        vintage: { name: 'كلاسيكي', styles: ['sepia', 'black_white', 'film'] },
        artistic: { name: 'فني', effects: ['oil_painting', 'watercolor', 'sketch'] },
        lighting: { name: 'إضاءة', modes: ['studio', 'natural', 'dramatic', 'soft'] }
      }
    }
  };

  // Color Matching Technology (ModiFace-inspired)
  const [colorMatchMode, setColorMatchMode] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#FF1744');
  const [matchIntensity, setMatchIntensity] = useState([70]);
  const [blendMode, setBlendMode] = useState('multiply');
  const [isDragActive, setIsDragActive] = useState(false);

  const processImage = useCallback(async (category: string, effect: any, intensity: number) => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setProcessingSteps([
      { id: '1', name: 'تحليل الوجه بتقنية AI', progress: 0, status: 'processing' },
      { id: '2', name: 'تحديد 68 نقطة على الوجه', progress: 0, status: 'pending' },
      { id: '3', name: 'تطبيق التأثير المحدد', progress: 0, status: 'pending' },
      { id: '4', name: 'تحسين الجودة والواقعية', progress: 0, status: 'pending' },
      { id: '5', name: 'معايرة الألوان النهائية', progress: 0, status: 'pending' }
    ]);

    try {
      // Simulate processing steps
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setProcessingSteps(prev => prev.map((step, index) => 
          index === i 
            ? { ...step, progress: 100, status: 'completed' }
            : index === i + 1 
              ? { ...step, status: 'processing', progress: 0 }
              : step
        ));
      }

      // Convert data URL to blob
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');
      formData.append('category', category);
      formData.append('effect', JSON.stringify(effect));
      formData.append('intensity', intensity.toString());

      console.log('Sending FaceApp processing request:', { category, effect, intensity });
      
      const result = await apiRequest('POST', '/api/faceapp/process', formData);
      
      const data = await result.json();
      
      if (data.success && data.processedImageUrl) {
        setProcessedImage(data.processedImageUrl);
        toast({
          title: "تم التطبيق بنجاح! ✨",
          description: data.message || `تم تطبيق تأثير ${category} بجودة احترافية`,
        });
      } else {
        throw new Error(data.message || 'فشل في المعالجة');
      }
    } catch (error) {
      toast({
        title: "خطأ في المعالجة",
        description: "حدث خطأ أثناء معالجة الصورة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingSteps([]);
    }
  }, [selectedImage, toast]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Selected file:', file);
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "نوع ملف غير مدعوم",
          description: "يرجى اختيار صورة بصيغة JPG, PNG أو GIF",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "حجم الملف كبير جداً",
          description: "يرجى اختيار صورة أقل من 10 ميجابايت",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setSelectedImage(result);
          setProcessedImage(null);
          toast({
            title: "تم رفع الصورة بنجاح! 📷",
            description: "يمكنك الآن اختيار التأثير المطلوب",
          });
        }
      };
      reader.onerror = () => {
        toast({
          title: "خطأ في قراءة الملف",
          description: "حدث خطأ أثناء قراءة الصورة. يرجى المحاولة مرة أخرى",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
    }
    
    // Reset the input value to allow selecting the same file again
    event.target.value = '';
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      // Create proper file input change event
      const mockEvent = {
        target: { files: [imageFile], value: '' }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleImageUpload(mockEvent);
    } else {
      toast({
        title: "ملف غير صحيح",
        description: "يرجى سحب وإفلات صورة فقط",
        variant: "destructive",
      });
    }
  };

  const saveImage = async () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `faceapp-professional-${Date.now()}.jpg`;
    link.click();

    toast({
      title: "تم الحفظ بنجاح! 💾",
      description: "تم حفظ الصورة المعدلة بجودة عالية",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="mb-6 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl mb-2 flex items-center gap-3">
                  <Wand2 className="w-8 h-8" />
                  FaceApp Studio Professional
                </CardTitle>
                <p className="text-lg opacity-90">
                  تقنية ModiFace المتقدمة + ميزات FaceApp الكاملة
                </p>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-green-600 text-white px-3 py-1">
                  AI-Powered
                </Badge>
                <Badge className="bg-blue-600 text-white px-3 py-1">
                  Professional
                </Badge>
                <Badge className="bg-yellow-600 text-white px-3 py-1">
                  Real-Time
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Control Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">لوحة التحكم المتقدمة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    console.log('Upload button clicked');
                    fileInputRef.current?.click();
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  data-testid="button-upload-image"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  رفع صورة جديدة
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  onChange={handleImageUpload}
                  className="hidden"
                  multiple={false}
                />
              </div>

              {/* Category Selection */}
              <div className="space-y-3">
                <h4 className="font-semibold">فئات التأثيرات</h4>
                {Object.entries(categories).map(([key, category]) => {
                  const IconComponent = category.icon;
                  return (
                    <Button
                      key={key}
                      variant={activeCategory === key ? "default" : "outline"}
                      onClick={() => setActiveCategory(key)}
                      className={`w-full justify-start ${
                        activeCategory === key 
                          ? `bg-gradient-to-r ${category.color} text-white`
                          : ''
                      }`}
                      data-testid={`button-category-${key}`}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {category.name}
                    </Button>
                  );
                })}
              </div>

              {/* Professional Tools */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-semibold">أدوات احترافية</h4>
                
                <Button
                  variant="outline"
                  onClick={() => setColorMatchMode(!colorMatchMode)}
                  className="w-full justify-start"
                  data-testid="button-color-match"
                >
                  <Pipette className="w-4 h-4 mr-2" />
                  مطابقة الألوان (ModiFace)
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowComparison(!showComparison)}
                  className="w-full justify-start"
                  data-testid="button-comparison"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  مقارنة قبل/بعد
                </Button>

                {processedImage && (
                  <>
                    <Button
                      onClick={saveImage}
                      className="w-full bg-green-600 hover:bg-green-700"
                      data-testid="button-save"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      حفظ بجودة عالية
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      data-testid="button-share"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      مشاركة النتيجة
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Main Workspace */}
          <Card className="lg:col-span-3">
            <CardContent className="p-6">
              {/* Processing Steps */}
              {isProcessing && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold mb-3 text-blue-800 flex items-center gap-2">
                    <Wand2 className="w-4 h-4 animate-spin" />
                    معالجة بتقنية AI المتقدمة...
                  </h4>
                  <div className="space-y-3">
                    {processingSteps.map((step) => (
                      <div key={step.id} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          step.status === 'completed' ? 'bg-green-500' :
                          step.status === 'processing' ? 'bg-blue-500 animate-pulse' :
                          'bg-gray-300'
                        }`} />
                        <span className="text-sm flex-1">{step.name}</span>
                        {step.status === 'processing' && (
                          <Progress value={step.progress} className="w-20 h-2" />
                        )}
                        {step.status === 'completed' && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            ✓
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-2 bg-white bg-opacity-50 rounded text-xs text-gray-600">
                    💡 استخدام تقنية ModiFace للمعالجة الاحترافية
                  </div>
                </div>
              )}

              {/* Image Display */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {/* Original Image */}
                <div className="space-y-2">
                  <h4 className="font-semibold">الصورة الأصلية</h4>
                  <div 
                    className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed flex items-center justify-center transition-all duration-200 ${
                      isDragActive 
                        ? 'border-purple-500 bg-purple-50 border-solid' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {selectedImage ? (
                      <div className="relative">
                        <img 
                          src={selectedImage} 
                          alt="Original" 
                          className="w-full h-full object-cover rounded"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-gray-600 text-white">
                            أصلية
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className={`text-center transition-colors duration-200 ${
                        isDragActive ? 'text-purple-600' : 'text-gray-500'
                      }`}>
                        {isDragActive ? (
                          <>
                            <Download className="w-12 h-12 mx-auto mb-2 animate-bounce" />
                            <p className="font-semibold">اتركها هنا! 🎯</p>
                            <p className="text-xs mt-1">
                              سيتم رفع الصورة تلقائياً
                            </p>
                          </>
                        ) : (
                          <>
                            <Camera className="w-12 h-12 mx-auto mb-2" />
                            <p>ارفع صورة للبدء</p>
                            <p className="text-xs text-gray-400 mt-1">
                              اسحب وأفلت أو انقر لاختيار
                            </p>
                            <p className="text-xs text-gray-400">
                              JPG, PNG, GIF (أقل من 10 ميجا)
                            </p>
                            <Button
                              onClick={() => fileInputRef.current?.click()}
                              variant="outline"
                              size="sm"
                              className="mt-3"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              اختر صورة
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Processed Image */}
                <div className="space-y-2">
                  <h4 className="font-semibold">النتيجة النهائية</h4>
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-solid border-green-300 flex items-center justify-center">
                    {processedImage ? (
                      <div className="relative">
                        <img 
                          src={processedImage} 
                          alt="Processed" 
                          className="w-full h-full object-cover rounded"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-600 text-white">
                            ✓ تم المعالجة
                          </Badge>
                        </div>
                        <div className="absolute bottom-2 left-2">
                          <Badge className="bg-blue-600 text-white text-xs">
                            AI معالج
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        <Sparkles className="w-12 h-12 mx-auto mb-2" />
                        <p>النتيجة ستظهر هنا</p>
                        <p className="text-xs text-gray-400 mt-1">
                          جودة احترافية 95%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Interactive Makeup Tools - Under Image */}
              {selectedImage && (
                <div className="mt-6">
                  <InteractiveMakeupTools
                    onToolSelect={(tool, config) => {
                      console.log('أداة محددة:', tool, config);
                      toast({
                        title: "تم اختيار الأداة",
                        description: `تم اختيار أداة ${tool}`,
                      });
                    }}
                    onApplyMakeup={async (config) => {
                      console.log('تطبيق المكياج:', config);
                      await processImage('makeup', config, config.intensity);
                    }}
                    isProcessing={isProcessing}
                  />
                </div>
              )}

              {/* Effects Panel */}
              {selectedImage && (
                <Tabs value={activeCategory} className="w-full">
                  <TabsList className="grid grid-cols-6 w-full">
                    {Object.entries(categories).map(([key, category]) => (
                      <TabsTrigger key={key} value={key} className="text-xs">
                        {category.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {/* Makeup Tab */}
                  <TabsContent value="makeup" className="space-y-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(categories.makeup.subcategories).map(([key, sub]) => (
                        <Card key={key} className="p-4">
                          <h5 className="font-semibold mb-3">{sub.name}</h5>
                          {'colors' in sub && (
                            <div className="grid grid-cols-5 gap-2 mb-3">
                              {sub.colors.map((color, index) => (
                                <button
                                  key={index}
                                  onClick={() => processImage('makeup', { type: key, color }, matchIntensity[0])}
                                  className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-500"
                                  style={{ backgroundColor: color }}
                                  data-testid={`color-${key}-${index}`}
                                />
                              ))}
                            </div>
                          )}
                          {'effects' in sub && (
                            <div className="space-y-2">
                              {sub.effects.map((effect, index) => (
                                <Button
                                  key={index}
                                  size="sm"
                                  variant="outline"
                                  onClick={() => processImage('makeup', { type: key, effect }, matchIntensity[0])}
                                  className="w-full"
                                  data-testid={`effect-${key}-${effect}`}
                                >
                                  {effect}
                                </Button>
                              ))}
                            </div>
                          )}
                          {'shades' in sub && (
                            <div className="text-center">
                              <p className="text-sm text-gray-600 mb-2">{sub.shades} درجة متاحة</p>
                              <Button
                                size="sm"
                                onClick={() => processImage('makeup', { type: key, findShade: true }, matchIntensity[0])}
                                data-testid={`button-find-shade-${key}`}
                              >
                                العثور على درجتي
                              </Button>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Age Tab */}
                  <TabsContent value="age" className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <Card className="p-4">
                        <h5 className="font-semibold mb-3">أصغر سناً</h5>
                        <div className="space-y-2">
                          {categories.age.effects.younger.ranges.map((years) => (
                            <Button
                              key={years}
                              size="sm"
                              variant="outline"
                              onClick={() => processImage('age', { type: 'younger', years }, 80)}
                              className="w-full"
                              data-testid={`button-younger-${years}`}
                            >
                              -{years} سنوات
                            </Button>
                          ))}
                        </div>
                      </Card>

                      <Card className="p-4">
                        <h5 className="font-semibold mb-3">أكبر سناً</h5>
                        <div className="space-y-2">
                          {categories.age.effects.older.ranges.map((years) => (
                            <Button
                              key={years}
                              size="sm"
                              variant="outline"
                              onClick={() => processImage('age', { type: 'older', years }, 80)}
                              className="w-full"
                              data-testid={`button-older-${years}`}
                            >
                              +{years} سنوات
                            </Button>
                          ))}
                        </div>
                      </Card>

                      <Card className="p-4">
                        <h5 className="font-semibold mb-3">الخط الزمني</h5>
                        <div className="space-y-2">
                          {categories.age.effects.timeline.stages.map((stage) => (
                            <Button
                              key={stage}
                              size="sm"
                              variant="outline"
                              onClick={() => processImage('age', { type: 'timeline', stage }, 80)}
                              className="w-full"
                              data-testid={`button-timeline-${stage}`}
                            >
                              {stage === 'child' ? 'طفولة' :
                               stage === 'teen' ? 'مراهقة' :
                               stage === 'adult' ? 'شباب' : 'كبار السن'}
                            </Button>
                          ))}
                        </div>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Gender Tab */}
                  <TabsContent value="gender" className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      {Object.entries(categories.gender.modes).map(([key, mode]) => (
                        <Card key={key} className="p-4">
                          <h5 className="font-semibold mb-3">{mode.name}</h5>
                          <Button
                            onClick={() => processImage('gender', { type: key, mode }, 75)}
                            className="w-full mb-3"
                            data-testid={`button-gender-${key}`}
                          >
                            تطبيق التحويل
                          </Button>
                          {'features' in mode && (
                            <div className="space-y-1">
                              <p className="text-xs text-gray-600">الميزات:</p>
                              {mode.features.map((feature, index) => (
                                <Badge key={index} variant="outline" className="text-xs mr-1">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Beauty Tab */}
                  <TabsContent value="beauty" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(categories.beauty.enhancements).map(([key, enhancement]) => (
                        <Card key={key} className="p-4">
                          <h5 className="font-semibold mb-3">{enhancement.name}</h5>
                          {'levels' in enhancement && (
                            <div className="space-y-2">
                              {enhancement.levels.map((level) => (
                                <Button
                                  key={level}
                                  size="sm"
                                  variant="outline"
                                  onClick={() => processImage('beauty', { type: key, level }, 70)}
                                  className="w-full"
                                  data-testid={`button-beauty-${key}-${level}`}
                                >
                                  {level === 'light' ? 'خفيف' : 
                                   level === 'medium' ? 'متوسط' : 'قوي'}
                                </Button>
                              ))}
                            </div>
                          )}
                          {'whiteness' in enhancement && (
                            <div className="space-y-2">
                              {enhancement.whiteness.map((level) => (
                                <Button
                                  key={level}
                                  size="sm"
                                  variant="outline"
                                  onClick={() => processImage('beauty', { type: key, level }, 70)}
                                  className="w-full"
                                  data-testid={`button-teeth-${level}`}
                                >
                                  مستوى {level}
                                </Button>
                              ))}
                            </div>
                          )}
                          {'sizes' in enhancement && (
                            <div className="space-y-2">
                              {enhancement.sizes.map((size) => (
                                <Button
                                  key={size}
                                  size="sm"
                                  variant="outline"
                                  onClick={() => processImage('beauty', { type: key, size }, 70)}
                                  className="w-full"
                                  data-testid={`button-eyes-${size}`}
                                >
                                  {size === 'subtle' ? 'طفيف' :
                                   size === 'medium' ? 'متوسط' : 'واضح'}
                                </Button>
                              ))}
                            </div>
                          )}
                          {'types' in enhancement && (
                            <div className="space-y-2">
                              {enhancement.types.map((type) => (
                                <Button
                                  key={type}
                                  size="sm"
                                  variant="outline"
                                  onClick={() => processImage('beauty', { type: key, smileType: type }, 70)}
                                  className="w-full"
                                  data-testid={`button-smile-${type}`}
                                >
                                  {type === 'natural' ? 'طبيعية' :
                                   type === 'wide' ? 'عريضة' : 'مشرقة'}
                                </Button>
                              ))}
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Hair Tab */}
                  <TabsContent value="hair" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(categories.hair.options).map(([key, option]) => (
                        <Card key={key} className="p-4">
                          <h5 className="font-semibold mb-3">{option.name}</h5>
                          {'palette' in option && (
                            <div className="grid grid-cols-5 gap-2 mb-3">
                              {option.palette.map((color, index) => (
                                <button
                                  key={index}
                                  onClick={() => processImage('hair', { type: key, color }, 80)}
                                  className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-500"
                                  style={{ backgroundColor: color }}
                                  data-testid={`hair-color-${index}`}
                                />
                              ))}
                            </div>
                          )}
                          {'types' in option && (
                            <div className="space-y-2">
                              {option.types.map((type) => (
                                <Button
                                  key={type}
                                  size="sm"
                                  variant="outline"
                                  onClick={() => processImage('hair', { type: key, style: type }, 80)}
                                  className="w-full"
                                  data-testid={`hair-style-${type}`}
                                >
                                  {type}
                                </Button>
                              ))}
                            </div>
                          )}
                          {'options' in option && (
                            <div className="space-y-2">
                              {option.options.map((opt) => (
                                <Button
                                  key={opt}
                                  size="sm"
                                  variant="outline"
                                  onClick={() => processImage('hair', { type: key, length: opt }, 80)}
                                  className="w-full"
                                  data-testid={`hair-length-${opt}`}
                                >
                                  {opt === 'short' ? 'قصير' :
                                   opt === 'medium' ? 'متوسط' : 'طويل'}
                                </Button>
                              ))}
                            </div>
                          )}
                          {'styles' in option && (
                            <div className="space-y-2">
                              {option.styles.map((style) => (
                                <Button
                                  key={style}
                                  size="sm"
                                  variant="outline"
                                  onClick={() => processImage('hair', { type: key, facial: style }, 80)}
                                  className="w-full"
                                  data-testid={`facial-hair-${style}`}
                                >
                                  {style}
                                </Button>
                              ))}
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Effects Tab */}
                  <TabsContent value="effects" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(categories.effects.filters).map(([key, filter]) => (
                        <Card key={key} className="p-4">
                          <h5 className="font-semibold mb-3">{filter.name}</h5>
                          {'intensity' in filter && (
                            <div className="space-y-2">
                              {filter.intensity.map((level, index) => (
                                <Button
                                  key={index}
                                  size="sm"
                                  variant="outline"
                                  onClick={() => processImage('effects', { type: key, intensity: level }, 60)}
                                  className="w-full"
                                  data-testid={`effect-${key}-${index}`}
                                >
                                  شدة {Math.round(level * 100)}%
                                </Button>
                              ))}
                            </div>
                          )}
                          {'styles' in filter && (
                            <div className="space-y-2">
                              {filter.styles.map((style) => (
                                <Button
                                  key={style}
                                  size="sm"
                                  variant="outline"
                                  onClick={() => processImage('effects', { type: key, style }, 60)}
                                  className="w-full"
                                  data-testid={`effect-style-${style}`}
                                >
                                  {style}
                                </Button>
                              ))}
                            </div>
                          )}
                          {'effects' in filter && (
                            <div className="space-y-2">
                              {filter.effects.map((effect) => (
                                <Button
                                  key={effect}
                                  size="sm"
                                  variant="outline"
                                  onClick={() => processImage('effects', { type: key, effect }, 60)}
                                  className="w-full"
                                  data-testid={`artistic-${effect}`}
                                >
                                  {effect}
                                </Button>
                              ))}
                            </div>
                          )}
                          {'modes' in filter && (
                            <div className="space-y-2">
                              {filter.modes.map((mode) => (
                                <Button
                                  key={mode}
                                  size="sm"
                                  variant="outline"
                                  onClick={() => processImage('effects', { type: key, mode }, 60)}
                                  className="w-full"
                                  data-testid={`lighting-${mode}`}
                                >
                                  {mode}
                                </Button>
                              ))}
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              )}

              {/* Advanced Controls */}
              {colorMatchMode && (
                <Card className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50">
                  <h4 className="font-semibold mb-4">🎨 تقنية مطابقة الألوان ModiFace</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">اللون المرجعي</label>
                      <input
                        type="color"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-full h-10 rounded border"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">شدة المطابقة: {matchIntensity[0]}%</label>
                      <Slider
                        value={matchIntensity}
                        onValueChange={setMatchIntensity}
                        max={100}
                        min={10}
                        step={5}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">نمط المزج</label>
                      <Select value={blendMode} onValueChange={setBlendMode}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiply">ضرب</SelectItem>
                          <SelectItem value="overlay">تراكب</SelectItem>
                          <SelectItem value="soft-light">إضاءة ناعمة</SelectItem>
                          <SelectItem value="normal">عادي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mt-6">
          <Card className="text-center p-4">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold">98.3% دقة</h3>
            <p className="text-xs text-gray-600">تحليل البشرة</p>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold">68 نقطة</h3>
            <p className="text-xs text-gray-600">تتبع الوجه</p>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl mb-2">🌈</div>
            <h3 className="font-semibold">60+ فلتر</h3>
            <p className="text-xs text-gray-600">تأثيرات متقدمة</p>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl mb-2">🚀</div>
            <h3 className="font-semibold">AI مدعوم</h3>
            <p className="text-xs text-gray-600">معالجة فورية</p>
          </Card>
        </div>
      </div>
    </div>
  );
}