import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KYCData } from "../KYCForm";
import { Upload } from "lucide-react";
import { useState } from "react";

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
  const [documentType, setDocumentType] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side?: 'front' | 'back') => {
    if (e.target.files?.[0]) {
      if (documentType === 'passport') {
        updateFormData({ 
          documentImage: e.target.files[0],
          documentType: 'passport'
        });
      } else {
        if (side === 'front') {
          updateFormData({ 
            documentFrontImage: e.target.files[0],
            documentType
          });
        } else if (side === 'back') {
          updateFormData({ 
            documentBackImage: e.target.files[0],
            documentType
          });
        }
      }
    }
  };

  const canProceed = () => {
    if (documentType === 'passport') {
      return !!formData.documentImage;
    }
    return !!formData.documentFrontImage && !!formData.documentBackImage;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Upload ID Document</h2>
          <p className="text-gray-600">
            Please select your document type and upload the required images
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Document Type</Label>
            <Select
              value={documentType}
              onValueChange={setDocumentType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="national_id">National ID</SelectItem>
                <SelectItem value="drivers_license">Driver's License</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {documentType && (
            <div className="space-y-4">
              {documentType === 'passport' ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    id="passportUpload"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e)}
                  />
                  <Label
                    htmlFor="passportUpload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-12 w-12 text-gray-400 mb-4" />
                    <span className="text-sm text-gray-600">
                      {formData.documentImage
                        ? formData.documentImage.name
                        : "Upload passport photo"}
                    </span>
                  </Label>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      id="frontUpload"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'front')}
                    />
                    <Label
                      htmlFor="frontUpload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-12 w-12 text-gray-400 mb-4" />
                      <span className="text-sm text-gray-600">
                        {formData.documentFrontImage
                          ? formData.documentFrontImage.name
                          : "Upload front side"}
                      </span>
                    </Label>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      id="backUpload"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'back')}
                    />
                    <Label
                      htmlFor="backUpload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-12 w-12 text-gray-400 mb-4" />
                      <span className="text-sm text-gray-600">
                        {formData.documentBackImage
                          ? formData.documentBackImage.name
                          : "Upload back side"}
                      </span>
                    </Label>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Previous
        </Button>
        <Button
          onClick={onNext}
          disabled={!documentType || !canProceed()}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
};

export default DocumentUpload;