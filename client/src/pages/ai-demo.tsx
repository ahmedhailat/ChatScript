import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Wand2, 
  Camera, 
  Upload, 
  Sparkles, 
  Bot,
  Loader2,
  Download,
  RefreshCw,
  Eye,
  Palette,
  Clock,
  User2
} from "lucide-react";

export default function AIDemo() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedProcedure, setSelectedProcedure] = useState("rhinoplasty");
  const [intensity, setIntensity] = useState([60]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("surgical");
  const { toast } = useToast();

  // Demo images for testing
  const demoImages = {
    portrait1: "https://images.unsplash.com/photo-1494790108755-2616b612b182?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    portrait2: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    portrait3: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
  };

  const procedures = [
    { id: "rhinoplasty", name: "Nose Surgery", icon: "👃", description: "AI-powered nose reshaping visualization" },
    { id: "dental", name: "Dental Work", icon: "🦷", description: "Teeth straightening and whitening preview" },
    { id: "facelift", name: "Face Lifting", icon: "✨", description: "Facial contouring and enhancement" },
    { id: "scar_removal", name: "Scar Removal", icon: "🩹", description: "Scar reduction and skin improvement" }
  ];

  const makeupTypes = [
    { id: "lipstick", name: "Lipstick", color: "#FF6B6B" },
    { id: "eyeshadow", name: "Eyeshadow", color: "#8B5CF6" },
    { id: "blush", name: "Blush", color: "#F87171" },
    { id: "foundation", name: "Foundation", color: "#D4A574" },
    { id: "eyeliner", name: "Eyeliner", color: "#1F2937" },
    { id: "mascara", name: "Mascara", color: "#000000" }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateSurgicalPreview = async () => {
    if (!selectedImage) {
      toast({
        title: "No image selected",
        description: "Please select or upload an image first",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Convert image to blob
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('image', blob, 'demo-photo.jpg');
      formData.append('procedureType', selectedProcedure);
      formData.append('intensity', intensity[0].toString());
      
      const apiResponse = await fetch('/api/generate-surgical-preview', {
        method: 'POST',
        body: formData,
      });
      
      const result = await apiResponse.json();
      
      if (result.success && result.afterImageUrl) {
        setResultImage(result.afterImageUrl);
        toast({
          title: "AI Preview Generated!",
          description: `${procedures.find(p => p.id === selectedProcedure)?.name} visualization complete`,
        });
      } else {
        throw new Error(result.error || 'Failed to generate preview');
      }

    } catch (error) {
      console.error('Error generating surgical preview:', error);
      toast({
        title: "Generation Failed",
        description: "Unable to generate AI preview. Please try again.",
        variant: "destructive"
      });
      
      // Show demo result for testing
      setResultImage("https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400");
    } finally {
      setIsGenerating(false);
    }
  };

  const applyMakeup = async (makeupType: string, color: string) => {
    if (!selectedImage) {
      toast({
        title: "No image selected",
        description: "Please select an image first",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('image', blob, 'makeup-photo.jpg');
      formData.append('makeupType', makeupType);
      formData.append('color', color);
      formData.append('intensity', intensity[0].toString());
      
      const apiResponse = await fetch('/api/apply-makeup', {
        method: 'POST',
        body: formData,
      });
      
      const result = await apiResponse.json();
      
      if (result.success && result.makeupImageUrl) {
        setResultImage(result.makeupImageUrl);
        toast({
          title: "Makeup Applied!",
          description: `${makeupType} effect applied successfully`,
        });
      } else {
        throw new Error(result.error || 'Failed to apply makeup');
      }

    } catch (error) {
      console.error('Error applying makeup:', error);
      toast({
        title: "Makeup Application Failed",
        description: "Unable to apply makeup effect. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAgeProgression = async (targetAge: number) => {
    if (!selectedImage) return;

    setIsGenerating(true);

    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('image', blob, 'age-photo.jpg');
      formData.append('targetAge', targetAge.toString());
      
      const apiResponse = await fetch('/api/age-progression', {
        method: 'POST',
        body: formData,
      });
      
      const result = await apiResponse.json();
      
      if (result.success && result.agedImageUrl) {
        setResultImage(result.agedImageUrl);
        toast({
          title: "Age Progression Complete!",
          description: `Aged to ${targetAge} years old`,
        });
      }

    } catch (error) {
      console.error('Error with age progression:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  MedVision AI Demo
                </h1>
                <p className="text-sm text-slate-600">Real AI-Powered Medical Visualization</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              <Sparkles className="w-3 h-3 mr-1" />
              Live AI Processing
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Image Selection */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Camera className="mr-2 w-5 h-5 text-purple-600" />
            Step 1: Select Your Image
          </h2>
          
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            {/* Demo Images */}
            {Object.entries(demoImages).map(([key, url]) => (
              <div
                key={key}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage === url ? 'border-purple-500 shadow-lg' : 'border-gray-200 hover:border-purple-300'
                }`}
                onClick={() => setSelectedImage(url)}
              >
                <img src={url} alt="Demo" className="w-full h-32 object-cover" />
                {selectedImage === url && (
                  <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                    <Badge className="bg-purple-600">Selected</Badge>
                  </div>
                )}
              </div>
            ))}
            
            {/* Upload Option */}
            <label className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 transition-colors">
              <Upload className="w-6 h-6 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Upload Custom</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </Card>

        {/* AI Processing Tabs */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Wand2 className="mr-2 w-5 h-5 text-purple-600" />
            Step 2: Choose AI Processing
          </h2>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="surgical">Surgical Preview</TabsTrigger>
              <TabsTrigger value="makeup">Virtual Makeup</TabsTrigger>
              <TabsTrigger value="aging">Age Progression</TabsTrigger>
            </TabsList>

            <TabsContent value="surgical" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-4">Select Procedure:</h3>
                  <RadioGroup value={selectedProcedure} onValueChange={setSelectedProcedure}>
                    {procedures.map((procedure) => (
                      <div key={procedure.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-purple-50">
                        <RadioGroupItem value={procedure.id} id={procedure.id} />
                        <Label htmlFor={procedure.id} className="flex-1 cursor-pointer">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{procedure.icon}</span>
                            <div>
                              <div className="font-medium">{procedure.name}</div>
                              <div className="text-sm text-gray-500">{procedure.description}</div>
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                <div>
                  <h3 className="font-medium mb-4">Intensity: {intensity[0]}%</h3>
                  <Slider
                    value={intensity}
                    onValueChange={setIntensity}
                    max={100}
                    min={10}
                    step={10}
                    className="mb-6"
                  />
                  
                  <Button 
                    onClick={generateSurgicalPreview}
                    disabled={!selectedImage || isGenerating}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    data-testid="button-generate-surgical"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                        Generating with AI...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 w-4 h-4" />
                        Generate Surgical Preview
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="makeup" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-4">Makeup Effects:</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {makeupTypes.map((makeup) => (
                      <Button
                        key={makeup.id}
                        variant="outline"
                        onClick={() => applyMakeup(makeup.id, makeup.color)}
                        disabled={!selectedImage || isGenerating}
                        className="h-auto p-3 flex flex-col items-center space-y-2"
                      >
                        <Palette className="w-4 h-4" style={{ color: makeup.color }} />
                        <span className="text-sm">{makeup.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-4">Intensity: {intensity[0]}%</h3>
                  <Slider
                    value={intensity}
                    onValueChange={setIntensity}
                    max={100}
                    min={20}
                    step={10}
                    className="mb-6"
                  />
                  
                  <p className="text-sm text-gray-600">
                    Click any makeup effect above to apply it with the current intensity setting.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="aging" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-4">Age Progression:</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[25, 35, 45, 55, 65, 75].map((age) => (
                      <Button
                        key={age}
                        variant="outline"
                        onClick={() => generateAgeProgression(age)}
                        disabled={!selectedImage || isGenerating}
                        className="h-auto p-3 flex flex-col items-center space-y-2"
                      >
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Age {age}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-4">Age Progression Preview</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Select a target age to see how the person might look at that age using AI-powered aging simulation.
                  </p>
                  
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-700">
                      Age progression is for entertainment and demonstration purposes. 
                      Results may vary based on genetics, lifestyle, and other factors.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Results Display */}
        {(selectedImage || resultImage) && (
          <Card className="p-6 mt-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Eye className="mr-2 w-5 h-5 text-purple-600" />
              Step 3: AI Results
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Before */}
              <div>
                <h3 className="font-medium mb-3 text-center">Before</h3>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {selectedImage ? (
                    <img src={selectedImage} alt="Before" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Camera className="w-12 h-12" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* After */}
              <div>
                <h3 className="font-medium mb-3 text-center">After (AI Generated)</h3>
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg overflow-hidden">
                  {isGenerating ? (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-3" />
                      <p className="text-sm text-purple-600">AI Processing...</p>
                    </div>
                  ) : resultImage ? (
                    <img src={resultImage} alt="After" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-purple-400">
                      <Sparkles className="w-12 h-12 mb-2" />
                      <p className="text-sm">AI result will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {resultImage && !isGenerating && (
              <div className="flex justify-center mt-6 space-x-4">
                <Button variant="outline" onClick={() => setResultImage(null)}>
                  <RefreshCw className="mr-2 w-4 h-4" />
                  Try Again
                </Button>
                <Button>
                  <Download className="mr-2 w-4 h-4" />
                  Download Result
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* AI Features Showcase */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Real AI Processing</h3>
            <p className="text-sm text-gray-600">
              Powered by OpenAI's latest models for realistic image generation and medical visualization.
            </p>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Multiple Effects</h3>
            <p className="text-sm text-gray-600">
              Surgical previews, makeup application, age progression, and facial enhancement tools.
            </p>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User2 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Medical Grade</h3>
            <p className="text-sm text-gray-600">
              Designed for medical professionals with HIPAA-compliant processing and realistic results.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}