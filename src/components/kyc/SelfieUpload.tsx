import { Button } from "@/components/ui/button";
import { KYCData } from "../KYCForm";
import BiometricCapture from "./BiometricCapture";

interface SelfieUploadProps {
  formData: KYCData;
  updateFormData: (data: Partial<KYCData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const SelfieUpload = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
}: SelfieUploadProps) => {
  const handleBiometricCapture = (hash: string) => {
    updateFormData({ biometricHash: hash });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Biometric Verification</h2>
          <p className="text-gray-600">
            Please look directly at the camera for facial verification
          </p>
        </div>

        <BiometricCapture onCaptureComplete={handleBiometricCapture} />
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Previous
        </Button>
        <Button
          onClick={onNext}
          disabled={!formData.biometricHash}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
};

export default SelfieUpload;