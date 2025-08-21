import { useState } from "react";
import { Link } from "wouter";
import { Eye, EyeOff, Mail, Lock, User, Phone, Brain, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialty: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const specialties = [
    { value: "plastic-surgeon", label: "جراح تجميل" },
    { value: "dermatologist", label: "طبيب جلدية" },
    { value: "dentist", label: "طبيب أسنان" },
    { value: "orthodontist", label: "أخصائي تقويم أسنان" },
    { value: "facial-surgeon", label: "جراح وجه وفكين" },
    { value: "aesthetic-doctor", label: "طبيب تجميل غير جراحي" },
    { value: "nurse", label: "ممرض/ة متخصص" },
    { value: "other", label: "أخرى" },
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "خطأ في كلمة المرور",
        description: "كلمات المرور غير متطابقة",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "يرجى الموافقة على الشروط",
        description: "يجب الموافقة على شروط الخدمة للمتابعة",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate registration API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "مرحباً بك في MedVision AI. يرجى تفعيل حسابك عبر البريد الإلكتروني",
      });
      
      // Redirect to verification page
      window.location.href = "/verify-email";
    } catch (error) {
      toast({
        title: "خطأ في إنشاء الحساب",
        description: "حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue/10 via-ai-purple/5 to-slate-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-medical-blue rounded-2xl mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">إنشاء حساب جديد</h1>
          <p className="text-slate-600">انضم إلى مجتمع المهنيين الطبيين في MedVision AI</p>
        </div>

        {/* Registration Form */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center">ابدأ رحلتك المهنية</CardTitle>
            <CardDescription className="text-center">
              أدخل بياناتك لإنشاء حساب متخصص
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">الاسم الأول</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="firstName"
                      placeholder="الاسم الأول"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="pr-10 text-right"
                      required
                      data-testid="input-first-name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">الاسم الأخير</Label>
                  <Input
                    id="lastName"
                    placeholder="الاسم الأخير"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="text-right"
                    required
                    data-testid="input-last-name"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="doctor@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pr-10 text-right"
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+966 50 123 4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="pr-10 text-right"
                    required
                    data-testid="input-phone"
                  />
                </div>
              </div>

              {/* Specialty Field */}
              <div className="space-y-2">
                <Label htmlFor="specialty">التخصص الطبي</Label>
                <Select onValueChange={(value) => handleInputChange("specialty", value)} required>
                  <SelectTrigger className="text-right" data-testid="select-specialty">
                    <SelectValue placeholder="اختر تخصصك الطبي" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty.value} value={specialty.value}>
                        {specialty.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Password Fields */}
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="اكتب كلمة مرور قوية"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="أعد كتابة كلمة المرور"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="pr-10 pl-10 text-right"
                    required
                    data-testid="input-confirm-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-3 h-4 w-4 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start space-x-2 space-x-reverse">
                <input
                  id="terms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => handleInputChange("agreeToTerms", e.target.checked)}
                  className="rounded border-slate-300 mt-1"
                  required
                />
                <Label htmlFor="terms" className="text-sm leading-5">
                  أوافق على{" "}
                  <a href="/terms" className="text-medical-blue hover:underline">
                    شروط الخدمة
                  </a>{" "}
                  و{" "}
                  <a href="/privacy" className="text-medical-blue hover:underline">
                    سياسة الخصوصية
                  </a>{" "}
                  وأتعهد بالالتزام بمعايير HIPAA للخصوصية الطبية
                </Label>
              </div>

              {/* Register Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-medical-blue to-ai-purple hover:from-blue-700 hover:to-purple-700"
                disabled={isLoading}
                data-testid="button-register"
              >
                {isLoading ? (
                  "جاري إنشاء الحساب..."
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>إنشاء الحساب</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-slate-600">
                لديك حساب بالفعل؟{" "}
                <Link href="/login" className="text-medical-blue hover:underline font-medium">
                  تسجيل الدخول
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 gap-4">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <h3 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              ميزات المنصة المتقدمة
            </h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• ذكاء اصطناعي متقدم للتصور الجراحي</li>
              <li>• معايير HIPAA للأمان والخصوصية</li>
              <li>• أدوات تفاعلية للمكياج والتجميل</li>
              <li>• تقارير مفصلة ومشاركة آمنة للنتائج</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}