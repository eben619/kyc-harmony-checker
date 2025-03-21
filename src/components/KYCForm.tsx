import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import PersonalInfo from "./kyc/PersonalInfo";
import BiometricVerification from "./kyc/BiometricVerification";
import DocumentUpload from "./kyc/DocumentUpload";
import Review from "./kyc/Review";
import ProgressSteps from "./kyc/ProgressSteps";

export type KYCData = {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  country: string;
  zipCode: string;
  documentType?: string;
  documentImagePath?: string;
  documentFrontImagePath?: string;
  documentBackImagePath?: string;
  selfieImagePath?: string;
  biometricHash?: string;
  biometricData: {
    faceImage: string | null;
    fingerprintHash: string | null;
    livePhotoImage: string | null;
  };
};

const KYCForm = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<KYCData>({
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    address: "",
    country: "",
    zipCode: "",
    biometricData: {
      faceImage: null,
      fingerprintHash: null,
      livePhotoImage: null,
    },
  });

  const updateFormData = (data: Partial<KYCData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    toast({
      title: "KYC Submitted Successfully",
      description: "We'll review your information and get back to you soon.",
    });
    console.log("Form submitted:", formData);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-center text-foreground">KYC Verification</h1>
      <div className="text-center mb-6">
        <p className="font-bold text-foreground">Please make sure the information provided matches that on your ID.</p>
      </div>
      <div className="bg-card rounded-xl shadow-lg p-8 text-card-foreground">
        <ProgressSteps currentStep={step} totalSteps={4} />

        <div className="mt-8">
          {step === 1 && (
            <PersonalInfo formData={formData} updateFormData={updateFormData} onNext={nextStep} />
          )}
          {step === 2 && (
            <DocumentUpload
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          {step === 3 && (
            <BiometricVerification
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          {step === 4 && (
            <Review
              formData={formData}
              onSubmit={handleSubmit}
              onPrev={prevStep}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default KYCForm;