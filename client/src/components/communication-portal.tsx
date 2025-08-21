import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Send, 
  Phone, 
  Video, 
  Paperclip, 
  Download,
  Clock,
  CheckCircle2,
  User,
  UserCog,
  Calendar,
  FileText,
  Image as ImageIcon,
  Mic
} from 'lucide-react';

interface Message {
  id: string;
  consultationId: string;
  senderId: string;
  senderType: 'doctor' | 'patient';
  content: string;
  messageType: 'text' | 'image' | 'file' | 'voice_note' | 'video_call_request';
  attachmentUrl?: string;
  isRead: boolean;
  timestamp: Date;
  replyToMessageId?: string;
}

interface FileShare {
  id: string;
  consultationId: string;
  uploadedBy: string;
  fileName: string;
  fileType: 'image' | 'document' | 'medical_report' | 'prescription';
  fileUrl: string;
  fileSize: number;
  description?: string;
  uploadedAt: Date;
}

interface VideoCall {
  id: string;
  consultationId: string;
  doctorId: string;
  patientId: string;
  scheduledTime: Date;
  duration: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  meetingUrl?: string;
}

export default function CommunicationPortal() {
  const [consultationId] = useState('consultation_demo_123');
  const [currentUserId] = useState('user_123');
  const [userType] = useState<'doctor' | 'patient'>('patient');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [files, setFiles] = useState<FileShare[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoCall, setVideoCall] = useState<VideoCall | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load conversation history on mount
  useEffect(() => {
    loadConversationHistory();
    loadFiles();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversationHistory = async () => {
    setIsLoadingMessages(true);
    try {
      const response = await apiRequest('GET', `/api/communication/conversation/${consultationId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setMessages(result.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "خطأ في تحميل المحادثة",
        description: "حدث خطأ في تحميل الرسائل",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const loadFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const response = await apiRequest('GET', `/api/communication/files/${consultationId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setFiles(result.files.map((file: any) => ({
            ...file,
            uploadedAt: new Date(file.uploadedAt)
          })));
        }
      }
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;

    setIsSending(true);
    try {
      let attachmentUrl = undefined;

      // Upload file if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('consultationId', consultationId);
        formData.append('uploadedBy', currentUserId);
        formData.append('fileType', getFileType(selectedFile.type));
        formData.append('description', `ملف مرفق: ${selectedFile.name}`);

        const uploadResponse = await apiRequest('POST', '/api/communication/upload-file', formData);
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          if (uploadResult.success) {
            attachmentUrl = uploadResult.fileShare.fileUrl;
          }
        }
      }

      // Send message
      const messageData = {
        consultationId,
        senderId: currentUserId,
        senderType: userType,
        content: newMessage || `تم إرسال ملف: ${selectedFile?.name}`,
        messageType: selectedFile ? getMessageType(selectedFile.type) : 'text',
        attachmentUrl
      };

      const response = await apiRequest('POST', '/api/communication/send-message', messageData);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setMessages(prev => [...prev, result.message]);
          setNewMessage('');
          setSelectedFile(null);
          
          toast({
            title: "تم إرسال الرسالة",
            description: "تم إرسال رسالتك بنجاح",
          });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "خطأ في الإرسال",
        description: "فشل في إرسال الرسالة",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const scheduleVideoCall = async () => {
    try {
      const callData = {
        consultationId,
        doctorId: userType === 'doctor' ? currentUserId : 'doctor_123',
        patientId: userType === 'patient' ? currentUserId : 'patient_123',
        scheduledTime: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
        duration: 30
      };

      const response = await apiRequest('POST', '/api/communication/schedule-call', callData);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setVideoCall(result.videoCall);
          toast({
            title: "تم جدولة المكالمة",
            description: "تم جدولة مكالمة فيديو بنجاح",
          });
        }
      }
    } catch (error) {
      console.error('Error scheduling call:', error);
      toast({
        title: "خطأ في الجدولة",
        description: "فشل في جدولة المكالمة",
        variant: "destructive",
      });
    }
  };

  const startVideoCall = async (callId: string) => {
    try {
      const response = await apiRequest('POST', `/api/communication/start-call/${callId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // In a real app, open video call interface
          window.open(result.meetingDetails.meetingUrl, '_blank');
          toast({
            title: "تم بدء المكالمة",
            description: "تم فتح نافذة المكالمة",
          });
        }
      }
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: "خطأ في المكالمة",
        description: "فشل في بدء المكالمة",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "حجم الملف كبير",
          description: "يرجى اختيار ملف أصغر من 10 ميجابايت",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const getFileType = (mimeType: string): 'image' | 'document' | 'medical_report' | 'prescription' => {
    if (mimeType.startsWith('image/')) return 'image';
    return 'document';
  };

  const getMessageType = (mimeType: string): 'text' | 'image' | 'file' => {
    if (mimeType.startsWith('image/')) return 'image';
    return 'file';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'كيلو بايت', 'ميجا بايت', 'جيجا بايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserName = (senderId: string, senderType: string): string => {
    if (senderType === 'doctor') return 'د. أحمد محمد';
    return 'المريض';
  };

  const getUserAvatar = (senderType: string): string => {
    return senderType === 'doctor' ? '/api/placeholder/doctor-avatar' : '/api/placeholder/patient-avatar';
  };

  return (
    <Card className="max-w-6xl mx-auto" dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <UserCog className="ml-2 w-6 h-6 text-blue-600" />
            بوابة التواصل بين الطبيب والمريض
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Badge variant="destructive" data-testid="badge-unread-count">
                {unreadCount} رسالة جديدة
              </Badge>
            )}
            <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-blue-50">
              <CheckCircle2 className="w-3 h-3 ml-1" />
              متصل
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="messages" data-testid="tab-messages">المحادثة</TabsTrigger>
            <TabsTrigger value="files" data-testid="tab-files">الملفات</TabsTrigger>
            <TabsTrigger value="calls" data-testid="tab-calls">المكالمات</TabsTrigger>
          </TabsList>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50 min-h-[400px] flex flex-col">
              
              {/* Messages Area */}
              <ScrollArea className="flex-1 pr-4" style={{ height: '350px' }}>
                {isLoadingMessages ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                        data-testid={`message-${message.id}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === currentUserId
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border'
                        }`}>
                          
                          {/* Message Header */}
                          <div className="flex items-center space-x-2 mb-1">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={getUserAvatar(message.senderType)} />
                              <AvatarFallback>
                                {message.senderType === 'doctor' ? 'د' : 'م'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs opacity-70">
                              {getUserName(message.senderId, message.senderType)}
                            </span>
                          </div>
                          
                          {/* Message Content */}
                          <div className="space-y-2">
                            {message.content && (
                              <p className="text-sm" data-testid={`text-message-content-${message.id}`}>
                                {message.content}
                              </p>
                            )}
                            
                            {/* Attachment */}
                            {message.attachmentUrl && (
                              <div className="border rounded p-2 bg-gray-100">
                                {message.messageType === 'image' ? (
                                  <img 
                                    src={message.attachmentUrl} 
                                    alt="صورة مرفقة" 
                                    className="max-w-full h-auto rounded"
                                    data-testid={`img-attachment-${message.id}`}
                                  />
                                ) : (
                                  <div className="flex items-center space-x-2">
                                    <FileText className="w-4 h-4" />
                                    <span className="text-xs">ملف مرفق</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Message Time */}
                          <div className="text-xs opacity-50 mt-1 text-left" data-testid={`text-message-time-${message.id}`}>
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center space-x-2">
                  
                  {/* File Attachment */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    data-testid="input-file-attachment"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="button-attach-file"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>

                  {/* Voice Note */}
                  <Button variant="outline" size="sm" data-testid="button-voice-note">
                    <Mic className="w-4 h-4" />
                  </Button>

                  {/* Video Call */}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={scheduleVideoCall}
                    data-testid="button-video-call"
                  >
                    <Video className="w-4 h-4" />
                  </Button>

                  {/* Message Input */}
                  <div className="flex-1">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="اكتب رسالتك هنا..."
                      className="resize-none"
                      rows={2}
                      data-testid="textarea-message"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                  </div>

                  {/* Send Button */}
                  <Button
                    onClick={sendMessage}
                    disabled={(!newMessage.trim() && !selectedFile) || isSending}
                    data-testid="button-send-message"
                  >
                    {isSending ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* Selected File Preview */}
                {selectedFile && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Paperclip className="w-4 h-4" />
                      <span className="text-sm" data-testid="text-selected-file">
                        {selectedFile.name} ({formatFileSize(selectedFile.size)})
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                      data-testid="button-remove-file"
                    >
                      إلغاء
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoadingFiles ? (
                <div className="col-span-full flex justify-center items-center h-32">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
              ) : (
                files.map((file) => (
                  <Card key={file.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {file.fileType === 'image' ? (
                            <ImageIcon className="w-5 h-5 text-blue-600" />
                          ) : (
                            <FileText className="w-5 h-5 text-gray-600" />
                          )}
                          <span className="text-sm font-medium" data-testid={`text-file-name-${file.id}`}>
                            {file.fileName}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" data-testid={`button-download-${file.id}`}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {file.description && (
                        <p className="text-xs text-gray-600 mb-2" data-testid={`text-file-description-${file.id}`}>
                          {file.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatFileSize(file.fileSize)}</span>
                        <span>{formatTime(file.uploadedAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Video Calls Tab */}
          <TabsContent value="calls" className="space-y-4">
            <div className="space-y-4">
              
              {/* Schedule New Call */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">جدولة مكالمة فيديو جديدة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="call-date">التاريخ والوقت</Label>
                      <Input 
                        type="datetime-local" 
                        id="call-date"
                        min={new Date().toISOString().slice(0, 16)}
                        data-testid="input-call-datetime"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="call-duration">المدة (بالدقائق)</Label>
                      <Input 
                        type="number" 
                        id="call-duration" 
                        defaultValue="30"
                        min="15" 
                        max="120"
                        data-testid="input-call-duration"
                      />
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4"
                    onClick={scheduleVideoCall}
                    data-testid="button-schedule-call"
                  >
                    <Calendar className="w-4 h-4 ml-2" />
                    جدولة المكالمة
                  </Button>
                </CardContent>
              </Card>

              {/* Scheduled Calls */}
              {videoCall && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">المكالمات المجدولة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Video className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium" data-testid="text-call-time">
                            {videoCall.scheduledTime.toLocaleString('ar-SA')}
                          </p>
                          <p className="text-sm text-gray-600">
                            المدة: {videoCall.duration} دقيقة
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={
                            videoCall.status === 'scheduled' ? 'default' :
                            videoCall.status === 'active' ? 'destructive' :
                            videoCall.status === 'completed' ? 'secondary' : 'outline'
                          }
                          data-testid="badge-call-status"
                        >
                          {videoCall.status === 'scheduled' ? 'مجدولة' :
                           videoCall.status === 'active' ? 'جارية' :
                           videoCall.status === 'completed' ? 'مكتملة' : 'ملغية'}
                        </Badge>
                        {videoCall.status === 'scheduled' && (
                          <Button
                            size="sm"
                            onClick={() => startVideoCall(videoCall.id)}
                            data-testid="button-start-call"
                          >
                            <Video className="w-4 h-4 ml-2" />
                            بدء المكالمة
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}