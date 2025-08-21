import { useState } from "react";
import { Link } from "wouter";
import { Eye, EyeOff, Mail, Lock, Brain, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate login API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك في MedVision AI",
      });
      
      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue/10 via-ai-purple/5 to-slate-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-medical-blue rounded-2xl mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">تسجيل الدخول</h1>
          <p className="text-slate-600">ادخل إلى حسابك في MedVision AI</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center">مرحباً بعودتك</CardTitle>
            <CardDescription className="text-center">
              أدخل بياناتك لتسجيل الدخول إلى حسابك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="اكتب بريدك الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-10 text-right"
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Link href="/forgot-password" className="text-sm text-medical-blue hover:underline">
                    نسيت كلمة المرور؟
                  </Link>
                  <Label htmlFor="password">كلمة المرور</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="اكتب كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 pl-10 text-right"
                    required
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-3 h-4 w-4 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Login Button */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    id="remember"
                    type="checkbox"
                    className="rounded border-slate-300"
                  />
                  <Label htmlFor="remember" className="text-sm">
                    تذكرني
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-medical-blue to-ai-purple hover:from-blue-700 hover:to-purple-700"
                  disabled={isLoading}
                  data-testid="button-login"
                >
                  {isLoading ? (
                    "جاري تسجيل الدخول..."
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>تسجيل الدخول</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">أو</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="space-y-2">
              <Button variant="outline" className="w-full" type="button">
                <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                تسجيل الدخول باستخدام Google
              </Button>
              
              <Button variant="outline" className="w-full" type="button">
                <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                تسجيل الدخول باستخدام Facebook
              </Button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-slate-600">
                ليس لديك حساب؟{" "}
                <Link href="/register" className="text-medical-blue hover:underline font-medium">
                  أنشئ حساباً جديداً
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-500">
            بتسجيل الدخول، أنت توافق على{" "}
            <a href="/terms" className="text-medical-blue hover:underline">
              شروط الخدمة
            </a>{" "}
            و{" "}
            <a href="/privacy" className="text-medical-blue hover:underline">
              سياسة الخصوصية
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}