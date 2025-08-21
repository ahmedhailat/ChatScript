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
          <TabsList className="inline-flex w-max min-w-full">
            <TabsTrigger value="results" data-testid="tab-results">
              <Bot className="mr-2 w-4 h-4" />
              AI Results
            </TabsTrigger>
            <TabsTrigger value="makeup" data-testid="tab-makeup">
              <Palette className="mr-2 w-4 h-4" />
              Virtual Makeup
            </TabsTrigger>
            <TabsTrigger value="filters" data-testid="tab-filters">
              <Filter className="mr-2 w-4 h-4" />
              Filters
            </TabsTrigger>
            <TabsTrigger value="adjustments" data-testid="tab-adjustments">
              <Sliders className="mr-2 w-4 h-4" />
              Face Adjust
            </TabsTrigger>
            <TabsTrigger value="medical" data-testid="tab-medical">
              <Sparkles className="mr-2 w-4 h-4" />
              Medical Effects
            </TabsTrigger>
            <TabsTrigger value="aging" data-testid="tab-aging">
              <Clock className="mr-2 w-4 h-4" />
              Age Progression
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="results" className="mt-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <h5 className="font-medium text-slate-900 mb-3">Analysis Tools</h5>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                size="sm"
                disabled={!beforeImage}
                data-testid="button-crop"
              >
                <Crop className="mr-2 w-4 h-4" />
                Crop
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={!beforeImage}
                data-testid="button-rotate"
              >
                <RotateCw className="mr-2 w-4 h-4" />
                Rotate
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={!beforeImage}
                data-testid="button-enhance"
              >
                <Palette className="mr-2 w-4 h-4" />
                Enhance
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={!afterImage}
                data-testid="button-export"
              >
                <Download className="mr-2 w-4 h-4" />
                Export
              </Button>
            </div>

            {/* Effect Layers Display */}
            {effectLayers.length > 0 && (
              <div className="mt-4">
                <h6 className="font-medium text-slate-700 mb-2 flex items-center">
                  <Layers className="mr-2 w-4 h-4" />
                  Active Effects ({effectLayers.length})
                </h6>
                <div className="space-y-2">
                  {effectLayers.map((layer, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-white rounded border text-sm"
                    >
                      <span className="font-medium capitalize">
                        {layer.type.replace('_', ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        {layer.color && (
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: layer.color }}
                          />
                        )}
                        <span className="text-slate-600">{layer.intensity}%</span>
                        <button
                          onClick={() => setEffectLayers(prev => 
                            prev.map((l, i) => i === index ? { ...l, visible: !l.visible } : l)
                          )}
                          className={`w-3 h-3 rounded ${layer.visible ? 'bg-green-500' : 'bg-slate-300'}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="makeup" className="mt-4">
          <MakeupColors 
            onColorChange={handleMakeupColorChange}
            disabled={!beforeImage || isProcessing}
          />
        </TabsContent>

        <TabsContent value="filters" className="mt-4">
          <RealTimeFilters
            onFilterChange={handleFilterChange}
            disabled={!beforeImage || isProcessing}
          />
        </TabsContent>

        <TabsContent value="adjustments" className="mt-4">
          <FacialAdjustments
            onAdjustmentChange={handleFacialAdjustments}
            disabled={!beforeImage || isProcessing}
          />
        </TabsContent>

        <TabsContent value="medical" className="mt-4">
          <MedicalEffects
            onEffectChange={handleMedicalEffectChange}
            disabled={!beforeImage || isProcessing}
          />
        </TabsContent>

        <TabsContent value="aging" className="mt-4">
          <AgeProgression
            onAgeChange={handleAgeChange}
            disabled={!beforeImage || isProcessing}
            currentAge={25}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
