import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, 
  Brush, 
  Pipette, 
  Circle, 
  Square, 
  Triangle,
  Eye,
  Droplets,
  Sparkles,
  Settings,
  RefreshCw,
  Target,
  Layers,
  Move3D
} from 'lucide-react';

interface ProfessionalToolsPaletteProps {
  selectedTool: string;
  onToolSelect: (tool: string) => void;
  selectedColor: string;
  onColorSelect: (color: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  intensity: number;
  onIntensityChange: (intensity: number) => void;
}

export default function ProfessionalToolsPalette({
  selectedTool,
  onToolSelect,
  selectedColor,
  onColorSelect,
  brushSize,
  onBrushSizeChange,
  intensity,
  onIntensityChange
}: ProfessionalToolsPaletteProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const colorPickerRef = useRef<HTMLInputElement>(null);

  const makeupTools = [
    { id: 'lipstick', name: 'أحمر الشفاه', icon: Circle, color: '#E91E63' },
    { id: 'eyeshadow', name: 'ظلال العيون', icon: Eye, color: '#9C27B0' },
    { id: 'foundation', name: 'كريم الأساس', icon: Square, color: '#FFCC80' },
    { id: 'blush', name: 'أحمر الخدود', icon: Circle, color: '#FF5722' },
    { id: 'contour', name: 'كونتور', icon: Triangle, color: '#795548' },
    { id: 'highlighter', name: 'هايلايتر', icon: Sparkles, color: '#FFD700' },
    { id: 'eyeliner', name: 'كحل العيون', icon: Move3D, color: '#000000' },
    { id: 'mascara', name: 'الماسكارا', icon: Brush, color: '#212121' },
    { id: 'brows', name: 'رسم الحواجب', icon: Move3D, color: '#5D4037' },
    { id: 'lipliner', name: 'محدد الشفاه', icon: Circle, color: '#8E24AA' }
  ];

  const professionalColors = [
    // Lipstick colors
    '#E91E63', '#D81B60', '#C2185B', '#AD1457', '#880E4F',
    '#F06292', '#EC407A', '#E57373', '#EF5350', '#F44336',
    
    // Eyeshadow colors
    '#9C27B0', '#8E24AA', '#7B1FA2', '#6A1B9A', '#4A148C',
    '#BA68C8', '#AB47BC', '#9575CD', '#7986CB', '#5C6BC0',
    
    // Foundation shades
    '#FFCC80', '#FFB74D', '#FFA726', '#FF9800', '#FB8C00',
    '#F57C00', '#EF6C00', '#E65100', '#D84315', '#BF360C',
    
    // Blush colors
    '#FF5722', '#FF7043', '#FF8A65', '#FFAB91', '#FFCCBC',
    '#F8BBD9', '#F48FB1', '#F06292', '#EC407A', '#E91E63',
    
    // Contour shades
    '#795548', '#8D6E63', '#A1887F', '#BCAAA4', '#D7CCC8',
    '#6D4C41', '#5D4037', '#4E342E', '#3E2723', '#1B0000',
    
    // Special effects
    '#FFD700', '#FFC107', '#FFEB3B', '#CDDC39', '#8BC34A',
    '#4CAF50', '#009688', '#00BCD4', '#03A9F4', '#2196F3'
  ];

  const brushSizes = [
    { size: 5, name: 'دقيق جداً' },
    { size: 10, name: 'دقيق' },
    { size: 20, name: 'متوسط' },
    { size: 30, name: 'كبير' },
    { size: 50, name: 'كبير جداً' }
  ];

  const blendModes = [
    { id: 'normal', name: 'عادي' },
    { id: 'multiply', name: 'ضرب' },
    { id: 'overlay', name: 'تداخل' },
    { id: 'soft-light', name: 'إضاءة ناعمة' },
    { id: 'hard-light', name: 'إضاءة قوية' }
  ];

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            أدوات احترافية
          </div>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        <Tabs defaultValue="tools" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tools">أدوات</TabsTrigger>
            <TabsTrigger value="colors">ألوان</TabsTrigger>
            <TabsTrigger value="settings">إعدادات</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tools" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {makeupTools.map((tool) => {
                const IconComponent = tool.icon;
                return (
                  <Button
                    key={tool.id}
                    variant={selectedTool === tool.id ? "default" : "outline"}
                    className={`p-3 h-auto flex flex-col gap-1 ${
                      selectedTool === tool.id 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                        : ''
                    }`}
                    onClick={() => onToolSelect(tool.id)}
                  >
                    <IconComponent className="w-5 h-5" style={{ color: tool.color }} />
                    <span className="text-xs">{tool.name}</span>
                  </Button>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="colors" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">اللون المحدد</h4>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
                    style={{ backgroundColor: selectedColor }}
                    onClick={() => colorPickerRef.current?.click()}
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => colorPickerRef.current?.click()}
                  >
                    <Pipette className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <input
                ref={colorPickerRef}
                type="color"
                value={selectedColor}
                onChange={(e) => onColorSelect(e.target.value)}
                className="hidden"
              />
              
              <div className="grid grid-cols-8 gap-1">
                {professionalColors.map((color, index) => (
                  <button
                    key={index}
                    className={`w-6 h-6 rounded border-2 ${
                      selectedColor === color 
                        ? 'border-black border-2' 
                        : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => onColorSelect(color)}
                  />
                ))}
              </div>
              
              <div className="text-center">
                <Badge variant="outline" className="font-mono text-xs">
                  {selectedColor}
                </Badge>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              {/* Brush Size */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">حجم الفرشاة</span>
                  <Badge>{brushSize}px</Badge>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={brushSize}
                  onChange={(e) => onBrushSizeChange(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex gap-1">
                  {brushSizes.map((brush) => (
                    <Button
                      key={brush.size}
                      size="sm"
                      variant={brushSize === brush.size ? "default" : "outline"}
                      onClick={() => onBrushSizeChange(brush.size)}
                      className="text-xs px-2"
                    >
                      {brush.size}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Intensity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">الشدة</span>
                  <Badge>{intensity}%</Badge>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={intensity}
                  onChange={(e) => onIntensityChange(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              {showAdvanced && (
                <>
                  {/* Blend Mode */}
                  <div className="space-y-2">
                    <span className="text-sm font-medium">وضع المزج</span>
                    <div className="grid grid-cols-2 gap-1">
                      {blendModes.map((mode) => (
                        <Button
                          key={mode.id}
                          size="sm"
                          variant="outline"
                          className="text-xs"
                        >
                          {mode.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Precision Controls */}
                  <div className="space-y-2">
                    <span className="text-sm font-medium">دقة التطبيق</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Target className="w-4 h-4 mr-1" />
                        دقيق
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Layers className="w-4 h-4 mr-1" />
                        متدرج
                      </Button>
                    </div>
                  </div>
                </>
              )}
              
              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  إعادة تعيين
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Droplets className="w-4 h-4 mr-1" />
                  مزج
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Current Tool Info */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm">الأداة النشطة</h4>
              <p className="text-xs text-gray-600">
                {makeupTools.find(t => t.id === selectedTool)?.name || 'غير محدد'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-600">الشدة: {intensity}%</div>
              <div className="text-xs text-gray-600">الحجم: {brushSize}px</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}