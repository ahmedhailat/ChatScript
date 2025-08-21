import React from 'react';
import CommunicationPortal from '@/components/communication-portal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from "wouter";
import { Home, ArrowRight, UserCog, Video, MessageSquare, FileText, Calendar } from 'lucide-react';

export default function CommunicationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50" dir="rtl">
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
              <span className="text-gray-700">بوابة التواصل الطبي</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-blue-50">
                <UserCog className="w-3 h-3 ml-1" />
                تواصل آمن ومحمي
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            بوابة التواصل بين الطبيب والمريض
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            منصة تواصل آمنة ومحمية للتشاور مع الأطباء المتخصصين، مع إمكانيات المراسلة الفورية ومكالمات الفيديو والمشاركة الآمنة للملفات الطبية
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">رسائل فورية</h3>
              <p className="text-sm text-gray-600">
                تواصل مباشر وآمن مع طبيبك المختص
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">مكالمات فيديو</h3>
              <p className="text-sm text-gray-600">
                استشارات طبية مرئية عالية الجودة
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">مشاركة الملفات</h3>
              <p className="text-sm text-gray-600">
                رفع ومشاركة التقارير والصور الطبية
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">جدولة المواعيد</h3>
              <p className="text-sm text-gray-600">
                حجز واختيار أوقات الاستشارات
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Component */}
        <CommunicationPortal />

        {/* Security and Privacy Information */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>الأمان والخصوصية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-3 text-green-600">الحماية والتشفير</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• تشفير تام لجميع الرسائل والملفات</li>
                    <li>• امتثال كامل لمعايير HIPAA الطبية</li>
                    <li>• حماية البيانات بأعلى معايير الأمان</li>
                    <li>• عدم تخزين المحادثات بدون موافقة</li>
                    <li>• خوادم محلية آمنة ومعتمدة</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3 text-blue-600">ميزات المنصة</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• تواصل مباشر مع الأطباء المعتمدين</li>
                    <li>• إمكانية إرسال الصور والتقارير</li>
                    <li>• تسجيل المكالمات للمراجعة (اختياري)</li>
                    <li>• تنبيهات المواعيد والمتابعة</li>
                    <li>• أرشيف شامل لتاريخ الاستشارات</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <div className="text-yellow-600 mt-0.5">⚠️</div>
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-1">تنبيه مهم</h4>
                    <p className="text-sm text-yellow-700">
                      هذه المنصة مخصصة للاستشارات الطبية غير العاجلة. في حالات الطوارئ الطبية، يرجى التوجه فوراً إلى أقرب مستشفى أو الاتصال بالطوارئ.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Doctor Information */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>الأطباء المتاحون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserCog className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-1">د. أحمد محمد</h3>
                    <p className="text-sm text-gray-600 mb-2">جراحة التجميل والترميم</p>
                    <Badge variant="outline" className="text-xs">
                      متاح الآن
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserCog className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-1">د. فاطمة أحمد</h3>
                    <p className="text-sm text-gray-600 mb-2">طب الأسنان التجميلي</p>
                    <Badge variant="secondary" className="text-xs">
                      متاح غداً
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserCog className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-1">د. محمد علي</h3>
                    <p className="text-sm text-gray-600 mb-2">جراحة الأنف والأذن</p>
                    <Badge variant="outline" className="text-xs">
                      متاح الآن
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 flex justify-center space-x-4">
          <Link href="/3d-modeling">
            <a className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              النمذجة ثلاثية الأبعاد
            </a>
          </Link>
          <Link href="/faceapp">
            <a className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              استوديو تحرير الوجه
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}