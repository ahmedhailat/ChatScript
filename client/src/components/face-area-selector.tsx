import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  MousePointer2, 
  RotateCcw, 
  Eye, 
  Circle, 
  Smile,
  Square,
  Check,
  Settings
} from "lucide-react";

interface FaceArea {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bounds?: { x: number; y: number; width: number; height: number };
}

interface FaceAreaSelectorProps {
  image: string;
  onAreasSelected: (areas: Record<string, any>) => void;
  selectedProcedure: string;
}

export default function FaceAreaSelector({ 
  image, 
  onAreasSelected, 
  selectedProcedure 
}: FaceAreaSelectorProps) {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [areas, setAreas] = useState<FaceArea[]>([
    { id: 'nose', name: 'Nose', icon: <Circle className="w-4 h-4" />, color: '#FF6B6B' },
    { id: 'lips', name: 'Lips', icon: <Smile className="w-4 h-4" />, color: '#4ECDC4' },
    { id: 'teeth', name: 'Teeth', icon: <Square className="w-3 h-3" />, color: '#45B7D1' },
    { id: 'chin', name: 'Chin/Jaw', icon: <MousePointer2 className="w-4 h-4" />, color: '#96CEB4' }
  ]);
  
  const [adjustments, setAdjustments] = useState({
    noseWidth: [0],
    noseLength: [0], 
    lipSize: [0],
    teethWhitening: [50],
    teethStraightening: [50],
    chinShape: [0]
  });

  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [currentSelection, setCurrentSelection] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const startSelection = (area: string) => {
    setSelectedArea(area);
    setIsSelecting(true);
    setCurrentSelection(null);
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
        ? { ...area, bounds: currentSelection }
        : area
    ));
    
    setIsSelecting(false);
    setSelectedArea(null);
    setSelectionStart(null);
    setCurrentSelection(null);
  }, [isSelecting, selectedArea, currentSelection]);

  const drawSelection = (selection: { x: number; y: number; width: number; height: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear previous selection
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw current selection
    const area = areas.find(a => a.id === selectedArea);
    if (area) {
      ctx.strokeStyle = area.color;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(selection.x, selection.y, selection.width, selection.height);
      
      ctx.fillStyle = area.color + '20';
      ctx.fillRect(selection.x, selection.y, selection.width, selection.height);
    }
  };

  const clearSelections = () => {
    setAreas(prev => prev.map(area => ({ ...area, bounds: undefined })));
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const generatePreview = () => {
    const selectedAreas = areas.reduce((acc, area) => {
      if (area.bounds) {
        acc[area.id] = area.bounds;
      }
      return acc;
    }, {} as Record<string, any>);
    
    onAreasSelected({
      areas: selectedAreas,
      adjustments: {
        noseWidth: adjustments.noseWidth[0],
        noseLength: adjustments.noseLength[0],
        lipSize: adjustments.lipSize[0],
        teethWhitening: adjustments.teethWhitening[0],
        teethStraightening: adjustments.teethStraightening[0],
        chinShape: adjustments.chinShape[0]
      }
    });
  };

  const getProcedureAreas = () => {
    switch (selectedProcedure) {
      case 'rhinoplasty':
        return areas.filter(a => a.id === 'nose');
      case 'dental':
        return areas.filter(a => ['teeth', 'lips'].includes(a.id));
      case 'facelift':
        return areas.filter(a => ['nose', 'lips', 'chin'].includes(a.id));
      default:
        return areas;
    }
  };

  const relevantAreas = getProcedureAreas();

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <MousePointer2 className="mr-2 w-5 h-5 text-purple-600" />
        Select Face Areas for {selectedProcedure}
      </h3>

      {/* Image with selection overlay */}
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
          className="absolute inset-0 cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ 
            display: isSelecting ? 'block' : 'none',
            pointerEvents: isSelecting ? 'auto' : 'none' 
          }}
        />
        
        {/* Show existing selections */}
        {!isSelecting && relevantAreas.map(area => area.bounds && (
          <div
            key={area.id}
            className="absolute border-2 border-dashed bg-opacity-20"
            style={{
              left: area.bounds.x,
              top: area.bounds.y,
              width: area.bounds.width,
              height: area.bounds.height,
              borderColor: area.color,
              backgroundColor: area.color
            }}
          >
            <Badge 
              className="absolute -top-6 left-0 text-xs"
              style={{ backgroundColor: area.color }}
            >
              {area.name}
            </Badge>
          </div>
        ))}
      </div>

      {/* Area selection buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {relevantAreas.map(area => (
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

      {/* Adjustment controls */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium flex items-center">
          <Settings className="mr-2 w-4 h-4" />
          Surgical Adjustments
        </h4>
        
        {selectedProcedure === 'rhinoplasty' && (
          <>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Nose Width: {adjustments.noseWidth[0] > 0 ? 'Wider' : adjustments.noseWidth[0] < 0 ? 'Narrower' : 'Natural'} ({adjustments.noseWidth[0]})
              </label>
              <Slider
                value={adjustments.noseWidth}
                onValueChange={(value) => setAdjustments(prev => ({ ...prev, noseWidth: value }))}
                max={50}
                min={-50}
                step={5}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Nose Length: {adjustments.noseLength[0] > 0 ? 'Longer' : adjustments.noseLength[0] < 0 ? 'Shorter' : 'Natural'} ({adjustments.noseLength[0]})
              </label>
              <Slider
                value={adjustments.noseLength}
                onValueChange={(value) => setAdjustments(prev => ({ ...prev, noseLength: value }))}
                max={50}
                min={-50}
                step={5}
                className="w-full"
              />
            </div>
          </>
        )}
        
        {(selectedProcedure === 'dental' || selectedProcedure === 'facelift') && (
          <>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Teeth Whitening: {adjustments.teethWhitening[0]}%
              </label>
              <Slider
                value={adjustments.teethWhitening}
                onValueChange={(value) => setAdjustments(prev => ({ ...prev, teethWhitening: value }))}
                max={100}
                min={0}
                step={10}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Teeth Straightening: {adjustments.teethStraightening[0]}%
              </label>
              <Slider
                value={adjustments.teethStraightening}
                onValueChange={(value) => setAdjustments(prev => ({ ...prev, teethStraightening: value }))}
                max={100}
                min={0}
                step={10}
                className="w-full"
              />
            </div>
          </>
        )}

        {selectedProcedure === 'facelift' && (
          <>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Lip Size: {adjustments.lipSize[0] > 0 ? 'Fuller' : adjustments.lipSize[0] < 0 ? 'Thinner' : 'Natural'} ({adjustments.lipSize[0]})
              </label>
              <Slider
                value={adjustments.lipSize}
                onValueChange={(value) => setAdjustments(prev => ({ ...prev, lipSize: value }))}
                max={30}
                min={-30}
                step={5}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Chin Shape: {adjustments.chinShape[0] > 0 ? 'Stronger' : adjustments.chinShape[0] < 0 ? 'Softer' : 'Natural'} ({adjustments.chinShape[0]})
              </label>
              <Slider
                value={adjustments.chinShape}
                onValueChange={(value) => setAdjustments(prev => ({ ...prev, chinShape: value }))}
                max={30}
                min={-30}
                step={5}
                className="w-full"
              />
            </div>
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex space-x-3">
        <Button 
          onClick={generatePreview}
          disabled={!relevantAreas.some(area => area.bounds)}
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          data-testid="button-generate-preview"
        >
          <Eye className="mr-2 w-4 h-4" />
          Generate Preview
        </Button>
        
        <Button 
          variant="outline" 
          onClick={clearSelections}
          data-testid="button-clear-selections"
        >
          <RotateCcw className="mr-2 w-4 h-4" />
          Clear
        </Button>
      </div>

      {isSelecting && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            Click and drag on the image to select the <strong>{areas.find(a => a.id === selectedArea)?.name}</strong> area.
          </p>
        </div>
      )}
    </Card>
  );
}