import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from "@/components/ui/badge";
import { 
  Brush, 
  Palette, 
  Scissors, 
  Paintbrush,
  Wand2,
  Eye,
  Smile,
  Heart,
  Droplets,
  Sparkles,
  Circle,
  Square,
  Triangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InteractiveMakeupToolsProps {
  image: string;
  onToolUsed?: (tool: string, settings: any) => void;
}

export default function InteractiveMakeupTools({ 
  image, 
  onToolUsed 
}: InteractiveMakeupToolsProps) {
  const [selectedTool, setSelectedTool] = useState('brush');
  const [brushSize, setBrushSize] = useState([15]);
  const [intensity, setIntensity] = useState([60]);
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');
  const [isApplying, setIsApplying] = useState(false);

  const { toast } = useToast();

  const tools = [
    { 
      id: 'brush', 
      name: 'فرشاة', 
      icon: <Brush className="w-5 h-5" />, 
      color: '#8B5CF6',
      description: 'فرشاة مكياج ناعمة للتطبيق الدقيق'
    },
    { 
      id: 'palette', 
      name: 'لوحة ألوان', 
      icon: <Palette className="w-5 h-5" />, 
      color: '#F59E0B',
      description: 'اختيار من مجموعة ألوان احترافية'
    },
    { 
      id: 'scissors', 
      name: 'أداة قص', 
      icon: <Scissors className="w-5 h-5" />, 
      color: '#EF4444',
      description: 'قص وتحديد المناطق بدقة'
    },
    { 
      id: 'paintbrush', 
      name: 'فرشاة رسم', 
      icon: <Paintbrush className="w-5 h-5" />, 
      color: '#10B981',
      description: 'رسم تفاصيل دقيقة ومعقدة'
    },
    { 
      id: 'wand', 
      name: 'عصا سحرية', 
      icon: <Wand2 className="w-5 h-5" />, 
      color: '#8B5CF6',
      description: 'تطبيق تأثيرات فورية ومبهرة'
    },
    { 
      id: 'blender', 
      name: 'أداة مزج', 
      icon: <Circle className="w-5 h-5" />, 
      color: '#F97316',
      description: 'مزج الألوان والتدرجات بطبيعية'
    }
  ];

  const makeupCategories = [
    { 
      id: 'lips', 
      name: 'الشفاه', 
      icon: <Smile className="w-4 h-4" />, 
      colors: ['#FF6B6B', '#DC2626', '#BE185D', '#A21CAF', '#EC4899', '#F472B6', '#FB7185', '#F87171']
    },
    { 
      id: 'eyes', 
      name: 'العيون', 
      icon: <Eye className="w-4 h-4" />, 
      colors: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95', '#3730A3', '#1E40AF', '#1D4ED8']
    },
    { 
      id: 'cheeks', 
      name: 'الخدود', 
      icon: <Heart className="w-4 h-4" />, 
      colors: ['#F87171', '#EF4444', '#DC2626', '#F97316', '#EA580C', '#D97706', '#FB7185', '#EC4899']
    },
    { 
      id: 'foundation', 
      name: 'كريم الأساس', 
      icon: <Droplets className="w-4 h-4" />, 
      colors: ['#F3E5AB', '#E6D3A3', '#D4A574', '#C4956C', '#B4856A', '#A47564', '#946558', '#84554C']
    }
  ];

  const applyTool = async () => {
    setIsApplying(true);
    
    try {
      const settings = {
        tool: selectedTool,
        brushSize: brushSize[0],
        intensity: intensity[0],
        color: selectedColor
      };
      
      // Simulate tool application
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onToolUsed) {
        onToolUsed(selectedTool, settings);
      }
      
      const tool = tools.find(t => t.id === selectedTool);
      toast({
        title: "تم تطبيق الأداة",
        description: `تم استخدام ${tool?.name} بنجاح`,
      });
    } catch (error) {
      toast({
        title: "خطأ في التطبيق",
        description: "فشل في تطبيق الأداة",
        variant: "destructive"
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Card className="p-6" dir="rtl">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Sparkles className="ml-2 w-6 h-6 text-purple-600" />
            أدوات المكياج التفاعلية
          </div>
          <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100">
            Professional Tools
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-0">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Tools panel */}
          <div className="space-y-6">
            {/* Tool selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4">اختر أداتك:</h3>
              <div className="grid grid-cols-2 gap-3">
                {tools.map(tool => (
                  <Button
                    key={tool.id}
                    variant={selectedTool === tool.id ? "default" : "outline"}
                    onClick={() => setSelectedTool(tool.id)}
                    className="h-auto p-4 flex flex-col items-center space-y-2 relative"
                    style={{
                      borderColor: selectedTool === tool.id ? tool.color : undefined,
                      backgroundColor: selectedTool === tool.id ? tool.color : undefined
                    }}
                  >
                    {tool.icon}
                    <span className="text-sm font-medium">{tool.name}</span>
                    {selectedTool === tool.id && (
                      <Badge className="absolute -top-2 -right-2 bg-green-500">
                        <Sparkles className="w-3 h-3" />
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
              
              {selectedTool && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {tools.find(t => t.id === selectedTool)?.description}
                  </p>
                </div>
              )}
            </div>

            {/* Color palette for makeup categories */}
            <div>
              <h4 className="font-semibold mb-3">فئات المكياج والألوان:</h4>
              <div className="space-y-4">
                {makeupCategories.map(category => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center space-x-2 gap-2">
                      {category.icon}
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <div className="grid grid-cols-8 gap-2">
                      {category.colors.map((color, index) => (
                        <button
                          key={`${category.id}-${index}`}
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

            {/* Tool controls */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  حجم الأداة: {brushSize[0]}px
                </label>
                <Slider
                  value={brushSize}
                  onValueChange={setBrushSize}
                  max={50}
                  min={5}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  قوة التأثير: {intensity[0]}%
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
            </div>

            {/* Apply button */}
            <Button 
              onClick={applyTool}
              disabled={isApplying}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3"
            >
              {isApplying ? (
                <>
                  <Sparkles className="ml-2 w-4 h-4 animate-spin" />
                  جاري التطبيق...
                </>
              ) : (
                <>
                  <Wand2 className="ml-2 w-4 h-4" />
                  تطبيق الأداة
                </>
              )}
            </Button>
          </div>

          {/* Image preview with tools */}
          <div className="space-y-4">
            <div className="relative bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl overflow-hidden">
              <img 
                src={image} 
                alt="معاينة المكياج" 
                className="w-full max-w-md mx-auto block"
              />
              
              {/* Tool overlay indicator */}
              <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                {tools.find(t => t.id === selectedTool)?.name}
              </div>
              
              {/* Color indicator */}
              <div className="absolute bottom-4 left-4 flex items-center space-x-2 gap-2">
                <div 
                  className="w-8 h-8 rounded-full border-2 border-white shadow-lg"
                  style={{ backgroundColor: selectedColor }}
                />
                <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                  اللون المختار
                </div>
              </div>
            </div>

            {/* Quick tips */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">نصائح سريعة:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• استخدم الفرشاة الناعمة للتطبيق الطبيعي</li>
                <li>• اختر الألوان المناسبة لدرجة بشرتك</li>
                <li>• ابدأ بشدة منخفضة ثم زد تدريجياً</li>
                <li>• استخدم أداة المزج لتوزيع الألوان</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}