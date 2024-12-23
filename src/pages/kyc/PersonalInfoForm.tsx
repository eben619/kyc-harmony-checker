import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PersonalInfo from "@/components/kyc/PersonalInfo";
import ProgressSteps from "@/components/kyc/ProgressSteps";
import { KYCData } from "@/components/KYCForm";

const PersonalInfoForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<KYCData>({
    firstName: "",
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

  const handleNext = (data: Partial<KYCData>) => {
    const updatedData = { ...formData, ...data };
    localStorage.setItem("kycFormData", JSON.stringify(updatedData));
    navigate("/kyc/document-upload");
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-center">KYC Verification</h1>
      <div className="bg-white rounded-xl shadow-lg p-8">
        <ProgressSteps currentStep={1} totalSteps={4} />
        <PersonalInfo
          formData={formData}
          updateFormData={handleNext}
          onNext={() => {}}
        />
      </div>
    </div>
  );
};

export default PersonalInfoForm;