import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BiometricVerification from "@/components/kyc/BiometricVerification";
import ProgressSteps from "@/components/kyc/ProgressSteps";
import { KYCData } from "@/components/KYCForm";

const BiometricVerificationForm = () => {
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

  useEffect(() => {
    const savedData = localStorage.getItem("kycFormData");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    } else {
      navigate("/kyc");
    }
  }, [navigate]);

  const handleNext = (data: Partial<KYCData>) => {
    const updatedData = { ...formData, ...data };
    localStorage.setItem("kycFormData", JSON.stringify(updatedData));
    navigate("/kyc/review");
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-center">KYC Verification</h1>
      <div className="bg-white rounded-xl shadow-lg p-8">
        <ProgressSteps currentStep={3} totalSteps={4} />
        <BiometricVerification
          formData={formData}
          updateFormData={handleNext}
          onNext={() => {}}
          onPrev={() => navigate("/kyc/document-upload")}
        />
      </div>
    </div>
  );
};

export default BiometricVerificationForm;