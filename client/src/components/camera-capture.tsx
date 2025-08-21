import { useRef, useState, useEffect } from "react";
import { Camera, Upload, FileImage, RotateCcw, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCamera } from "@/hooks/use-camera";

interface CameraCaptureProps {
  onImageCapture: (imageUrl: string) => void;
  beforeImage: string | null;
}

export default function CameraCapture({ onImageCapture, beforeImage }: CameraCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
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

  const handleTakePhoto = async () => {
    if (!isStreaming) {
      setShowCamera(true);
      await startCamera();
    } else {
      const photoData = capturePhoto();
      if (photoData) {
        onImageCapture(photoData);
        stopCamera();
        setShowCamera(false);
        toast({
          title: "Photo captured successfully",
          description: "Ready for AI analysis",
        });
      }
    }
  };

  const handleCancelCamera = () => {
    stopCamera();
    setShowCamera(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
        <Camera className="text-medical-blue mr-3 w-5 h-5" />
        Patient Photo Capture
      </h3>
      
      {/* Camera View */}
      {showCamera && (
        <div className="mb-6 bg-black rounded-lg overflow-hidden relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-64 object-cover"
            data-testid="camera-video-feed"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
            <Button
              onClick={handleTakePhoto}
              className="bg-medical-blue hover:bg-blue-700 text-white rounded-full w-16 h-16"
              data-testid="button-capture-photo"
            >
              <Camera className="w-6 h-6" />
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

      {/* Camera/Upload Area */}
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 transition-colors ${
          showCamera 
            ? "hidden"
            : `cursor-pointer ${
              isDragging 
                ? "border-medical-blue bg-blue-50" 
                : beforeImage 
                  ? "border-medical-success bg-green-50" 
                  : "border-slate-300 hover:border-medical-blue bg-slate-50"
            }`
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !showCamera && fileInputRef.current?.click()}
        data-testid="camera-upload-area"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
          data-testid="input-file-upload"
        />
        
        {beforeImage ? (
          <div className="space-y-4">
            <img 
              src={beforeImage} 
              alt="Patient photo" 
              className="w-32 h-32 object-cover rounded-lg mx-auto"
              data-testid="img-patient-before"
            />
            <p className="text-medical-success font-medium">Image uploaded successfully</p>
            <p className="text-sm text-slate-500">Click to upload a different image</p>
          </div>
        ) : (
          <>
            <FileImage className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 font-medium mb-2">Capture or Upload Patient Photo</p>
            <p className="text-sm text-slate-500 mb-4">Supports JPEG, PNG, DICOM formats</p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                className="bg-medical-blue hover:bg-blue-700"
                onClick={handleTakePhoto}
                data-testid="button-take-photo"
              >
                <Camera className="mr-2 w-4 h-4" />
                Take Photo
              </Button>
              <Button 
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                data-testid="button-upload-file"
              >
                <Upload className="mr-2 w-4 h-4" />
                Upload File
              </Button>
            </div>
          </>
        )}
      </div>
      
      {/* File Requirements */}
      <div className="text-xs text-slate-500 space-y-1">
        <p>• Maximum file size: 10MB</p>
        <p>• Recommended resolution: 1080x1080px or higher</p>
        <p>• Ensure good lighting and front-facing angle</p>
      </div>
    </div>
  );
}
