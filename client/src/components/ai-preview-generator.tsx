import { useState } from "react";
import { Wand2, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AIPreviewGeneratorProps {
  beforeImage: string | null;
  procedureType: string;
  onPreviewGenerated: (afterImage: string) => void;
  disabled?: boolean;
}

export default function AIPreviewGenerator({ 
  beforeImage, 
  procedureType, 
  onPreviewGenerated,
  disabled = false 
}: AIPreviewGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const procedureDetails = {
    rhinoplasty: {
      name: "Rhinoplasty",
      description: "AI will analyze nose structure and generate realistic reshaping preview",
      estimatedTime: "15-30 seconds"
    },
    dental: {
      name: "Dental Restoration", 
      description: "AI will straighten teeth, improve alignment and apply natural whitening",
      estimatedTime: "15-25 seconds"
    },
    facelift: {
      name: "Facial Contouring",
      description: "AI will enhance facial structure with natural lifting and contouring",
      estimatedTime: "20-35 seconds"
    },
    scar_removal: {
      name: "Scar Removal",
      description: "AI will reduce scar visibility and improve skin texture",
      estimatedTime: "10-20 seconds"
    }
  };

  const currentProcedure = procedureDetails[procedureType as keyof typeof procedureDetails] || procedureDetails.rhinoplasty;

  const generateAIPreview = async () => {
    if (!beforeImage) {
      toast({
        title: "No image provided",
        description: "Please capture or upload a photo first",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 1000);

      // Convert base64 to blob for upload
      const response = await fetch(beforeImage);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('image', blob, 'medical-photo.jpg');
      formData.append('procedureType', procedureType);
      formData.append('intensity', '65'); // Moderate intensity for realistic results
      
      const apiResponse = await fetch('/api/generate-surgical-preview', {
        method: 'POST',
        body: formData,
      });
      
      const result = await apiResponse.json();
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (result.success && result.afterImageUrl) {
        onPreviewGenerated(result.afterImageUrl);
        toast({
          title: "AI Preview Generated",
          description: `${currentProcedure.name} visualization completed successfully`,
        });
      } else {
        throw new Error(result.error || 'Failed to generate preview');
      }

    } catch (error) {
      console.error('Error generating AI preview:', error);
      toast({
        title: "Preview Generation Failed",
        description: "Unable to generate AI preview. Please try again or check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const analyzeImage = async () => {
    if (!beforeImage) return;

    try {
      const response = await fetch(beforeImage);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('image', blob, 'analysis.jpg');
      
      const apiResponse = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData,
      });
      
      const result = await apiResponse.json();
      
      if (result.success) {
        toast({
          title: "Image Analysis Complete",
          description: `Suitable for ${procedureType}. ${result.analysis.recommendations || 'Ready for preview generation.'}`,
        });
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
    }
  };

  return (
    <div className="bg-gradient-to-br from-ai-purple/5 to-medical-blue/5 rounded-xl p-6 border border-ai-purple/20">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-ai-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-ai-purple" />
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          AI-Powered {currentProcedure.name}
        </h3>
        <p className="text-sm text-slate-600 mb-2">
          {currentProcedure.description}
        </p>
        <p className="text-xs text-slate-500">
          Estimated time: {currentProcedure.estimatedTime}
        </p>
      </div>

      {/* Progress Bar */}
      {isGenerating && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Generating Preview...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-ai-purple to-medical-blue h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={generateAIPreview}
          disabled={!beforeImage || disabled || isGenerating}
          className="w-full bg-gradient-to-r from-ai-purple to-medical-blue hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3"
          data-testid="button-generate-ai-preview"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 w-5 h-5 animate-spin" />
              Generating AI Preview...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 w-5 h-5" />
              Generate AI Preview
            </>
          )}
        </Button>

        <Button
          onClick={analyzeImage}
          variant="outline"
          disabled={!beforeImage || disabled || isGenerating}
          className="w-full border-ai-purple/30 text-ai-purple hover:bg-ai-purple/10"
          data-testid="button-analyze-image"
        >
          <AlertCircle className="mr-2 w-4 h-4" />
          Analyze Image First
        </Button>
      </div>

      {/* AI Disclaimer */}
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <h5 className="font-medium text-amber-800 mb-1 text-sm">AI Preview Disclaimer</h5>
        <p className="text-xs text-amber-700">
          AI-generated previews are estimates for consultation purposes only. 
          Actual surgical results may vary based on individual anatomy, healing, and other factors.
          Always consult with qualified medical professionals.
        </p>
      </div>
    </div>
  );
}