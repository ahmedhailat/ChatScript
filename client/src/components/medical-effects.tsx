import { useState } from "react";
import { Activity, Heart, Pill, AlertTriangle, Thermometer, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MedicalEffectsProps {
  onEffectChange: (effect: string, intensity: number, duration: number) => void;
  disabled?: boolean;
}

export default function MedicalEffects({ onEffectChange, disabled = false }: MedicalEffectsProps) {
  const [selectedEffect, setSelectedEffect] = useState<string>("swelling");
  const [intensity, setIntensity] = useState(30);
  const [duration, setDuration] = useState(7); // days

  const medicalEffects = [
    {
      id: "swelling",
      name: "Post-Surgery Swelling",
      icon: <Activity className="w-5 h-5" />,
      description: "Simulates post-operative swelling and inflammation",
      color: "text-red-500"
    },
    {
      id: "bruising",
      name: "Bruising & Discoloration",
      icon: <Heart className="w-5 h-5" />,
      description: "Shows expected bruising patterns after procedures",
      color: "text-purple-500"
    },
    {
      id: "healing",
      name: "Healing Timeline",
      icon: <Thermometer className="w-5 h-5" />,
      description: "Progressive healing visualization over time",
      color: "text-green-500"
    },
    {
      id: "medication",
      name: "Medication Effects",
      icon: <Pill className="w-5 h-5" />,
      description: "Impact of prescribed medications on appearance",
      color: "text-blue-500"
    },
    {
      id: "complications",
      name: "Potential Complications",
      icon: <AlertTriangle className="w-5 h-5" />,
      description: "Rare but possible complications visualization",
      color: "text-orange-500"
    },
    {
      id: "recovery",
      name: "Recovery Stages",
      icon: <Zap className="w-5 h-5" />,
      description: "Different stages of recovery process",
      color: "text-teal-500"
    }
  ];

  const timelineOptions = [
    { value: 1, label: "Day 1" },
    { value: 3, label: "3 Days" },
    { value: 7, label: "1 Week" },
    { value: 14, label: "2 Weeks" },
    { value: 30, label: "1 Month" },
    { value: 60, label: "2 Months" },
    { value: 90, label: "3 Months" },
    { value: 180, label: "6 Months" }
  ];

  const handleApplyEffect = () => {
    onEffectChange(selectedEffect, intensity, duration);
  };

  const currentEffect = medicalEffects.find(effect => effect.id === selectedEffect);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
        <Activity className="text-medical-alert mr-3 w-5 h-5" />
        Medical Effects Simulation
      </h3>

      {/* Effect Selection */}
      <div className="mb-6">
        <Label className="text-sm font-medium text-slate-700 mb-3 block">
          Medical Effect Type
        </Label>
        <div className="space-y-2">
          {medicalEffects.map((effect) => (
            <div
              key={effect.id}
              onClick={() => !disabled && setSelectedEffect(effect.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedEffect === effect.id
                  ? "bg-medical-alert/10 border-medical-alert"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              data-testid={`effect-${effect.id}`}
            >
              <div className="flex items-center">
                <div className={`${effect.color} mr-3`}>
                  {effect.icon}
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">{effect.name}</h4>
                  <p className="text-xs text-slate-600 mt-1">{effect.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Intensity Control */}
      <div className="mb-6">
        <Label className="text-sm font-medium text-slate-700 mb-3 block">
          Effect Intensity: {intensity}%
        </Label>
        <Slider
          value={[intensity]}
          onValueChange={(value) => setIntensity(value[0])}
          max={100}
          min={10}
          step={5}
          disabled={disabled}
          className="w-full"
          data-testid="slider-effect-intensity"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>Mild</span>
          <span>Moderate</span>
          <span>Severe</span>
        </div>
      </div>

      {/* Timeline Control */}
      <div className="mb-6">
        <Label className="text-sm font-medium text-slate-700 mb-3 block">
          Recovery Timeline
        </Label>
        <Select 
          value={duration.toString()} 
          onValueChange={(value) => setDuration(parseInt(value))}
          disabled={disabled}
        >
          <SelectTrigger data-testid="select-recovery-timeline">
            <SelectValue placeholder="Select timeline" />
          </SelectTrigger>
          <SelectContent>
            {timelineOptions.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Current Effect Info */}
      {currentEffect && (
        <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <h5 className="font-medium text-amber-800 mb-2 flex items-center">
            <div className={currentEffect.color}>{currentEffect.icon}</div>
            <span className="ml-2">Current Effect: {currentEffect.name}</span>
          </h5>
          <p className="text-sm text-amber-700">{currentEffect.description}</p>
          <p className="text-xs text-amber-600 mt-2">
            Intensity: {intensity}% | Timeline: {duration} days
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleApplyEffect}
          className="bg-medical-alert hover:bg-red-700 flex-1"
          disabled={disabled}
          data-testid="button-apply-medical-effect"
        >
          <Activity className="mr-2 w-4 h-4" />
          Apply Medical Effect
        </Button>
      </div>

      {/* Medical Disclaimer */}
      <div className="mt-4 p-3 bg-slate-50 rounded-lg">
        <h5 className="font-medium text-slate-900 mb-2 flex items-center">
          <AlertTriangle className="w-4 h-4 text-amber-500 mr-2" />
          Medical Disclaimer
        </h5>
        <ul className="text-xs text-slate-600 space-y-1">
          <li>• Simulations are estimates based on typical cases</li>
          <li>• Individual results may vary significantly</li>
          <li>• Consult with medical professionals for accurate expectations</li>
          <li>• Not a substitute for professional medical advice</li>
        </ul>
      </div>
    </div>
  );
}