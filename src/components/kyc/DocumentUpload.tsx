
import { Button } from "@/components/ui/button";
import { KYCData } from "../KYCForm";
import SingleDocumentUpload from "./document-upload/SingleDocumentUpload";
import DocumentTypeSelect from "./document-upload/DocumentTypeSelect";
import { useDocumentUpload } from "./document-upload/useDocumentUpload";

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
  const {
    documentType,
    setDocumentType,
    isVerifying,
    handleFileChange,
    canProceed,
  } = useDocumentUpload(formData, updateFormData);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Upload ID Document</h2>
          <p className="text-gray-600">
            Please select your document type and upload clear images
          </p>
        </div>

        <div className="space-y-4">
          <DocumentTypeSelect 
            value={documentType || ''} 
            onChange={(value) => setDocumentType(value)}
          />

          {documentType && (
            <div className="space-y-4">
              {documentType === 'passport' ? (
                <SingleDocumentUpload
                  id="passportUpload"
                  label="Upload passport photo"
                  fileName={formData.documentImagePath}
                  disabled={isVerifying.passport}
                  onChange={(e) => handleFileChange(e, 'passport')}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SingleDocumentUpload
                    id="frontUpload"
                    label="Upload front side"
                    fileName={formData.documentFrontImagePath}
                    disabled={isVerifying.front}
                    onChange={(e) => handleFileChange(e, 'front')}
                  />
                  <SingleDocumentUpload
                    id="backUpload"
                    label="Upload back side"
                    fileName={formData.documentBackImagePath}
                    disabled={isVerifying.back}
                    onChange={(e) => handleFileChange(e, 'back')}
                  />
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
          disabled={!documentType || !canProceed() || isVerifying.front || isVerifying.back || isVerifying.passport}
        >
          {isVerifying.front || isVerifying.back || isVerifying.passport ? "Verifying..." : "Next Step"}
        </Button>
      </div>
    </div>
  );
};

export default DocumentUpload;
