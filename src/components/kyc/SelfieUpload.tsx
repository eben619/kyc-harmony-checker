import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { KYCData } from "../KYCForm";
import { Camera } from "lucide-react";

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
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      updateFormData({ selfieImage: e.target.files[0] });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Take a Selfie</h2>
          <p className="text-gray-600">
            Please take a clear photo of yourself in good lighting
          </p>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            id="selfieUpload"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <Label
            htmlFor="selfieUpload"
            className="cursor-pointer flex flex-col items-center"
          >
            <Camera className="h-12 w-12 text-gray-400 mb-4" />
            <span className="text-sm text-gray-600">
              {formData.selfieImage
                ? formData.selfieImage.name
                : "Click to upload or take a photo"}
            </span>
          </Label>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Previous
        </Button>
        <Button
          onClick={onNext}
          disabled={!formData.selfieImage}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
};

export default SelfieUpload;