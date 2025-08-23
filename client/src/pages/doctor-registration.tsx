import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Stethoscope, 
  Award, 
  Calendar,
  FileText,
  Upload,
  CheckCircle,
  Clock,
  Building
} from 'lucide-react';

export default function DoctorRegistrationPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    experience: '',
    bio: '',
    hourlyRate: '',
    licenseNumber: '',
    clinicName: '',
    clinicAddress: '',
    workingHours: '',
    languages: '',
    education: '',
    certifications: ''
  });

  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const registerDoctorMutation = useMutation({
    mutationFn: async (doctorData: FormData) => {
      const response = await apiRequest('POST', '/api/register-doctor', doctorData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "تم التسجيل بنجاح! 🎉",
        description: "سيتم مراجعة طلبك وإرسال تأكيد خلال 24 ساعة",
      });
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        specialty: '',
        experience: '',
        bio: '',
        hourlyRate: '',
        licenseNumber: '',
        clinicName: '',
        clinicAddress: '',
        workingHours: '',
        languages: '',
        education: '',
        certifications: ''
      });
      setAvatar(null);
      setAvatarPreview(null);
    },
    onError: (error: any) => {
      toast({
        title: "فشل في التسجيل",
        description: error.message || "حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const specialties = [
    { value: 'جراحة تجميل الأنف', label: 'جراحة تجميل الأنف' },
    { value: 'طب تجميل الوجه', label: 'طب تجميل الوجه' },
    { value: 'تجميل الأسنان', label: 'تجميل الأسنان' },
    { value: 'العناية بالبشرة', label: 'العناية بالبشرة' },
    { value: 'جراحة الوجه والفكين', label: 'جراحة الوجه والفكين' },
    { value: 'طب تجميل متكامل', label: 'طب تجميل متكامل' },
    { value: 'أمراض جلدية وتجميل', label: 'أمراض جلدية وتجميل' },
    { value: 'جراحة العيون التجميلية', label: 'جراحة العيون التجميلية' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.specialty) {
      toast({
        title: "خطأ في التحقق",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    // Create FormData for file upload
    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      submitData.append(key, value);
    });
    
    if (avatar) {
      submitData.append('avatar', avatar);
    }

    registerDoctorMutation.mutate(submitData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            تسجيل طبيب جديد
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            انضم إلى منصة MedVision AI وابدأ في تقديم استشاراتك الطبية للمرضى
          </p>
          <Badge className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <Stethoscope className="w-4 h-4 ml-1" />
            منصة طبية متقدمة
          </Badge>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="grid gap-8">
            
            {/* معلومات شخصية */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  المعلومات الشخصية
                </CardTitle>
                <CardDescription>
                  المعلومات الأساسية الخاصة بك
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">الاسم الكامل *</Label>
                    <Input
                      id="name"
                      placeholder="د. محمد أحمد"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      data-testid="input-doctor-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="doctor@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      data-testid="input-doctor-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف *</Label>
                    <Input
                      id="phone"
                      placeholder="+966501234567"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      data-testid="input-doctor-phone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">رقم الترخيص الطبي</Label>
                    <Input
                      id="licenseNumber"
                      placeholder="123456789"
                      value={formData.licenseNumber}
                      onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                      data-testid="input-license-number"
                    />
                  </div>
                </div>

                {/* صورة شخصية */}
                <div className="space-y-2">
                  <Label htmlFor="avatar">الصورة الشخصية</Label>
                  <div className="flex items-center gap-4">
                    {avatarPreview && (
                      <img
                        src={avatarPreview}
                        alt="معاينة"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <Input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        data-testid="input-avatar"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* معلومات مهنية */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-600" />
                  المعلومات المهنية
                </CardTitle>
                <CardDescription>
                  تفاصيل تخصصك وخبرتك المهنية
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="specialty">التخصص *</Label>
                    <Select onValueChange={(value) => handleInputChange('specialty', value)}>
                      <SelectTrigger data-testid="select-specialty">
                        <SelectValue placeholder="اختر التخصص" />
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
                  <div className="space-y-2">
                    <Label htmlFor="experience">سنوات الخبرة</Label>
                    <Input
                      id="experience"
                      type="number"
                      placeholder="10"
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      data-testid="input-experience"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">أجر الاستشارة (ريال)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      placeholder="500"
                      value={formData.hourlyRate}
                      onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                      data-testid="input-hourly-rate"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="languages">اللغات</Label>
                    <Input
                      id="languages"
                      placeholder="العربية، الإنجليزية"
                      value={formData.languages}
                      onChange={(e) => handleInputChange('languages', e.target.value)}
                      data-testid="input-languages"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">النبذة الشخصية</Label>
                  <Textarea
                    id="bio"
                    placeholder="اكتب نبذة مختصرة عن خبرتك وتخصصك..."
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="min-h-[100px]"
                    data-testid="textarea-bio"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education">المؤهلات العلمية</Label>
                  <Textarea
                    id="education"
                    placeholder="بكالوريوس الطب والجراحة - جامعة الملك سعود..."
                    value={formData.education}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                    data-testid="textarea-education"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certifications">الشهادات والتدريبات</Label>
                  <Textarea
                    id="certifications"
                    placeholder="زمالة الكلية الملكية البريطانية..."
                    value={formData.certifications}
                    onChange={(e) => handleInputChange('certifications', e.target.value)}
                    data-testid="textarea-certifications"
                  />
                </div>
              </CardContent>
            </Card>

            {/* معلومات العيادة */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-purple-600" />
                  معلومات العيادة
                </CardTitle>
                <CardDescription>
                  تفاصيل مكان عملك ومواعيد العمل
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="clinicName">اسم العيادة</Label>
                    <Input
                      id="clinicName"
                      placeholder="عيادة التجميل المتقدمة"
                      value={formData.clinicName}
                      onChange={(e) => handleInputChange('clinicName', e.target.value)}
                      data-testid="input-clinic-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workingHours">ساعات العمل</Label>
                    <Input
                      id="workingHours"
                      placeholder="9:00 صباحاً - 6:00 مساءً"
                      value={formData.workingHours}
                      onChange={(e) => handleInputChange('workingHours', e.target.value)}
                      data-testid="input-working-hours"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinicAddress">عنوان العيادة</Label>
                  <Textarea
                    id="clinicAddress"
                    placeholder="الرياض، حي النخيل، شارع الملك فهد..."
                    value={formData.clinicAddress}
                    onChange={(e) => handleInputChange('clinicAddress', e.target.value)}
                    data-testid="textarea-clinic-address"
                  />
                </div>
              </CardContent>
            </Card>

            {/* إرسال الطلب */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                  <h3 className="text-lg font-semibold text-green-800">
                    جاهز للإرسال؟
                  </h3>
                  <p className="text-green-700">
                    بعد إرسال الطلب، سيتم مراجعة بياناتك من قبل فريقنا الطبي المختص
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                    <Clock className="w-4 h-4" />
                    <span>مدة المراجعة: 24-48 ساعة</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* أزرار التحكم */}
            <div className="flex gap-4 justify-center">
              <Button 
                type="submit" 
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={registerDoctorMutation.isPending}
                data-testid="button-submit-registration"
              >
                {registerDoctorMutation.isPending ? (
                  <>
                    <Clock className="w-4 h-4 ml-2 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 ml-2" />
                    إرسال طلب التسجيل
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}