import { Shield, Lock, Award, CheckCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-12" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Medical Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
          <h4 className="font-semibold text-amber-800 mb-3 flex items-center">
            <Shield className="ml-2 w-5 h-5" />
            إخلاء مسؤولية طبية مهم
          </h4>
          <div className="text-sm text-amber-700 space-y-2">
            <p>• هذه أداة التصور بالذكاء الاصطناعي مخصصة للأغراض التعليمية والاستشارية فقط ولا تشكل نصيحة طبية.</p>
            <p>• النتائج المعروضة هي توقعات مولدة بواسطة الكمبيوتر وقد لا تعكس النتائج الجراحية الفعلية.</p>
            <p>• استشر دائماً المهنيين الطبيين المؤهلين قبل اتخاذ أي قرارات جراحية.</p>
            <p>• النتائج الفردية قد تختلف بناءً على التشريح وعملية الشفاء وعوامل طبية أخرى.</p>
          </div>
        </div>

        {/* Privacy & Compliance */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h5 className="font-semibold text-slate-900 mb-3">الخصوصية والأمان</h5>
            <ul className="text-sm text-slate-600 space-y-2">
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-medical-success ml-2" />
                متوافق مع معايير HIPAA
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-medical-success ml-2" />
                متوافق مع قانون GDPR
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-medical-success ml-2" />
                تشفير شامل من البداية للنهاية
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-medical-success ml-2" />
                تخزين بيانات آمن
              </li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold text-slate-900 mb-3">تقنية الذكاء الاصطناعي</h5>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>• نماذج ذكاء اصطناعي طبية الدرجة</li>
              <li>• مدربة على مجموعات بيانات موثقة</li>
              <li>• تحسين مستمر</li>
              <li>• اختبارات ضمان الجودة</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold text-slate-900 mb-3">الدعم</h5>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>• دعم تقني 24/7</li>
              <li>• تدريب المهنيين الطبيين</li>
              <li>• وثائق API</li>
              <li>• مساعدة في التكامل</li>
            </ul>
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-slate-200">
          <div className="flex items-center gap-6 text-sm text-slate-500 mb-4 sm:mb-0">
            <a href="#" className="hover:text-slate-700" data-testid="link-privacy-policy">سياسة الخصوصية</a>
            <a href="#" className="hover:text-slate-700" data-testid="link-terms-service">شروط الخدمة</a>
            <a href="#" className="hover:text-slate-700" data-testid="link-medical-disclaimer">إخلاء المسؤولية الطبية</a>
            <a href="#" className="hover:text-slate-700" data-testid="link-support">الدعم</a>
          </div>
          
          <div className="text-sm text-slate-500" data-testid="text-copyright">
            © 2024 MedVision AI. جميع الحقوق محفوظة.
          </div>
        </div>
      </div>
    </footer>
  );
}
