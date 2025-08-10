import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  MousePointer2, 
  Eye, 
  Smile, 
  Circle,
  Square,
  Undo2,
  Check,
  Wand2,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MakeupArea {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bounds?: { x: number; y: number; width: number; height: number };
  makeupColor?: string;
  intensity?: number;
}

interface AreaMakeupToolProps {
  image: string;
  onMakeupApplied: (result: string) => void;
}

export default function AreaMakeupTool({ 
  image, 
  onMakeupApplied 
}: AreaMakeupToolProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [currentSelection, setCurrentSelection] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');
  const [intensity, setIntensity] = useState([60]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [areas, setAreas] = useState<MakeupArea[]>([
    { id: 'lips', name: 'الشفاه', icon: <Smile className="w-4 h-4" />, color: '#FF6B6B' },
    { id: 'eyes', name: 'العيون', icon: <Eye className="w-4 h-4" />, color: '#8B5CF6' },
    { id: 'cheeks', name: 'الخدود', icon: <Circle className="w-4 h-4" />, color: '#F87171' },
    { id: 'forehead', name: 'الجبهة', icon: <Square className="w-4 h-4" />, color: '#96CEB4' }
  ]);

  const { toast } = useToast();

  const makeupColors = [
    '#FF6B6B', '#DC2626', '#BE185D', '#7C2D12', '#991B1B', '#A21CAF',
    '#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95', '#3730A3',
    '#F87171', '#EF4444', '#DC2626', '#F97316', '#EA580C', '#D97706',
    '#D4A574', '#C4956C', '#B4856A', '#A47564', '#946558', '#84554C'
  ];

  useEffect(() => {
    if (imageRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const img = imageRef.current;
      
      if (img.complete) {
        canvas.width = img.clientWidth;
        canvas.height = img.clientHeight;
        canvas.style.width = img.clientWidth + 'px';
        canvas.style.height = img.clientHeight + 'px';
      }
    }
  }, [image]);

  const startSelection = (areaId: string) => {
    setSelectedArea(areaId);
    setIsSelecting(true);
    setCurrentSelection(null);
    
    // Set default color for the area
    const area = areas.find(a => a.id === areaId);
    if (area) {
      setSelectedColor(area.color);
    }
    
    toast({
      title: "حدد المنطقة",
      description: `اضغط واسحب لتحديد منطقة ${areas.find(a => a.id === areaId)?.name}`,
    });
  };

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelecting || !selectedArea) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setSelectionStart({ x, y });
  }, [isSelecting, selectedArea]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelecting || !selectedArea || !selectionStart) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const selection = {
      x: Math.min(selectionStart.x, currentX),
      y: Math.min(selectionStart.y, currentY),
      width: Math.abs(currentX - selectionStart.x),
      height: Math.abs(currentY - selectionStart.y)
    };
    
    setCurrentSelection(selection);
    drawSelection(selection);
  }, [isSelecting, selectedArea, selectionStart]);

  const handleMouseUp = useCallback(() => {
    if (!isSelecting || !selectedArea || !currentSelection) return;
    
    // Save the selection for the current area
    setAreas(prev => prev.map(area => 
      area.id === selectedArea 
        ? { 
            ...area, 
            bounds: currentSelection,
            makeupColor: selectedColor,
            intensity: intensity[0]
          }
        : area
    ));
    
    setIsSelecting(false);
    setSelectedArea(null);
    setSelectionStart(null);
    setCurrentSelection(null);
    
    toast({
      title: "تم تحديد المنطقة",
      description: "يمكنك الآن تطبيق المكياج على هذه المنطقة",
    });
  }, [isSelecting, selectedArea, currentSelection, selectedColor, intensity]);

  const drawSelection = (selection: { x: number; y: number; width: number; height: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear previous selection
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw existing area selections
    areas.forEach(area => {
      if (area.bounds && area.id !== selectedArea) {
        ctx.strokeStyle = area.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(area.bounds.x, area.bounds.y, area.bounds.width, area.bounds.height);
        
        ctx.fillStyle = area.color + '20';
        ctx.fillRect(area.bounds.x, area.bounds.y, area.bounds.width, area.bounds.height);
      }
    });
    
    // Draw current selection
    const area = areas.find(a => a.id === selectedArea);
    if (area) {
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = 3;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(selection.x, selection.y, selection.width, selection.height);
      
      ctx.fillStyle = selectedColor + '30';
      ctx.fillRect(selection.x, selection.y, selection.width, selection.height);
    }
  };

  const clearSelections = () => {
    setAreas(prev => prev.map(area => ({ 
      ...area, 
      bounds: undefined, 
      makeupColor: undefined, 
      intensity: undefined 
    })));
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    
    toast({
      title: "تم مسح التحديدات",
      description: "تم إزالة جميع تحديدات المناطق",
    });
  };

  const applyAreaMakeup = async () => {
    const selectedAreas = areas.filter(area => area.bounds && area.makeupColor);
    
    if (selectedAreas.length === 0) {
      toast({
        title: "لا توجد مناطق محددة",
        description: "يرجى تحديد منطقة واحدة على الأقل وتطبيق المكياج عليها",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Convert image to blob for API call
      const response = await fetch(image);
      const blob = await response.blob();
      
      // Prepare makeup effects for each selected area
      const makeupEffects = selectedAreas.map(area => ({
        type: getMakeupTypeFromArea(area.id),
        color: area.makeupColor!,
        intensity: area.intensity || 60,
        area: area.bounds!
      }));
      
      const formData = new FormData();
      formData.append('image', blob, 'area-makeup.jpg');
      formData.append('effects', JSON.stringify(makeupEffects));
      
      const apiResponse = await fetch('/api/apply-multiple-makeup', {
        method: 'POST',
        body: formData,
      });
      
      const result = await apiResponse.json();
      
      if (result.success && result.makeupImageUrl) {
        onMakeupApplied(result.makeupImageUrl);
        toast({
          title: "تم تطبيق المكياج!",
          description: `تم تطبيق المكياج على ${selectedAreas.length} منطقة بنجاح`,
        });
      } else {
        throw new Error(result.error || 'فشل في تطبيق المكياج');
      }
    } catch (error) {
      console.error('Error applying area makeup:', error);
      toast({
        title: "خطأ في التطبيق",
        description: "فشل في تطبيق المكياج على المناطق المحددة",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getMakeupTypeFromArea = (areaId: string): string => {
    const mapping = {
      'lips': 'lipstick',
      'eyes': 'eyeshadow', 
      'cheeks': 'blush',
      'forehead': 'foundation'
    };
    return mapping[areaId as keyof typeof mapping] || 'foundation';
  };

  return (
    <Card className="p-6" dir="rtl">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <MousePointer2 className="ml-2 w-5 h-5 text-purple-600" />
        تطبيق المكياج على مناطق محددة
      </h3>

      {/* صورة مع تحديد المناطق */}
      <div className="relative mb-6 bg-gray-100 rounded-lg overflow-hidden">
        <img 
          ref={imageRef}
          src={image} 
          alt="الوجه" 
          className="w-full max-w-md mx-auto block"
          onLoad={() => {
            const canvas = canvasRef.current;
            const img = imageRef.current;
            if (canvas && img) {
              canvas.width = img.clientWidth;
              canvas.height = img.clientHeight;
              canvas.style.width = img.clientWidth + 'px';
              canvas.style.height = img.clientHeight + 'px';
            }
          }}
        />
        
        <canvas
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ 
            display: isSelecting ? 'block' : 'none',
            pointerEvents: isSelecting ? 'auto' : 'none' 
          }}
        />
        
        {/* عرض المناطق المحددة */}
        {!isSelecting && areas.map(area => area.bounds && (
          <div
            key={area.id}
            className="absolute border-2 border-dashed bg-opacity-20"
            style={{
              left: area.bounds.x,
              top: area.bounds.y,
              width: area.bounds.width,
              height: area.bounds.height,
              borderColor: area.makeupColor || area.color,
              backgroundColor: area.makeupColor || area.color
            }}
          >
            <Badge 
              className="absolute -top-6 left-0 text-xs"
              style={{ backgroundColor: area.makeupColor || area.color }}
            >
              {area.name}
            </Badge>
          </div>
        ))}
      </div>

      {/* أزرار اختيار المناطق */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {areas.map(area => (
          <Button
            key={area.id}
            variant={selectedArea === area.id ? "default" : "outline"}
            onClick={() => startSelection(area.id)}
            disabled={isSelecting && selectedArea !== area.id}
            className="h-auto p-3 flex flex-col items-center space-y-2"
            style={{
              borderColor: selectedArea === area.id ? area.color : undefined,
              backgroundColor: selectedArea === area.id ? area.color : undefined
            }}
            data-testid={`button-select-${area.id}`}
          >
            {area.icon}
            <span className="text-sm">{area.name}</span>
            {area.bounds && <Check className="w-3 h-3" />}
          </Button>
        ))}
      </div>

      {/* اختيار لون المكياج */}
      <div className="mb-4">
        <label className="text-sm font-medium mb-2 block">لون المكياج:</label>
        <div className="grid grid-cols-6 gap-2">
          {makeupColors.map(color => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-8 h-8 rounded-full border-2 ${
                selectedColor === color ? 'border-gray-800' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* تحكم في الشدة */}
      <div className="mb-4">
        <label className="text-sm font-medium mb-2 block">
          شدة المكياج: {intensity[0]}%
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
          onClick={applyAreaMakeup}
          disabled={!areas.some(area => area.bounds) || isProcessing}
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          data-testid="button-apply-area-makeup"
        >
          {isProcessing ? (
            <Loader2 className="ml-2 w-4 h-4 animate-spin" />
          ) : (
            <Wand2 className="ml-2 w-4 h-4" />
          )}
          {isProcessing ? 'جاري التطبيق...' : 'تطبيق المكياج'}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={clearSelections}
          data-testid="button-clear-selections"
        >
          <Undo2 className="ml-2 w-4 h-4" />
          مسح
        </Button>
      </div>

      {isSelecting && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            اضغط واسحب على الصورة لتحديد منطقة <strong>{areas.find(a => a.id === selectedArea)?.name}</strong>.
          </p>
        </div>
      )}
    </Card>
  );
}