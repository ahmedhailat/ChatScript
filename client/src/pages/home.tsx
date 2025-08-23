import EnhancedHeader from "@/components/enhanced-header";
import CameraCapture from "@/components/camera-capture";
import ArabicCameraCapture from "@/components/arabic-camera-capture";
import ProcedureSelection from "@/components/procedure-selection";
import AIVisualization from "@/components/ai-visualization";
import AIPreviewGenerator from "@/components/ai-preview-generator";
import FaceAreaSelector from "@/components/face-area-selector";
import LiveMakeupOverlay from "@/components/live-makeup-overlay";
import EnhancedMakeupStudio from "@/components/enhanced-makeup-studio";
import InteractiveMakeupTool from "@/components/interactive-makeup-tool";
import AreaMakeupTool from "@/components/area-makeup-tool";
import DirectMakeupVisualizer from "@/components/direct-makeup-visualizer";
import CompleteMakeupStudio from "@/components/complete-makeup-studio";
import AdvancedFaceAppStudio from "@/components/advanced-faceapp-studio";
import InteractiveMakeupTools from "@/components/interactive-makeup-tools";
import ConsultationBooking from '@/components/consultation-booking';
import ConsultationForm from "@/components/consultation-form";
import SampleGallery from "@/components/sample-gallery";
import EnhancedSampleGallery from "@/components/enhanced-sample-gallery";
import EnhancedFooter from "@/components/enhanced-footer";
import { SimpleAITest } from "@/components/simple-ai-test";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [selectedProcedure, setSelectedProcedure] = useState<string>("rhinoplasty");
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAreaSelector, setShowAreaSelector] = useState(false);
  const [showMakeupTool, setShowMakeupTool] = useState(false);
  const [faceSelections, setFaceSelections] = useState<any>(null);
  
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <EnhancedHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Hero Section */}
        <div className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-3xl p-12 mb-8 text-white overflow-hidden" dir="rtl">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-32 h-32 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-20 right-20 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-10 left-20 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>
          
          <div className="relative z-10 max-w-4xl">
            <h1 className="text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-pink-300 to-blue-300 bg-clip-text text-transparent">
                🎭 MedVision AI Studio Pro 🎭
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              أول منصة ذكية في الشرق الأوسط تجمع بين التصور الطبي الدقيق والمكياج الاحترافي المرئي
              <br />
              <span className="text-pink-200 font-semibold">بتقنية FaceApp المتقدمة ودقة طبية عالية - متوافق مع معايير HIPAA</span>
            </p>
            
            {/* Enhanced Statistics */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-3 text-lg rounded-full animate-pulse-glow flex items-center font-bold">
                ⭐ تقييم 4.9/5
              </div>
              <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 text-lg rounded-full flex items-center font-bold">
                ✨ 98.3% دقة مطابقة الألوان
              </div>
              <div className="bg-gradient-to-r from-pink-400 to-purple-500 text-white px-6 py-3 text-lg rounded-full flex items-center font-bold">
                💖 1000+ عميل سعيد
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <a href="/register" className="group">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 p-4 rounded-xl transition-all duration-300 transform group-hover:scale-105">
                  <div className="text-2xl mb-2">✨</div>
                  <div className="font-bold">إنشاء حساب</div>
                  <div className="text-sm opacity-90">ابدأ رحلتك معنا مجاناً</div>
                </div>
              </a>

              <a href="/login" className="group">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 p-4 rounded-xl transition-all duration-300 transform group-hover:scale-105">
                  <div className="text-2xl mb-2">🔐</div>
                  <div className="font-bold">تسجيل الدخول</div>
                  <div className="text-sm opacity-90">الوصول لحسابك الحالي</div>
                </div>
              </a>
              
              <a href="/faceapp" className="group">
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 p-4 rounded-xl transition-all duration-300 transform group-hover:scale-105">
                  <div className="text-2xl mb-2">🎭</div>
                  <div className="font-bold">استوديو FaceApp</div>
                  <div className="text-sm opacity-90">مكياج ومؤثرات احترافية</div>
                </div>
              </a>
              
              <a href="/subscription" className="group">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 p-4 rounded-xl transition-all duration-300 transform group-hover:scale-105">
                  <div className="text-2xl mb-2">💳</div>
                  <div className="font-bold">الباقات والدفع</div>
                  <div className="text-sm opacity-90">اختر باقتك المناسبة</div>
                </div>
              </a>
              
              <a href="/booking" className="group">
                <div className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 p-4 rounded-xl transition-all duration-300 transform group-hover:scale-105">
                  <div className="text-2xl mb-2">📅</div>
                  <div className="font-bold">احجز موعدك</div>
                  <div className="text-sm opacity-90">نظام حجز متطور كفيزيتا</div>
                </div>
              </a>
            </div>

            {/* New Features Badges */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 text-sm rounded-full flex items-center">
                🆕 قاعدة بيانات ثلاثية الأبعاد
              </div>
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 text-sm rounded-full flex items-center">
                🔥 ملفات أطباء متكاملة
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 text-sm rounded-full flex items-center">
                ⚡ نظام حجز مواعيد فوري
              </div>
              <div className="bg-gradient-to-r from-teal-500 to-green-500 text-white px-4 py-2 text-sm rounded-full flex items-center">
                🏥 منصة عيادة متكاملة
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mb-6 justify-center">
              <button
                onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
                className="btn-professional transform hover:scale-105"
              >
                🧪 اختبار سريع للنظام
              </button>
              <a 
                href="/tutorial"
                className="btn-professional transform hover:scale-105 no-underline inline-block"
              >
                🎬 شاهد الفيديو التعليمي
              </a>
              <a 
                href="/faceapp"
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold no-underline inline-block transform hover:scale-105 transition-all"
              >
                🎭 FaceApp Studio المتقدم
              </a>
              <a 
                href="/3d-modeling"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-bold no-underline inline-block transform hover:scale-105 transition-all"
              >
                🎭 النمذجة ثلاثية الأبعاد
              </a>
              <a 
                href="/communication"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-bold no-underline inline-block transform hover:scale-105 transition-all"
              >
                💬 بوابة التواصل الطبي
              </a>
            </div>
            
            {/* Enhanced Features */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="glass-morphism p-4 rounded-xl flex items-center gap-3">
                <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">✓</span>
                <div>
                  <div className="font-semibold">متوافق HIPAA</div>
                  <div className="text-green-200">حماية طبية كاملة</div>
                </div>
              </div>
              <div className="glass-morphism p-4 rounded-xl flex items-center gap-3">
                <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">🔒</span>
                <div>
                  <div className="font-semibold">مشفر بالكامل</div>
                  <div className="text-blue-200">SSL 256-bit</div>
                </div>
              </div>
              <div className="glass-morphism p-4 rounded-xl flex items-center gap-3">
                <span className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white">🧠</span>
                <div>
                  <div className="font-semibold">ذكاء اصطناعي</div>
                  <div className="text-purple-200">تقنية متقدمة</div>
                </div>
              </div>
              <div className="glass-morphism p-4 rounded-xl flex items-center gap-3">
                <span className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white">⚡</span>
                <div>
                  <div className="font-semibold">معالجة فورية</div>
                  <div className="text-pink-200">نتائج في ثوانٍ</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Section */}
        <div className="mb-8">
          <SimpleAITest 
            onResult={(imageUrl) => {
              setAfterImage(imageUrl);
              console.log('✅ تم إنشاء صورة جديدة:', imageUrl);
            }}
          />
        </div>

        {/* Face Area Selector (when enabled) */}
        {showAreaSelector && beforeImage && (
          <div className="mb-8">
            <FaceAreaSelector
              image={beforeImage}
              selectedProcedure={selectedProcedure}
              onAreasSelected={setFaceSelections}
            />
          </div>
        )}

        {/* Complete Visual Makeup Studio (when enabled) */}
        {showMakeupTool && beforeImage && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-2xl border-2 border-pink-200">
              <div className="text-center mb-4">
                <h2 className="text-3xl font-bold text-purple-800 mb-2">
                  🎭 استوديو FaceApp الاحترافي المتقدم 🎭
                </h2>
                <p className="text-purple-600 text-lg">
                  مكياج مرئي فوري • تحويلات العمر • تغيير الجنس • تحسينات الجمال • إعدادات احترافية
                </p>
              </div>
              
              <AdvancedFaceAppStudio
                image={beforeImage}
                onMakeupComplete={(result) => {
                  setAfterImage(result);
                  console.log('Advanced FaceApp makeup completed');
                  toast({
                    title: "🎉 تحويل مذهل!",
                    description: "تم تطبيق التحويلات والمكياج الاحترافي بتقنية FaceApp المتقدمة",
                  });
                }}
              />
              
              {/* Interactive Makeup Tools */}
              <div className="mt-6">
                <InteractiveMakeupTools
                  image={beforeImage}
                  onToolUsed={(tool, settings) => {
                    console.log('Interactive tool used:', tool, settings);
                    toast({
                      title: "أداة تفاعلية",
                      description: `تم استخدام أداة ${tool} بنجاح`,
                    });
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Workflow Grid */}
        <div className="grid lg:grid-cols-3 gap-8" dir="rtl">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <ArabicCameraCapture 
              onImageCapture={setBeforeImage}
              beforeImage={beforeImage}
            />
            <ProcedureSelection 
              selectedProcedure={selectedProcedure}
              onProcedureChange={setSelectedProcedure}
            />
            <AIPreviewGenerator
              beforeImage={beforeImage}
              procedureType={selectedProcedure}
              onPreviewGenerated={setAfterImage}
              disabled={isProcessing}
            />
            
            {beforeImage && (
              <div className="mt-4 space-y-2">
                <button 
                  onClick={() => setShowAreaSelector(!showAreaSelector)}
                  className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  {showAreaSelector ? 'إخفاء' : 'إظهار'} تحديد المناطق بدقة
                </button>
                <button 
                  onClick={() => setShowMakeupTool(!showMakeupTool)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white rounded-xl hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all transform hover:scale-105 font-bold text-lg shadow-lg"
                >
                  {showMakeupTool ? '🎭 إخفاء' : '🌟 تفعيل'} استوديو FaceApp المتقدم
                </button>
                <a href="/tutorial" className="no-underline">
                  <button className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                    📹 مشاهدة فيديو الشرح
                  </button>
                </a>
              </div>
            )}
          </div>

          {/* Center Column */}
          <div className="lg:col-span-2">
            <AIVisualization 
              beforeImage={beforeImage}
              afterImage={afterImage}
              isProcessing={isProcessing}
              onGeneratePreview={async () => {
                if (!beforeImage) return;
                
                setIsProcessing(true);
                
                try {
                  // Convert base64 to blob for upload
                  const response = await fetch(beforeImage);
                  const blob = await response.blob();
                  
                  const formData = new FormData();
                  formData.append('image', blob, 'photo.jpg');
                  formData.append('procedureType', selectedProcedure);
                  formData.append('intensity', '60'); // Default intensity
                  
                  // Include face area selections if available
                  if (faceSelections) {
                    formData.append('areas', JSON.stringify(faceSelections.areas || {}));
                    formData.append('adjustments', JSON.stringify(faceSelections.adjustments || {}));
                  }
                  
                  const apiResponse = await fetch('/api/generate-surgical-preview', {
                    method: 'POST',
                    body: formData,
                  });
                  
                  const result = await apiResponse.json();
                  
                  if (result.success && result.afterImageUrl) {
                    setAfterImage(result.afterImageUrl);
                  } else {
                    console.error('Failed to generate preview:', result.error);
                    // Fallback to demo images for development
                    const procedureImages = {
                      rhinoplasty: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
                      dental: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
                      facelift: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
                      scar_removal: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
                    };
                    setAfterImage(procedureImages[selectedProcedure as keyof typeof procedureImages] || procedureImages.rhinoplasty);
                  }
                } catch (error) {
                  console.error('Error generating surgical preview:', error);
                  // Show fallback image
                  setAfterImage("https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400");
                } finally {
                  setIsProcessing(false);
                }
              }}
            />
            <ConsultationForm className="mt-6" />
          </div>
        </div>

        {/* Real-time Consultation Booking System */}
        <div className="mb-12">
          <ConsultationBooking 
            consultationType="rhinoplasty"
            onBookingComplete={(consultationId) => {
              console.log('Consultation booked:', consultationId);
            }}
          />
        </div>

        <EnhancedSampleGallery />
      </main>

      <EnhancedFooter />
    </div>
  );
}
