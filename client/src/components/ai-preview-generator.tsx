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
      name: "تجميل الأنف",
      description: "سيحلل الذكاء الاصطناعي بنية الأنف وينتج معاينة واقعية لإعادة التشكيل",
      estimatedTime: "15-30 ثانية"
    },
    dental: {
      name: "طب الأسنان التجميلي", 
      description: "سيقوم الذكاء الاصطناعي بتقويم الأسنان وتحسين المحاذاة وتطبيق التبييض الطبيعي",
      estimatedTime: "15-25 ثانية"
    },
    facelift: {
      name: "نحت الوجه",
      description: "سيعزز الذكاء الاصطناعي بنية الوجه مع الشد والنحت الطبيعي",
      estimatedTime: "20-35 ثانية"
    },
    scar_removal: {
      name: "إزالة الندبات",
      description: "سيقلل الذكاء الاصطناعي من ظهور الندبات ويحسن ملمس الجلد",
      estimatedTime: "10-20 ثانية"
    }
  };

  const currentProcedure = procedureDetails[procedureType as keyof typeof procedureDetails] || procedureDetails.rhinoplasty;

  const generateAIPreview = async () => {
    if (!beforeImage) {
      toast({
        title: "لا توجد صورة",
        description: "يرجى التقاط أو رفع صورة أولاً",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      console.log('بدء توليد الصورة بالذكاء الاصطناعي:', {
        procedureType,
        hasBeforeImage: !!beforeImage
      });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 1000);

      // Convert base64 to blob for upload
      const response = await fetch(beforeImage);
      const blob = await response.blob();
      
      console.log('تم تحويل الصورة إلى blob:', {
        blobSize: blob.size,
        blobType: blob.type
      });
      
      const formData = new FormData();
      formData.append('image', blob, 'medical-photo.jpg');
      formData.append('procedureType', procedureType);
      formData.append('intensity', '65'); // Moderate intensity for realistic results
      
      console.log('إرسال الطلب إلى الخادم...');
      
      const apiResponse = await fetch('/api/generate-surgical-preview', {
        method: 'POST',
        body: formData,
      });
      
      console.log('استجابة الخادم:', {
        status: apiResponse.status,
        statusText: apiResponse.statusText
      });
      
      const result = await apiResponse.json();
      console.log('نتيجة المعالجة:', result);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (result.success && result.afterImageUrl) {
        onPreviewGenerated(result.afterImageUrl);
        
        // Show different messages based on processing method
        if (result.processingMethod === 'ai') {
          toast({
            title: "تم إنتاج المعاينة بالذكاء الاصطناعي",
            description: `تم إكمال تصور ${currentProcedure.name} باستخدام الذكاء الاصطناعي المتقدم`,
          });
        } else {
          toast({
            title: "تم إنتاج المعاينة بالمعالجة المحلية",
            description: `تم إكمال تصور ${currentProcedure.name} باستخدام المعالجة المحلية المتقدمة (خدمة الذكاء الاصطناعي غير متاحة حالياً)`,
          });
        }
      } else {
        throw new Error(result.error || 'Failed to generate preview');
      }

    } catch (error) {
      console.error('Error generating AI preview:', error);
      toast({
        title: "فشل في إنتاج المعاينة",
        description: "حدث خطأ في إنتاج المعاينة. قد تكون خدمة الذكاء الاصطناعي مؤقتاً غير متاحة. يرجى المحاولة مرة أخرى.",
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
          title: "اكتمل تحليل الصورة",
          description: `مناسبة لـ ${procedureType}. ${result.analysis.recommendations || 'جاهز لإنتاج المعاينة.'}`,
        });
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
    }
  };

  return (
    <div className="bg-gradient-to-br from-ai-purple/5 to-medical-blue/5 rounded-xl p-6 border border-ai-purple/20" dir="rtl">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-ai-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-ai-purple" />
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          توليد {currentProcedure.name} بالذكاء الاصطناعي
        </h3>
        <p className="text-sm text-slate-600 mb-2">
          {currentProcedure.description}
        </p>
        <p className="text-xs text-slate-500">
          الوقت المتوقع: {currentProcedure.estimatedTime}
        </p>
      </div>

      {/* Progress Bar */}
      {isGenerating && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>جاري إنتاج المعاينة...</span>
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
              <Loader2 className="ml-2 w-5 h-5 animate-spin" />
              جاري إنتاج المعاينة...
            </>
          ) : (
            <>
              <Wand2 className="ml-2 w-5 h-5" />
              إنتاج معاينة بالذكاء الاصطناعي
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
          <AlertCircle className="ml-2 w-4 h-4" />
          تحليل الصورة أولاً
        </Button>
      </div>

      {/* AI Disclaimer */}
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <h5 className="font-medium text-amber-800 mb-1 text-sm">إخلاء مسؤولية الذكاء الاصطناعي</h5>
        <p className="text-xs text-amber-700">
          المعاينات المولدة بالذكاء الاصطناعي هي تقديرات لأغراض الاستشارة فقط.
          قد تختلف النتائج الجراحية الفعلية بناءً على التشريح الفردي والشفاء وعوامل أخرى.
          استشر دائماً المهنيين الطبيين المؤهلين.
        </p>
      </div>
    </div>
  );
}