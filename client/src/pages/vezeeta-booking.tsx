import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Award,
  Users,
  VideoIcon,
  MessageCircle,
  Heart,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  CreditCard,
  Globe,
  User
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, isBefore } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  avatar?: string;
  bio: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  consultationFee: number;
  onlineConsultation: boolean;
  workingHours: any;
  languages: string[];
  totalPatients: number;
  totalSurgeries: number;
  successRate: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
  doctorId: string;
  price: number;
}

interface Booking {
  id: string;
  doctorId: string;
  appointmentDate: Date;
  duration: number;
  status: string;
  consultationType: string;
  patientName: string;
  patientPhone: string;
  price: number;
}

export default function VezeetaBookingPage() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [consultationType, setConsultationType] = useState<string>('clinic');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب قائمة الأطباء مع التصفية
  const { data: doctors = [], isLoading: loadingDoctors } = useQuery({
    queryKey: ['/api/doctors', selectedSpecialty, searchQuery],
    queryFn: async () => {
      let url = '/api/doctors';
      const params = new URLSearchParams();
      
      if (selectedSpecialty && selectedSpecialty !== 'all') {
        params.append('specialty', selectedSpecialty);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      const response = await apiRequest('GET', url);
      return response.json();
    },
  });

  // جلب المواعيد المتاحة
  const { data: availableSlots = [], isLoading: loadingSlots } = useQuery({
    queryKey: ['/api/available-slots', selectedDoctor?.id, selectedDate],
    queryFn: async () => {
      if (!selectedDoctor) return [];
      
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await apiRequest('GET', `/api/doctors/${selectedDoctor.id}/available-slots?date=${dateStr}`);
      return response.json();
    },
    enabled: !!selectedDoctor,
  });

  // حجز موعد
  const bookAppointmentMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest('POST', '/api/bookings', bookingData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم حجز الموعد بنجاح",
        description: "سيتم التواصل معك قريباً لتأكيد الموعد",
      });
      setIsBookingModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/available-slots'] });
    },
    onError: () => {
      toast({
        title: "فشل في حجز الموعد",
        description: "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const specialties = [
    { value: 'all', label: 'جميع التخصصات' },
    { value: 'plastic_surgery', label: 'جراحة التجميل' },
    { value: 'dermatology', label: 'الأمراض الجلدية' },
    { value: 'dental', label: 'طب الأسنان' },
    { value: 'ophthalmology', label: 'طب العيون' },
    { value: 'ent', label: 'أنف وأذن وحنجرة' },
    { value: 'orthopedic', label: 'العظام' },
  ];

  const consultationTypes = [
    { value: 'clinic', label: 'زيارة العيادة', icon: MapPin },
    { value: 'video', label: 'استشارة فيديو', icon: VideoIcon },
    { value: 'phone', label: 'استشارة هاتفية', icon: Phone },
  ];

  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentWeek, { weekStartsOn: 6 }), // السبت
    end: endOfWeek(currentWeek, { weekStartsOn: 6 })
  });

  const generateTimeSlots = (workingHours: any) => {
    const slots = [];
    const startHour = 9;
    const endHour = 18;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time,
          available: Math.random() > 0.3, // محاكاة المواعيد المتاحة
          doctorId: selectedDoctor?.id || '',
          price: selectedDoctor?.consultationFee || 0
        });
      }
    }
    return slots;
  };

  const handleBookAppointment = (formData: any) => {
    const bookingData = {
      doctorId: selectedDoctor?.id,
      appointmentDate: selectedDate,
      timeSlot: selectedTimeSlot,
      consultationType,
      patientName: formData.patientName,
      patientPhone: formData.patientPhone,
      patientEmail: formData.patientEmail,
      notes: formData.notes,
      price: selectedDoctor?.consultationFee || 0
    };

    bookAppointmentMutation.mutate(bookingData);
  };

  const DoctorCard = ({ doctor }: { doctor: Doctor }) => (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500" data-testid={`doctor-card-${doctor.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-4 space-x-reverse">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {doctor.name.charAt(0)}
          </div>
          <div className="flex-1 text-right">
            <CardTitle className="text-xl mb-1">{doctor.name}</CardTitle>
            <CardDescription className="text-base">{doctor.specialty}</CardDescription>
            <div className="flex items-center justify-end mt-2 space-x-4 space-x-reverse">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current ml-1" />
                <span className="font-semibold">{doctor.rating}</span>
              </div>
              <div className="flex items-center">
                <Award className="w-4 h-4 text-green-500 ml-1" />
                <span className="text-sm">{doctor.experience} سنوات</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 text-blue-500 ml-1" />
                <span className="text-sm">{doctor.totalPatients} مريض</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 ml-2" />
            <span>{doctor.clinicName} - {doctor.clinicAddress}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <CreditCard className="w-4 h-4 ml-2" />
            <span>رسوم الكشف: {doctor.consultationFee} ريال</span>
          </div>

          {doctor.onlineConsultation && (
            <Badge variant="secondary" className="text-xs">
              <VideoIcon className="w-3 h-3 ml-1" />
              استشارة أونلاين متاحة
            </Badge>
          )}

          <div className="flex flex-wrap gap-2 mt-3">
            {doctor.languages?.map((lang, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                <Globe className="w-3 h-3 ml-1" />
                {lang}
              </Badge>
            ))}
          </div>

          <div className="pt-3 border-t">
            <Button 
              onClick={() => {
                setSelectedDoctor(doctor);
                setIsBookingModalOpen(true);
              }}
              className="w-full"
              data-testid={`book-doctor-${doctor.id}`}
            >
              احجز موعد
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const BookingModal = () => (
    <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-right">
            حجز موعد مع د. {selectedDoctor?.name}
          </DialogTitle>
          <DialogDescription className="text-right">
            {selectedDoctor?.specialty} - {selectedDoctor?.clinicName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* اختيار نوع الاستشارة */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-right">نوع الاستشارة</h3>
            <div className="grid grid-cols-1 gap-3">
              {consultationTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <Card 
                    key={type.value}
                    className={`cursor-pointer transition-all ${
                      consultationType === type.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => setConsultationType(type.value)}
                    data-testid={`consultation-type-${type.value}`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <IconComponent className="w-5 h-5" />
                          <span>{type.label}</span>
                        </div>
                        {consultationType === type.value && (
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* اختيار التاريخ والوقت */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-right">اختيار التاريخ والوقت</h3>
            
            {/* التقويم الأسبوعي */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
                  data-testid="next-week"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-semibold">
                  {format(currentWeek, 'MMMM yyyy', { locale: ar })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
                  disabled={isBefore(addDays(currentWeek, -7), new Date())}
                  data-testid="previous-week"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => (
                  <Button
                    key={day.toISOString()}
                    variant={isSameDay(day, selectedDate) ? "default" : "outline"}
                    size="sm"
                    className={`p-2 h-auto flex flex-col ${
                      isToday(day) ? 'border-blue-500' : ''
                    }`}
                    onClick={() => setSelectedDate(day)}
                    disabled={isBefore(day, new Date())}
                    data-testid={`date-${format(day, 'yyyy-MM-dd')}`}
                  >
                    <span className="text-xs">
                      {format(day, 'E', { locale: ar })}
                    </span>
                    <span className="text-sm font-semibold">
                      {format(day, 'd')}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            {/* المواعيد المتاحة */}
            {selectedDate && (
              <div className="space-y-3">
                <h4 className="font-medium text-right">المواعيد المتاحة</h4>
                {loadingSlots ? (
                  <div className="text-center py-4">
                    <div className="animate-spin w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {generateTimeSlots(selectedDoctor?.workingHours).map((slot) => (
                      <Button
                        key={slot.time}
                        variant={selectedTimeSlot === slot.time ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                        onClick={() => setSelectedTimeSlot(slot.time)}
                        disabled={!slot.available}
                        data-testid={`time-slot-${slot.time}`}
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* نموذج بيانات المريض */}
        {selectedTimeSlot && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold text-right">بيانات المريض</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleBookAppointment({
                patientName: formData.get('patientName'),
                patientPhone: formData.get('patientPhone'),
                patientEmail: formData.get('patientEmail'),
                notes: formData.get('notes')
              });
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-right">الاسم الكامل</label>
                  <Input 
                    name="patientName" 
                    required 
                    placeholder="أدخل الاسم الكامل"
                    data-testid="patient-name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-right">رقم الهاتف</label>
                  <Input 
                    name="patientPhone" 
                    required 
                    placeholder="05xxxxxxxx"
                    data-testid="patient-phone"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-right">البريد الإلكتروني</label>
                  <Input 
                    name="patientEmail" 
                    type="email" 
                    placeholder="example@email.com"
                    data-testid="patient-email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-right">ملاحظات</label>
                  <Textarea 
                    name="notes" 
                    placeholder="أي ملاحظات إضافية"
                    data-testid="patient-notes"
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-right">
                    <p className="text-lg font-semibold">إجمالي التكلفة</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedDoctor?.consultationFee} ريال
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>التاريخ: {format(selectedDate, 'yyyy/MM/dd')}</p>
                    <p>الوقت: {selectedTimeSlot}</p>
                    <p>النوع: {consultationTypes.find(t => t.value === consultationType)?.label}</p>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={bookAppointmentMutation.isPending}
                  data-testid="confirm-booking"
                >
                  {bookAppointmentMutation.isPending ? 'جاري الحجز...' : 'تأكيد الحجز'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* رأس الصفحة */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏥 احجز موعدك مع أفضل الأطباء
          </h1>
          <p className="text-xl text-gray-600">
            منصة متقدمة لحجز المواعيد الطبية مع أفضل أطباء التجميل والجراحة
          </p>
        </div>

        {/* فلاتر البحث */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 ml-2" />
              البحث والتصفية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">التخصص</label>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger data-testid="specialty-filter">
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

              <div>
                <label className="block text-sm font-medium mb-2">البحث</label>
                <Input
                  placeholder="ابحث عن اسم الطبيب أو العيادة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="search-doctors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">التاريخ المفضل</label>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <CalendarIcon className="w-4 h-4" />
                  <span className="text-sm">
                    {format(selectedDate, 'yyyy/MM/dd')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* قائمة الأطباء */}
        {loadingDoctors ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>جاري تحميل قائمة الأطباء...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor: Doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}

        {doctors.length === 0 && !loadingDoctors && (
          <Card className="text-center py-8">
            <CardContent>
              <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">لا توجد أطباء متاحين</h3>
              <p className="text-gray-600">لم يتم العثور على أطباء يطابقون معايير البحث</p>
            </CardContent>
          </Card>
        )}

        {/* مودال الحجز */}
        <BookingModal />
      </div>
    </div>
  );
}