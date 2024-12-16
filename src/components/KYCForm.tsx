import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import PersonalInfo from "./kyc/PersonalInfo";
import DocumentUpload from "./kyc/DocumentUpload";
import SelfieUpload from "./kyc/SelfieUpload";
import Review from "./kyc/Review";
import ProgressSteps from "./kyc/ProgressSteps";

export type KYCData = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  documentImage: File | null;
  selfieImage: File | null;
  biometricHash?: string;
};

const KYCForm = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<KYCData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    address: "",
    documentImage: null,
    selfieImage: null,
    biometricHash: undefined,
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
      <h1 className="text-2xl font-bold mb-8">KYC Verification</h1>
      <div className="bg-white rounded-xl shadow-lg p-8">
        <ProgressSteps currentStep={step} />

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
            <SelfieUpload
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
