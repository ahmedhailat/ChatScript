import { useState } from "react";
import { Filter, Sun, Moon, Contrast, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface RealTimeFiltersProps {
  onFilterChange: (filters: ImageFilters) => void;
  disabled?: boolean;
}

interface ImageFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
  clarity: number;
  vignette: number;
  selectedFilter: string;
}

export default function RealTimeFilters({ onFilterChange, disabled = false }: RealTimeFiltersProps) {
  const [filters, setFilters] = useState<ImageFilters>({
    brightness: 50,
    contrast: 50,
    saturation: 50,
    warmth: 50,
    clarity: 50,
    vignette: 0,
    selectedFilter: "none"
  });

  const presetFilters = [
    {
      id: "none",
      name: "None",
      preview: "🔳",
      filters: { brightness: 50, contrast: 50, saturation: 50, warmth: 50, clarity: 50, vignette: 0 }
    },
    {
      id: "natural",
      name: "Natural",
      preview: "🌿",
      filters: { brightness: 55, contrast: 45, saturation: 45, warmth: 55, clarity: 60, vignette: 10 }
    },
    {
      id: "vibrant",
      name: "Vibrant",
      preview: "🌈",
      filters: { brightness: 60, contrast: 65, saturation: 75, warmth: 50, clarity: 70, vignette: 5 }
    },
    {
      id: "soft",
      name: "Soft",
      preview: "☁️",
      filters: { brightness: 65, contrast: 35, saturation: 40, warmth: 60, clarity: 30, vignette: 20 }
    },
    {
      id: "dramatic",
      name: "Dramatic",
      preview: "⚡",
      filters: { brightness: 45, contrast: 80, saturation: 60, warmth: 40, clarity: 85, vignette: 30 }
    },
    {
      id: "vintage",
      name: "Vintage",
      preview: "📸",
      filters: { brightness: 55, contrast: 60, saturation: 30, warmth: 75, clarity: 40, vignette: 40 }
    },
    {
      id: "black_white",
      name: "B&W",
      preview: "⚫",
      filters: { brightness: 50, contrast: 70, saturation: 0, warmth: 50, clarity: 80, vignette: 15 }
    },
    {
      id: "golden_hour",
      name: "Golden",
      preview: "🌅",
      filters: { brightness: 70, contrast: 55, saturation: 65, warmth: 85, clarity: 60, vignette: 25 }
    }
  ];

  const adjustmentControls = [
    { 
      key: "brightness", 
      label: "Brightness", 
      icon: <Sun className="w-4 h-4" />,
      min: 0, 
      max: 100 
    },
    { 
      key: "contrast", 
      label: "Contrast", 
      icon: <Contrast className="w-4 h-4" />,
      min: 0, 
      max: 100 
    },
    { 
      key: "saturation", 
      label: "Saturation", 
      icon: <Filter className="w-4 h-4" />,
      min: 0, 
      max: 100 
    },
    { 
      key: "warmth", 
      label: "Warmth", 
      icon: <Sun className="w-4 h-4" />,
      min: 0, 
      max: 100 
    },
    { 
      key: "clarity", 
      label: "Clarity", 
      icon: <Sparkles className="w-4 h-4" />,
      min: 0, 
      max: 100 
    },
    { 
      key: "vignette", 
      label: "Vignette", 
      icon: <Moon className="w-4 h-4" />,
      min: 0, 
      max: 100 
    }
  ];

  const handleFilterChange = (key: keyof ImageFilters, value: number) => {
    const newFilters = { ...filters, [key]: value, selectedFilter: "custom" };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const applyPresetFilter = (preset: typeof presetFilters[0]) => {
    const newFilters = { 
      ...preset.filters, 
      selectedFilter: preset.id 
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const resetFilters = {
      brightness: 50,
      contrast: 50,
      saturation: 50,
      warmth: 50,
      clarity: 50,
      vignette: 0,
      selectedFilter: "none"
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
        <Filter className="text-ai-purple mr-3 w-5 h-5" />
        Real-Time Filters & Effects
      </h3>

      {/* Preset Filters */}
      <div className="mb-6">
        <Label className="text-sm font-medium text-slate-700 mb-3 block">
          Filter Presets
        </Label>
        <div className="grid grid-cols-4 gap-2">
          {presetFilters.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPresetFilter(preset)}
              disabled={disabled}
              className={`p-3 rounded-lg border text-center transition-all ${
                filters.selectedFilter === preset.id
                  ? "bg-ai-purple text-white border-ai-purple shadow-md"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-sm"}`}
              data-testid={`filter-${preset.id}`}
            >
              <div className="text-2xl mb-1">{preset.preview}</div>
              <div className="text-xs font-medium">{preset.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Adjustments */}
      <div className="space-y-4">
        <Label className="text-sm font-medium text-slate-700 block">
          Manual Adjustments
        </Label>
        
        {adjustmentControls.map((control) => (
          <div key={control.key} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-ai-purple mr-2">{control.icon}</span>
                <Label className="text-sm font-medium text-slate-700">
                  {control.label}
                </Label>
              </div>
              <span className="text-xs font-medium text-slate-500">
                {filters[control.key as keyof ImageFilters]}%
              </span>
            </div>
            
            <Slider
              value={[filters[control.key as keyof ImageFilters]]}
              onValueChange={(value) => handleFilterChange(control.key as keyof ImageFilters, value[0])}
              max={control.max}
              min={control.min}
              step={1}
              disabled={disabled}
              className="w-full"
              data-testid={`slider-${control.key}`}
            />
            
            <div className="flex justify-between text-xs text-slate-400">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Preview Info */}
      <div className="mt-6 p-4 bg-gradient-to-r from-ai-purple/10 to-medical-blue/10 rounded-lg">
        <h5 className="font-medium text-slate-900 mb-2">Current Filter: {
          presetFilters.find(f => f.id === filters.selectedFilter)?.name || "Custom"
        }</h5>
        
        <div className="text-xs text-slate-600 space-y-1">
          <p>• Brightness: {filters.brightness > 50 ? "Enhanced" : filters.brightness < 50 ? "Dimmed" : "Natural"}</p>
          <p>• Contrast: {filters.contrast > 50 ? "Increased" : filters.contrast < 50 ? "Softened" : "Natural"}</p>
          <p>• Saturation: {filters.saturation > 50 ? "Vibrant" : filters.saturation < 50 ? "Muted" : "Natural"}</p>
        </div>
      </div>

      {/* Reset Button */}
      <div className="mt-4 flex justify-center">
        <Button
          onClick={resetFilters}
          variant="outline"
          disabled={disabled}
          data-testid="button-reset-filters"
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
}