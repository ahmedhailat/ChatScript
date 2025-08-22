import React from 'react';
import ThreeDFacialModeling from '@/components/3d-facial-modeling';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from "wouter";
import { Home, ArrowRight, RotateCcw } from 'lucide-react';

export default function ThreeDModelingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" dir="rtl">
      {/* Header Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <a className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors">
                  <Home className="w-5 h-5" />
                  <span>الرئيسية</span>
                </a>
              </Link>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">النمذجة ثلاثية الأبعاد</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-purple-50">
                <RotateCcw className="w-3 h-3 ml-1" />
                تقنية التصوير المجسم
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            النمذجة ثلاثية الأبعاد للوجه
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            تحليل وجهك بتقنية ثلاثية الأبعاد متطورة لفهم شكل وجهك وتناسق ملامحك مع توصيات احترافية للتحسين
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">تحليل دقيق</h3>
              <p className="text-sm text-gray-600">
                تحليل 68+ نقطة مرجعية بدقة عالية لفهم تركيبة وجهك
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">نماذج متعددة</h3>
              <p className="text-sm text-gray-600">
                إطار سلكي، محكم، تشريحي، وجراحي بزوايا مختلفة
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">توصيات احترافية</h3>
              <p className="text-sm text-gray-600">
                نصائح مخصصة لتحسين الملامح بناءً على التحليل المفصل
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Component */}
        <ThreeDFacialModeling />

        {/* Additional Information */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>عن تقنية النمذجة ثلاثية الأبعاد</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-3">كيف تعمل التقنية؟</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• تحليل الصورة باستخدام الذكاء الاصطناعي</li>
                    <li>• كشف النقاط المرجعية الدقيقة على الوجه</li>
                    <li>• حساب النسب والأبعاد ثلاثية الأبعاد</li>
                    <li>• إنشاء نموذج مجسم تفاعلي</li>
                    <li>• تحليل التماثل والنسب الذهبية</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">الاستخدامات الطبية</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• التخطيط للعمليات التجميلية</li>
                    <li>• تحليل تناسق الوجه قبل الإجراءات</li>
                    <li>• توقع النتائج المحتملة</li>
                    <li>• تقييم الحاجة للتدخل الجراحي</li>
                    <li>• متابعة النتائج بعد العمليات</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 flex justify-center space-x-4">
          <Link href="/faceapp" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            استوديو تحرير الوجه
          </Link>
          <Link href="/communication" className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            بوابة التواصل الطبي
          </Link>
        </div>
      </div>
    </div>
  );
}