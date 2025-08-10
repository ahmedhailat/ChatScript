import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Palette, 
  Eye, 
  Smile,
  Circle,
  Paintbrush,
  Wand2,
  Loader2,
  Download,
  RotateCcw,
  Plus,
  Minus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MakeupEffect {
  type: 'lipstick' | 'eyeshadow' | 'blush' | 'foundation' | 'eyeliner' | 'mascara';
  color: string;
  intensity: number;
  area: { x: number; y: number; width: number; height: number };
  name: string;
}

interface EnhancedMakeupStudioProps {
  image: string;
  onMakeupApplied: (result: string) => void;
}

export default function EnhancedMakeupStudio({ 
  image, 
  onMakeupApplied 
}: EnhancedMakeupStudioProps) {
  const [activeEffects, setActiveEffects] = useState<MakeupEffect[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMakeupType, setSelectedMakeupType] = useState<MakeupEffect['type']>('lipstick');
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');
  const [intensity, setIntensity] = useState([60]);
  const { toast } = useToast();

  const makeupTypes = [
    { 
      id: 'lipstick' as const, 
      name: 'Lipstick', 
      icon: <Smile className="w-4 h-4" />, 
      defaultColor: '#FF6B6B',
      defaultArea: { x: 50, y: 60, width: 80, height: 25 }
    },
    { 
      id: 'eyeshadow' as const, 
      name: 'Eyeshadow', 
      icon: <Eye className="w-4 h-4" />, 
      defaultColor: '#8B5CF6',
      defaultArea: { x: 40, y: 35, width: 90, height: 20 }
    },
    { 
      id: 'blush' as const, 
      name: 'Blush', 
      icon: <Circle className="w-4 h-4" />, 
      defaultColor: '#F87171',
      defaultArea: { x: 25, y: 45, width: 35, height: 30 }
    },
    { 
      id: 'foundation' as const, 
      name: 'Foundation', 
      icon: <Paintbrush className="w-4 h-4" />, 
      defaultColor: '#D4A574',
      defaultArea: { x: 10, y: 20, width: 80, height: 70 }
    },
    { 
      id: 'eyeliner' as const, 
      name: 'Eyeliner', 
      icon: <Minus className="w-4 h-4" />, 
      defaultColor: '#1F2937',
      defaultArea: { x: 35, y: 40, width: 30, height: 3 }
    },
    { 
      id: 'mascara' as const, 
      name: 'Mascara', 
      icon: <Eye className="w-4 h-4" />, 
      defaultColor: '#111827',
      defaultArea: { x: 35, y: 35, width: 30, height: 15 }
    }
  ];

  const colorPalettes = {
    lipstick: ['#FF6B6B', '#DC2626', '#BE185D', '#C2410C', '#7C2D12', '#991B1B'],
    eyeshadow: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95', '#3730A3'],
    blush: ['#F87171', '#EF4444', '#DC2626', '#F97316', '#EA580C', '#D97706'],
    foundation: ['#D4A574', '#C4956C', '#B4856A', '#A47564', '#946558', '#84554C'],
    eyeliner: ['#1F2937', '#374151', '#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB'],
    mascara: ['#111827', '#1F2937', '#374151', '#4B5563', '#6B7280', '#9CA3AF']
  };

  const addMakeupEffect = () => {
    const makeupType = makeupTypes.find(t => t.id === selectedMakeupType);
    if (!makeupType) return;

    const newEffect: MakeupEffect = {
      type: selectedMakeupType,
      color: selectedColor,
      intensity: intensity[0],
      area: makeupType.defaultArea,
      name: `${makeupType.name} ${activeEffects.length + 1}`
    };

    setActiveEffects([...activeEffects, newEffect]);
    
    toast({
      title: "Effect Added",
      description: `${makeupType.name} effect added to your look`,
    });
  };

  const removeEffect = (index: number) => {
    setActiveEffects(activeEffects.filter((_, i) => i !== index));
  };

  const updateEffect = (index: number, updates: Partial<MakeupEffect>) => {
    setActiveEffects(activeEffects.map((effect, i) => 
      i === index ? { ...effect, ...updates } : effect
    ));
  };

  const applyAllEffects = async () => {
    if (activeEffects.length === 0) {
      toast({
        title: "No Effects",
        description: "Please add some makeup effects first",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Convert image to blob for API call
      const response = await fetch(image);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('image', blob, 'makeup-photo.jpg');
      formData.append('effects', JSON.stringify(activeEffects));
      
      const apiResponse = await fetch('/api/apply-multiple-makeup', {
        method: 'POST',
        body: formData,
      });
      
      const result = await apiResponse.json();
      
      if (result.success && result.makeupImageUrl) {
        onMakeupApplied(result.makeupImageUrl);
        toast({
          title: "Makeup Applied!",
          description: `Applied ${activeEffects.length} makeup effects successfully`,
        });
      } else {
        throw new Error(result.error || 'Failed to apply makeup');
      }
    } catch (error) {
      console.error('Error applying makeup:', error);
      toast({
        title: "Application Failed",
        description: "Failed to apply makeup effects",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const clearAllEffects = () => {
    setActiveEffects([]);
    toast({
      title: "Effects Cleared",
      description: "All makeup effects have been removed",
    });
  };

  const applyPresetLook = (lookName: string) => {
    let presetEffects: MakeupEffect[] = [];
    
    switch (lookName) {
      case 'natural':
        presetEffects = [
          { type: 'foundation', color: '#D4A574', intensity: 30, area: { x: 10, y: 20, width: 80, height: 70 }, name: 'Natural Foundation' },
          { type: 'blush', color: '#F87171', intensity: 25, area: { x: 25, y: 45, width: 35, height: 30 }, name: 'Soft Blush' },
          { type: 'lipstick', color: '#FF6B6B', intensity: 40, area: { x: 50, y: 60, width: 80, height: 25 }, name: 'Natural Lip' }
        ];
        break;
      case 'evening':
        presetEffects = [
          { type: 'foundation', color: '#C4956C', intensity: 50, area: { x: 10, y: 20, width: 80, height: 70 }, name: 'Evening Foundation' },
          { type: 'eyeshadow', color: '#8B5CF6', intensity: 70, area: { x: 40, y: 35, width: 90, height: 20 }, name: 'Dramatic Eyes' },
          { type: 'eyeliner', color: '#1F2937', intensity: 80, area: { x: 35, y: 40, width: 30, height: 3 }, name: 'Bold Liner' },
          { type: 'mascara', color: '#111827', intensity: 75, area: { x: 35, y: 35, width: 30, height: 15 }, name: 'Full Lashes' },
          { type: 'lipstick', color: '#DC2626', intensity: 85, area: { x: 50, y: 60, width: 80, height: 25 }, name: 'Bold Lip' },
          { type: 'blush', color: '#EF4444', intensity: 45, area: { x: 25, y: 45, width: 35, height: 30 }, name: 'Contoured Blush' }
        ];
        break;
      case 'glam':
        presetEffects = [
          { type: 'foundation', color: '#B4856A', intensity: 60, area: { x: 10, y: 20, width: 80, height: 70 }, name: 'Glam Foundation' },
          { type: 'eyeshadow', color: '#7C3AED', intensity: 85, area: { x: 40, y: 35, width: 90, height: 20 }, name: 'Glitter Eyes' },
          { type: 'eyeliner', color: '#1F2937', intensity: 90, area: { x: 35, y: 40, width: 30, height: 3 }, name: 'Cat Eye' },
          { type: 'mascara', color: '#111827', intensity: 85, area: { x: 35, y: 35, width: 30, height: 15 }, name: 'Volume Lashes' },
          { type: 'lipstick', color: '#BE185D', intensity: 90, area: { x: 50, y: 60, width: 80, height: 25 }, name: 'Statement Lip' },
          { type: 'blush', color: '#DC2626', intensity: 55, area: { x: 25, y: 45, width: 35, height: 30 }, name: 'Sculpted Cheeks' }
        ];
        break;
    }
    
    setActiveEffects(presetEffects);
    toast({
      title: "Preset Applied",
      description: `${lookName.charAt(0).toUpperCase() + lookName.slice(1)} look has been loaded`,
    });
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Palette className="mr-2 w-5 h-5 text-purple-600" />
        Enhanced Makeup Studio
      </h3>

      <Tabs defaultValue="effects" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="effects">Effects</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="active">Active ({activeEffects.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="effects" className="space-y-4">
          {/* Makeup Type Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Makeup Type:</label>
            <div className="grid grid-cols-3 gap-2">
              {makeupTypes.map(type => (
                <Button
                  key={type.id}
                  variant={selectedMakeupType === type.id ? "default" : "outline"}
                  onClick={() => {
                    setSelectedMakeupType(type.id);
                    setSelectedColor(type.defaultColor);
                  }}
                  className="h-auto p-3 flex flex-col items-center space-y-1 text-xs"
                  data-testid={`button-makeup-type-${type.id}`}
                >
                  {type.icon}
                  <span>{type.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Color:</label>
            <div className="grid grid-cols-6 gap-2">
              {colorPalettes[selectedMakeupType].map(color => (
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

          {/* Intensity Control */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Intensity: {intensity[0]}%
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

          {/* Add Effect Button */}
          <Button 
            onClick={addMakeupEffect}
            className="w-full"
            data-testid="button-add-effect"
          >
            <Plus className="mr-2 w-4 h-4" />
            Add {makeupTypes.find(t => t.id === selectedMakeupType)?.name} Effect
          </Button>
        </TabsContent>

        <TabsContent value="presets" className="space-y-4">
          <div className="grid gap-3">
            <Button 
              variant="outline" 
              onClick={() => applyPresetLook('natural')}
              className="p-4 h-auto flex flex-col items-start"
              data-testid="button-preset-natural"
            >
              <div className="font-medium">Natural Look</div>
              <div className="text-sm text-gray-600">Light foundation, soft blush, natural lip</div>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => applyPresetLook('evening')}
              className="p-4 h-auto flex flex-col items-start"
              data-testid="button-preset-evening"
            >
              <div className="font-medium">Evening Look</div>
              <div className="text-sm text-gray-600">Dramatic eyes, bold liner, statement lip</div>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => applyPresetLook('glam')}
              className="p-4 h-auto flex flex-col items-start"
              data-testid="button-preset-glam"
            >
              <div className="font-medium">Glam Look</div>
              <div className="text-sm text-gray-600">Full coverage, glitter eyes, bold colors</div>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeEffects.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No active effects</p>
          ) : (
            <div className="space-y-3">
              {activeEffects.map((effect, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: effect.color }}
                    />
                    <div>
                      <div className="font-medium text-sm">{effect.name}</div>
                      <div className="text-xs text-gray-500">{effect.intensity}% intensity</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEffect(index)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex space-x-3 mt-6">
        <Button 
          onClick={applyAllEffects}
          disabled={activeEffects.length === 0 || isProcessing}
          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          data-testid="button-apply-all-effects"
        >
          {isProcessing ? (
            <Loader2 className="mr-2 w-4 h-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 w-4 h-4" />
          )}
          {isProcessing ? 'Processing...' : 'Apply All Effects'}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={clearAllEffects}
          disabled={activeEffects.length === 0}
          data-testid="button-clear-all-effects"
        >
          <RotateCcw className="mr-2 w-4 h-4" />
          Clear
        </Button>
      </div>
    </Card>
  );
}