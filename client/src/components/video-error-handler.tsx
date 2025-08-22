import { useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VideoErrorHandlerProps {
  onRetry: () => void;
  videoSource?: string;
}

export function VideoErrorHandler({ onRetry, videoSource }: VideoErrorHandlerProps) {
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    onRetry();
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-orange-600" />
        </div>
        <CardTitle className="text-orange-800">مشكلة في تحميل الفيديو</CardTitle>
      </CardHeader>
      <CardContent className="text-center" dir="rtl">
        <p className="text-orange-700 mb-4">
          عذراً، حدثت مشكلة في تحميل الفيديو التعليمي. يمكنك المحاولة مرة أخرى أو الانتقال للتجربة التفاعلية.
        </p>
        
        <div className="space-y-3">
          <Button 
            onClick={handleRetry}
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            <RefreshCw className="w-4 h-4 ml-2" />
            إعادة المحاولة ({retryCount + 1})
          </Button>
          
          <div className="text-sm text-orange-600">
            <p>نصائح لحل المشكلة:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>تحقق من اتصال الإنترنت</li>
              <li>قم بتحديث الصفحة</li>
              <li>جرب متصفح مختلف</li>
              <li>استخدم التجربة التفاعلية بدلاً من ذلك</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}