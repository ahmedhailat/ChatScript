import { ArrowLeft, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { DemoVideoTutorial } from "@/components/demo-video-tutorial";
import { ActualVideoTutorial } from "@/components/actual-video-tutorial";
import { RealTutorialVideo } from "@/components/real-tutorial-video";

export default function TutorialPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8" dir="rtl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">شرح FaceApp Studio</h1>
              <p className="text-slate-600">فيديو تعليمي شامل لجميع تأثيرات تحرير الوجه</p>
            </div>
          </div>
          
          <Link href="/" className="no-underline">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              العودة للرئيسية
            </Button>
          </Link>
        </div>

        {/* Interactive Tutorial Video Component */}
        <DemoVideoTutorial />
      </div>
    </div>
  );
}