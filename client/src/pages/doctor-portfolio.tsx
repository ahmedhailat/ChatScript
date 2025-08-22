import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart, 
  Eye, 
  Star, 
  PlayCircle, 
  Clock, 
  Calendar, 
  Users, 
  Award,
  Camera,
  Video,
  Phone,
  Mail,
  MapPin,
  Upload,
  Search,
  Filter
} from 'lucide-react';

interface DoctorPortfolio {
  id: string;
  title: string;
  procedureType: string;
  description: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  videoUrl?: string;
  patientAge: number;
  patientGender: string;
  surgeryDuration: number;
  recoveryTime: number;
  difficulty: string;
  likes: number;
  views: number;
  createdAt: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  avatar?: string;
  bio: string;
}

export default function DoctorPortfolioPage() {
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [procedureFilter, setProcedureFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب قائمة الأطباء
  const { data: doctorsData, isLoading: loadingDoctors } = useQuery({
    queryKey: ['/api/doctors'],
  });
  
  const doctors = Array.isArray(doctorsData) ? doctorsData : [];

  // جلب ملفات الأطباء
  const { data: portfoliosData, isLoading: loadingPortfolios } = useQuery({
    queryKey: ['/api/doctor-portfolios', selectedDoctor, procedureFilter],
    queryFn: async () => {
      let url = '/api/doctor-portfolios';
      const params = new URLSearchParams();
      
      if (selectedDoctor && selectedDoctor !== 'all') {
        params.append('doctorId', selectedDoctor);
      }
      if (procedureFilter && procedureFilter !== 'all') {
        params.append('procedureType', procedureFilter);
      }
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      const response = await apiRequest('GET', url);
      const data = await response.json();
      return data.portfolios || data; // Handle both array and object responses
    },
  });

  // Extract portfolios array from the response
  const portfolios = Array.isArray(portfoliosData?.portfolios) 
    ? portfoliosData.portfolios 
    : Array.isArray(portfoliosData) 
    ? portfoliosData 
    : [];

  // mutation لإضافة عملية جديدة للملف
  const addPortfolioMutation = useMutation({
    mutationFn: async (portfolioData: any) => {
      const response = await apiRequest('POST', '/api/doctor-portfolios', portfolioData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إضافة العملية بنجاح",
        description: "تم إضافة العملية إلى ملف الطبيب",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/doctor-portfolios'] });
    },
    onError: () => {
      toast({
        title: "خطأ في الإضافة",
        description: "فشل في إضافة العملية",
        variant: "destructive",
      });
    },
  });

  const procedureTypes = [
    { value: 'all', label: 'جميع العمليات' },
    { value: 'rhinoplasty', label: 'تجميل الأنف' },
    { value: 'facial_contouring', label: 'نحت الوجه' },
    { value: 'dental_alignment', label: 'تقويم الأسنان' },
    { value: 'skin_treatment', label: 'علاج البشرة' },
    { value: 'lip_enhancement', label: 'تكبير الشفاه' },
    { value: 'eye_treatment', label: 'علاج العيون' },
  ];

  const PortfolioCard = ({ portfolio }: { portfolio: any }) => (
    <Card className="group hover:shadow-lg transition-all duration-300" data-testid={`portfolio-card-${portfolio.id}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold text-right">{portfolio.title}</CardTitle>
            <CardDescription className="text-right mt-1">
              <Badge variant="secondary" className="ml-2">
                {procedureTypes.find(p => p.value === portfolio.procedureType)?.label}
              </Badge>
              <span className="text-sm text-gray-600">
                {portfolio.difficulty === 'easy' ? 'سهل' : 
                 portfolio.difficulty === 'medium' ? 'متوسط' : 'صعب'}
              </span>
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="flex items-center">
              <Eye className="w-4 h-4 ml-1" />
              <span>{portfolio.views}</span>
            </div>
            <div className="flex items-center">
              <Heart className="w-4 h-4 ml-1 text-red-500" />
              <span>{portfolio.likes}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* صورة قبل */}
          <div className="relative">
            <img
              src={portfolio.beforeImageUrl}
              alt="قبل العملية"
              className="w-full h-48 object-cover rounded-lg"
              data-testid={`before-image-${portfolio.id}`}
            />
            <Badge className="absolute top-2 right-2 bg-red-500">قبل</Badge>
          </div>
          
          {/* صورة بعد */}
          <div className="relative">
            <img
              src={portfolio.afterImageUrl}
              alt="بعد العملية"
              className="w-full h-48 object-cover rounded-lg"
              data-testid={`after-image-${portfolio.id}`}
            />
            <Badge className="absolute top-2 right-2 bg-green-500">بعد</Badge>
          </div>
        </div>

        {/* فيديو توضيحي */}
        {portfolio.videoUrl && (
          <div className="mb-4">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center"
              data-testid={`video-button-${portfolio.id}`}
            >
              <PlayCircle className="w-4 h-4 ml-2" />
              مشاهدة الفيديو التوضيحي
            </Button>
          </div>
        )}

        <div className="text-right mb-3">
          <p className="text-gray-700 text-sm">{portfolio.description}</p>
        </div>

        {/* تفاصيل العملية */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="text-center p-2 bg-gray-50 rounded">
            <Clock className="w-4 h-4 mx-auto mb-1 text-blue-500" />
            <div className="font-semibold">{portfolio.surgeryDuration} دقيقة</div>
            <div className="text-gray-600">مدة العملية</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <Calendar className="w-4 h-4 mx-auto mb-1 text-green-500" />
            <div className="font-semibold">{portfolio.recoveryTime} يوم</div>
            <div className="text-gray-600">فترة التعافي</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <Users className="w-4 h-4 mx-auto mb-1 text-purple-500" />
            <div className="font-semibold">{portfolio.patientAge} سنة</div>
            <div className="text-gray-600">عمر المريض</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <Award className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
            <div className="font-semibold">{portfolio.patientGender === 'male' ? 'ذكر' : 'أنثى'}</div>
            <div className="text-gray-600">الجنس</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const DoctorCard = ({ doctor }: { doctor: Doctor }) => (
    <Card className="hover:shadow-lg transition-shadow" data-testid={`doctor-card-${doctor.id}`}>
      <CardHeader className="text-center">
        <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3">
          {doctor.name.charAt(0)}
        </div>
        <CardTitle className="text-xl">{doctor.name}</CardTitle>
        <CardDescription>{doctor.specialty}</CardDescription>
        <div className="flex items-center justify-center mt-2">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="ml-1 font-semibold">{doctor.rating}</span>
          <span className="ml-2 text-gray-600">{doctor.experience} سنوات خبرة</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 text-sm text-right mb-4">{doctor.bio}</p>
        <Button 
          onClick={() => setSelectedDoctor(doctor.id)}
          className="w-full"
          data-testid={`select-doctor-${doctor.id}`}
        >
          عرض ملف الطبيب
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏥 ملفات الأطباء وعمليات التجميل
          </h1>
          <p className="text-xl text-gray-600">
            اكتشف نتائج العمليات الحقيقية مع أفضل أطباء التجميل
          </p>
        </div>

        <Tabs defaultValue="portfolios" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="portfolios" data-testid="tab-portfolios">ملفات العمليات</TabsTrigger>
            <TabsTrigger value="doctors" data-testid="tab-doctors">الأطباء</TabsTrigger>
            <TabsTrigger value="search" data-testid="tab-search">البحث المتقدم</TabsTrigger>
          </TabsList>

          {/* علامة تبويب ملفات العمليات */}
          <TabsContent value="portfolios" className="space-y-6">
            {/* فلاتر البحث */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 ml-2" />
                  تصفية النتائج
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">الطبيب</label>
                    <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                      <SelectTrigger data-testid="doctor-filter">
                        <SelectValue placeholder="اختر الطبيب" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع الأطباء</SelectItem>
                        {doctors.map((doctor: any) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">نوع العملية</label>
                    <Select value={procedureFilter} onValueChange={setProcedureFilter}>
                      <SelectTrigger data-testid="procedure-filter">
                        <SelectValue placeholder="اختر نوع العملية" />
                      </SelectTrigger>
                      <SelectContent>
                        {procedureTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">البحث</label>
                    <Input
                      placeholder="ابحث في العمليات..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      data-testid="search-input"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* عرض ملفات العمليات */}
            {loadingPortfolios ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>جاري تحميل ملفات العمليات...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {portfolios.map((portfolio: DoctorPortfolio) => (
                  <PortfolioCard key={portfolio.id} portfolio={portfolio} />
                ))}
              </div>
            )}

            {portfolios.length === 0 && !loadingPortfolios && (
              <Card className="text-center py-8">
                <CardContent>
                  <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">لا توجد عمليات متاحة</h3>
                  <p className="text-gray-600">لم يتم العثور على عمليات تطابق معايير البحث</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* علامة تبويب الأطباء */}
          <TabsContent value="doctors" className="space-y-6">
            {loadingDoctors ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>جاري تحميل قائمة الأطباء...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doctor: any) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* علامة تبويب البحث المتقدم */}
          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="w-5 h-5 ml-2" />
                  البحث في قاعدة البيانات ثلاثية الأبعاد
                </CardTitle>
                <CardDescription>
                  ابحث في مجموعة بيانات Digitized Rhinoplasty للعثور على أفضل النماذج المرجعية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">نوع الوجه</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الوجه" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oval">بيضاوي</SelectItem>
                        <SelectItem value="round">دائري</SelectItem>
                        <SelectItem value="square">مربع</SelectItem>
                        <SelectItem value="heart">قلب</SelectItem>
                        <SelectItem value="diamond">ماسي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">نوع الأنف</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الأنف" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="straight">مستقيم</SelectItem>
                        <SelectItem value="aquiline">نسري</SelectItem>
                        <SelectItem value="snub">منتفخ</SelectItem>
                        <SelectItem value="roman">روماني</SelectItem>
                        <SelectItem value="greek">يوناني</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">الجنس</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الجنس" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">ذكر</SelectItem>
                        <SelectItem value="female">أنثى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-6">
                  <Button className="w-full" data-testid="search-3d-database">
                    <Search className="w-4 h-4 ml-2" />
                    البحث في قاعدة البيانات ثلاثية الأبعاد
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}