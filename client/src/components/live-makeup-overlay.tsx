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
  Wand2
} from "lucide-react";

interface MakeupArea {
  id: string;
  name: string;
  icon: React.ReactNode;
  defaultColor: string;
  bounds?: { x: number; y: number; width: number; height: number };
  intensity: number;
}

interface LiveMakeupOverlayProps {
  image: string;
  onMakeupApplied: (result: string) => void;
}

export default function LiveMakeupOverlay({ image, onMakeupApplied }: LiveMakeupOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  
  const [makeupAreas, setMakeupAreas] = useState<MakeupArea[]>([
    { id: 'lips', name: 'Lipstick', icon: <Smile className="w-4 h-4" />, defaultColor: '#FF6B6B', intensity: 50 },
    { id: 'eyes', name: 'Eyeshadow', icon: <Eye className="w-4 h-4" />, defaultColor: '#8B5CF6', intensity: 40 },
    { id: 'cheeks', name: 'Blush', icon: <Circle className="w-4 h-4" />, defaultColor: '#F87171', intensity: 30 },
    { id: 'foundation', name: 'Foundation', icon: <Paintbrush className="w-4 h-4" />, defaultColor: '#D4A574', intensity: 35 }
  ]);

  const [brushSize, setBrushSize] = useState([20]);
  const [brushIntensity, setBrushIntensity] = useState([50]);
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#8B5CF6', '#F87171', '#96CEB4',
    '#FFA726', '#EF5350', '#AB47BC', '#5C6BC0', '#26A69A', '#9CCC65'
  ];

  useEffect(() => {
    if (imageRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imageRef.current;
      
      if (ctx && img.complete) {
        canvas.width = img.clientWidth;
        canvas.height = img.clientHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [image]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedTool) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    startDrawing(x, y);
  }, [selectedTool]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedTool || !isApplying) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    drawMakeup(x, y);
  }, [selectedTool, isApplying]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsApplying(false);
  }, []);

  const startDrawing = (x: number, y: number) => {
    setIsApplying(true);
    drawMakeup(x, y);
  };

  const drawMakeup = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Parse color and apply with intensity
    const hexColor = selectedColor.replace('#', '');
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    const alpha = brushIntensity[0] / 100;
    
    ctx.globalAlpha = alpha;
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    
    // Apply makeup effect based on selected tool
    const blendMode = getMakeupBlendMode(selectedTool!);
    ctx.globalCompositeOperation = blendMode;
    
    // Draw circular brush stroke
    ctx.beginPath();
    ctx.arc(x, y, brushSize[0], 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  };

  const getMakeupBlendMode = (tool: string): GlobalCompositeOperation => {
    const blendModes = {
      'lips': 'multiply',
      'eyes': 'soft-light',
      'cheeks': 'soft-light',
      'foundation': 'overlay'
    };
    
    return blendModes[tool as keyof typeof blendModes] || 'source-over';
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const applyMakeupToImage = async () => {
    if (!canvasRef.current || !imageRef.current) return;
    
    // Create a new canvas to composite the image and makeup
    const compositeCanvas = document.createElement('canvas');
    const compositeCtx = compositeCanvas.getContext('2d');
    
    if (!compositeCtx) return;
    
    const img = imageRef.current;
    compositeCanvas.width = img.clientWidth;
    compositeCanvas.height = img.clientHeight;
    
    // Draw original image
    compositeCtx.drawImage(img, 0, 0, img.clientWidth, img.clientHeight);
    
    // Draw makeup overlay
    compositeCtx.drawImage(canvasRef.current, 0, 0);
    
    // Convert to blob and create URL
    compositeCanvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        onMakeupApplied(url);
      }
    }, 'image/jpeg', 0.9);
  };

  const quickApplyMakeup = async (makeupType: string) => {
    try {
      // Convert image to blob for API call
      const response = await fetch(image);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('image', blob, 'makeup-photo.jpg');
      formData.append('makeupType', makeupType);
      formData.append('color', selectedColor);
      formData.append('intensity', brushIntensity[0].toString());
      
      // Create a mock area for the entire face
      const mockArea = { x: 0, y: 0, width: 400, height: 400 };
      formData.append('area', JSON.stringify(mockArea));
      
      const apiResponse = await fetch('/api/apply-makeup', {
        method: 'POST',
        body: formData,
      });
      
      const result = await apiResponse.json();
      
      if (result.success && result.makeupImageUrl) {
        onMakeupApplied(result.makeupImageUrl);
      }
    } catch (error) {
      console.error('Error applying makeup:', error);
      // Fallback to manual application
      applyMakeupToImage();
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Palette className="mr-2 w-5 h-5 text-purple-600" />
        Live Makeup Application
      </h3>

      {/* Image with makeup overlay */}
      <div className="relative mb-6 bg-gray-100 rounded-lg overflow-hidden">
        <img 
          ref={imageRef}
          src={image} 
          alt="Face" 
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
          className="absolute inset-0"
          style={{ cursor: selectedTool ? 'crosshair' : 'default' }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        />
      </div>

      {/* Makeup tools */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {makeupAreas.map(area => (
          <Button
            key={area.id}
            variant={selectedTool === area.id ? "default" : "outline"}
            onClick={() => {
              setSelectedTool(selectedTool === area.id ? null : area.id);
              setSelectedColor(area.defaultColor);
            }}
            className="h-auto p-3 flex items-center space-x-2"
            style={{
              backgroundColor: selectedTool === area.id ? area.defaultColor : undefined,
              borderColor: selectedTool === area.id ? area.defaultColor : undefined
            }}
            data-testid={`button-makeup-${area.id}`}
          >
            {area.icon}
            <span className="text-sm">{area.name}</span>
          </Button>
        ))}
      </div>

      {/* Color palette */}
      <div className="mb-4">
        <label className="text-sm font-medium mb-2 block">Choose Color:</label>
        <div className="grid grid-cols-6 gap-2">
          {colors.map(color => (
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

      {/* Brush controls */}
      <div className="space-y-4 mb-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Brush Size: {brushSize[0]}px
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
        <div>
          <label className="text-sm font-medium mb-2 block">
            Intensity: {brushIntensity[0]}%
          </label>
          <Slider
            value={brushIntensity}
            onValueChange={setBrushIntensity}
            max={100}
            min={10}
            step={10}
            className="w-full"
          />
        </div>
      </div>

      {/* Quick apply buttons */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {makeupAreas.slice(0, 2).map(area => (
          <Button
            key={`quick-${area.id}`}
            variant="outline"
            onClick={() => quickApplyMakeup(area.id)}
            className="text-xs"
            data-testid={`button-quick-${area.id}`}
          >
            <Wand2 className="mr-1 w-3 h-3" />
            Quick {area.name}
          </Button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex space-x-3">
        <Button 
          onClick={applyMakeupToImage}
          disabled={!selectedTool}
          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          data-testid="button-apply-makeup"
        >
          <Palette className="mr-2 w-4 h-4" />
          Apply Makeup
        </Button>
        
        <Button 
          variant="outline" 
          onClick={clearCanvas}
          data-testid="button-clear-makeup"
        >
          <Undo2 className="mr-2 w-4 h-4" />
          Clear
        </Button>
      </div>

      {selectedTool && (
        <div className="mt-4 p-3 bg-pink-50 border border-pink-200 rounded-lg">
          <p className="text-sm text-pink-700">
            <strong>{makeupAreas.find(a => a.id === selectedTool)?.name}</strong> selected. 
            Click and drag on the image to apply makeup. Use the sliders to adjust brush size and intensity.
          </p>
        </div>
      )}
    </Card>
  );
}