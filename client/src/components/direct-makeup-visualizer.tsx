import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  Eye, 
  Smile, 
  Circle,
  Sparkles,
  Undo2,
  Download,
  Wand2,
  Brush,
  Heart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MakeupEffect {
  id: string;
  type: 'lips' | 'eyes' | 'cheeks' | 'foundation';
  color: string;
  intensity: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DirectMakeupVisualizerProps {
  image: string;
  onMakeupComplete?: (effects: MakeupEffect[]) => void;
}

export default function DirectMakeupVisualizer({ 
  image, 
  onMakeupComplete 
}: DirectMakeupVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [effects, setEffects] = useState<MakeupEffect[]>([]);
  const [selectedTool, setSelectedTool] = useState<'lips' | 'eyes' | 'cheeks' | 'foundation'>('lips');
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');
  const [intensity, setIntensity] = useState([70]);
  const [brushSize, setBrushSize] = useState([25]);

  const { toast } = useToast();

  const makeupColors = {
    lips: ['#FF6B6B', '#DC2626', '#BE185D', '#7C2D12', '#991B1B', '#A21CAF', '#8B5CF6', '#F97316'],
    eyes: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95', '#3730A3', '#1E40AF', '#065F46'],
    cheeks: ['#F87171', '#EF4444', '#DC2626', '#F97316', '#EA580C', '#D97706', '#FB7185', '#EC4899'],
    foundation: ['#D4A574', '#C4956C', '#B4856A', '#A47564', '#946558', '#84554C', '#F3E5AB', '#E6D3A3']
  };

  const tools = [
    { id: 'lips' as const, name: 'أحمر شفاه', icon: <Smile className="w-4 h-4" />, color: '#FF6B6B' },
    { id: 'eyes' as const, name: 'ظلال عيون', icon: <Eye className="w-4 h-4" />, color: '#8B5CF6' },
    { id: 'cheeks' as const, name: 'أحمر خدود', icon: <Heart className="w-4 h-4" />, color: '#F87171' },
    { id: 'foundation' as const, name: 'كريم أساس', icon: <Circle className="w-4 h-4" />, color: '#D4A574' }
  ];

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
      height: brushSize[0] / 2
    };

    setEffects(prev => [...prev, newEffect]);
    
    toast({
      title: "تم تطبيق المكياج!",
      description: `تم إضافة ${tools.find(t => t.id === selectedTool)?.name} بنجاح`,
    });
  };

  const clearEffects = () => {
    setEffects([]);
    toast({
      title: "تم المسح",
      description: "تم إزالة جميع تأثيرات المكياج",
    });
  };

  const downloadResult = () => {
    // This would normally generate a final image with effects
    if (onMakeupComplete) {
      onMakeupComplete(effects);
    }
    
    toast({
      title: "نتيجة رائعة!",
      description: `تم حفظ ${effects.length} تأثير مكياج`,
    });
  };

  const getBlendMode = (type: string) => {
    switch (type) {
      case 'lips': return 'multiply';
      case 'eyes': return 'overlay';
      case 'cheeks': return 'soft-light';
      case 'foundation': return 'normal';
      default: return 'multiply';
    }
  };

  return (
    <Card className="p-6" dir="rtl">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center text-lg">
          <Palette className="ml-2 w-5 h-5 text-pink-600" />
          استوديو المكياج المباشر
          <Badge variant="secondary" className="mr-2">
            {effects.length} تأثير
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-0">
        {/* صورة مع تأثيرات المكياج المباشرة */}
        <div className="relative mb-6 bg-gray-100 rounded-lg overflow-hidden">
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
            
            {/* طبقات المكياج المرئية */}
            {effects.map((effect) => (
              <div
                key={effect.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: `${effect.x}%`,
                  top: `${effect.y}%`,
                  width: `${effect.width}%`,
                  height: `${effect.height}%`,
                  backgroundColor: effect.color,
                  opacity: effect.intensity / 100,
                  mixBlendMode: getBlendMode(effect.type) as any,
                  filter: `blur(${effect.type === 'foundation' ? '3px' : '1px'})`,
                  transition: 'all 0.3s ease'
                }}
              />
            ))}

            {/* مؤشر الفرشاة */}
            <div 
              className="absolute pointer-events-none border-2 border-white rounded-full"
              style={{
                width: `${brushSize[0] / 2}%`,
                height: `${brushSize[0] / 2}%`,
                backgroundColor: selectedColor,
                opacity: 0.5,
                transform: 'translate(-50%, -50%)',
                display: 'none'
              }}
            />
          </div>
        </div>

        {/* أدوات المكياج */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {tools.map(tool => (
            <Button
              key={tool.id}
              variant={selectedTool === tool.id ? "default" : "outline"}
              onClick={() => {
                setSelectedTool(tool.id);
                setSelectedColor(makeupColors[tool.id][0]);
              }}
              className="h-auto p-3 flex flex-col items-center space-y-1"
              style={{
                borderColor: selectedTool === tool.id ? tool.color : undefined,
                backgroundColor: selectedTool === tool.id ? tool.color : undefined
              }}
              data-testid={`tool-${tool.id}`}
            >
              {tool.icon}
              <span className="text-xs">{tool.name}</span>
            </Button>
          ))}
        </div>

        {/* ألوان المكياج */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">
            ألوان {tools.find(t => t.id === selectedTool)?.name}:
          </label>
          <div className="grid grid-cols-8 gap-2">
            {makeupColors[selectedTool].map((color, index) => (
              <button
                key={`${selectedTool}-color-${index}`}
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  selectedColor === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                data-testid={`color-${selectedTool}-${index}`}
              />
            ))}
          </div>
        </div>

        {/* التحكم في الشدة */}
        <div className="mb-4">
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
            data-testid="slider-intensity"
          />
        </div>

        {/* حجم الفرشاة */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">
            حجم الفرشاة: {brushSize[0]}
          </label>
          <Slider
            value={brushSize}
            onValueChange={setBrushSize}
            max={60}
            min={10}
            step={5}
            className="w-full"
            data-testid="slider-brush-size"
          />
        </div>

        {/* أزرار التحكم */}
        <div className="flex space-x-3 gap-3">
          <Button 
            onClick={downloadResult}
            disabled={effects.length === 0}
            className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
            data-testid="button-download-result"
          >
            <Download className="ml-2 w-4 h-4" />
            حفظ النتيجة ({effects.length})
          </Button>
          
          <Button 
            variant="outline" 
            onClick={clearEffects}
            disabled={effects.length === 0}
            data-testid="button-clear-makeup"
          >
            <Undo2 className="ml-2 w-4 h-4" />
            مسح الكل
          </Button>
        </div>

        {/* معلومات المساعدة */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 text-center">
            <Sparkles className="inline w-4 h-4 ml-1" />
            انقر على الصورة لتطبيق {tools.find(t => t.id === selectedTool)?.name} مباشرة!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}