import { ProfessionalFaceAppStudio } from "@/components/professional-faceapp-studio";
import DemoVideoMaker from "@/components/demo-video-maker";
import { ArrowLeft, Wand2, Video } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FaceAppPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between" dir="rtl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FaceApp Studio Professional</h1>
                <p className="text-sm text-gray-600">تحرير الوجه بالذكاء الاصطناعي + عرض توضيحي</p>
              </div>
            </div>
            
            <Link href="/" className="no-underline">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                العودة للرئيسية
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Tabs defaultValue="studio" className="w-full" dir="rtl">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6">
              <TabsTrigger value="studio" className="flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                الاستوديو المهني
              </TabsTrigger>
              <TabsTrigger value="demo" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                العرض التوضيحي
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="studio">
              <ProfessionalFaceAppStudio />
            </TabsContent>
            
            <TabsContent value="demo">
              <DemoVideoMaker />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}