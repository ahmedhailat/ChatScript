import { useState } from "react";
import { Link } from "wouter";
import { Check, Crown, Zap, Star, ArrowRight, Brain, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  icon: React.ReactNode;
  popular?: boolean;
  badge?: string;
  features: PlanFeature[];
}

export default function SubscriptionPage() {
  const [isYearly, setIsYearly] = useState(false);

  const plans: SubscriptionPlan[] = [
    {
      id: "basic",
      name: "الباقة الأساسية",
      description: "مثالية للأطباء المبتدئين في التصور الرقمي",
      monthlyPrice: 99,
      yearlyPrice: 990,
      icon: <Zap className="w-6 h-6" />,
      features: [
        { text: "50 عملية تصور شهرياً", included: true },
        { text: "أدوات المكياج الأساسية", included: true },
        { text: "تخزين الصور (500 MB)", included: true },
        { text: "دعم عبر البريد الإلكتروني", included: true },
        { text: "قوالب تقارير أساسية", included: true },
        { text: "AI متقدم للتصور", included: false },
        { text: "تحليلات مفصلة", included: false },
        { text: "دعم فوري 24/7", included: false },
      ],
    },
    {
      id: "professional",
      name: "الباقة الاحترافية",
      description: "الخيار الأمثل للعيادات والممارسين المتخصصين",
      monthlyPrice: 199,
      yearlyPrice: 1990,
      icon: <Crown className="w-6 h-6" />,
      popular: true,
      badge: "الأكثر شعبية",
      features: [
        { text: "200 عملية تصور شهرياً", included: true },
        { text: "جميع أدوات المكياج المتقدمة", included: true },
        { text: "تخزين الصور (5 GB)", included: true },
        { text: "AI متقدم للتصور", included: true },
        { text: "تحليلات وتقارير مفصلة", included: true },
        { text: "دعم فوري عبر الدردشة", included: true },
        { text: "قوالب تقارير احترافية", included: true },
        { text: "مشاركة آمنة مع المرضى", included: true },
        { text: "تدريب وورش عمل", included: false },
      ],
    },
    {
      id: "enterprise",
      name: "باقة المؤسسات",
      description: "حلول شاملة للمستشفيات والمراكز الطبية الكبيرة",
      monthlyPrice: 499,
      yearlyPrice: 4990,
      icon: <Star className="w-6 h-6" />,
      badge: "للمؤسسات",
      features: [
        { text: "عمليات تصور غير محدودة", included: true },
        { text: "جميع الميزات والأدوات", included: true },
        { text: "تخزين غير محدود", included: true },
        { text: "AI متقدم مع تخصيص", included: true },
        { text: "تحليلات متقدمة ولوحة تحكم", included: true },
        { text: "دعم فوري 24/7 مخصص", included: true },
        { text: "إدارة متعددة المستخدمين", included: true },
        { text: "تدريب وورش عمل مخصصة", included: true },
        { text: "API مخصص وتكامل", included: true },
      ],
    },
  ];

  const getPrice = (plan: SubscriptionPlan) => {
    return isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const getSavings = (plan: SubscriptionPlan) => {
    const monthlyCost = plan.monthlyPrice * 12;
    const yearlyCost = plan.yearlyPrice;
    return Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue/5 via-white to-ai-purple/5" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-medical-blue rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">خطط الاشتراك</h1>
                <p className="text-slate-600">اختر الباقة المناسبة لاحتياجاتك المهنية</p>
              </div>
            </div>
            <Link href="/" className="no-underline">
              <Button variant="outline">العودة للرئيسية</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Billing Toggle */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-4 bg-white rounded-full p-2 shadow-sm border">
            <Label htmlFor="billing-toggle" className={`px-4 py-2 rounded-full transition-colors ${!isYearly ? 'bg-medical-blue text-white' : 'text-slate-600'}`}>
              شهري
            </Label>
            <Switch
              id="billing-toggle"
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <Label htmlFor="billing-toggle" className={`px-4 py-2 rounded-full transition-colors ${isYearly ? 'bg-medical-blue text-white' : 'text-slate-600'}`}>
              سنوي
            </Label>
          </div>
          {isYearly && (
            <p className="text-sm text-green-600 mt-2 font-medium">
              وفر حتى 20% مع الدفع السنوي
            </p>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular 
                  ? 'border-2 border-medical-blue shadow-xl scale-105' 
                  : 'border border-slate-200 hover:shadow-lg'
              } transition-all duration-300`}
            >
              {plan.badge && (
                <Badge 
                  className={`absolute -top-3 right-6 ${
                    plan.popular ? 'bg-medical-blue' : 'bg-ai-purple'
                  }`}
                >
                  {plan.badge}
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                  plan.popular ? 'bg-medical-blue text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {plan.icon}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-sm leading-5">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center">
                {/* Pricing */}
                <div className="mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-slate-900">
                      {getPrice(plan).toLocaleString()}
                    </span>
                    <span className="text-slate-600">ريال</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {isYearly ? 'سنوياً' : 'شهرياً'}
                  </p>
                  {isYearly && (
                    <p className="text-xs text-green-600 mt-1">
                      وفر {getSavings(plan)}% سنوياً
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8 text-right">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        feature.included 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                        {feature.included ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <span className="w-2 h-2 bg-slate-300 rounded-full" />
                        )}
                      </div>
                      <span className={`text-sm ${
                        feature.included ? 'text-slate-900' : 'text-slate-400'
                      }`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  className={`w-full ${
                    plan.popular
                      ? 'bg-gradient-to-r from-medical-blue to-ai-purple hover:from-blue-700 hover:to-purple-700'
                      : 'bg-slate-900 hover:bg-slate-800'
                  }`}
                  asChild
                >
                  <Link href={`/payment?plan=${plan.id}&billing=${isYearly ? 'yearly' : 'monthly'}`}>
                    <div className="flex items-center justify-center gap-2">
                      <span>اشتراك الآن</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-slate-900">أمان متقدم</h3>
            <p className="text-sm text-slate-600">
              معايير HIPAA والتشفير الكامل لحماية بيانات المرضى
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900">دعم متخصص</h3>
            <p className="text-sm text-slate-600">
              فريق دعم طبي متخصص متاح 24/7 لمساعدتك
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900">ذكاء اصطناعي متطور</h3>
            <p className="text-sm text-slate-600">
              أحدث تقنيات الذكاء الاصطناعي للتصور الطبي الدقيق
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">أسئلة شائعة</h2>
          <div className="max-w-3xl mx-auto text-right">
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">هل يمكنني تغيير خطة الاشتراك لاحقاً؟</h3>
                <p className="text-slate-600 text-sm">
                  نعم، يمكنك ترقية أو تقليل خطة اشتراكك في أي وقت. التغييرات ستدخل حيز التنفيذ في بداية دورة الفوترة التالية.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">هل توجد فترة تجريبية مجانية؟</h3>
                <p className="text-slate-600 text-sm">
                  نعم، نوفر فترة تجريبية مجانية لمدة 14 يوماً لجميع الخطط. لا حاجة لبطاقة ائتمان للبدء.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">هل البيانات آمنة ومحمية؟</h3>
                <p className="text-slate-600 text-sm">
                  نحن ملتزمون بمعايير HIPAA الصارمة ونستخدم تشفير AES-256 لحماية جميع البيانات الطبية والشخصية.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}