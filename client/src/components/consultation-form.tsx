import { useState } from "react";
import { ClipboardList, Save, Share, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ConsultationFormProps {
  className?: string;
}

export default function ConsultationForm({ className }: ConsultationFormProps) {
  const [formData, setFormData] = useState({
    patientName: "",
    age: "",
    medicalHistory: "",
    notes: ""
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Consultation saved",
      description: "Patient consultation details have been saved successfully.",
    });
  };

  const handleShare = () => {
    toast({
      title: "Sharing with patient",
      description: "Results will be securely shared with the patient.",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={cn("bg-white rounded-xl shadow-sm border border-slate-200 p-6", className)} dir="rtl">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
        <ClipboardList className="text-medical-blue ml-3 w-5 h-5" />
        تفاصيل الاستشارة
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="patientName" className="text-sm font-medium text-slate-700">
                اسم المريض
              </Label>
              <Input
                id="patientName"
                type="text"
                placeholder="أدخل اسم المريض"
                value={formData.patientName}
                onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                className="mt-2 text-right"
                data-testid="input-patient-name"
              />
            </div>
            
            <div>
              <Label htmlFor="age" className="text-sm font-medium text-slate-700">
                العمر
              </Label>
              <Input
                id="age"
                type="number"
                placeholder="عمر المريض"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                className="mt-2"
                data-testid="input-patient-age"
              />
            </div>
            
            <div>
              <Label htmlFor="medicalHistory" className="text-sm font-medium text-slate-700">
                Medical History
              </Label>
              <Select 
                value={formData.medicalHistory} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, medicalHistory: value }))}
              >
                <SelectTrigger className="mt-2" data-testid="select-medical-history">
                  <SelectValue placeholder="Select medical history" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No previous surgeries</SelectItem>
                  <SelectItem value="cosmetic">Previous cosmetic procedures</SelectItem>
                  <SelectItem value="other">Other medical conditions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-slate-700">
              Consultation Notes
            </Label>
            <Textarea
              id="notes"
              rows={6}
              placeholder="Add consultation notes, patient expectations, and recommendations..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="mt-2"
              data-testid="textarea-consultation-notes"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button 
            type="submit"
            className="bg-medical-blue hover:bg-blue-700"
            data-testid="button-save-consultation"
          >
            <Save className="mr-2 w-4 h-4" />
            Save Consultation
          </Button>
          <Button 
            type="button"
            className="bg-medical-success hover:bg-green-700"
            onClick={handleShare}
            data-testid="button-share-results"
          >
            <Share className="mr-2 w-4 h-4" />
            Share with Patient
          </Button>
          <Button 
            type="button"
            variant="outline"
            onClick={handlePrint}
            data-testid="button-print-report"
          >
            <Printer className="mr-2 w-4 h-4" />
            Print Report
          </Button>
        </div>
      </form>
    </div>
  );
}
