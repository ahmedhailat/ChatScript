import { useState } from "react";
import { Sliders, RotateCcw, Eye, Smile, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface FacialAdjustmentsProps {
  onAdjustmentChange: (adjustments: FacialAdjustments) => void;
  disabled?: boolean;
}

interface FacialAdjustments {
  noseWidth: number;
  noseLength: number;
  eyeSize: number;
  eyeDistance: number;
  lipFullness: number;
  jawWidth: number;
  cheekHeight: number;
  foreheadHeight: number;
  chinLength: number;
}

export default function FacialAdjustments({ onAdjustmentChange, disabled = false }: FacialAdjustmentsProps) {
  const [adjustments, setAdjustments] = useState<FacialAdjustments>({
    noseWidth: 50,
    noseLength: 50,
    eyeSize: 50,
    eyeDistance: 50,
    lipFullness: 50,
    jawWidth: 50,
    cheekHeight: 50,
    foreheadHeight: 50,
    chinLength: 50
  });

  const adjustmentCategories = [
    {
      title: "Nose Adjustments",
      icon: <Zap className="w-5 h-5" />,
      items: [
        { key: "noseWidth", label: "Nose Width", min: 20, max: 80 },
        { key: "noseLength", label: "Nose Length", min: 30, max: 70 }
      ]
    },
    {
      title: "Eye Adjustments", 
      icon: <Eye className="w-5 h-5" />,
      items: [
        { key: "eyeSize", label: "Eye Size", min: 30, max: 80 },
        { key: "eyeDistance", label: "Eye Distance", min: 40, max: 60 }
      ]
    },
    {
      title: "Mouth & Jaw",
      icon: <Smile className="w-5 h-5" />,
      items: [
        { key: "lipFullness", label: "Lip Fullness", min: 30, max: 80 },
        { key: "jawWidth", label: "Jaw Width", min: 30, max: 80 }
      ]
    },
    {
      title: "Facial Structure",
      icon: <Sliders className="w-5 h-5" />,
      items: [
        { key: "cheekHeight", label: "Cheek Height", min: 30, max: 70 },
        { key: "foreheadHeight", label: "Forehead Height", min: 40, max: 60 },
        { key: "chinLength", label: "Chin Length", min: 30, max: 70 }
      ]
    }
  ];

  const handleAdjustmentChange = (key: keyof FacialAdjustments, value: number) => {
    const newAdjustments = { ...adjustments, [key]: value };
    setAdjustments(newAdjustments);
    onAdjustmentChange(newAdjustments);
  };

  const resetAdjustments = () => {
    const defaultAdjustments: FacialAdjustments = {
      noseWidth: 50,
      noseLength: 50,
      eyeSize: 50,
      eyeDistance: 50,
      lipFullness: 50,
      jawWidth: 50,
      cheekHeight: 50,
      foreheadHeight: 50,
      chinLength: 50
    };
    setAdjustments(defaultAdjustments);
    onAdjustmentChange(defaultAdjustments);
  };

  const getIntensityColor = (value: number) => {
    if (value < 45 || value > 55) return "text-ai-purple";
    return "text-slate-600";
  };

  const getIntensityDescription = (value: number) => {
    if (value < 35) return "Much Smaller";
    if (value < 45) return "Smaller";
    if (value > 65) return "Larger";
    if (value > 75) return "Much Larger";
    return "Natural";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
        <Sliders className="text-ai-purple mr-3 w-5 h-5" />
        Facial Feature Adjustments
      </h3>

      <div className="space-y-6">
        {adjustmentCategories.map((category) => (
          <div key={category.title} className="space-y-4">
            <h4 className="font-medium text-slate-900 flex items-center text-sm">
              <span className="text-ai-purple mr-2">{category.icon}</span>
              {category.title}
            </h4>
            
            <div className="space-y-4 pl-6">
              {category.items.map((item) => (
                <div key={item.key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium text-slate-700">
                      {item.label}
                    </Label>
                    <span className={`text-xs font-medium ${getIntensityColor(adjustments[item.key as keyof FacialAdjustments])}`}>
                      {getIntensityDescription(adjustments[item.key as keyof FacialAdjustments])}
                    </span>
                  </div>
                  
                  <Slider
                    value={[adjustments[item.key as keyof FacialAdjustments]]}
                    onValueChange={(value) => handleAdjustmentChange(item.key as keyof FacialAdjustments, value[0])}
                    max={item.max}
                    min={item.min}
                    step={1}
                    disabled={disabled}
                    className="w-full"
                    data-testid={`slider-${item.key}`}
                  />
                  
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Smaller</span>
                    <span className="text-slate-400">|</span>
                    <span>Natural</span>
                    <span className="text-slate-400">|</span>
                    <span>Larger</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Preset Adjustments */}
      <div className="mt-6 p-4 bg-slate-50 rounded-lg">
        <h5 className="font-medium text-slate-900 mb-3">Quick Presets</h5>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              const feminineAdjustments = {
                ...adjustments,
                noseWidth: 40,
                eyeSize: 60,
                lipFullness: 65,
                cheekHeight: 60,
                jawWidth: 40
              };
              setAdjustments(feminineAdjustments);
              onAdjustmentChange(feminineAdjustments);
            }}
            variant="outline"
            size="sm"
            disabled={disabled}
            data-testid="preset-feminine"
          >
            Softer Features
          </Button>
          
          <Button
            onClick={() => {
              const masculineAdjustments = {
                ...adjustments,
                noseWidth: 60,
                jawWidth: 65,
                chinLength: 60,
                eyeDistance: 55
              };
              setAdjustments(masculineAdjustments);
              onAdjustmentChange(masculineAdjustments);
            }}
            variant="outline"
            size="sm"
            disabled={disabled}
            data-testid="preset-masculine"
          >
            Stronger Features
          </Button>
          
          <Button
            onClick={() => {
              const symmetricalAdjustments = {
                ...adjustments,
                eyeDistance: 50,
                noseWidth: 50,
                jawWidth: 50
              };
              setAdjustments(symmetricalAdjustments);
              onAdjustmentChange(symmetricalAdjustments);
            }}
            variant="outline"
            size="sm"
            disabled={disabled}
            data-testid="preset-symmetrical"
          >
            Perfect Symmetry
          </Button>
        </div>
      </div>

      {/* Reset Button */}
      <div className="mt-4 flex justify-center">
        <Button
          onClick={resetAdjustments}
          variant="outline"
          disabled={disabled}
          data-testid="button-reset-adjustments"
        >
          <RotateCcw className="mr-2 w-4 h-4" />
          Reset All Adjustments
        </Button>
      </div>

      {/* Adjustment Summary */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h6 className="font-medium text-blue-800 mb-2">Active Adjustments:</h6>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(adjustments)
            .filter(([_, value]) => value !== 50)
            .map(([key, value]) => (
              <div key={key} className="flex justify-between text-blue-700">
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className={getIntensityColor(value)}>
                  {getIntensityDescription(value)}
                </span>
              </div>
            ))}
          {Object.values(adjustments).every(value => value === 50) && (
            <p className="text-blue-600 col-span-2">All features at natural size</p>
          )}
        </div>
      </div>
    </div>
  );
}