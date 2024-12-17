import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Fingerprint, Scan, CheckCircle2 } from "lucide-react";
import { KYCData } from "../KYCForm";

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
  const [isCapturing, setIsCapturing] = useState(false);

  const handleFaceCapture = () => {
    setIsCapturing(true);
    // Simulated capture for UI demo
    setTimeout(() => {
      updateFormData({
        biometricData: {
          ...formData.biometricData,
          faceImage: "captured_face_image",
        },
      });
      setIsCapturing(false);
    }, 2000);
  };

  const handleFingerprintCapture = () => {
    setIsCapturing(true);
    // Simulated capture for UI demo
    setTimeout(() => {
      updateFormData({
        biometricData: {
          ...formData.biometricData,
          fingerprintHash: "captured_fingerprint_hash",
        },
      });
      setIsCapturing(false);
    }, 2000);
  };

  const handleLivePhotoCapture = () => {
    setIsCapturing(true);
    // Simulated capture for UI demo
    setTimeout(() => {
      updateFormData({
        biometricData: {
          ...formData.biometricData,
          livePhotoImage: "captured_live_photo",
        },
      });
      setIsCapturing(false);
    }, 2000);
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
          <Card className="p-6">
            <div className="text-center space-y-4">
              <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                {formData.biometricData.faceImage ? (
                  <CheckCircle2 className="w-16 h-16 text-green-500" />
                ) : (
                  <Camera className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <h3 className="font-semibold">Face Verification</h3>
              <p className="text-sm text-gray-600">
                Position your face within the frame for verification
              </p>
              <Button
                onClick={handleFaceCapture}
                disabled={isCapturing || formData.biometricData.faceImage}
                className="w-full"
              >
                {formData.biometricData.faceImage ? "Captured" : "Start Face Scan"}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="fingerprint" className="mt-4">
          <Card className="p-6">
            <div className="text-center space-y-4">
              <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                {formData.biometricData.fingerprintHash ? (
                  <CheckCircle2 className="w-16 h-16 text-green-500" />
                ) : (
                  <Fingerprint className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <h3 className="font-semibold">Fingerprint Verification</h3>
              <p className="text-sm text-gray-600">
                Place your finger on the sensor
              </p>
              <Button
                onClick={handleFingerprintCapture}
                disabled={isCapturing || formData.biometricData.fingerprintHash}
                className="w-full"
              >
                {formData.biometricData.fingerprintHash ? "Captured" : "Capture Fingerprint"}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="live" className="mt-4">
          <Card className="p-6">
            <div className="text-center space-y-4">
              <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                {formData.biometricData.livePhotoImage ? (
                  <CheckCircle2 className="w-16 h-16 text-green-500" />
                ) : (
                  <Scan className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <h3 className="font-semibold">Live Photo Verification</h3>
              <p className="text-sm text-gray-600">
                Take a live photo for verification
              </p>
              <Button
                onClick={handleLivePhotoCapture}
                disabled={isCapturing || formData.biometricData.livePhotoImage}
                className="w-full"
              >
                {formData.biometricData.livePhotoImage ? "Captured" : "Take Live Photo"}
              </Button>
            </div>
          </Card>
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