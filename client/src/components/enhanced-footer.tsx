import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { 
  Heart, 
  Star, 
  Sparkles, 
  Crown, 
  Shield, 
  Zap,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube
} from "lucide-react";

export default function EnhancedFooter() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8" dir="rtl">
          {/* Company info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 gap-3">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">MedVision AI</h3>
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black">
                  <Crown className="w-3 h-3 ml-1" />
                  Professional
                </Badge>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              منصة الذكاء الاصطناعي الرائدة للتصور الطبي وتطبيقات المكياج الاحترافية. 
              تقنية متقدمة لتحويل الوجه وتحسين الجمال بدقة طبية عالية.
            </p>
            <div className="flex space-x-4 gap-4">
              <Button variant="ghost" size="sm" className="text-blue-300 hover:text-white">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-blue-300 hover:text-white">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-pink-300 hover:text-white">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-red-300 hover:text-white">
                <Youtube className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold flex items-center">
              <Star className="w-5 h-5 ml-2 text-yellow-400" />
              المميزات الرئيسية
            </h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center">
                <Heart className="w-4 h-4 ml-2 text-pink-400" />
                مكياج مرئي فوري
              </li>
              <li className="flex items-center">
                <Zap className="w-4 h-4 ml-2 text-purple-400" />
                تحويلات العمر والجنس
              </li>
              <li className="flex items-center">
                <Sparkles className="w-4 h-4 ml-2 text-blue-400" />
                تحسينات الجمال الذكية
              </li>
              <li className="flex items-center">
                <Shield className="w-4 h-4 ml-2 text-green-400" />
                متوافق مع معايير HIPAA
              </li>
              <li className="flex items-center">
                <Crown className="w-4 h-4 ml-2 text-yellow-400" />
                إعدادات احترافية متقدمة
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">خدماتنا المتخصصة</h4>
            <ul className="space-y-2 text-gray-300">
              <li>• التصور الجراحي بالذكاء الاصطناعي</li>
              <li>• استوديو المكياج الاحترافي</li>
              <li>• تحليل الوجه والملامح</li>
              <li>• استشارات طبية تجميلية</li>
              <li>• تدريب وورش عمل</li>
              <li>• دعم فني متخصص</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">تواصل معنا</h4>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-center">
                <Mail className="w-4 h-4 ml-2 text-blue-400" />
                support@medvision-ai.com
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 ml-2 text-green-400" />
                +966 11 123 4567
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 ml-2 text-red-400" />
                الرياض، المملكة العربية السعودية
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <Link href="/booking">
                <Button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700">
                  <Mail className="w-4 h-4 ml-2" />
                  ابدأ استشارة مجانية
                </Button>
              </Link>
              
              <Link href="/doctor-registration">
                <Button variant="outline" className="w-full border-purple-500 text-purple-300 hover:bg-purple-600 hover:text-white">
                  <Shield className="w-4 h-4 ml-2" />
                  انضم كطبيب
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-6 gap-6 mb-4 md:mb-0">
              <div className="flex items-center space-x-2 gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">محمي بتشفير SSL</span>
              </div>
              <div className="flex items-center space-x-2 gap-2">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-sm text-gray-300">صُنع بحب في السعودية</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-400">
              © 2025 MedVision AI. جميع الحقوق محفوظة.
            </div>
          </div>

          {/* Performance stats */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-pink-400">98.3%</div>
              <div className="text-xs text-gray-300">دقة مطابقة الألوان</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">468</div>
              <div className="text-xs text-gray-300">نقطة تتبع الوجه</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">50+</div>
              <div className="text-xs text-gray-300">تأثير مكياج احترافي</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-green-400">24/7</div>
              <div className="text-xs text-gray-300">دعم فني متواصل</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}