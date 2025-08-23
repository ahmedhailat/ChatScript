import { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  Video, 
  FileText, 
  Calendar, 
  User, 
  Clock, 
  Send, 
  Paperclip, 
  Phone, 
  X,
  CheckCircle,
  Circle,
  Download,
  Eye,
  Stethoscope
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Message {
  id: string;
  senderId: string;
  senderType: 'doctor' | 'patient';
  content: string;
  messageType: 'text' | 'image' | 'file' | 'voice_note';
  attachmentUrl?: string;
  isRead: boolean;
  timestamp: string;
  replyToMessageId?: string;
}

interface Consultation {
  id: string;
  doctorId: string;
  appointmentDate: string;
  consultationType: string;
  status: string;
  notes?: string;
  meetingLink?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatar?: string;
  rating: number;
}

export default function PatientPortal() {
  const [selectedConsultation, setSelectedConsultation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch patient's consultations
  const { data: consultations = [], isLoading: consultationsLoading } = useQuery<Consultation[]>({
    queryKey: ['/api/booking-consultations/patient'],
    retry: false,
  });

  // Fetch doctors data
  const { data: doctors = [] } = useQuery<Doctor[]>({
    queryKey: ['/api/doctors'],
    retry: false,
  });

  // Fetch messages for selected consultation
  const { data: messagesData, isLoading: messagesLoading } = useQuery<{messages: Message[]}>({
    queryKey: ['/api/messages', selectedConsultation],
    enabled: !!selectedConsultation,
    retry: false,
  });

  const messages = messagesData?.messages || [];

  // WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('🔗 اتصال WebSocket تم بنجاح');
      setWs(socket);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'new_message') {
          // Refresh messages for the current consultation
          queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedConsultation] });
          
          // Show notification if message is from doctor
          if (data.message.senderType === 'doctor') {
            toast({
              title: "رسالة جديدة من الطبيب",
              description: data.message.content.substring(0, 50) + (data.message.content.length > 50 ? '...' : ''),
            });
          }
        }
        
        if (data.type === 'user_typing') {
          setTypingUsers(prev => [...prev.filter(id => id !== data.userId), data.userId]);
        }
        
        if (data.type === 'user_stop_typing') {
          setTypingUsers(prev => prev.filter(id => id !== data.userId));
        }
        
        if (data.type === 'video_call_scheduled') {
          toast({
            title: "مكالمة مرئية جديدة",
            description: "تم جدولة مكالمة مرئية مع الطبيب",
          });
          queryClient.invalidateQueries({ queryKey: ['/api/booking-consultations/patient'] });
        }
        
        if (data.type === 'file_shared') {
          toast({
            title: "ملف جديد",
            description: "تم مشاركة ملف طبي معك",
          });
        }
        
      } catch (error) {
        console.error('خطأ في معالجة رسالة WebSocket:', error);
      }
    };

    socket.onclose = () => {
      console.log('🔌 إغلاق اتصال WebSocket');
      setWs(null);
    };

    socket.onerror = (error) => {
      console.error('خطأ في WebSocket:', error);
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [queryClient, selectedConsultation, toast]);

  // Join consultation room
  useEffect(() => {
    if (ws && selectedConsultation) {
      ws.send(JSON.stringify({
        type: 'join_consultation',
        consultationId: selectedConsultation
      }));
    }
  }, [ws, selectedConsultation]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      return apiRequest('POST', '/api/messages', messageData);
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedConsultation] });
    },
    onError: () => {
      toast({
        title: "خطأ في الإرسال",
        description: "فشل في إرسال الرسالة",
        variant: "destructive",
      });
    }
  });

  // File upload mutation
  const fileUploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return fetch('/api/file-shares', {
        method: 'POST',
        body: formData,
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: "تم رفع الملف",
        description: "تم مشاركة الملف مع الطبيب بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedConsultation] });
    },
    onError: () => {
      toast({
        title: "خطأ في رفع الملف",
        description: "فشل في رفع الملف",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConsultation) return;

    sendMessageMutation.mutate({
      consultationId: selectedConsultation,
      senderId: "current-patient-id", // Should come from auth
      senderType: "patient",
      content: newMessage.trim(),
      messageType: "text"
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConsultation) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('consultationId', selectedConsultation);
    formData.append('uploadedBy', 'current-patient-id'); // Should come from auth
    formData.append('fileType', file.type.startsWith('image/') ? 'image' : 'document');
    formData.append('description', `ملف من المريض: ${file.name}`);

    fileUploadMutation.mutate(formData);
  };

  const handleTyping = () => {
    if (ws && selectedConsultation) {
      ws.send(JSON.stringify({
        type: 'typing',
        consultationId: selectedConsultation,
        userId: 'current-patient-id',
        senderType: 'patient'
      }));
      
      setIsTyping(true);
      setTimeout(() => {
        if (ws) {
          ws.send(JSON.stringify({
            type: 'stop_typing',
            consultationId: selectedConsultation,
            userId: 'current-patient-id'
          }));
        }
        setIsTyping(false);
      }, 2000);
    }
  };

  const getDoctorInfo = (doctorId: string) => {
    return doctors.find(d => d.id === doctorId) || { name: 'طبيب غير معروف', specialty: '', rating: 0 };
  };

  const joinVideoCall = (meetingLink?: string) => {
    if (meetingLink) {
      window.open(meetingLink, '_blank');
    } else {
      toast({
        title: "رابط غير متاح",
        description: "رابط المكالمة غير متاح حالياً",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex" dir="rtl">
      {/* Sidebar - My Consultations */}
      <div className="w-80 bg-white border-l border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-ai-purple" />
            استشاراتي الطبية
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {consultations.length} استشارة نشطة
          </p>
        </div>

        <ScrollArea className="flex-1">
          {consultationsLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-slate-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {consultations.map((consultation) => {
                const doctor = getDoctorInfo(consultation.doctorId);
                return (
                  <Card 
                    key={consultation.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedConsultation === consultation.id 
                        ? 'bg-ai-purple/10 border-ai-purple' 
                        : 'hover:bg-slate-50'
                    }`}
                    onClick={() => setSelectedConsultation(consultation.id)}
                    data-testid={`consultation-card-${consultation.id}`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-medical-blue rounded-full flex items-center justify-center">
                          <Stethoscope className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">
                            د. {doctor.name}
                          </h3>
                          <p className="text-xs text-slate-600 truncate">
                            {doctor.specialty}
                          </p>
                          <p className="text-xs text-slate-600 truncate">
                            {consultation.consultationType}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {consultation.status === 'pending' ? 'في الانتظار' : 
                               consultation.status === 'confirmed' ? 'مؤكد' : 
                               consultation.status === 'completed' ? 'مكتمل' : 'ملغي'}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {format(new Date(consultation.appointmentDate), 'dd MMM', { locale: ar })}
                            </span>
                          </div>
                          {consultation.meetingLink && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                joinVideoCall(consultation.meetingLink);
                              }}
                              className="mt-2 h-6 px-2 text-xs"
                              data-testid="button-join-video"
                            >
                              <Video className="w-3 h-3 ml-1" />
                              دخول المكالمة
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConsultation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-medical-blue rounded-full flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    {(() => {
                      const consultation = consultations.find(c => c.id === selectedConsultation);
                      const doctor = consultation ? getDoctorInfo(consultation.doctorId) : null;
                      return (
                        <>
                          <h3 className="font-semibold text-slate-900">
                            د. {doctor?.name || 'طبيب غير معروف'}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {doctor?.specialty} - {consultation?.consultationType}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const consultation = consultations.find(c => c.id === selectedConsultation);
                      if (consultation?.meetingLink) {
                        joinVideoCall(consultation.meetingLink);
                      }
                    }}
                    className="flex items-center gap-2"
                    data-testid="button-video-call"
                  >
                    <Video className="w-4 h-4" />
                    انضمام للمكالمة
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                    data-testid="button-share-file"
                  >
                    <FileText className="w-4 h-4" />
                    مشاركة ملف
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              {messagesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-slate-200 rounded animate-pulse mb-2"></div>
                        <div className="h-6 bg-slate-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.senderType === 'patient' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.senderType === 'doctor' && (
                        <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center">
                          <Stethoscope className="w-4 h-4 text-white" />
                        </div>
                      )}
                      
                      <div className={`max-w-md ${
                        message.senderType === 'patient' 
                          ? 'bg-ai-purple text-white' 
                          : 'bg-white border border-slate-200'
                      } rounded-lg p-3`}>
                        <p className="text-sm">{message.content}</p>
                        {message.attachmentUrl && (
                          <div className="mt-2 p-2 bg-slate-100 rounded flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <a 
                              href={message.attachmentUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              عرض الملف
                            </a>
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-70">
                            {format(new Date(message.timestamp), 'HH:mm', { locale: ar })}
                          </span>
                          {message.senderType === 'patient' && (
                            <div className="flex items-center">
                              {message.isRead ? (
                                <CheckCircle className="w-3 h-3 opacity-70" />
                              ) : (
                                <Circle className="w-3 h-3 opacity-70" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {message.senderType === 'patient' && (
                        <div className="w-8 h-8 bg-ai-purple rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {typingUsers.length > 0 && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center">
                        <Stethoscope className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white border border-slate-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                          <span className="text-xs text-slate-600">الطبيب يكتب...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="bg-white border-t border-slate-200 p-4">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-attach-file"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      if (!isTyping) {
                        handleTyping();
                      }
                    }}
                    placeholder="اكتب رسالتك للطبيب..."
                    className="text-right pl-12"
                    data-testid="input-message"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="bg-ai-purple hover:bg-ai-purple/90"
                  data-testid="button-send-message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">
                اختر استشارة للبدء
              </h3>
              <p className="text-slate-500">
                اختر استشارة من القائمة للبدء في المحادثة مع الطبيب
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}