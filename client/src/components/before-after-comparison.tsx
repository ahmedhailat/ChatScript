import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Download, 
  Share2, 
  RotateCcw,
  Maximize2,
  ArrowLeftRight,
  Camera
} from 'lucide-react';

interface BeforeAfterComparisonProps {
  beforeImage: string;
  afterImage: string;
  effectName: string;
  effectDetails: any;
}

export default function BeforeAfterComparison({ 
  beforeImage, 
  afterImage, 
  effectName, 
  effectDetails 
}: BeforeAfterComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSliderMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const downloadComparison = async () => {
    try {
      // Create a canvas to combine both images
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const beforeImg = new Image();
      const afterImg = new Image();
      
      await Promise.all([
        new Promise((resolve) => {
          beforeImg.onload = resolve;
          beforeImg.src = beforeImage;
        }),
        new Promise((resolve) => {
          afterImg.onload = resolve;
          afterImg.src = afterImage;
        })
      ]);
      
      canvas.width = beforeImg.width * 2 + 20; // Extra space for divider
      canvas.height = beforeImg.height + 100; // Extra space for labels
      
      // White background
      ctx!.fillStyle = '#ffffff';
      ctx!.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw before image
      ctx!.drawImage(beforeImg, 0, 50, beforeImg.width, beforeImg.height);
      
      // Draw after image
      ctx!.drawImage(afterImg, beforeImg.width + 20, 50, afterImg.width, afterImg.height);
      
      // Add labels
      ctx!.fillStyle = '#333333';
      ctx!.font = 'bold 24px Arial';
      ctx!.textAlign = 'center';
      ctx!.fillText('قبل', beforeImg.width / 2, 30);
      ctx!.fillText('بعد', beforeImg.width + 20 + afterImg.width / 2, 30);
      
      // Add effect name
      ctx!.font = '18px Arial';
      ctx!.fillText(`تأثير: ${effectName}`, canvas.width / 2, canvas.height - 20);
      
      // Download
      const link = document.createElement('a');
      link.download = `faceapp-comparison-${effectName}-${Date.now()}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
      
    } catch (error) {
      console.error('Error creating comparison image:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            مقارنة قبل وبعد
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => setIsFullScreen(!isFullScreen)}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="secondary"
              onClick={downloadComparison}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge className="bg-white text-green-600">
            {effectName}
          </Badge>
          {effectDetails.intensity && (
            <Badge variant="outline" className="border-white text-white">
              {effectDetails.intensity}% شدة
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div 
          className={`relative overflow-hidden ${
            isFullScreen ? 'fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center' : ''
          }`}
        >
          <div 
            ref={containerRef}
            className={`relative cursor-ew-resize select-none ${
              isFullScreen ? 'max-w-4xl max-h-screen' : 'aspect-square'
            }`}
            onMouseMove={handleSliderMove}
            onClick={handleSliderMove}
          >
            {/* Before Image (Full) */}
            <img 
              src={beforeImage} 
              alt="صورة قبل التعديل"
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* After Image (Clipped) */}
            <div 
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
            >
              <img 
                src={afterImage} 
                alt="صورة بعد التعديل"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Slider Line */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10 cursor-ew-resize"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg">
                <ArrowLeftRight className="w-4 h-4 text-gray-600" />
              </div>
            </div>
            
            {/* Labels */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-sm font-medium">
              قبل
            </div>
            <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-sm font-medium">
              بعد
            </div>
            
            {/* Percentage Indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-sm">
              {Math.round(sliderPosition)}% / {Math.round(100 - sliderPosition)}%
            </div>
          </div>
          
          {isFullScreen && (
            <Button 
              className="absolute top-4 right-4 z-50"
              variant="secondary"
              onClick={() => setIsFullScreen(false)}
            >
              إغلاق
            </Button>
          )}
        </div>
        
        {/* Controls */}
        <div className="p-4 space-y-4">
          {/* Slider Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>قبل</span>
              <span className="font-medium">{Math.round(sliderPosition)}% / {Math.round(100 - sliderPosition)}%</span>
              <span>بعد</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setSliderPosition(0)}
              className="flex-1"
            >
              عرض الأصلية
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setSliderPosition(50)}
              className="flex-1"
            >
              50/50
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setSliderPosition(100)}
              className="flex-1"
            >
              عرض المعدلة
            </Button>
          </div>
          
          {/* Effect Details */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-semibold mb-2">تفاصيل التأثير</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">النوع:</span>
                <span className="ml-2 font-medium">{effectName}</span>
              </div>
              {effectDetails.color && (
                <div>
                  <span className="text-gray-600">اللون:</span>
                  <div className="inline-flex items-center gap-2 ml-2">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: effectDetails.color }}
                    />
                    <span className="font-mono text-xs">{effectDetails.color}</span>
                  </div>
                </div>
              )}
              {effectDetails.intensity && (
                <div>
                  <span className="text-gray-600">الشدة:</span>
                  <span className="ml-2 font-medium">{effectDetails.intensity}%</span>
                </div>
              )}
              <div>
                <span className="text-gray-600">الجودة:</span>
                <span className="ml-2 font-medium">احترافية</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
              <Download className="w-4 h-4 mr-2" />
              تحميل المقارنة
            </Button>
            <Button variant="outline" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              مشاركة
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}