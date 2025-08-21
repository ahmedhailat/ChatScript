import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowRight, Home } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50" dir="rtl">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">الصفحة غير موجودة</h2>

          <p className="mt-4 text-sm text-gray-600 mb-6">
            عذراً، الصفحة التي تبحث عنها غير متاحة أو تم نقلها إلى موقع آخر
          </p>

          <Link href="/" className="no-underline">
            <Button className="bg-medical-blue hover:bg-blue-700 text-white">
              <Home className="w-4 h-4 ml-2" />
              العودة للرئيسية
              <ArrowRight className="w-4 h-4 mr-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
