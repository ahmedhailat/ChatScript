import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CalendarDays, 
  Clock, 
  User, 
  Video, 
  Star, 
  MapPin,
  Phone,
  MessageSquare,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Calendar as CalendarIcon
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  avatar?: string;
  bio?: string;
  hourlyRate: number;
  availability?: any;
  isActive: boolean;
}

interface TimeSlot {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface ConsultationBookingProps {
  consultationType?: string;
  onBookingComplete?: (consultationId: string) => void;
}

export default function ConsultationBooking({ 
  consultationType = "rhinoplasty", 
  onBookingComplete 
}: ConsultationBookingProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [activeTab, setActiveTab] = useState('doctors');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available doctors
  const { data: doctors = [], isLoading: doctorsLoading } = useQuery({
    queryKey: ['/api/doctors', consultationType],
    queryFn: () => apiRequest('GET', `/api/doctors?specialty=${encodeURIComponent(consultationType)}`),
    retry: false,
  });

  // Fetch time slots for selected doctor and date
  const { data: timeSlots = [], isLoading: slotsLoading } = useQuery({
    queryKey: ['/api/time-slots', selectedDoctor?.id, selectedDate?.toISOString().split('T')[0]],
    queryFn: () => apiRequest('GET', `/api/time-slots?doctorId=${selectedDoctor?.id}&date=${selectedDate?.toISOString().split('T')[0]}`),
    enabled: !!selectedDoctor && !!selectedDate,
    retry: false,
  });

  // Book consultation mutation
  const bookConsultation = useMutation({
    mutationFn: async (bookingData: any) => {
      return await apiRequest('POST', '/api/consultations', bookingData);
    },
    onSuccess: (data) => {
      toast({
        title: "تم الحجز بنجاح! ✅",
        description: `تم تأكيد موعدك مع ${selectedDoctor?.name}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/time-slots'] });
      if (onBookingComplete) {
        onBookingComplete(data.id);
      }
      // Reset form
      setSelectedDoctor(null);
      setSelectedTimeSlot(null);
      setConsultationNotes('');
      setPatientName('');
      setPatientPhone('');
      setActiveTab('doctors');
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الحجز",
        description: error.message || "فشل في حجز الاستشارة",
        variant: "destructive",
      });
    },
  });

  const consultationTypes = {
    rhinoplasty: { name: 'جراحة الأنف', icon: '👃', price: 15000 },
    facial: { name: 'تجميل الوجه', icon: '✨', price: 12000 },
    dental: { name: 'تجميل الأسنان', icon: '🦷', price: 10000 },
    skincare: { name: 'العناية بالبشرة', icon: '🧴', price: 8000 },
  };

  const handleBookConsultation = () => {
    if (!selectedDoctor || !selectedTimeSlot || !patientName || !patientPhone) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    bookConsultation.mutate({
      doctorId: selectedDoctor.id,
      timeSlotId: selectedTimeSlot.id,
      appointmentDate: `${selectedDate?.toISOString().split('T')[0]} ${selectedTimeSlot.startTime}`,
      consultationType,
      notes: consultationNotes,
      patientName,
      patientPhone,
      duration: 30,
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-purple-800">
            🏥 حجز استشارة طبية فورية
          </CardTitle>
          <p className="text-gray-600">
            احجز موعدك مع أفضل الأطباء المختصين في {consultationTypes[consultationType as keyof typeof consultationTypes]?.name}
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="doctors" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            اختيار الطبيب
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2" disabled={!selectedDoctor}>
            <CalendarIcon className="w-4 h-4" />
            التوقيت
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-2" disabled={!selectedTimeSlot}>
            <MessageSquare className="w-4 h-4" />
            التفاصيل
          </TabsTrigger>
          <TabsTrigger value="confirm" className="flex items-center gap-2" disabled={!patientName}>
            <CheckCircle className="w-4 h-4" />
            التأكيد
          </TabsTrigger>
        </TabsList>

        {/* Doctors Selection */}
        <TabsContent value="doctors" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctorsLoading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="h-16 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </Card>
              ))
            ) : doctors.length > 0 ? (
              doctors.map((doctor: Doctor) => (
                <Card 
                  key={doctor.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                    selectedDoctor?.id === doctor.id ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setSelectedDoctor(doctor);
                    setActiveTab('schedule');
                  }}
                  data-testid={`doctor-${doctor.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {doctor.avatar ? (
                        <img src={doctor.avatar} alt={doctor.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        doctor.name.charAt(0)
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                      <p className="text-sm text-gray-600">{doctor.specialty}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{doctor.rating}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {doctor.experience} سنة خبرة
                        </Badge>
                      </div>
                      <p className="text-lg font-semibold text-purple-600 mt-2">
                        {Math.round(doctor.hourlyRate / 100)} ريال/الجلسة
                      </p>
                    </div>
                  </div>
                  {doctor.bio && (
                    <p className="text-xs text-gray-500 mt-3 line-clamp-2">{doctor.bio}</p>
                  )}
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد أطباء متاحون</h3>
                <p className="text-gray-500">سيتم إضافة الأطباء قريباً</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Schedule Selection */}
        <TabsContent value="schedule" className="space-y-4">
          {selectedDoctor && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  اختيار التاريخ والوقت - د. {selectedDoctor.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                {/* Calendar */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">اختر التاريخ</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                    className="rounded-md border w-fit"
                  />
                </div>

                {/* Time Slots */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">الأوقات المتاحة</Label>
                  {selectedDate ? (
                    <div className="space-y-2">
                      {slotsLoading ? (
                        [...Array(6)].map((_, i) => (
                          <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
                        ))
                      ) : timeSlots.length > 0 ? (
                        timeSlots.map((slot: TimeSlot) => (
                          <Button
                            key={slot.id}
                            variant={selectedTimeSlot?.id === slot.id ? "default" : "outline"}
                            className="w-full justify-start"
                            onClick={() => {
                              setSelectedTimeSlot(slot);
                              setActiveTab('details');
                            }}
                            disabled={!slot.isAvailable}
                            data-testid={`slot-${slot.id}`}
                          >
                            <Clock className="w-4 h-4 ml-2" />
                            {slot.startTime} - {slot.endTime}
                            {!slot.isAvailable && (
                              <Badge variant="destructive" className="mr-2">محجوز</Badge>
                            )}
                          </Button>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">لا توجد مواعيد متاحة في هذا التاريخ</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">اختر تاريخاً لعرض الأوقات المتاحة</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Details */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الاستشارة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientName">اسم المريض *</Label>
                  <Input
                    id="patientName"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="أدخل اسمك الكامل"
                    data-testid="patient-name-input"
                  />
                </div>
                <div>
                  <Label htmlFor="patientPhone">رقم الهاتف *</Label>
                  <Input
                    id="patientPhone"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="+966 50 123 4567"
                    data-testid="patient-phone-input"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">ملاحظات أو استفسارات</Label>
                <Textarea
                  id="notes"
                  value={consultationNotes}
                  onChange={(e) => setConsultationNotes(e.target.value)}
                  placeholder="أخبرنا عن حالتك أو أي استفسارات تريد مناقشتها..."
                  className="min-h-20"
                  data-testid="consultation-notes"
                />
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={() => setActiveTab('confirm')}
                  disabled={!patientName || !patientPhone}
                  className="w-full md:w-auto"
                >
                  متابعة للتأكيد
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Confirmation */}
        <TabsContent value="confirm" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">تأكيد الحجز</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Booking Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">الطبيب:</span>
                  <span className="font-semibold">{selectedDoctor?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">التخصص:</span>
                  <span>{selectedDoctor?.specialty}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">التاريخ:</span>
                  <span>{selectedDate?.toLocaleDateString('ar-SA')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">الوقت:</span>
                  <span>{selectedTimeSlot?.startTime} - {selectedTimeSlot?.endTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">المدة:</span>
                  <span>30 دقيقة</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">نوع الاستشارة:</span>
                  <span>{consultationTypes[consultationType as keyof typeof consultationTypes]?.name}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span>التكلفة الإجمالية:</span>
                    <span className="text-purple-600">{Math.round((selectedDoctor?.hourlyRate || 0) / 100)} ريال</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('details')}
                >
                  تعديل
                </Button>
                <Button
                  onClick={handleBookConsultation}
                  disabled={bookConsultation.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                  data-testid="confirm-booking-btn"
                >
                  {bookConsultation.isPending ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      جاري الحجز...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 ml-2" />
                      تأكيد الحجز
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}