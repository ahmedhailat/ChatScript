import { useState } from "react";
import { Brain, User } from "lucide-react";

export default function Header() {
  const [language, setLanguage] = useState<"en" | "ar">("en");

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-medical-blue rounded-lg flex items-center justify-center">
              <Brain className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">MedVision AI</h1>
              <p className="text-xs text-slate-500">منصة التصور الجراحي</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <div className="flex bg-slate-100 rounded-lg p-1" data-testid="language-toggle">
              <button 
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  language === "en" 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
                onClick={() => setLanguage("en")}
                data-testid="button-language-en"
              >
                EN
              </button>
              <button 
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  language === "ar" 
                    ? "bg-white text-slate-900 shadow-sm" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
                onClick={() => setLanguage("ar")}
                data-testid="button-language-ar"
              >
                العربية
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-medium text-slate-700" data-testid="text-doctor-name">
                د. أحمد الراشد
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
