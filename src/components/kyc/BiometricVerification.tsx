import { useState } from "react";
import { Button } from "@/components/ui/button";
import { KYCData } from "../KYCForm";
import LivePhotoVerification from "./biometric/LivePhotoVerification";
import FingerprintVerification from "./biometric/FingerprintVerification";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState("fingerprint");

  const handleBiometricUpdate = (data: Partial<KYCData["biometricData"]>) => {
    updateFormData({
      biometricData: {
        ...formData.biometricData,
        ...data,
      },
    });
  };

  const isComplete = formData.biometricData.fingerprintHash && 
                    formData.biometricData.livePhotoImage;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">Biometric Verification</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Please complete both verifications to continue
        </p>
      </div>

      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="fingerprint">Fingerprint</TabsTrigger>
            <TabsTrigger value="live-photo">Live Photo</TabsTrigger>
          </TabsList>
          <TabsContent value="fingerprint" className="mt-4">
            <FingerprintVerification
              biometricData={formData.biometricData}
              onCapture={handleBiometricUpdate}
            />
          </TabsContent>
          <TabsContent value="live-photo" className="mt-4">
            <LivePhotoVerification
              biometricData={formData.biometricData}
              onCapture={handleBiometricUpdate}
            />
          </TabsContent>
        </Tabs>
      </Card>

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