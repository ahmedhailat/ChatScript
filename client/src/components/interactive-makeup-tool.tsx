import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  Paintbrush, 
  Eye, 
  Smile, 
  Circle,
  Undo2,
  Download,
  Wand2,
  Loader2,
  Pipette
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InteractiveMakeupToolProps {
  image: string;
  onMakeupApplied: (result: string) => void;
}

interface MakeupStroke {
  x: number;
  y: number;
  color: string;
  size: number;
  type: string;
  intensity: number;
}

export default function InteractiveMakeupTool({ 
  image, 
  onMakeupApplied 
}: InteractiveMakeupToolProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>('lipstick');
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');
  const [brushSize, setBrushSize] = useState([15]);
  const [intensity, setIntensity] = useState([60]);
  const [strokes, setStrokes] = useState<MakeupStroke[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [colorPickerMode, setColorPickerMode] = useState(false);
  
  const { toast } = useToast();

  const makeupTools = [
    { id: 'lipstick', name: 'أحمر الشفاه', icon: <Smile className="w-4 h-4" />, defaultColor: '#FF6B6B', blendMode: 'multiply' },
    { id: 'eyeshadow', name: 'ظلال العيون', icon: <Eye className="w-4 h-4" />, defaultColor: '#8B5CF6', blendMode: 'soft-light' },
    { id: 'blush', name: 'أحمر الخدود', icon: <Circle className="w-4 h-4" />, defaultColor: '#F87171', blendMode: 'soft-light' },
    { id: 'foundation', name: 'كريم الأساس', icon: <Paintbrush className="w-4 h-4" />, defaultColor: '#D4A574', blendMode: 'overlay' },
    { id: 'eyeliner', name: 'الكحل', icon: <Eye className="w-4 h-4" />, defaultColor: '#1F2937', blendMode: 'multiply' },
    { id: 'highlighter', name: 'الهايلايتر', icon: <Wand2 className="w-4 h-4" />, defaultColor: '#FDE68A', blendMode: 'lighten' }
  ];

  const colorPalette = [
    // أحمر الشفاه
    '#FF6B6B', '#DC2626', '#BE185D', '#7C2D12', '#991B1B', '#A21CAF',
    // ظلال العيون
    '#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95', '#3730A3',
    // أحمر الخدود
    '#F87171', '#EF4444', '#DC2626', '#F97316', '#EA580C', '#D97706',
    // كريم الأساس
    '#D4A574', '#C4956C', '#B4856A', '#A47564', '#946558', '#84554C',
    // ألوان إضافية
    '#FDE68A', '#FCD34D', '#F59E0B', '#D97706', '#92400E', '#78350F'
  ];

  useEffect(() => {
    if (imageRef.current && canvasRef.current && overlayCanvasRef.current) {
      const canvas = canvasRef.current;
      const overlayCanvas = overlayCanvasRef.current;
      const img = imageRef.current;
      
      if (img.complete) {
        // Set canvas dimensions to match image
        canvas.width = img.clientWidth;
        canvas.height = img.clientHeight;
        overlayCanvas.width = img.clientWidth;
        overlayCanvas.height = img.clientHeight;
        
        // Draw image on main canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      }
    }
  }, [image]);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (colorPickerMode) {
      pickColor(e);
      return;
    }
    
    setIsDrawing(true);
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    drawMakeup(x, y, true);
  }, [colorPickerMode, selectedTool, selectedColor, brushSize, intensity]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || colorPickerMode) return;
    
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    drawMakeup(x, y, false);
  }, [isDrawing, colorPickerMode, selectedTool, selectedColor, brushSize, intensity]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const drawMakeup = (x: number, y: number, isStart: boolean) => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas) return;
    
    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;
    
    // Parse color and apply with intensity
    const hexColor = selectedColor.replace('#', '');
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    const alpha = (intensity[0] / 100) * 0.8;
    
    // Set brush properties
    ctx.globalAlpha = alpha;
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    
    // Apply makeup effect based on selected tool
    const tool = makeupTools.find(t => t.id === selectedTool);
    if (tool) {
      ctx.globalCompositeOperation = tool.blendMode as GlobalCompositeOperation;
    }
    
    // Draw circular brush stroke with soft edges
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, brushSize[0]);
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
    gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, brushSize[0], 0, 2 * Math.PI);
    ctx.fill();
    
    // Reset composition mode
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    
    // Store stroke for later processing
    if (isStart) {
      const newStroke: MakeupStroke = {
        x, y, 
        color: selectedColor,
        size: brushSize[0],
        type: selectedTool,
        intensity: intensity[0]
      };
      setStrokes(prev => [...prev, newStroke]);
    }
    
    // Update the combined result immediately
    updateCombinedCanvas();
  };

  const updateCombinedCanvas = () => {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    const img = imageRef.current;
    
    if (!canvas || !overlayCanvas || !img) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear and redraw original image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Overlay the makeup
    ctx.drawImage(overlayCanvas, 0, 0);
  };

  const pickColor = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const imageData = ctx.getImageData(x, y, 1, 1);
    const [r, g, b] = imageData.data;
    
    const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    setSelectedColor(hexColor);
    setColorPickerMode(false);
    
    toast({
      title: "تم اختيار اللون",
      description: `تم اختيار اللون ${hexColor}`,
    });
  };

  const clearMakeup = () => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas) return;
    
    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    setStrokes([]);
    updateCombinedCanvas();
    
    toast({
      title: "تم مسح المكياج",
      description: "تم إزالة جميع تأثيرات المكياج",
    });
  };

  const saveMakeupResult = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsProcessing(true);
    
    try {
      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        // Create URL for the result
        const resultUrl = URL.createObjectURL(blob);
        onMakeupApplied(resultUrl);
        
        toast({
          title: "تم حفظ النتيجة",
          description: "تم تطبيق المكياج بنجاح",
        });
      }, 'image/jpeg', 0.9);
    } catch (error) {
      console.error('Error saving makeup result:', error);
      toast({
        title: "خطأ في الحفظ",
        description: "فشل في حفظ نتيجة المكياج",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const applyQuickMakeup = (makeupType: string) => {
    const tool = makeupTools.find(t => t.id === makeupType);
    if (!tool) return;
    
    setSelectedTool(makeupType);
    setSelectedColor(tool.defaultColor);
    
    toast({
      title: "تم اختيار الأداة",
      description: `تم اختيار ${tool.name}`,
    });
  };

  return (
    <Card className="p-6" dir="rtl">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Palette className="ml-2 w-5 h-5 text-purple-600" />
        أداة المكياج التفاعلية
      </h3>

      {/* صورة مع طبقة المكياج */}
      <div className="relative mb-6 bg-gray-100 rounded-lg overflow-hidden">
        <img 
          ref={imageRef}
          src={image} 
          alt="الوجه" 
          className="w-full max-w-md mx-auto block"
          style={{ display: 'none' }}
          onLoad={() => {
            const canvas = canvasRef.current;
            const overlayCanvas = overlayCanvasRef.current;
            const img = imageRef.current;
            if (canvas && overlayCanvas && img) {
              canvas.width = img.clientWidth;
              canvas.height = img.clientHeight;
              overlayCanvas.width = img.clientWidth;
              overlayCanvas.height = img.clientHeight;
              
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              }
            }
          }}
        />
        
        {/* الكانفاس الرئيسي */}
        <canvas
          ref={canvasRef}
          className="w-full max-w-md mx-auto block"
          style={{ 
            cursor: colorPickerMode ? 'crosshair' : selectedTool ? 'none' : 'default',
            border: '2px solid #e5e7eb',
            borderRadius: '8px'
          }}
        />
        
        {/* كانفاس طبقة المكياج */}
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 w-full max-w-md mx-auto"
          style={{ 
            cursor: colorPickerMode ? 'crosshair' : selectedTool ? 'none' : 'default',
            pointerEvents: 'auto'
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
        
        {/* مؤشر الفرشاة */}
        {selectedTool && !colorPickerMode && (
          <div 
            className="absolute pointer-events-none border-2 border-white rounded-full"
            style={{
              width: brushSize[0] * 2,
              height: brushSize[0] * 2,
              backgroundColor: selectedColor + '40',
              transform: 'translate(-50%, -50%)',
              zIndex: 10
            }}
          />
        )}
      </div>

      {/* أدوات المكياج */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {makeupTools.map(tool => (
          <Button
            key={tool.id}
            variant={selectedTool === tool.id ? "default" : "outline"}
            onClick={() => applyQuickMakeup(tool.id)}
            className="h-auto p-3 flex flex-col items-center space-y-1 text-xs"
            style={{
              backgroundColor: selectedTool === tool.id ? tool.defaultColor : undefined,
              borderColor: selectedTool === tool.id ? tool.defaultColor : undefined
            }}
            data-testid={`button-tool-${tool.id}`}
          >
            {tool.icon}
            <span>{tool.name}</span>
          </Button>
        ))}
      </div>

      {/* لوحة الألوان */}
      <div className="mb-4">
        <label className="text-sm font-medium mb-2 block">اختيار اللون:</label>
        <div className="grid grid-cols-6 gap-2 mb-3">
          {colorPalette.map(color => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-8 h-8 rounded-full border-2 ${
                selectedColor === color ? 'border-gray-800' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              data-testid={`color-${color}`}
            />
          ))}
        </div>
        
        {/* أداة اختيار اللون من الصورة */}
        <Button
          variant={colorPickerMode ? "default" : "outline"}
          onClick={() => setColorPickerMode(!colorPickerMode)}
          className="w-full mb-3"
          data-testid="button-color-picker"
        >
          <Pipette className="ml-2 w-4 h-4" />
          {colorPickerMode ? 'إلغاء اختيار اللون' : 'اختيار لون من الصورة'}
        </Button>
      </div>

      {/* تحكم في حجم الفرشاة */}
      <div className="mb-4">
        <label className="text-sm font-medium mb-2 block">
          حجم الفرشاة: {brushSize[0]}px
        </label>
        <Slider
          value={brushSize}
          onValueChange={setBrushSize}
          max={50}
          min={5}
          step={5}
          className="w-full"
        />
      </div>

      {/* تحكم في الشدة */}
      <div className="mb-4">
        <label className="text-sm font-medium mb-2 block">
          شدة التأثير: {intensity[0]}%
        </label>
        <Slider
          value={intensity}
          onValueChange={setIntensity}
          max={100}
          min={10}
          step={10}
          className="w-full"
        />
      </div>

      {/* أزرار التحكم */}
      <div className="flex space-x-3 gap-3">
        <Button 
          onClick={saveMakeupResult}
          disabled={strokes.length === 0 || isProcessing}
          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          data-testid="button-save-result"
        >
          {isProcessing ? (
            <Loader2 className="ml-2 w-4 h-4 animate-spin" />
          ) : (
            <Download className="ml-2 w-4 h-4" />
          )}
          {isProcessing ? 'جاري الحفظ...' : 'حفظ النتيجة'}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={clearMakeup}
          disabled={strokes.length === 0}
          data-testid="button-clear-makeup"
        >
          <Undo2 className="ml-2 w-4 h-4" />
          مسح
        </Button>
      </div>

      {/* رسالة تعليمية */}
      {selectedTool && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            {colorPickerMode ? (
              'اضغط على الصورة لاختيار لون من المنطقة المحددة'
            ) : (
              `تم اختيار ${makeupTools.find(t => t.id === selectedTool)?.name}. اضغط واسحب على الصورة لتطبيق المكياج.`
            )}
          </p>
        </div>
      )}
    </Card>
  );
}