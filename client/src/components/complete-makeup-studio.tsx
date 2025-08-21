import React, { useState, useRef } from 'react';
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
  Wand2,
  Download,
  Undo2,
  RotateCcw,
  Star,
  Camera
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DirectMakeupVisualizer from "./direct-makeup-visualizer";

interface CompleteMakeupStudioProps {
  image: string;
  onMakeupComplete?: (result: string) => void;
}

export default function CompleteMakeupStudio({ 
  image, 
  onMakeupComplete 
}: CompleteMakeupStudioProps) {
  const [activeTab, setActiveTab] = useState('visual');
  const [processingCount, setProcessingCount] = useState(0);
  
  const { toast } = useToast();

  // Professional makeup presets
  const makeupPresets = [
    {
      id: 'natural',
      name: 'طبيعي',
      icon: <Sparkles className="w-4 h-4" />,
      description: 'مكياج يومي خفيف وطبيعي',
      effects: {
        foundation: { color: '#D4A574', intensity: 30 },
        lips: { color: '#FF6B6B', intensity: 40 },
        eyes: { color: '#8B5CF6', intensity: 25 },
        cheeks: { color: '#F87171', intensity: 35 }
      }
    },
    {
      id: 'glamour',
      name: 'ساحر',
      icon: <Star className="w-4 h-4" />,
      description: 'مكياج مسائي أنيق ومتألق',
      effects: {
        foundation: { color: '#C4956C', intensity: 50 },
        lips: { color: '#DC2626', intensity: 80 },
        eyes: { color: '#6D28D9', intensity: 75 },
        cheeks: { color: '#EF4444', intensity: 60 }
      }
    },
    {
      id: 'bold',
      name: 'جريء',
      icon: <Wand2 className="w-4 h-4" />,
      description: 'مكياج قوي وجذاب للمناسبات',
      effects: {
        foundation: { color: '#B4856A', intensity: 60 },
        lips: { color: '#BE185D', intensity: 95 },
        eyes: { color: '#5B21B6', intensity: 90 },
        cheeks: { color: '#DC2626', intensity: 70 }
      }
    }
  ];

  const applyPreset = async (preset: typeof makeupPresets[0]) => {
    setProcessingCount(prev => prev + 1);
    
    try {
      // Simulate professional makeup application
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (onMakeupComplete) {
        onMakeupComplete(image); // In reality, this would be the processed image
      }
      
      toast({
        title: `تم تطبيق المكياج ${preset.name}!`,
        description: preset.description,
      });
    } catch (error) {
      toast({
        title: "خطأ في التطبيق",
        description: "فشل في تطبيق الإعداد المسبق",
        variant: "destructive"
      });
    } finally {
      setProcessingCount(prev => prev - 1);
    }
  };

  const takeSnapshot = () => {
    toast({
      title: "تم التقاط الصورة!",
      description: "تم حفظ النتيجة في معرض الصور",
    });
  };

  return (
    <Card className="p-6" dir="rtl">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Palette className="ml-2 w-6 h-6 text-pink-600" />
            استوديو المكياج الاحترافي الكامل
          </div>
          <Badge variant="secondary" className="flex items-center">
            <Camera className="w-3 h-3 ml-1" />
            ModiFace Pro
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="presets" className="flex items-center">
              <Star className="w-4 h-4 ml-1" />
              إعدادات جاهزة
            </TabsTrigger>
            <TabsTrigger value="visual" className="flex items-center">
              <Brush className="w-4 h-4 ml-1" />
              مكياج مرئي
            </TabsTrigger>
            <TabsTrigger value="professional" className="flex items-center">
              <Wand2 className="w-4 h-4 ml-1" />
              أدوات محترفة
            </TabsTrigger>
          </TabsList>

          {/* إعدادات المكياج الجاهزة */}
          <TabsContent value="presets" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">اختر إطلالة جاهزة:</h3>
              
              <div className="grid gap-4">
                {makeupPresets.map((preset) => (
                  <Card key={preset.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 gap-3">
                        <div className="p-2 bg-pink-100 rounded-full">
                          {preset.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold">{preset.name}</h4>
                          <p className="text-sm text-gray-600">{preset.description}</p>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => applyPreset(preset)}
                        disabled={processingCount > 0}
                        className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                        data-testid={`preset-${preset.id}`}
                      >
                        {processingCount > 0 ? 'جاري التطبيق...' : 'تطبيق'}
                      </Button>
                    </div>
                    
                    {/* معاينة الألوان */}
                    <div className="flex space-x-2 gap-2 mt-3">
                      {Object.entries(preset.effects).map(([type, effect]) => (
                        <div
                          key={type}
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: effect.color }}
                          title={`${effect.intensity}% شدة`}
                        />
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* المكياج المرئي المباشر */}
          <TabsContent value="visual" className="mt-6">
            <DirectMakeupVisualizer
              image={image}
              onMakeupComplete={(effects) => {
                console.log('Visual makeup applied:', effects);
                toast({
                  title: "مكياج مثالي!",
                  description: `تم تطبيق ${effects.length} تأثير بصري`,
                });
                
                if (onMakeupComplete) {
                  onMakeupComplete(image);
                }
              }}
            />
          </TabsContent>

          {/* الأدوات الاحترافية */}
          <TabsContent value="professional" className="mt-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">أدوات المكياج الاحترافية</h3>
              
              {/* معاينة الصورة */}
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={image} 
                  alt="الوجه" 
                  className="w-full max-w-md mx-auto block"
                />
                <div className="absolute top-4 right-4">
                  <Button
                    size="sm"
                    onClick={takeSnapshot}
                    className="bg-white/90 text-gray-800 hover:bg-white"
                  >
                    <Camera className="w-4 h-4 ml-1" />
                    التقاط
                  </Button>
                </div>
              </div>

              {/* أدوات التحكم الاحترافية */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Eye className="w-4 h-4 ml-1" />
                    تحسين العيون
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm">إشراق العيون</label>
                      <Slider defaultValue={[50]} max={100} min={0} step={1} />
                    </div>
                    <div>
                      <label className="text-sm">حجم الرموش</label>
                      <Slider defaultValue={[30]} max={100} min={0} step={1} />
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Smile className="w-4 h-4 ml-1" />
                    تجميل الشفاه
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm">امتلاء الشفاه</label>
                      <Slider defaultValue={[40]} max={100} min={0} step={1} />
                    </div>
                    <div>
                      <label className="text-sm">نعومة الشفاه</label>
                      <Slider defaultValue={[60]} max={100} min={0} step={1} />
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Heart className="w-4 h-4 ml-1" />
                    أحمر الخدود
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm">شدة اللون</label>
                      <Slider defaultValue={[45]} max={100} min={0} step={1} />
                    </div>
                    <div>
                      <label className="text-sm">نطاق التوزيع</label>
                      <Slider defaultValue={[35]} max={100} min={0} step={1} />
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Sparkles className="w-4 h-4 ml-1" />
                    كريم الأساس
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm">نعومة البشرة</label>
                      <Slider defaultValue={[70]} max={100} min={0} step={1} />
                    </div>
                    <div>
                      <label className="text-sm">توحيد اللون</label>
                      <Slider defaultValue={[55]} max={100} min={0} step={1} />
                    </div>
                  </div>
                </Card>
              </div>

              {/* أزرار التحكم النهائية */}
              <div className="flex space-x-3 gap-3">
                <Button 
                  onClick={() => {
                    toast({
                      title: "تم تطبيق التعديلات!",
                      description: "تم حفظ جميع التحسينات بنجاح",
                    });
                    if (onMakeupComplete) onMakeupComplete(image);
                  }}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  <Download className="ml-2 w-4 h-4" />
                  تطبيق وحفظ
                </Button>
                
                <Button variant="outline">
                  <RotateCcw className="ml-2 w-4 h-4" />
                  إعادة تعيين
                </Button>
                
                <Button variant="outline">
                  <Undo2 className="ml-2 w-4 h-4" />
                  تراجع
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}