import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, Wand2 } from "lucide-react";

interface SimpleAITestProps {
  onResult?: (imageUrl: string) => void;
}

export function SimpleAITest({ onResult }: SimpleAITestProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setResultImage(null); // Reset result when new image is selected
    };
    reader.readAsDataURL(file);
  };

  const processImage = async () => {
    if (!selectedImage) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار صورة أولاً",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    
    try {
      console.log('🧪 اختبار بسيط لتوليد الصور');
      
      // Progress simulation
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 90));
      }, 500);

      // Convert image to blob
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('image', blob, 'test-image.jpg');
      formData.append('procedureType', 'rhinoplasty');
      formData.append('intensity', '50');
      
      console.log('📤 إرسال الطلب للخادم...');
      
      const apiResponse = await fetch('/api/generate-surgical-preview', {
        method: 'POST',
        body: formData,
      });
      
      const result = await apiResponse.json();
      console.log('📥 استجابة الخادم:', result);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (result.success && result.afterImageUrl) {
        // Create full URL for the result image
        const fullImageUrl = result.afterImageUrl.startsWith('http') 
          ? result.afterImageUrl 
          : `${window.location.origin}${result.afterImageUrl}`;
          
        console.log('✅ تم إنشاء الصورة:', fullImageUrl);
        setResultImage(fullImageUrl);
        
        if (onResult) {
          onResult(fullImageUrl);
        }
        
        toast({
          title: "نجح الاختبار! 🎉",
          description: `تم إنشاء الصورة باستخدام ${result.processingMethod === 'ai' ? 'الذكاء الاصطناعي' : 'المعالجة المحلية'}`,
        });
      } else {
        throw new Error(result.error || 'فشل في إنشاء الصورة');
      }
      
    } catch (error) {
      console.error('❌ خطأ في المعالجة:', error);
      toast({
        title: "فشل في المعالجة",
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-xl font-bold">
          🧪 اختبار بسيط لتوليد الصور
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        <div className="text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label 
            htmlFor="image-upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
          >
            <Upload className="w-4 h-4" />
            اختر صورة للاختبار
          </label>
        </div>

        {/* Selected Image */}
        {selectedImage && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">الصورة المختارة:</p>
            <img 
              src={selectedImage} 
              alt="Selected" 
              className="max-w-xs max-h-64 mx-auto rounded-lg border"
            />
          </div>
        )}

        {/* Process Button */}
        <div className="text-center">
          <Button
            onClick={processImage}
            disabled={!selectedImage || isProcessing}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            {isProcessing ? 'جاري المعالجة...' : 'ابدأ المعالجة'}
          </Button>
        </div>

        {/* Progress */}
        {isProcessing && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-center text-sm text-gray-600">
              جاري المعالجة... {progress}%
            </p>
          </div>
        )}

        {/* Result Image */}
        {resultImage && (
          <div className="text-center">
            <p className="text-sm font-bold text-green-600 mb-2">✅ النتيجة:</p>
            <img 
              src={resultImage} 
              alt="Result" 
              className="max-w-xs max-h-64 mx-auto rounded-lg border-2 border-green-500"
            />
            <p className="text-xs text-gray-500 mt-2">
              تم إنشاء صورة جديدة بنجاح!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}