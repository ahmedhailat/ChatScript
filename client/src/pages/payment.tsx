import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { CreditCard, Lock, Shield, ArrowRight, CheckCircle, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface PaymentData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
  billingAddress: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
}

export default function PaymentPage() {
  const [location] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardholderName: "",
    billingAddress: {
      street: "",
      city: "",
      zipCode: "",
      country: "SA",
    },
  });
  const { toast } = useToast();

  // Extract plan info from URL params
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const planId = urlParams.get('plan') || 'professional';
  const billing = urlParams.get('billing') || 'monthly';

  const planDetails = {
    basic: {
      name: "الباقة الأساسية",
      monthlyPrice: 99,
      yearlyPrice: 990,
      features: ["50 عملية تصور شهرياً", "أدوات المكياج الأساسية", "دعم عبر البريد الإلكتروني"],
    },
    professional: {
      name: "الباقة الاحترافية",
      monthlyPrice: 199,
      yearlyPrice: 1990,
      features: ["200 عملية تصور شهرياً", "جميع أدوات المكياج المتقدمة", "AI متقدم للتصور", "دعم فوري"],
    },
    enterprise: {
      name: "باقة المؤسسات",
      monthlyPrice: 499,
      yearlyPrice: 4990,
      features: ["عمليات تصور غير محدودة", "جميع الميزات والأدوات", "دعم مخصص 24/7", "API مخصص"],
    },
  };

  const selectedPlan = planDetails[planId as keyof typeof planDetails] || planDetails.professional;
  const price = billing === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice;
  const vatAmount = Math.round(price * 0.15); // 15% VAT
  const totalAmount = price + vatAmount;

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('billingAddress.')) {
      const addressField = field.split('.')[1];
      setPaymentData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [addressField]: value,
        },
      }));
    } else {
      setPaymentData(prev => ({ ...prev, [field]: value }));
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    handleInputChange('cardNumber', formatted);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "تم الدفع بنجاح!",
        description: `تم تفعيل ${selectedPlan.name} لحسابك`,
      });
      
      // Redirect to success page
      window.location.href = "/payment-success";
    } catch (error) {
      toast({
        title: "فشل في عملية الدفع",
        description: "يرجى التحقق من بيانات البطاقة والمحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const months = [
    "01", "02", "03", "04", "05", "06",
    "07", "08", "09", "10", "11", "12"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear + i).toString());

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
                <h1 className="text-2xl font-bold text-slate-900">إتمام الدفع</h1>
                <p className="text-slate-600">دفع آمن ومشفر بمعايير عالمية</p>
              </div>
            </div>
            <Link href="/subscription" className="no-underline">
              <Button variant="outline">العودة للخطط</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5" />
                  معلومات الدفع
                </CardTitle>
                <CardDescription>
                  جميع المعلومات مشفرة وآمنة بمعايير PCI DSS
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePayment} className="space-y-6">
                  {/* Card Information */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-slate-900">بيانات البطاقة</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">رقم البطاقة</Label>
                      <div className="relative">
                        <CreditCard className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={paymentData.cardNumber}
                          onChange={handleCardNumberChange}
                          className="pr-10 text-right"
                          maxLength={19}
                          required
                          data-testid="input-card-number"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryMonth">الشهر</Label>
                        <Select onValueChange={(value) => handleInputChange('expiryMonth', value)} required>
                          <SelectTrigger data-testid="select-expiry-month">
                            <SelectValue placeholder="الشهر" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month} value={month}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="expiryYear">السنة</Label>
                        <Select onValueChange={(value) => handleInputChange('expiryYear', value)} required>
                          <SelectTrigger data-testid="select-expiry-year">
                            <SelectValue placeholder="السنة" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cvv">رمز الأمان</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={paymentData.cvv}
                          onChange={(e) => handleInputChange('cvv', e.target.value)}
                          className="text-center"
                          maxLength={4}
                          required
                          data-testid="input-cvv"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardholderName">اسم حامل البطاقة</Label>
                      <Input
                        id="cardholderName"
                        placeholder="الاسم كما هو مكتوب على البطاقة"
                        value={paymentData.cardholderName}
                        onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                        className="text-right"
                        required
                        data-testid="input-cardholder-name"
                      />
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-slate-900">عنوان الفوترة</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="street">العنوان</Label>
                      <Input
                        id="street"
                        placeholder="اكتب عنوانك بالتفصيل"
                        value={paymentData.billingAddress.street}
                        onChange={(e) => handleInputChange('billingAddress.street', e.target.value)}
                        className="text-right"
                        required
                        data-testid="input-street"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">المدينة</Label>
                        <Input
                          id="city"
                          placeholder="الرياض"
                          value={paymentData.billingAddress.city}
                          onChange={(e) => handleInputChange('billingAddress.city', e.target.value)}
                          className="text-right"
                          required
                          data-testid="input-city"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">الرمز البريدي</Label>
                        <Input
                          id="zipCode"
                          placeholder="12345"
                          value={paymentData.billingAddress.zipCode}
                          onChange={(e) => handleInputChange('billingAddress.zipCode', e.target.value)}
                          className="text-center"
                          required
                          data-testid="input-zip-code"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">البلد</Label>
                      <Select 
                        value={paymentData.billingAddress.country}
                        onValueChange={(value) => handleInputChange('billingAddress.country', value)}
                        required
                      >
                        <SelectTrigger data-testid="select-country">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SA">المملكة العربية السعودية</SelectItem>
                          <SelectItem value="AE">الإمارات العربية المتحدة</SelectItem>
                          <SelectItem value="KW">الكويت</SelectItem>
                          <SelectItem value="QA">قطر</SelectItem>
                          <SelectItem value="BH">البحرين</SelectItem>
                          <SelectItem value="OM">عمان</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Payment Button */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-medical-blue to-ai-purple hover:from-blue-700 hover:to-purple-700 text-lg py-3"
                    disabled={isProcessing}
                    data-testid="button-pay-now"
                  >
                    {isProcessing ? (
                      "جاري معالجة الدفع..."
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span>ادفع {totalAmount.toLocaleString()} ريال الآن</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 shadow-lg border-0">
              <CardHeader>
                <CardTitle>ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Plan Details */}
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <h3 className="font-medium text-slate-900">{selectedPlan.name}</h3>
                    <p className="text-sm text-slate-600">
                      {billing === 'yearly' ? 'فوترة سنوية' : 'فوترة شهرية'}
                    </p>
                    {billing === 'yearly' && (
                      <Badge variant="secondary" className="mt-1">
                        وفر 20%
                      </Badge>
                    )}
                  </div>
                  <span className="font-bold text-lg">
                    {price.toLocaleString()} ريال
                  </span>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="font-medium text-slate-900 text-sm">الميزات المشمولة:</h4>
                  {selectedPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-slate-600">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Pricing Breakdown */}
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">السعر الأساسي</span>
                    <span>{price.toLocaleString()} ريال</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">ضريبة القيمة المضافة (15%)</span>
                    <span>{vatAmount.toLocaleString()} ريال</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>المجموع</span>
                    <span>{totalAmount.toLocaleString()} ريال</span>
                  </div>
                </div>

                {/* Security Badges */}
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>دفع آمن مشفر بمعايير PCI DSS</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Lock className="w-4 h-4 text-green-600" />
                    <span>حماية كاملة لبيانات البطاقة</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}