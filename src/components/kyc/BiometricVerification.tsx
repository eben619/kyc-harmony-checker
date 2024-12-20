import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KYCData } from "../KYCForm";
import FaceVerification from "./biometric/FaceVerification";
import FingerprintVerification from "./biometric/FingerprintVerification";
import LivePhotoVerification from "./biometric/LivePhotoVerification";
import "./types/image-capture.d.ts";

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
  const [activeTab, setActiveTab] = useState("face");

  const handleBiometricUpdate = (data: Partial<BiometricData>) => {
    updateFormData({
      biometricData: {
        ...formData.biometricData,
        ...data,
      },
    });
  };

  const isComplete = 
    formData.biometricData.faceImage &&
    formData.biometricData.fingerprintHash &&
    formData.biometricData.livePhotoImage;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">Biometric Verification</h2>
        <p className="text-gray-600 mt-2">
          Please complete all three verification steps
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="face">Face Scan</TabsTrigger>
          <TabsTrigger value="fingerprint">Fingerprint</TabsTrigger>
          <TabsTrigger value="live">Live Photo</TabsTrigger>
        </TabsList>

        <TabsContent value="face" className="mt-4">
          <FaceVerification
            biometricData={formData.biometricData}
            onCapture={handleBiometricUpdate}
          />
        </TabsContent>

        <TabsContent value="fingerprint" className="mt-4">
          <FingerprintVerification
            biometricData={formData.biometricData}
            onCapture={handleBiometricUpdate}
          />
        </TabsContent>

        <TabsContent value="live" className="mt-4">
          <LivePhotoVerification
            biometricData={formData.biometricData}
            onCapture={handleBiometricUpdate}
          />
        </TabsContent>
      </Tabs>

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