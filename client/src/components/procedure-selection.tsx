import { Zap, Smile, User, Sparkles } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ProcedureSelectionProps {
  selectedProcedure: string;
  onProcedureChange: (value: string) => void;
}

export default function ProcedureSelection({ selectedProcedure, onProcedureChange }: ProcedureSelectionProps) {
  const procedures = [
    {
      id: "rhinoplasty",
      icon: <Zap className="w-5 h-5 text-slate-400" />,
      title: "تجميل الأنف",
      description: "جراحة إعادة تشكيل الأنف"
    },
    {
      id: "dental",
      icon: <Smile className="w-5 h-5 text-slate-400" />,
      title: "طب الأسنان التجميلي",
      description: "تقويم وتبييض الأسنان"
    },
    {
      id: "facelift",
      icon: <User className="w-5 h-5 text-slate-400" />,
      title: "نحت الوجه",
      description: "شد ونحت الوجه"
    },
    {
      id: "scar_removal",
      icon: <Sparkles className="w-5 h-5 text-slate-400" />,
      title: "إزالة الندبات",
      description: "تقليل الندبات وعلاج الجلد"
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6" dir="rtl">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
        <Zap className="text-medical-blue ml-3 w-5 h-5" />
        نوع العملية
      </h3>
      
      <RadioGroup 
        value={selectedProcedure} 
        onValueChange={onProcedureChange}
        className="space-y-3"
        data-testid="procedure-selection"
      >
        {procedures.map((procedure) => (
          <div key={procedure.id} className="flex items-center space-x-2">
            <RadioGroupItem 
              value={procedure.id} 
              id={procedure.id}
              data-testid={`radio-procedure-${procedure.id}`}
            />
            <Label 
              htmlFor={procedure.id}
              className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer flex-1"
            >
              <div className="flex items-center w-full">
                {procedure.icon}
                <div className="ml-3">
                  <p className="font-medium text-slate-900">{procedure.title}</p>
                  <p className="text-sm text-slate-500">{procedure.description}</p>
                </div>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
