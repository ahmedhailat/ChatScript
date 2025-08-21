import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from "@/components/ui/badge";
import { 
  Smile, 
  Target,
  CheckCircle,
  Upload,
  Download,
  Undo2,
  Camera
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PrecisionLipDemoProps {
  initialImage?: string;
}

export default function PrecisionLipDemo({ initialImage }: PrecisionLipDemoProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string>(initialImage || '');
  const [selectedColor, setSelectedColor] = useState('#FF69B4');
  const [intensity, setIntensity] = useState([70]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string>('');
  
  const { toast } = useToast();

  // Professional lip colors
  const lipColors = [
    '#FF69B4', '#FF1493', '#DC143C', '#B22222', '#8B0000',
    '#FF6347', '#FF4500', '#FF7F50', '#FFA07A', '#F08080',
    '#D2B48C', '#DEB887', '#F5DEB3', '#FFDAB9', '#FFE4E1',
    '#9370DB', '#8B008B', '#BA55D3', '#DDA0DD', '#PLUM'
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setSelectedImage(imageUrl);
        setProcessedImage('');
      };
      reader.readAsDataURL(file);
    }
  };

  const applyPrecisionLipstick = async () => {
    if (!selectedImage) {
      toast({
        title: "لا توجد صورة",
        description: "يرجى رفع صورة أولاً",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Convert image to file
      let imageFile: File;
      
      if (selectedImage.startsWith('data:')) {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        imageFile = new File([blob], 'uploaded-image.jpg', { type: 'image/jpeg' });
      } else {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        imageFile = new File([blob], 'image.jpg', { type: 'image/jpeg' });
      }

      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('region', 'lips');
      formData.append('color', selectedColor);
      formData.append('intensity', intensity[0].toString());
      formData.append('texture', 'gloss');

      console.log(`🎨 Applying precision lipstick: ${selectedColor}, ${intensity[0]}%`);

      const result = await fetch('/api/apply-precision-makeup', {
        method: 'POST',
        body: formData
      });

      if (!result.ok) {
        throw new Error('فشل في تطبيق أحمر الشفاه الدقيق');
      }

      const makeupResult = await result.json();

      if (makeupResult.success) {
        setProcessedImage(makeupResult.processedImageUrl);
        
        toast({
          title: "✅ تم التطبيق بنجاح",
          description: "تم تطبيق أحمر الشفاه داخل الحدود فقط",
        });
      } else {
        throw new Error(makeupResult.error || 'فشل في تطبيق المكياج');
      }
      
    } catch (error) {
      console.error('Precision lipstick error:', error);
      toast({
        title: "خطأ في التطبيق",
        description: error instanceof Error ? error.message : 'خطأ غير معروف',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.download = `precision-lipstick-${Date.now()}.jpg`;
    link.href = processedImage;
    link.click();
    
    toast({
      title: "تم الحفظ بنجاح",
      description: "تم حفظ الصورة مع أحمر الشفاه الدقيق",
    });
  };

  const resetMakeup = () => {
    setProcessedImage('');
    setIntensity([70]);
    
    toast({
      title: "تم إعادة التعيين",
      description: "تم مسح المكياج المطبق",
    });
  };

  return (
    <Card className="p-6 max-w-6xl mx-auto" dir="rtl">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Target className="ml-2 w-6 h-6 text-pink-600" />
            تطبيق أحمر الشفاه بدقة متناهية
          </div>
          <Badge variant="outline" className="bg-gradient-to-r from-pink-50 to-red-50">
            <CheckCircle className="w-3 h-3 ml-1" />
            تقنية الحدود الدقيقة
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-0">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">رفع الصورة</h3>
            
            {!selectedImage ? (
              <div className="border-2 border-dashed border-pink-300 rounded-xl p-6 text-center bg-gradient-to-br from-pink-50 to-red-50">
                <Upload className="w-10 h-10 mx-auto text-pink-500 mb-3" />
                <h4 className="font-medium mb-2">اختر صورة وجه</h4>
                <p className="text-sm text-gray-600 mb-3">للحصول على أفضل النتائج</p>
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
                >
                  <Camera className="w-4 h-4 ml-1" />
                  اختيار صورة
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative bg-white rounded-xl border-2 border-pink-200 overflow-hidden">
                  <img 
                    src={selectedImage} 
                    alt="الصورة الأصلية" 
                    className="w-full h-auto max-h-64 object-contain"
                  />
                  <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                    الأصلية
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 ml-1" />
                  تغيير الصورة
                </Button>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Controls Section */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">التحكم في المكياج</h3>
            
            {/* Color Palette */}
            <div className="space-y-3">
              <h4 className="font-medium">ألوان الشفاه</h4>
              <div className="grid grid-cols-5 gap-2">
                {lipColors.map((color, index) => (
                  <button
                    key={index}
                    className={`w-10 h-10 rounded-full border-2 hover:scale-110 transition-all shadow-md ${
                      selectedColor === color ? 'ring-3 ring-pink-400 ring-offset-2' : 'hover:shadow-lg'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
              <div className="text-center">
                <span className="text-sm font-medium">اللون المختار: </span>
                <div 
                  className="inline-block w-6 h-6 rounded-full border ml-2"
                  style={{ backgroundColor: selectedColor }}
                />
              </div>
            </div>

            {/* Intensity Control */}
            <div className="space-y-3">
              <label className="block font-medium">
                شدة اللون: {intensity[0]}%
              </label>
              <Slider
                value={intensity}
                onValueChange={setIntensity}
                max={100}
                min={20}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>خفيف</span>
                <span>متوسط</span>
                <span>قوي</span>
              </div>
            </div>

            {/* Apply Button */}
            <Button 
              onClick={applyPrecisionLipstick}
              disabled={!selectedImage || isProcessing}
              className="w-full h-12 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full ml-2" />
                  جاري التطبيق...
                </>
              ) : (
                <>
                  <Smile className="w-5 h-5 ml-2" />
                  تطبيق أحمر الشفاه بدقة
                </>
              )}
            </Button>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                onClick={resetMakeup}
                disabled={!processedImage}
                size="sm"
              >
                <Undo2 className="w-4 h-4 ml-1" />
                إعادة تعيين
              </Button>
              
              <Button 
                variant="outline"
                onClick={downloadResult}
                disabled={!processedImage}
                size="sm"
              >
                <Download className="w-4 h-4 ml-1" />
                حفظ النتيجة
              </Button>
            </div>
          </div>

          {/* Result Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">النتيجة</h3>
            
            {processedImage ? (
              <div className="relative bg-white rounded-xl border-2 border-green-200 overflow-hidden">
                <img 
                  src={processedImage} 
                  alt="النتيجة النهائية" 
                  className="w-full h-auto max-h-64 object-contain"
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                  ✓ مع المكياج
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50">
                <Smile className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600">ستظهر النتيجة هنا</p>
                <p className="text-sm text-gray-500 mt-1">بعد تطبيق المكياج</p>
              </div>
            )}
            
            {processedImage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center text-green-800">
                  <CheckCircle className="w-4 h-4 ml-2" />
                  <span className="font-medium">تم تطبيق المكياج بدقة</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  أحمر الشفاه مطبق داخل حدود الشفاه فقط
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}