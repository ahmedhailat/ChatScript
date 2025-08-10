import { useState } from "react";
import { Clock, FastForward, Rewind, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface AgeProgressionProps {
  onAgeChange: (age: number) => void;
  disabled?: boolean;
  currentAge?: number;
}

export default function AgeProgression({ onAgeChange, disabled = false, currentAge = 25 }: AgeProgressionProps) {
  const [targetAge, setTargetAge] = useState(currentAge);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const ageRanges = [
    { min: 15, max: 25, label: "Young Adult", color: "text-green-500" },
    { min: 26, max: 40, label: "Adult", color: "text-blue-500" },
    { min: 41, max: 60, label: "Middle Age", color: "text-yellow-500" },
    { min: 61, max: 80, label: "Senior", color: "text-orange-500" },
    { min: 81, max: 100, label: "Elderly", color: "text-red-500" }
  ];

  const getCurrentAgeRange = (age: number) => {
    return ageRanges.find(range => age >= range.min && age <= range.max);
  };

  const handleAgeChange = (newAge: number[]) => {
    setTargetAge(newAge[0]);
    onAgeChange(newAge[0]);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, this would trigger animation
  };

  const resetToCurrentAge = () => {
    setTargetAge(currentAge);
    onAgeChange(currentAge);
    setIsPlaying(false);
  };

  const currentRange = getCurrentAgeRange(targetAge);
  
  const agingEffects = [
    { age: 20, effects: ["Smooth skin", "Bright eyes", "Full hair"] },
    { age: 30, effects: ["Fine lines starting", "Slight skin texture changes", "Hair remains full"] },
    { age: 40, effects: ["More pronounced wrinkles", "Some gray hair", "Skin tone changes"] },
    { age: 50, effects: ["Deep expression lines", "Gray/white hair", "Sagging skin"] },
    { age: 60, effects: ["Age spots", "Thinner hair", "Pronounced facial changes"] },
    { age: 70, effects: ["Significant wrinkles", "Hair thinning", "Skin discoloration"] },
    { age: 80, effects: ["Deep wrinkles", "Sparse hair", "Age-related changes"] }
  ];

  const getClosestEffects = (age: number) => {
    const closest = agingEffects.reduce((prev, curr) => 
      Math.abs(curr.age - age) < Math.abs(prev.age - age) ? curr : prev
    );
    return closest.effects;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
        <Clock className="text-ai-purple mr-3 w-5 h-5" />
        Age Progression Simulation
      </h3>

      {/* Age Control */}
      <div className="mb-6">
        <Label className="text-sm font-medium text-slate-700 mb-3 block">
          Target Age: {targetAge} years
          {currentRange && (
            <span className={`ml-2 text-xs ${currentRange.color}`}>
              ({currentRange.label})
            </span>
          )}
        </Label>
        <Slider
          value={[targetAge]}
          onValueChange={handleAgeChange}
          max={90}
          min={15}
          step={1}
          disabled={disabled}
          className="w-full mb-2"
          data-testid="slider-age-progression"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>15 years</span>
          <span>Current: {currentAge}</span>
          <span>90 years</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="mb-6">
        <Label className="text-sm font-medium text-slate-700 mb-3 block">
          Animation Controls
        </Label>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setTargetAge(Math.max(15, targetAge - 5))}
            variant="outline"
            size="sm"
            disabled={disabled || targetAge <= 15}
            data-testid="button-age-back"
          >
            <Rewind className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={handlePlayPause}
            variant="outline"
            size="sm"
            disabled={disabled}
            data-testid="button-play-pause"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <Button
            onClick={() => setTargetAge(Math.min(90, targetAge + 5))}
            variant="outline"
            size="sm"
            disabled={disabled || targetAge >= 90}
            data-testid="button-age-forward"
          >
            <FastForward className="w-4 h-4" />
          </Button>

          <Button
            onClick={resetToCurrentAge}
            variant="outline"
            size="sm"
            disabled={disabled}
            data-testid="button-reset-age"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Speed Control */}
      <div className="mb-6">
        <Label className="text-sm font-medium text-slate-700 mb-3 block">
          Playback Speed: {playbackSpeed}x
        </Label>
        <Slider
          value={[playbackSpeed]}
          onValueChange={(value) => setPlaybackSpeed(value[0])}
          max={3}
          min={0.25}
          step={0.25}
          disabled={disabled}
          className="w-full"
          data-testid="slider-playback-speed"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>0.25x</span>
          <span>Normal</span>
          <span>3x</span>
        </div>
      </div>

      {/* Expected Effects */}
      <div className="p-4 bg-slate-50 rounded-lg">
        <h5 className="font-medium text-slate-900 mb-3">Expected Aging Effects at {targetAge} years:</h5>
        <ul className="text-sm text-slate-600 space-y-1">
          {getClosestEffects(targetAge).map((effect, index) => (
            <li key={index} className="flex items-center">
              <span className="w-2 h-2 bg-ai-purple rounded-full mr-2 flex-shrink-0" />
              {effect}
            </li>
          ))}
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-700">
          <strong>Note:</strong> Age progression simulations are estimates based on typical aging patterns. 
          Individual results may vary significantly due to genetics, lifestyle, and other factors.
        </p>
      </div>
    </div>
  );
}