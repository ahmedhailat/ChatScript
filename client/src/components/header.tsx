import { useState } from "react";
import { Brain, User, LogOut, Settings, CreditCard } from "lucide-react";
import { Link } from "wouter";

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // This will be managed by auth context later

  return (
    <header className="bg-white shadow-sm border-b border-slate-200" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-medical-blue rounded-lg flex items-center justify-center">
              <Brain className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">MedVision AI</h1>
              <p className="text-xs text-slate-500">منصة التصور الجراحي المتقدمة</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors">
                الرئيسية
              </Link>
              <Link href="/tutorial" className="text-slate-600 hover:text-slate-900 transition-colors">
                فيديو الشرح
              </Link>
              <Link href="/subscription" className="text-slate-600 hover:text-slate-900 transition-colors">
                خطط الاشتراك
              </Link>
            </nav>

            {/* User Authentication */}
            {isLoggedIn ? (
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                  data-testid="button-user-menu"
                >
                  <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    د. أحمد الراشد
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
                    <div className="py-1">
                      <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <Settings className="w-4 h-4" />
                        إعدادات الحساب
                      </Link>
                      <Link href="/subscription" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <CreditCard className="w-4 h-4" />
                        الاشتراك والفوترة
                      </Link>
                      <hr className="my-1" />
                      <button className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-right">
                        <LogOut className="w-4 h-4" />
                        تسجيل الخروج
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="no-underline">
                  <button className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors">
                    تسجيل الدخول
                  </button>
                </Link>
                <Link href="/register" className="no-underline">
                  <button className="px-4 py-2 bg-medical-blue text-white rounded-lg hover:bg-blue-700 transition-colors">
                    إنشاء حساب
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
