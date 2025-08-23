import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Star, 
  Crown, 
  Zap, 
  Heart, 
  Camera,
  Video,
  Palette,
  Wand2,
  Settings,
  User,
  LogOut
} from "lucide-react";

export default function EnhancedHeader() {
  return (
    <header className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 text-white shadow-2xl relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-8 -left-4 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-8 left-20 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and branding */}
          <div className="flex items-center space-x-4 gap-4" dir="rtl">
            <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl shadow-lg">
              <Palette className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-300 to-blue-300 bg-clip-text text-transparent">
                MedVision AI Studio
              </h1>
              <p className="text-sm text-blue-200">
                استوديو المكياج والتجميل الذكي
              </p>
            </div>
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold">
              <Crown className="w-3 h-3 ml-1" />
              Pro
            </Badge>
          </div>

          {/* Navigation menu */}
          <nav className="hidden md:flex items-center space-x-8 gap-8">
            <a href="/" className="flex items-center space-x-2 gap-2 hover:text-pink-300 transition-colors">
              <Camera className="w-4 h-4" />
              <span>الرئيسية</span>
            </a>
            <a href="/faceapp" className="flex items-center space-x-2 gap-2 hover:text-pink-300 transition-colors">
              <Wand2 className="w-4 h-4" />
              <span>استوديو FaceApp</span>
            </a>
            <a href="/booking" className="flex items-center space-x-2 gap-2 hover:text-pink-300 transition-colors">
              <Heart className="w-4 h-4" />
              <span>حجز موعد</span>
            </a>
            <a href="/doctor-registration" className="flex items-center space-x-2 gap-2 hover:text-pink-300 transition-colors">
              <User className="w-4 h-4" />
              <span>انضم كطبيب</span>
            </a>
            <a href="/doctor-portal" className="flex items-center space-x-2 gap-2 hover:text-pink-300 transition-colors">
              <Wand2 className="w-4 h-4" />
              <span>منطقة الأطباء</span>
            </a>
            <a href="/patient-portal" className="flex items-center space-x-2 gap-2 hover:text-pink-300 transition-colors">
              <Heart className="w-4 h-4" />
              <span>منطقة المرضى</span>
            </a>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center space-x-4 gap-4">
            <a href="/login">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <User className="w-4 h-4 ml-2" />
                تسجيل الدخول
              </Button>
            </a>
            
            <a href="/register">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <Settings className="w-4 h-4 ml-2" />
                إنشاء حساب
              </Button>
            </a>
            
            <a href="/subscription">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-gradient-to-r from-pink-500 to-purple-500 border-white/20 text-white hover:bg-white/20"
              >
                <Crown className="w-4 h-4 ml-2" />
                الاشتراكات والدفع
              </Button>
            </a>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="py-4 border-t border-white/10">
          <div className="flex items-center justify-center space-x-8 gap-8">
            <div className="flex items-center space-x-2 gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-pink-300" />
              <span className="text-blue-200">مكياج مرئي فوري</span>
            </div>
            <div className="flex items-center space-x-2 gap-2 text-sm">
              <Star className="w-4 h-4 text-yellow-300" />
              <span className="text-blue-200">تحويلات العمر والجنس</span>
            </div>
            <div className="flex items-center space-x-2 gap-2 text-sm">
              <Heart className="w-4 h-4 text-red-300" />
              <span className="text-blue-200">تحسينات الجمال</span>
            </div>
            <div className="flex items-center space-x-2 gap-2 text-sm">
              <Zap className="w-4 h-4 text-purple-300" />
              <span className="text-blue-200">إعدادات احترافية</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}