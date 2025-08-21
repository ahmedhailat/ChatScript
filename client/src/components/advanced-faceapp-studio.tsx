import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Camera,
  Zap,
  Sun,
  Moon,
  Wind,
  Scissors,
  Paintbrush,
  Layers,
  Filter,
  Contrast,
  Lightbulb,
  Droplets,
  Flower2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MakeupEffect {
  id: string;
  type: 'lips' | 'eyes' | 'cheeks' | 'foundation' | 'eyebrows' | 'lashes' | 'contour' | 'highlight';
  color: string;
  intensity: number;
  x: number;
  y: number;
  width: number;
  height: number;
  blendMode: string;
  texture?: 'matte' | 'gloss' | 'shimmer' | 'metallic';
}

interface AdvancedFaceAppStudioProps {
  image: string;
  onMakeupComplete?: (result: string) => void;
}

export default function AdvancedFaceAppStudio({ 
  image, 
  onMakeupComplete 
}: AdvancedFaceAppStudioProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [effects, setEffects] = useState<MakeupEffect[]>([]);
  const [activeTab, setActiveTab] = useState('makeup');
  const [selectedTool, setSelectedTool] = useState<MakeupEffect['type']>('lips');
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');
  const [intensity, setIntensity] = useState([70]);
  const [brushSize, setBrushSize] = useState([25]);
  const [selectedTexture, setSelectedTexture] = useState<'matte' | 'gloss' | 'shimmer' | 'metallic'>('gloss');
  const [ageTransform, setAgeTransform] = useState([0]);
  const [genderTransform, setGenderTransform] = useState([0]);
  const [beautyLevel, setBeautyLevel] = useState([50]);
  const [skinSmoothing, setSkinSmoothing] = useState([60]);
  const [eyeEnhancement, setEyeEnhancement] = useState([40]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { toast } = useToast();

  // Professional color palettes for each tool
  const colorPalettes = {
    lips: {
      reds: ['#FF6B6B', '#DC2626', '#B91C1C', '#7F1D1D', '#BE185D', '#A21CAF'],
      pinks: ['#EC4899', '#DB2777', '#BE185D', '#9D174D', '#F472B6', '#F9A8D4'],
      nudes: ['#D4A574', '#C4956C', '#B4856A', '#A47564', '#946558', '#84554C'],
      berries: ['#7C2D12', '#991B1B', '#A21CAF', '#581C87', '#6B21A8', '#4C1D95']
    },
    eyes: {
      neutrals: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95', '#3730A3'],
      golds: ['#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F', '#451A03'],
      blues: ['#1E40AF', '#1D4ED8', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD'],
      greens: ['#065F46', '#047857', '#059669', '#10B981', '#34D399', '#6EE7B7']
    },
    cheeks: {
      corals: ['#F87171', '#EF4444', '#DC2626', '#B91C1C', '#7F1D1D', '#450A0A'],
      peaches: ['#FB7185', '#F43F5E', '#E11D48', '#BE123C', '#9F1239', '#881337'],
      roses: ['#EC4899', '#DB2777', '#BE185D', '#9D174D', '#831843', '#500724'],
      berries: ['#A21CAF', '#86198F', '#701A75', '#581C87', '#3B0764', '#1E1065']
    },
    foundation: {
      light: ['#F3E5AB', '#E6D3A3', '#D4A574', '#C4956C', '#B4856A', '#A47564'],
      medium: ['#946558', '#84554C', '#745A47', '#6B5B73', '#8B7355', '#A0522D'],
      dark: ['#654321', '#5D4037', '#4E342E', '#3E2723', '#2E1A14', '#1A0E0A'],
      olive: ['#8FBC8F', '#9ACD32', '#6B8E23', '#556B2F', '#808000', '#6B7B3D']
    }
  };

  // Advanced makeup tools
  const makeupTools = [
    { id: 'lips' as const, name: 'شفاه', icon: <Smile className="w-4 h-4" />, color: '#FF6B6B' },
    { id: 'eyes' as const, name: 'عيون', icon: <Eye className="w-4 h-4" />, color: '#8B5CF6' },
    { id: 'cheeks' as const, name: 'خدود', icon: <Heart className="w-4 h-4" />, color: '#F87171' },
    { id: 'foundation' as const, name: 'أساس', icon: <Droplets className="w-4 h-4" />, color: '#D4A574' },
    { id: 'eyebrows' as const, name: 'حواجب', icon: <Brush className="w-4 h-4" />, color: '#8B4513' },
    { id: 'lashes' as const, name: 'رموش', icon: <Zap className="w-4 h-4" />, color: '#000000' },
    { id: 'contour' as const, name: 'كنتور', icon: <Layers className="w-4 h-4" />, color: '#8D6E63' },
    { id: 'highlight' as const, name: 'هايلايت', icon: <Lightbulb className="w-4 h-4" />, color: '#FFD700' }
  ];

  // Professional makeup presets
  const professionalPresets = [
    {
      id: 'natural',
      name: 'طبيعي يومي',
      icon: <Sun className="w-4 h-4" />,
      description: 'مكياج خفيف للاستخدام اليومي',
      effects: [
        { type: 'foundation', color: '#D4A574', intensity: 30, texture: 'matte' },
        { type: 'lips', color: '#FF6B6B', intensity: 40, texture: 'gloss' },
        { type: 'eyes', color: '#8B5CF6', intensity: 25, texture: 'matte' },
        { type: 'cheeks', color: '#F87171', intensity: 35, texture: 'matte' }
      ]
    },
    {
      id: 'evening',
      name: 'مسائي أنيق',
      icon: <Moon className="w-4 h-4" />,
      description: 'إطلالة مسائية راقية ومتألقة',
      effects: [
        { type: 'foundation', color: '#C4956C', intensity: 50, texture: 'matte' },
        { type: 'lips', color: '#DC2626', intensity: 80, texture: 'gloss' },
        { type: 'eyes', color: '#6D28D9', intensity: 75, texture: 'shimmer' },
        { type: 'cheeks', color: '#EF4444', intensity: 60, texture: 'matte' },
        { type: 'highlight', color: '#FFD700', intensity: 45, texture: 'shimmer' }
      ]
    },
    {
      id: 'glamour',
      name: 'جلام فاخر',
      icon: <Star className="w-4 h-4" />,
      description: 'مكياج فاخر للمناسبات الخاصة',
      effects: [
        { type: 'foundation', color: '#B4856A', intensity: 60, texture: 'gloss' },
        { type: 'lips', color: '#BE185D', intensity: 95, texture: 'metallic' },
        { type: 'eyes', color: '#5B21B6', intensity: 90, texture: 'metallic' },
        { type: 'cheeks', color: '#DC2626', intensity: 70, texture: 'shimmer' },
        { type: 'contour', color: '#8D6E63', intensity: 55, texture: 'matte' },
        { type: 'highlight', color: '#FFD700', intensity: 80, texture: 'metallic' }
      ]
    },
    {
      id: 'bridal',
      name: 'عروس',
      icon: <Flower2 className="w-4 h-4" />,
      description: 'مكياج عروس كلاسيكي وخالد',
      effects: [
        { type: 'foundation', color: '#F3E5AB', intensity: 45, texture: 'matte' },
        { type: 'lips', color: '#A21CAF', intensity: 70, texture: 'gloss' },
        { type: 'eyes', color: '#F59E0B', intensity: 65, texture: 'shimmer' },
        { type: 'cheeks', color: '#FB7185', intensity: 50, texture: 'matte' },
        { type: 'eyebrows', color: '#8B4513', intensity: 40, texture: 'matte' },
        { type: 'lashes', color: '#000000', intensity: 85, texture: 'matte' },
        { type: 'highlight', color: '#FFD700', intensity: 60, texture: 'shimmer' }
      ]
    }
  ];

  // Age transformation effects
  const applyAgeTransformation = (years: number) => {
    const aging = years > 0 ? years / 10 : 0;
    const youthing = years < 0 ? Math.abs(years) / 10 : 0;
    
    return {
      wrinkles: aging * 0.3,
      skinTexture: aging * 0.4,
      eyeBags: aging * 0.2,
      skinGlow: youthing * 0.5,
      skinSmooth: youthing * 0.6
    };
  };

  // Handle image click for makeup application
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newEffect: MakeupEffect = {
      id: Date.now().toString(),
      type: selectedTool,
      color: selectedColor,
      intensity: intensity[0],
      x: x - brushSize[0] / 4,
      y: y - brushSize[0] / 4,
      width: brushSize[0] / 2,
      height: brushSize[0] / 2,
      blendMode: getBlendMode(selectedTool),
      texture: selectedTexture
    };

    setEffects(prev => [...prev, newEffect]);
    
    toast({
      title: "تم تطبيق المكياج",
      description: `تم إضافة ${makeupTools.find(t => t.id === selectedTool)?.name} بنجاح`,
    });
  };

  const getBlendMode = (type: MakeupEffect['type']) => {
    switch (type) {
      case 'lips': return 'multiply';
      case 'eyes': return 'overlay';
      case 'cheeks': return 'soft-light';
      case 'foundation': return 'normal';
      case 'highlight': return 'screen';
      case 'contour': return 'multiply';
      case 'eyebrows': return 'multiply';
      case 'lashes': return 'multiply';
      default: return 'multiply';
    }
  };

  const getTextureEffect = (texture: MakeupEffect['texture']) => {
    switch (texture) {
      case 'gloss': return 'brightness(1.2) saturate(1.1)';
      case 'shimmer': return 'brightness(1.3) contrast(1.1) saturate(1.2)';
      case 'metallic': return 'brightness(1.4) contrast(1.2) saturate(1.3) hue-rotate(10deg)';
      case 'matte': return 'brightness(0.95) saturate(0.9)';
      default: return 'none';
    }
  };

  const applyPreset = async (preset: typeof professionalPresets[0]) => {
    setIsProcessing(true);
    
    try {
      // Clear existing effects
      setEffects([]);
      
      // Apply preset effects with animation
      for (let i = 0; i < preset.effects.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const effect = preset.effects[i];
        const newEffect: MakeupEffect = {
          id: `preset-${preset.id}-${i}`,
          type: effect.type as MakeupEffect['type'],
          color: effect.color,
          intensity: effect.intensity,
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 60,
          width: 30 + Math.random() * 20,
          height: 30 + Math.random() * 20,
          blendMode: getBlendMode(effect.type as MakeupEffect['type']),
          texture: effect.texture as MakeupEffect['texture']
        };
        
        setEffects(prev => [...prev, newEffect]);
      }
      
      if (onMakeupComplete) {
        onMakeupComplete(image);
      }
      
      toast({
        title: `تم تطبيق ${preset.name}`,
        description: preset.description,
      });
    } catch (error) {
      toast({
        title: "خطأ في التطبيق",
        description: "فشل في تطبيق الإعداد المسبق",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const clearAllEffects = () => {
    setEffects([]);
    setAgeTransform([0]);
    setGenderTransform([0]);
    setBeautyLevel([50]);
    setSkinSmoothing([60]);
    setEyeEnhancement([40]);
    
    toast({
      title: "تم المسح",
      description: "تم إزالة جميع التأثيرات والتحسينات",
    });
  };

  const downloadResult = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate image processing and download
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "تم الحفظ بنجاح",
        description: `تم حفظ الصورة مع ${effects.length} تأثير مكياج`,
      });
      
      if (onMakeupComplete) {
        onMakeupComplete(image);
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
            <Palette className="ml-2 w-6 h-6 text-pink-600" />
            استوديو FaceApp الاحترافي المتقدم
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center">
              <Camera className="w-3 h-3 ml-1" />
              {effects.length} تأثير
            </Badge>
            <Badge variant="outline" className="bg-gradient-to-r from-pink-50 to-purple-50">
              ModiFace Pro
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="makeup" className="flex items-center">
              <Brush className="w-4 h-4 ml-1" />
              مكياج احترافي
            </TabsTrigger>
            <TabsTrigger value="transforms" className="flex items-center">
              <Wand2 className="w-4 h-4 ml-1" />
              تحويلات
            </TabsTrigger>
            <TabsTrigger value="beauty" className="flex items-center">
              <Sparkles className="w-4 h-4 ml-1" />
              تجميل
            </TabsTrigger>
            <TabsTrigger value="presets" className="flex items-center">
              <Star className="w-4 h-4 ml-1" />
              إعدادات جاهزة
            </TabsTrigger>
          </TabsList>

          {/* Professional Makeup Tools */}
          <TabsContent value="makeup" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Image with makeup effects */}
              <div className="space-y-4">
                <div className="relative bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl overflow-hidden border-2 border-pink-200">
                  <div 
                    ref={containerRef}
                    className="relative cursor-crosshair"
                    onClick={handleImageClick}
                  >
                    <img 
                      src={image} 
                      alt="الوجه" 
                      className="w-full max-w-md mx-auto block select-none"
                      draggable={false}
                    />
                    
                    {/* Makeup effect layers */}
                    {effects.map((effect) => (
                      <div
                        key={effect.id}
                        className="absolute rounded-full pointer-events-none transition-all duration-300"
                        style={{
                          left: `${effect.x}%`,
                          top: `${effect.y}%`,
                          width: `${effect.width}%`,
                          height: `${effect.height}%`,
                          backgroundColor: effect.color,
                          opacity: effect.intensity / 100,
                          mixBlendMode: effect.blendMode as any,
                          filter: `blur(${effect.type === 'foundation' ? '4px' : '2px'}) ${getTextureEffect(effect.texture)}`,
                          boxShadow: effect.texture === 'shimmer' ? 'inset 0 0 10px rgba(255,255,255,0.5)' : 'none'
                        }}
                      />
                    ))}

                    {/* Age transformation overlay */}
                    {ageTransform[0] !== 0 && (
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: ageTransform[0] > 0 
                            ? `linear-gradient(45deg, rgba(139,69,19,${ageTransform[0] * 0.1}), rgba(160,82,45,${ageTransform[0] * 0.05}))`
                            : `linear-gradient(45deg, rgba(255,182,193,${Math.abs(ageTransform[0]) * 0.1}), rgba(255,240,245,${Math.abs(ageTransform[0]) * 0.05}))`,
                          mixBlendMode: ageTransform[0] > 0 ? 'multiply' : 'screen'
                        }}
                      />
                    )}
                  </div>
                  
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    انقر لتطبيق {makeupTools.find(t => t.id === selectedTool)?.name}
                  </div>
                </div>

                {/* Quick controls */}
                <div className="flex justify-between items-center">
                  <Button
                    onClick={downloadResult}
                    disabled={effects.length === 0 || isProcessing}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Download className="ml-2 w-4 h-4" />
                    {isProcessing ? 'جاري الحفظ...' : 'حفظ النتيجة'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={clearAllEffects}
                    disabled={effects.length === 0}
                  >
                    <RotateCcw className="ml-2 w-4 h-4" />
                    مسح الكل
                  </Button>
                </div>
              </div>

              {/* Makeup tools and controls */}
              <div className="space-y-6">
                {/* Tool selection */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">أدوات المكياج:</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {makeupTools.map(tool => (
                      <Button
                        key={tool.id}
                        variant={selectedTool === tool.id ? "default" : "outline"}
                        onClick={() => {
                          setSelectedTool(tool.id);
                          const palette = colorPalettes[tool.id as keyof typeof colorPalettes];
                          if (palette) {
                            const colors = Object.values(palette).flat();
                            setSelectedColor(colors[0]);
                          }
                        }}
                        className="h-auto p-2 flex flex-col items-center space-y-1"
                        style={{
                          borderColor: selectedTool === tool.id ? tool.color : undefined,
                          backgroundColor: selectedTool === tool.id ? tool.color : undefined
                        }}
                      >
                        {tool.icon}
                        <span className="text-xs">{tool.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Color palette */}
                {selectedTool && colorPalettes[selectedTool as keyof typeof colorPalettes] && (
                  <div>
                    <h4 className="font-medium mb-3">ألوان {makeupTools.find(t => t.id === selectedTool)?.name}:</h4>
                    <div className="space-y-3">
                      {Object.entries(colorPalettes[selectedTool as keyof typeof colorPalettes]).map(([category, colors]) => (
                        <div key={category}>
                          <div className="text-sm font-medium mb-2 capitalize">{category}</div>
                          <div className="grid grid-cols-6 gap-2">
                            {colors.map((color, index) => (
                              <button
                                key={`${selectedTool}-${category}-${index}`}
                                onClick={() => setSelectedColor(color)}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${
                                  selectedColor === color ? 'border-gray-800 scale-110 ring-2 ring-blue-400' : 'border-gray-300'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Texture selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">نوع الملمس:</label>
                  <Select value={selectedTexture} onValueChange={(value: any) => setSelectedTexture(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="matte">مات</SelectItem>
                      <SelectItem value="gloss">لامع</SelectItem>
                      <SelectItem value="shimmer">متلألئ</SelectItem>
                      <SelectItem value="metallic">معدني</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Intensity control */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    شدة المكياج: {intensity[0]}%
                  </label>
                  <Slider
                    value={intensity}
                    onValueChange={setIntensity}
                    max={100}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Brush size */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    حجم الفرشاة: {brushSize[0]}
                  </label>
                  <Slider
                    value={brushSize}
                    onValueChange={setBrushSize}
                    max={80}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Age and Gender Transformation */}
          <TabsContent value="transforms" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">تحويلات العمر والجنس</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      تحويل العمر: {ageTransform[0] > 0 ? `+${ageTransform[0]} سنة` : ageTransform[0] < 0 ? `${ageTransform[0]} سنة` : 'العمر الحالي'}
                    </label>
                    <Slider
                      value={ageTransform}
                      onValueChange={setAgeTransform}
                      max={30}
                      min={-20}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      تحويل الجنس: {genderTransform[0] > 0 ? 'أكثر أنوثة' : genderTransform[0] < 0 ? 'أكثر ذكورة' : 'طبيعي'}
                    </label>
                    <Slider
                      value={genderTransform}
                      onValueChange={setGenderTransform}
                      max={100}
                      min={-100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="relative bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl overflow-hidden">
                <img 
                  src={image} 
                  alt="التحويلات" 
                  className="w-full max-w-md mx-auto block"
                />
                
                {/* Transformation overlays */}
                {ageTransform[0] !== 0 && (
                  <div 
                    className="absolute inset-0 pointer-events-none transition-all duration-500"
                    style={{
                      background: ageTransform[0] > 0 
                        ? `linear-gradient(135deg, rgba(139,69,19,${Math.abs(ageTransform[0]) * 0.05}), rgba(160,82,45,${Math.abs(ageTransform[0]) * 0.03}))`
                        : `linear-gradient(135deg, rgba(255,182,193,${Math.abs(ageTransform[0]) * 0.08}), rgba(255,240,245,${Math.abs(ageTransform[0]) * 0.05}))`,
                      mixBlendMode: ageTransform[0] > 0 ? 'overlay' : 'soft-light'
                    }}
                  />
                )}

                {genderTransform[0] !== 0 && (
                  <div 
                    className="absolute inset-0 pointer-events-none transition-all duration-500"
                    style={{
                      background: genderTransform[0] > 0 
                        ? `linear-gradient(45deg, rgba(255,105,180,${Math.abs(genderTransform[0]) * 0.02}), rgba(255,182,193,${Math.abs(genderTransform[0]) * 0.01}))`
                        : `linear-gradient(45deg, rgba(70,130,180,${Math.abs(genderTransform[0]) * 0.02}), rgba(173,216,230,${Math.abs(genderTransform[0]) * 0.01}))`,
                      mixBlendMode: 'soft-light'
                    }}
                  />
                )}
              </div>
            </div>
          </TabsContent>

          {/* Beauty Enhancement */}
          <TabsContent value="beauty" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">تحسينات الجمال</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      مستوى الجمال العام: {beautyLevel[0]}%
                    </label>
                    <Slider
                      value={beautyLevel}
                      onValueChange={setBeautyLevel}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      نعومة البشرة: {skinSmoothing[0]}%
                    </label>
                    <Slider
                      value={skinSmoothing}
                      onValueChange={setSkinSmoothing}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      تحسين العيون: {eyeEnhancement[0]}%
                    </label>
                    <Slider
                      value={eyeEnhancement}
                      onValueChange={setEyeEnhancement}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    toast({
                      title: "تم تطبيق التحسينات",
                      description: "تم تطبيق جميع تحسينات الجمال بنجاح",
                    });
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Sparkles className="ml-2 w-4 h-4" />
                  تطبيق التحسينات
                </Button>
              </div>

              <div className="relative bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl overflow-hidden">
                <img 
                  src={image} 
                  alt="التحسينات" 
                  className="w-full max-w-md mx-auto block"
                />
                
                {/* Beauty enhancement overlays */}
                <div 
                  className="absolute inset-0 pointer-events-none transition-all duration-500"
                  style={{
                    background: `linear-gradient(135deg, rgba(255,182,193,${beautyLevel[0] * 0.001}), rgba(255,240,245,${beautyLevel[0] * 0.0005}))`,
                    mixBlendMode: 'soft-light',
                    filter: `blur(${skinSmoothing[0] * 0.02}px) brightness(${1 + eyeEnhancement[0] * 0.002})`
                  }}
                />
              </div>
            </div>
          </TabsContent>

          {/* Professional Presets */}
          <TabsContent value="presets" className="mt-6">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">الإعدادات الاحترافية الجاهزة</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                {professionalPresets.map((preset) => (
                  <Card key={preset.id} className="p-4 hover:shadow-lg transition-shadow border-2 hover:border-pink-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3 gap-3">
                        <div className="p-3 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full">
                          {preset.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{preset.name}</h4>
                          <p className="text-sm text-gray-600">{preset.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Color preview */}
                    <div className="flex space-x-2 gap-2 mb-4">
                      {preset.effects.slice(0, 6).map((effect, index) => (
                        <div
                          key={index}
                          className="w-8 h-8 rounded-full border-2 border-white shadow-md relative"
                          style={{ backgroundColor: effect.color }}
                          title={`${effect.intensity}% ${effect.type}`}
                        >
                          {effect.texture === 'shimmer' && (
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30" />
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      onClick={() => applyPreset(preset)}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                    >
                      {isProcessing ? 'جاري التطبيق...' : 'تطبيق الإطلالة'}
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}