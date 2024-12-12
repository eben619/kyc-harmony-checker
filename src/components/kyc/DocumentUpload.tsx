import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { KYCData } from "../KYCForm";
import { Upload } from "lucide-react";

interface DocumentUploadProps {
  formData: KYCData;
  updateFormData: (data: Partial<KYCData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const DocumentUpload = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
}: DocumentUploadProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      updateFormData({ documentImage: e.target.files[0] });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Upload ID Document</h2>
          <p className="text-gray-600">
            Please upload a clear photo of your government-issued ID
          </p>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            id="documentUpload"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <Label
            htmlFor="documentUpload"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <span className="text-sm text-gray-600">
              {formData.documentImage
                ? formData.documentImage.name
                : "Click to upload or drag and drop"}
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
          disabled={!formData.documentImage}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
};

export default DocumentUpload;