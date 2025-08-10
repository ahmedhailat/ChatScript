import Header from "@/components/header";
import CameraCapture from "@/components/camera-capture";
import ProcedureSelection from "@/components/procedure-selection";
import AIVisualization from "@/components/ai-visualization";
import ConsultationForm from "@/components/consultation-form";
import SampleGallery from "@/components/sample-gallery";
import Footer from "@/components/footer";
import { useState } from "react";

export default function Home() {
  const [selectedProcedure, setSelectedProcedure] = useState<string>("rhinoplasty");
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="medical-gradient rounded-2xl p-8 mb-8 text-white">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-4">AI-Powered Surgical Visualization</h2>
            <p className="text-blue-100 mb-6">
              Advanced artificial intelligence technology to help visualize potential surgical outcomes. 
              Secure, HIPAA-compliant, and designed for medical professionals.
            </p>
            
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <i className="fas fa-shield-alt"></i>
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-lock"></i>
                <span>End-to-End Encrypted</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-certificate"></i>
                <span>Medical Grade AI</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Workflow Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <CameraCapture 
              onImageCapture={setBeforeImage}
              beforeImage={beforeImage}
            />
            <ProcedureSelection 
              selectedProcedure={selectedProcedure}
              onProcedureChange={setSelectedProcedure}
            />
          </div>

          {/* Center Column */}
          <div className="lg:col-span-2">
            <AIVisualization 
              beforeImage={beforeImage}
              afterImage={afterImage}
              isProcessing={isProcessing}
              onGeneratePreview={() => {
                setIsProcessing(true);
                // Simulate AI processing with more realistic effects
                setTimeout(() => {
                  // Different results based on selected procedure
                  const procedureImages = {
                    rhinoplasty: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
                    dental: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
                    facelift: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
                    scar_removal: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
                  };
                  
                  setAfterImage(procedureImages[selectedProcedure as keyof typeof procedureImages] || procedureImages.rhinoplasty);
                  setIsProcessing(false);
                }, 3000);
              }}
            />
            <ConsultationForm className="mt-6" />
          </div>
        </div>

        <SampleGallery />
      </main>

      <Footer />
    </div>
  );
}
