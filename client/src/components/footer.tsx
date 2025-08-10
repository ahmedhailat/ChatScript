import { Shield, Lock, Award, CheckCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Medical Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
          <h4 className="font-semibold text-amber-800 mb-3 flex items-center">
            <Shield className="mr-2 w-5 h-5" />
            Important Medical Disclaimer
          </h4>
          <div className="text-sm text-amber-700 space-y-2">
            <p>• This AI visualization tool is for educational and consultation purposes only and does not constitute medical advice.</p>
            <p>• Results shown are computer-generated predictions and may not reflect actual surgical outcomes.</p>
            <p>• Always consult with qualified medical professionals before making any surgical decisions.</p>
            <p>• Individual results may vary based on anatomy, healing process, and other medical factors.</p>
          </div>
        </div>

        {/* Privacy & Compliance */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h5 className="font-semibold text-slate-900 mb-3">Privacy & Security</h5>
            <ul className="text-sm text-slate-600 space-y-2">
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-medical-success mr-2" />
                HIPAA Compliant
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-medical-success mr-2" />
                GDPR Compliant
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-medical-success mr-2" />
                End-to-End Encryption
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-medical-success mr-2" />
                Secure Data Storage
              </li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold text-slate-900 mb-3">AI Technology</h5>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>• Medical-grade AI models</li>
              <li>• Trained on verified datasets</li>
              <li>• Continuous improvement</li>
              <li>• Quality assurance testing</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold text-slate-900 mb-3">Support</h5>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>• 24/7 Technical Support</li>
              <li>• Medical Professional Training</li>
              <li>• API Documentation</li>
              <li>• Integration Assistance</li>
            </ul>
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-slate-200">
          <div className="flex items-center space-x-6 text-sm text-slate-500 mb-4 sm:mb-0">
            <a href="#" className="hover:text-slate-700" data-testid="link-privacy-policy">Privacy Policy</a>
            <a href="#" className="hover:text-slate-700" data-testid="link-terms-service">Terms of Service</a>
            <a href="#" className="hover:text-slate-700" data-testid="link-medical-disclaimer">Medical Disclaimer</a>
            <a href="#" className="hover:text-slate-700" data-testid="link-support">Support</a>
          </div>
          
          <div className="text-sm text-slate-500" data-testid="text-copyright">
            © 2024 MedVision AI. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
