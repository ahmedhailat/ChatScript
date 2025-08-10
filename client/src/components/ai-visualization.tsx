import { useState } from "react";
import { Bot, Crop, RotateCw, Palette, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIVisualizationProps {
  beforeImage: string | null;
  afterImage: string | null;
  isProcessing: boolean;
  onGeneratePreview: () => void;
}

export default function AIVisualization({ 
  beforeImage, 
  afterImage, 
  isProcessing, 
  onGeneratePreview 
}: AIVisualizationProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center">
          <Bot className="text-ai-purple mr-3 w-5 h-5" />
          AI Visualization Results
        </h3>
        
        <Button 
          className="bg-ai-purple hover:bg-purple-700"
          onClick={onGeneratePreview}
          disabled={!beforeImage || isProcessing}
          data-testid="button-generate-prediction"
        >
          {isProcessing ? (
            <Loader2 className="mr-2 w-4 h-4 animate-spin" />
          ) : (
            <Bot className="mr-2 w-4 h-4" />
          )}
          Generate Prediction
        </Button>
      </div>

      {/* Before/After Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Before Image */}
        <div className="space-y-3">
          <h4 className="font-medium text-slate-900 flex items-center">
            <span className="w-2 h-2 bg-slate-400 rounded-full mr-2"></span>
            Before
          </h4>
          <div className="aspect-square bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
            {beforeImage ? (
              <img 
                src={beforeImage} 
                alt="Patient before photo" 
                className="w-full h-full object-cover rounded-lg"
                data-testid="img-before-analysis"
              />
            ) : (
              <div className="text-center" data-testid="placeholder-before-image">
                <Bot className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">Upload Photo</p>
                <p className="text-sm text-slate-500">Add patient image to begin</p>
              </div>
            )}
          </div>
          <p className="text-sm text-slate-500">Original patient photo</p>
        </div>

        {/* After Image */}
        <div className="space-y-3">
          <h4 className="font-medium text-slate-900 flex items-center">
            <span className="w-2 h-2 bg-medical-success rounded-full mr-2"></span>
            AI Prediction
          </h4>
          <div className="aspect-square bg-gradient-to-br from-ai-purple/10 to-medical-blue/10 rounded-lg border-2 border-dashed border-ai-purple/30 flex items-center justify-center relative">
            {isProcessing ? (
              <div className="text-center" data-testid="ai-processing-indicator">
                <Loader2 className="w-8 h-8 text-ai-purple animate-spin mx-auto mb-3" />
                <p className="text-slate-600 font-medium">Processing with AI...</p>
                <p className="text-sm text-slate-500">This may take 30-60 seconds</p>
              </div>
            ) : afterImage ? (
              <img 
                src={afterImage} 
                alt="AI prediction" 
                className="w-full h-full object-cover rounded-lg"
                data-testid="img-after-prediction"
              />
            ) : (
              <div className="text-center" data-testid="placeholder-ai-prediction">
                <Bot className="w-12 h-12 text-ai-purple/50 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">AI Processing</p>
                <p className="text-sm text-slate-500">Upload photo to see prediction</p>
              </div>
            )}
          </div>
          <p className="text-sm text-slate-500">Predicted surgical outcome</p>
        </div>
      </div>

      {/* Analysis Tools */}
      <div className="mt-6 p-4 bg-slate-50 rounded-lg">
        <h5 className="font-medium text-slate-900 mb-3">Analysis Tools</h5>
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            size="sm"
            disabled={!beforeImage}
            data-testid="button-crop"
          >
            <Crop className="mr-2 w-4 h-4" />
            Crop
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            disabled={!beforeImage}
            data-testid="button-rotate"
          >
            <RotateCw className="mr-2 w-4 h-4" />
            Rotate
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            disabled={!beforeImage}
            data-testid="button-enhance"
          >
            <Palette className="mr-2 w-4 h-4" />
            Enhance
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            disabled={!afterImage}
            data-testid="button-export"
          >
            <Download className="mr-2 w-4 h-4" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
}
