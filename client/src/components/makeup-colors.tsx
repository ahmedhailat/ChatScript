import { useState } from "react";
import { Palette, Pipette, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface MakeupColorsProps {
  onColorChange: (type: string, color: string, intensity: number) => void;
  disabled?: boolean;
}

export default function MakeupColors({ onColorChange, disabled = false }: MakeupColorsProps) {
  const [selectedType, setSelectedType] = useState<string>("lipstick");
  const [intensity, setIntensity] = useState(50);

  const makeupTypes = [
    { id: "lipstick", name: "Lipstick", icon: "💋" },
    { id: "eyeshadow", name: "Eyeshadow", icon: "👁️" },
    { id: "blush", name: "Blush", icon: "☺️" },
    { id: "foundation", name: "Foundation", icon: "🎭" },
    { id: "eyeliner", name: "Eyeliner", icon: "✏️" },
    { id: "mascara", name: "Mascara", icon: "👀" }
  ];

  const colorPalettes = {
    lipstick: [
      "#FF6B6B", "#FF4757", "#C44569", "#8B0000", "#FF1744",
      "#F8BBD9", "#FF69B4", "#DA70D6", "#9C27B0", "#673AB7"
    ],
    eyeshadow: [
      "#8B4513", "#A0522D", "#CD853F", "#DEB887", "#F5DEB3",
      "#708090", "#2F4F4F", "#483D8B", "#6A5ACD", "#9370DB"
    ],
    blush: [
      "#FFB6C1", "#FFC0CB", "#FF69B4", "#FF1493", "#DC143C",
      "#FA8072", "#F08080", "#E9967A", "#CD5C5C", "#B22222"
    ],
    foundation: [
      "#FFEFD5", "#FFE4C4", "#FFDAB9", "#F5DEB3", "#DEB887",
      "#D2B48C", "#BC9A6A", "#A0814F", "#8B7355", "#654321"
    ],
    eyeliner: [
      "#000000", "#2F4F4F", "#483D8B", "#4B0082", "#800080",
      "#8B0000", "#A0522D", "#8B4513", "#556B2F", "#2E8B57"
    ],
    mascara: [
      "#000000", "#2F4F4F", "#4B0082", "#800080", "#8B0000",
      "#A0522D", "#8B4513", "#483D8B", "#191970", "#000080"
    ]
  };

  const handleColorSelect = (color: string) => {
    onColorChange(selectedType, color, intensity);
  };

  const handleReset = () => {
    setIntensity(50);
    onColorChange("reset", "", 0);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
        <Palette className="text-ai-purple mr-3 w-5 h-5" />
        Virtual Makeup Colors
      </h3>

      {/* Makeup Type Selection */}
      <div className="mb-6">
        <Label className="text-sm font-medium text-slate-700 mb-3 block">
          Makeup Type
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {makeupTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              disabled={disabled}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                selectedType === type.id
                  ? "bg-ai-purple text-white border-ai-purple"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              data-testid={`button-makeup-${type.id}`}
            >
              <span className="text-lg mb-1 block">{type.icon}</span>
              {type.name}
            </button>
          ))}
        </div>
      </div>

      {/* Color Palette */}
      <div className="mb-6">
        <Label className="text-sm font-medium text-slate-700 mb-3 block">
          Color Selection
        </Label>
        <div className="grid grid-cols-5 gap-2">
          {(colorPalettes[selectedType as keyof typeof colorPalettes] || colorPalettes.lipstick).map((color, index) => (
            <button
              key={index}
              onClick={() => handleColorSelect(color)}
              disabled={disabled}
              className={`w-12 h-12 rounded-lg border-2 border-white shadow-sm hover:shadow-md transition-shadow ${
                disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-105"
              }`}
              style={{ backgroundColor: color }}
              data-testid={`color-${selectedType}-${index}`}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Intensity Slider */}
      <div className="mb-6">
        <Label className="text-sm font-medium text-slate-700 mb-3 block">
          Intensity: {intensity}%
        </Label>
        <Slider
          value={[intensity]}
          onValueChange={(value) => setIntensity(value[0])}
          max={100}
          min={0}
          step={5}
          disabled={disabled}
          className="w-full"
          data-testid="slider-makeup-intensity"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleReset}
          variant="outline"
          disabled={disabled}
          data-testid="button-reset-makeup"
        >
          <RotateCcw className="mr-2 w-4 h-4" />
          Reset
        </Button>
        <Button
          onClick={() => handleColorSelect("#FF6B6B")}
          className="bg-ai-purple hover:bg-purple-700"
          disabled={disabled}
          data-testid="button-apply-makeup"
        >
          <Pipette className="mr-2 w-4 h-4" />
          Apply Current
        </Button>
      </div>

      {/* Color Tips */}
      <div className="mt-4 p-3 bg-slate-50 rounded-lg">
        <h5 className="font-medium text-slate-900 mb-2">Color Tips:</h5>
        <ul className="text-xs text-slate-600 space-y-1">
          <li>• Start with low intensity and gradually increase</li>
          <li>• Consider your skin tone when selecting colors</li>
          <li>• Natural lighting shows colors more accurately</li>
        </ul>
      </div>
    </div>
  );
}