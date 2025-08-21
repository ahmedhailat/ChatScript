import { useState } from "react";
import { Bot, Crop, RotateCw, Palette, Download, Loader2, Layers, Sparkles, Clock, Sliders, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MakeupColors from "./makeup-colors";
import MedicalEffects from "./medical-effects";
import AgeProgression from "./age-progression";
import FacialAdjustments from "./facial-adjustments";
import RealTimeFilters from "./real-time-filters";

interface AIVisualizationProps {
  beforeImage: string | null;
  afterImage: string | null;
  isProcessing: boolean;
  onGeneratePreview: () => void;
}

interface EffectLayer {
  type: string;
  color?: string;
  intensity: number;
  visible: boolean;
}

export default function AIVisualization({ 
  beforeImage, 
  afterImage, 
  isProcessing, 
  onGeneratePreview 
}: AIVisualizationProps) {
  const [effectLayers, setEffectLayers] = useState<EffectLayer[]>([]);
  const [selectedTab, setSelectedTab] = useState("results");

  const handleMakeupColorChange = async (type: string, color: string, intensity: number) => {
    if (type === "reset") {
      setEffectLayers([]);
      return;
    }

    if (!beforeImage) return;

    try {
      // Convert base64 to blob for upload
      const response = await fetch(beforeImage);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('image', blob, 'photo.jpg');
      formData.append('makeupType', type);
      formData.append('color', color);
      formData.append('intensity', intensity.toString());

      const apiResponse = await fetch('/api/apply-makeup', {
        method: 'POST',
        body: formData,
      });

      const result = await apiResponse.json();
      if (result.success && result.makeupImageUrl) {
        // Update the after image with makeup applied
        onGeneratePreview(); // Trigger update with new makeup image
        
        const newLayer: EffectLayer = {
          type: `makeup_${type}`,
          color,
          intensity,
          visible: true
        };

        setEffectLayers(prev => {
          const filtered = prev.filter(layer => layer.type !== `makeup_${type}`);
          return [...filtered, newLayer];
        });
      }
    } catch (error) {
      console.error('Failed to apply makeup:', error);
    }
  };

  const handleMedicalEffectChange = (effect: string, intensity: number, duration: number) => {
    const newLayer: EffectLayer = {
      type: `medical_${effect}`,
      intensity,
      visible: true
    };

    setEffectLayers(prev => {
      const filtered = prev.filter(layer => layer.type !== `medical_${effect}`);
      return [...filtered, newLayer];
    });
  };

  const handleAgeChange = async (age: number) => {
    if (!beforeImage) return;

    try {
      // Convert base64 to blob for upload
      const response = await fetch(beforeImage);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('image', blob, 'photo.jpg');
      formData.append('targetAge', age.toString());

      const apiResponse = await fetch('/api/age-progression', {
        method: 'POST',
        body: formData,
      });

      const result = await apiResponse.json();
      if (result.success && result.agedImageUrl) {
        // Update the after image with age progression
        onGeneratePreview(); // Trigger update
        
        const newLayer: EffectLayer = {
          type: `age_progression`,
          intensity: age,
          visible: true
        };

        setEffectLayers(prev => {
          const filtered = prev.filter(layer => layer.type !== `age_progression`);
          return [...filtered, newLayer];
        });
      }
    } catch (error) {
      console.error('Failed to generate age progression:', error);
    }
  };

  const handleFacialAdjustments = (adjustments: any) => {
    const adjustmentLayers = Object.entries(adjustments)
      .filter(([_, value]) => value !== 50)
      .map(([key, value]) => ({
        type: `facial_${key}`,
        intensity: value as number,
        visible: true
      }));

    setEffectLayers(prev => {
      const filtered = prev.filter(layer => !layer.type.startsWith('facial_'));
      return [...filtered, ...adjustmentLayers];
    });
  };

  const handleFilterChange = (filters: any) => {
    const filterLayers = Object.entries(filters)
      .filter(([key, value]) => key !== 'selectedFilter' && value !== 50 && value !== 0)
      .map(([key, value]) => ({
        type: `filter_${key}`,
        intensity: value as number,
        visible: true
      }));

    setEffectLayers(prev => {
      const filtered = prev.filter(layer => !layer.type.startsWith('filter_'));
      return [...filtered, ...filterLayers];
    });
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center">
          <Bot className="text-ai-purple ml-3 w-5 h-5" />
          نتائج التصور بالذكاء الاصطناعي
        </h3>
        
        <Button 
          className="bg-ai-purple hover:bg-purple-700"
          onClick={onGeneratePreview}
          disabled={!beforeImage || isProcessing}
          data-testid="button-generate-prediction"
        >
          {isProcessing ? (
            <Loader2 className="ml-2 w-4 h-4 animate-spin" />
          ) : (
            <Bot className="mr-2 w-4 h-4" />
          )}
          {isProcessing ? 'جاري التوليد بالذكاء الاصطناعي...' : 'توليد توقع بالذكاء الاصطناعي'}
        </Button>
      </div>

      {/* Before/After Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Before Image */}
        <div className="space-y-3">
          <h4 className="font-medium text-slate-900 flex items-center">
            <span className="w-2 h-2 bg-slate-400 rounded-full ml-2"></span>
            قبل العملية
          </h4>
          <div className="aspect-square bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
            {beforeImage ? (
              <img 
                src={beforeImage} 
                alt="صورة المريض قبل العملية" 
                className="w-full h-full object-cover rounded-lg"
                data-testid="img-before-analysis"
              />
            ) : (
              <div className="text-center" data-testid="placeholder-before-image">
                <Bot className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">رفع الصورة</p>
                <p className="text-sm text-slate-500">أضف صورة المريض للبدء</p>
              </div>
            )}
          </div>
          <p className="text-sm text-slate-500">الصورة الأصلية للمريض</p>
        </div>

        {/* After Image */}
        <div className="space-y-3">
          <h4 className="font-medium text-slate-900 flex items-center">
            <span className="w-2 h-2 bg-medical-success rounded-full ml-2"></span>
            توقع الذكاء الاصطناعي
          </h4>
          <div className="aspect-square bg-gradient-to-br from-ai-purple/10 to-medical-blue/10 rounded-lg border-2 border-dashed border-ai-purple/30 flex items-center justify-center relative">
            {isProcessing ? (
              <div className="text-center" data-testid="ai-processing-indicator">
                <Loader2 className="w-8 h-8 text-ai-purple animate-spin mx-auto mb-3" />
                <p className="text-slate-600 font-medium">جاري المعالجة بالذكاء الاصطناعي...</p>
                <p className="text-sm text-slate-500">قد يستغرق 30-60 ثانية</p>
              </div>
            ) : afterImage ? (
              <img 
                src={afterImage} 
                alt="توقع الذكاء الاصطناعي" 
                className="w-full h-full object-cover rounded-lg"
                data-testid="img-after-prediction"
              />
            ) : (
              <div className="text-center" data-testid="placeholder-ai-prediction">
                <Bot className="w-12 h-12 text-ai-purple/50 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">معالجة الذكاء الاصطناعي</p>
                <p className="text-sm text-slate-500">ارفع صورة لرؤية التوقع</p>
              </div>
            )}
          </div>
          <p className="text-sm text-slate-500">النتيجة الجراحية المتوقعة</p>
        </div>
      </div>

      {/* Advanced Features Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-max min-w-full gap-2">
            <TabsTrigger value="results" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              النتائج
            </TabsTrigger>
            <TabsTrigger value="makeup" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              المكياج الافتراضي
            </TabsTrigger>
            <TabsTrigger value="adjustments" className="flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              التعديلات الجراحية
            </TabsTrigger>
            <TabsTrigger value="filters" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              الفلاتر المباشرة
            </TabsTrigger>
            <TabsTrigger value="medical" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              التأثيرات الطبية
            </TabsTrigger>
            <TabsTrigger value="age" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              تطور العمر
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="results" className="mt-6">
          <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-lg">
            <Bot className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-slate-900 mb-2">نتائج التصور</h4>
            <p className="text-slate-600">النتائج ستظهر هنا بعد معالجة الصورة</p>
          </div>
        </TabsContent>

        <TabsContent value="makeup" className="mt-6">
          <MakeupColors
            beforeImage={beforeImage}
            onColorChange={handleMakeupColorChange}
          />
        </TabsContent>

        <TabsContent value="adjustments" className="mt-6">
          <FacialAdjustments
            beforeImage={beforeImage}
            onAdjustmentChange={handleFacialAdjustments}
          />
        </TabsContent>

        <TabsContent value="filters" className="mt-6">
          <RealTimeFilters
            beforeImage={beforeImage}
            onFilterChange={handleFilterChange}
          />
        </TabsContent>

        <TabsContent value="medical" className="mt-6">
          <MedicalEffects
            beforeImage={beforeImage}
            onEffectChange={handleMedicalEffectChange}
          />
        </TabsContent>

        <TabsContent value="age" className="mt-6">
          <AgeProgression
            beforeImage={beforeImage}
            onAgeChange={handleAgeChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
