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
  Eye
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
  patientName: string;
  patientPhone: string;
  consultationType: string;
  status: string;
  appointmentDate: string;
  notes?: string;
  meetingLink?: string;
}

export default function DoctorPortal() {
  const [selectedConsultation, setSelectedConsultation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch consultations
  const { data: consultations = [], isLoading: consultationsLoading } = useQuery<Consultation[]>({
    queryKey: ['/api/booking-consultations/doctor'],
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
        }
        
        if (data.type === 'user_typing') {
          setTypingUsers(prev => [...prev.filter(id => id !== data.userId), data.userId]);
        }
        
        if (data.type === 'user_stop_typing') {
          setTypingUsers(prev => prev.filter(id => id !== data.userId));
        }
        
        if (data.type === 'video_call_scheduled' || data.type === 'file_shared') {
          queryClient.invalidateQueries({ queryKey: ['/api/booking-consultations/doctor'] });
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
  }, [queryClient, selectedConsultation]);

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
        description: "تم مشاركة الملف مع المريض بنجاح",
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
      senderId: "current-doctor-id", // Should come from auth
      senderType: "doctor",
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
    formData.append('uploadedBy', 'current-doctor-id'); // Should come from auth
    formData.append('fileType', file.type.startsWith('image/') ? 'image' : 'document');
    formData.append('description', `ملف طبي: ${file.name}`);

    fileUploadMutation.mutate(formData);
  };

  const handleTyping = () => {
    if (ws && selectedConsultation) {
      ws.send(JSON.stringify({
        type: 'typing',
        consultationId: selectedConsultation,
        userId: 'current-doctor-id',
        senderType: 'doctor'
      }));
      
      setIsTyping(true);
      setTimeout(() => {
        if (ws) {
          ws.send(JSON.stringify({
            type: 'stop_typing',
            consultationId: selectedConsultation,
            userId: 'current-doctor-id'
          }));
        }
        setIsTyping(false);
      }, 2000);
    }
  };

  const scheduleVideoCall = () => {
    if (!selectedConsultation) return;
    
    const videoCallData = {
      consultationId: selectedConsultation,
      doctorId: 'current-doctor-id',
      patientId: 'patient-id', // Should come from consultation data
      scheduledTime: new Date().toISOString(),
      duration: 30
    };

    // This would trigger the video call scheduling
    apiRequest('POST', '/api/video-calls', videoCallData)
      .then(() => {
        toast({
          title: "تم جدولة المكالمة",
          description: "تم إرسال رابط المكالمة للمريض",
        });
      })
      .catch(() => {
        toast({
          title: "خطأ في الجدولة",
          description: "فشل في جدولة المكالمة المرئية",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="h-screen bg-slate-50 flex" dir="rtl">
      {/* Sidebar - Consultations List */}
      <div className="w-80 bg-white border-l border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-medical-blue" />
            المحادثات النشطة
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {consultations.length} استشارة نشطة
          </p>
        </div>

        <ScrollArea className="flex-1">
          {consultationsLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-slate-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {consultations.map((consultation) => (
                <Card 
                  key={consultation.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedConsultation === consultation.id 
                      ? 'bg-medical-blue/10 border-medical-blue' 
                      : 'hover:bg-slate-50'
                  }`}
                  onClick={() => setSelectedConsultation(consultation.id)}
                  data-testid={`consultation-card-${consultation.id}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-ai-purple rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">
                          {consultation.patientName}
                        </h3>
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                  <div className="w-10 h-10 bg-ai-purple rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {consultations.find(c => c.id === selectedConsultation)?.patientName}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {consultations.find(c => c.id === selectedConsultation)?.consultationType}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={scheduleVideoCall}
                    className="flex items-center gap-2"
                    data-testid="button-video-call"
                  >
                    <Video className="w-4 h-4" />
                    مكالمة مرئية
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
                        message.senderType === 'doctor' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.senderType === 'patient' && (
                        <div className="w-8 h-8 bg-ai-purple rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                      
                      <div className={`max-w-md ${
                        message.senderType === 'doctor' 
                          ? 'bg-medical-blue text-white' 
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
                          {message.senderType === 'doctor' && (
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

                      {message.senderType === 'doctor' && (
                        <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {typingUsers.length > 0 && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-ai-purple rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white border border-slate-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                          <span className="text-xs text-slate-600">يكتب...</span>
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
                    placeholder="اكتب رسالتك هنا..."
                    className="text-right pl-12"
                    data-testid="input-message"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="bg-medical-blue hover:bg-medical-blue/90"
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
                اختر استشارة من القائمة للبدء في المحادثة مع المريض
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}