import { useState } from "react";
import { Button } from "@/components/ui/button";
import { KYCData } from "../KYCForm";
import LivePhotoVerification from "./biometric/LivePhotoVerification";

interface BiometricVerificationProps {
  formData: KYCData;
  updateFormData: (data: Partial<KYCData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const BiometricVerification = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
}: BiometricVerificationProps) => {
  const handleBiometricUpdate = (data: Partial<KYCData["biometricData"]>) => {
    updateFormData({
      biometricData: {
        ...formData.biometricData,
        ...data,
      },
    });
  };

  const isComplete = formData.biometricData.livePhotoImage;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">Biometric Verification</h2>
        <p className="text-gray-600 mt-2">
          Please complete the live photo verification
        </p>
      </div>

      <LivePhotoVerification
        biometricData={formData.biometricData}
        onCapture={handleBiometricUpdate}
      />

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onPrev}>
          Previous
        </Button>
        <Button onClick={onNext} disabled={!isComplete}>
          Next Step
        </Button>
      </div>
    </div>
  );
};

export default BiometricVerification;