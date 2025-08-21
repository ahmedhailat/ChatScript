import { useRef, useState, useEffect } from "react";
import { Camera, Upload, FileImage, RotateCcw, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCamera } from "@/hooks/use-camera";

interface ArabicCameraCaptureProps {
  onImageCapture: (imageUrl: string) => void;
  beforeImage: string | null;
}

export default function ArabicCameraCapture({ onImageCapture, beforeImage }: ArabicCameraCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const { toast } = useToast();
  const { videoRef, canvasRef, isStreaming, error, startCamera, stopCamera, capturePhoto } = useCamera();

  // Auto-hide camera error after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setShowCamera(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "نوع ملف غير صحيح",
        description: "يرجى رفع ملف صورة صالح (JPEG, PNG)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "الملف كبير جداً",
        description: "يرجى رفع صورة أصغر من 10 ميجابايت",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageCapture(e.target.result as string);
        toast({
          title: "تم رفع الصورة بنجاح",
          description: "جاهزة للتحليل بالذكاء الاصطناعي",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const startCameraCapture = async () => {
    try {
      setShowCamera(true);
      await startCamera();
      toast({
        title: "تم تشغيل الكاميرا",
        description: "اضغط على زر التقاط الصورة عندما تكون جاهزاً",
      });
    } catch (err) {
      console.error('Camera access error:', err);
      toast({
        title: "تم رفض الوصول للكاميرا",
        description: "يرجى السماح للكاميرا بالوصول والمحاولة مرة أخرى",
        variant: "destructive",
      });
      setShowCamera(false);
    }
  };

  const handleCameraCapture = async () => {
    if (isCapturing) return;
    
    setIsCapturing(true);
    try {
      const imageUrl = capturePhoto();
      if (imageUrl) {
        onImageCapture(imageUrl);
        setShowCamera(false);
        stopCamera();
        toast({
          title: "تم التقاط الصورة بنجاح",
          description: "جاهزة للتحليل بالذكاء الاصطناعي",
        });
      } else {
        toast({
          title: "خطأ في التقاط الصورة",
          description: "يرجى المحاولة مرة أخرى",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Camera capture error:', err);
      toast({
        title: "خطأ في الكاميرا",
        description: "تعذر التقاط الصورة، يرجى استخدام الرفع بدلاً من ذلك",
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const handleCancelCamera = () => {
    stopCamera();
    setShowCamera(false);
  };

  const handleRetakePhoto = () => {
    onImageCapture("");
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6" dir="rtl">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
        <Camera className="text-medical-blue ml-3 w-5 h-5" />
        التقاط صورة المريض
      </h3>
      
      {/* Camera View */}
      {showCamera && (
        <div className="mb-6 bg-black rounded-lg overflow-hidden relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 object-cover"
            data-testid="camera-video-feed"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {error && (
            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
              <div className="text-center text-white p-4">
                <p className="font-medium">خطأ في الكاميرا</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
            <Button
              onClick={handleCameraCapture}
              disabled={isCapturing || !!error}
              className="bg-medical-blue hover:bg-blue-700 text-white rounded-full w-16 h-16"
              data-testid="button-capture-photo"
            >
              {isCapturing ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-6 h-6" />
              )}
            </Button>
            <Button
              onClick={handleCancelCamera}
              variant="outline"
              className="bg-white/90 hover:bg-white rounded-full w-16 h-16"
              data-testid="button-cancel-camera"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {beforeImage && (
        <div className="mb-6 relative">
          <img 
            src={beforeImage} 
            alt="صورة المريض المرفوعة" 
            className="w-full max-w-md mx-auto rounded-lg shadow-sm border"
          />
          <div className="absolute top-2 right-2">
            <Button
              onClick={handleRetakePhoto}
              size="sm"
              variant="secondary"
              className="bg-white/90 hover:bg-white"
              data-testid="button-retake-photo"
            >
              <RotateCcw className="w-4 h-4 ml-1" />
              إعادة التقاط
            </Button>
          </div>
          <div className="absolute top-2 left-2">
            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
              <CheckCircle className="w-3 h-3 ml-1" />
              تم الرفع
            </div>
          </div>
        </div>
      )}

      {/* Upload Options */}
      {!beforeImage && (
        <>
          {/* Drag and Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-medical-blue bg-blue-50' 
                : 'border-slate-300 hover:border-slate-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            data-testid="drop-zone"
          >
            <FileImage className="mx-auto w-12 h-12 text-slate-400 mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-2">
              اسحب وأفلت صورة هنا
            </p>
            <p className="text-sm text-slate-500 mb-4">
              أو استخدم أحد الخيارات أدناه
            </p>
            
            <div className="flex gap-3 justify-center flex-wrap">
              <Button 
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex items-center gap-2"
                data-testid="button-upload-file"
              >
                <Upload className="w-4 h-4" />
                رفع ملف
              </Button>
              
              <Button 
                onClick={startCameraCapture}
                disabled={showCamera}
                className="bg-medical-blue hover:bg-blue-700 text-white flex items-center gap-2"
                data-testid="button-start-camera"
              >
                <Camera className="w-4 h-4" />
                {showCamera ? 'الكاميرا نشطة' : 'تشغيل الكاميرا'}
              </Button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            data-testid="file-input"
          />

          {/* File Requirements */}
          <div className="mt-4 text-xs text-slate-500 text-center">
            <p>أنواع الملفات المدعومة: JPEG, PNG, GIF</p>
            <p>الحد الأقصى لحجم الملف: 10 ميجابايت</p>
          </div>
        </>
      )}
    </div>
  );
}