import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Paintbrush, 
  Scissors, 
  Eye, 
  Palette, 
  Droplets, 
  Sparkles,
  Brush,
  CircleDot,
  Heart,
  Wand2,
  Eraser,
  Undo2,
  RotateCcw,
  Download,
  Share2
} from 'lucide-react';

interface InteractiveMakeupToolsProps {
  onToolSelect: (tool: string, config: any) => void;
  onApplyMakeup: (config: any) => void;
  isProcessing?: boolean;
}

export default function InteractiveMakeupTools({ 
  onToolSelect, 
  onApplyMakeup, 
  isProcessing = false 
}: InteractiveMakeupToolsProps) {
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState('#FF1744');
  const [brushSize, setBrushSize] = useState(15);
  const [intensity, setIntensity] = useState(70);

  const makeupTools = [
    { 
      id: 'brush', 
      name: 'فرشاة أساس', 
      icon: Paintbrush, 
      color: '#8B4513',
      makeupType: 'foundation'
    },
    { 
      id: 'lipstick', 
      name: 'أحمر شفاه', 
      icon: Heart, 
      color: '#FF1744',
      makeupType: 'lipstick'
    },
    { 
      id: 'eyeshadow', 
      name: 'ظلال عيون', 
      icon: Eye, 
      color: '#8D6E63',
      makeupType: 'eyeshadow'
    },
    { 
      id: 'blush', 
      name: 'أحمر خدود', 
      icon: CircleDot, 
      color: '#F8BBD9',
      makeupType: 'blush'
    },
    { 
      id: 'eyeliner', 
      name: 'كحل', 
      icon: Brush, 
      color: '#000000',
      makeupType: 'eyeliner'
    },
    { 
      id: 'mascara', 
      name: 'ماسكارا', 
      icon: Wand2, 
      color: '#2D2D2D',
      makeupType: 'mascara'
    },
    { 
      id: 'highlighter', 
      name: 'هايلايتر', 
      icon: Sparkles, 
      color: '#FFD700',
      makeupType: 'highlighter'
    },
    { 
      id: 'contour', 
      name: 'كونتور', 
      icon: Palette, 
      color: '#8B6914',
      makeupType: 'contour'
    }
  ];

  const utilityTools = [
    { id: 'scissors', name: 'مقص', icon: Scissors, color: '#6B7280' },
    { id: 'eraser', name: 'ممحاة', icon: Eraser, color: '#EF4444' },
    { id: 'undo', name: 'تراجع', icon: Undo2, color: '#3B82F6' },
    { id: 'reset', name: 'إعادة تعيين', icon: RotateCcw, color: '#F59E0B' }
  ];

  const colorPalette = [
    // ألوان أحمر الشفاه
    '#FF1744', '#E91E63', '#F06292', '#EC407A', '#AD1457',
    // ألوان ظلال العيون
    '#8D6E63', '#A1887F', '#BCAAA4', '#D7CCC8', '#5D4037',
    // ألوان أحمر الخدود
    '#F8BBD9', '#F48FB1', '#F06292', '#EC407A', '#E91E63',
    // ألوان الكحل والماسكارا
    '#000000', '#424242', '#616161', '#757575', '#2D2D2D',
    // ألوان هايلايتر
    '#FFD700', '#FFC107', '#FFEB3B', '#CDDC39', '#8BC34A',
    // ألوان كونتور
    '#8B6914', '#A0522D', '#CD853F', '#DEB887', '#F4A460'
  ];

  const handleToolSelect = (tool: any) => {
    setSelectedTool(tool.id);
    if (tool.makeupType) {
      setSelectedColor(tool.color);
      onToolSelect(tool.makeupType, {
        color: tool.color,
        intensity: intensity / 100,
        brushSize
      });
    }
  };

  const handleApplyMakeup = () => {
    const selectedMakeupTool = makeupTools.find(tool => tool.id === selectedTool);
    if (selectedMakeupTool?.makeupType) {
      onApplyMakeup({
        makeupType: selectedMakeupTool.makeupType,
        color: selectedColor,
        intensity,
        brushSize
      });
    }
  };

  return (
    <div className="w-full space-y-4 bg-gradient-to-b from-pink-50/50 to-purple-50/50 p-4 rounded-lg border border-pink-200">
      {/* عنوان الأدوات */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-purple-800 mb-2">
          🎨 أدوات المكياج التفاعلية
        </h3>
        <p className="text-sm text-gray-600">
          اختر أداة المكياج وابدأ التطبيق على الصورة
        </p>
      </div>

      {/* أدوات المكياج الرئيسية */}
      <Card className="border-pink-200">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">أدوات المكياج</h4>
          <div className="grid grid-cols-4 gap-3">
            {makeupTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Button
                  key={tool.id}
                  variant={selectedTool === tool.id ? "default" : "outline"}
                  size="sm"
                  className={`h-16 flex-col gap-1 relative ${
                    selectedTool === tool.id 
                      ? 'bg-purple-500 hover:bg-purple-600 text-white border-purple-600' 
                      : 'hover:bg-pink-50 hover:border-pink-300'
                  }`}
                  onClick={() => handleToolSelect(tool)}
                  data-testid={`tool-${tool.id}`}
                >
                  <Icon 
                    size={20} 
                    style={{ color: selectedTool === tool.id ? 'white' : tool.color }}
                  />
                  <span className="text-xs leading-tight">{tool.name}</span>
                  {selectedTool === tool.id && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 bg-pink-500">
                      ✓
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* لوحة الألوان */}
      {selectedTool && makeupTools.find(t => t.id === selectedTool)?.makeupType && (
        <Card className="border-pink-200">
          <CardContent className="p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">لوحة الألوان</h4>
            <div className="grid grid-cols-10 gap-2">
              {colorPalette.map((color, index) => (
                <button
                  key={index}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === color 
                      ? 'border-purple-600 scale-110 shadow-lg' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                  data-testid={`color-${color}`}
                />
              ))}
            </div>
            
            {/* لون مخصص */}
            <div className="mt-3 flex items-center gap-2">
              <label className="text-xs text-gray-600">لون مخصص:</label>
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-8 h-8 rounded border"
                data-testid="custom-color-picker"
              />
              <span className="text-xs text-gray-500">{selectedColor}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* إعدادات الأداة */}
      {selectedTool && makeupTools.find(t => t.id === selectedTool)?.makeupType && (
        <Card className="border-pink-200">
          <CardContent className="p-4 space-y-4">
            <h4 className="text-sm font-medium text-gray-700">إعدادات الأداة</h4>
            
            {/* حجم الفرشاة */}
            <div>
              <label className="text-xs text-gray-600 block mb-2">
                حجم الفرشاة: {brushSize}px
              </label>
              <Slider
                value={[brushSize]}
                onValueChange={(value) => setBrushSize(value[0])}
                max={50}
                min={5}
                step={5}
                className="w-full"
                data-testid="brush-size-slider"
              />
            </div>

            {/* شدة التأثير */}
            <div>
              <label className="text-xs text-gray-600 block mb-2">
                شدة التأثير: %{intensity}
              </label>
              <Slider
                value={[intensity]}
                onValueChange={(value) => setIntensity(value[0])}
                max={100}
                min={10}
                step={10}
                className="w-full"
                data-testid="intensity-slider"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* الأدوات المساعدة */}
      <Card className="border-pink-200">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">الأدوات المساعدة</h4>
          <div className="flex justify-center gap-2">
            {utilityTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Button
                  key={tool.id}
                  variant="outline"
                  size="sm"
                  className="h-12 px-3 hover:bg-gray-50"
                  data-testid={`utility-${tool.id}`}
                >
                  <Icon size={16} style={{ color: tool.color }} />
                  <span className="mr-1 text-xs">{tool.name}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* أزرار التحكم */}
      <div className="flex justify-center gap-3">
        <Button
          onClick={handleApplyMakeup}
          disabled={!selectedTool || isProcessing || !makeupTools.find(t => t.id === selectedTool)?.makeupType}
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          data-testid="apply-makeup-btn"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              جاري التطبيق...
            </>
          ) : (
            <>
              <Paintbrush className="ml-2" size={16} />
              تطبيق المكياج
            </>
          )}
        </Button>
        
        <Button variant="outline" size="sm" data-testid="download-btn">
          <Download className="ml-2" size={16} />
          تحميل
        </Button>
        
        <Button variant="outline" size="sm" data-testid="share-btn">
          <Share2 className="ml-2" size={16} />
          مشاركة
        </Button>
      </div>

      {/* معلومات الأداة المحددة */}
      {selectedTool && (
        <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-800">
            أداة محددة: <strong>{makeupTools.find(t => t.id === selectedTool)?.name}</strong>
          </p>
          <p className="text-xs text-gray-600 mt-1">
            اللون: {selectedColor} | الحجم: {brushSize}px | الشدة: %{intensity}
          </p>
        </div>
      )}
    </div>
  );
}