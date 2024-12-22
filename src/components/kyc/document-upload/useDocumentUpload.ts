import { useDocumentType } from "./hooks/useDocumentType";
import { useFileUpload } from "./hooks/useFileUpload";
import { useDocumentVerification } from "./hooks/useDocumentVerification";
import type { KYCData } from "../../KYCForm";

export const useDocumentUpload = (
  formData: KYCData,
  updateFormData: (data: Partial<KYCData>) => void
) => {
  const { documentType, setDocumentType, canProceed } = useDocumentType(formData);
  const { uploadFile, isUploading } = useFileUpload();
  const { verifyDocument, isVerifying } = useDocumentVerification();

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    side?: 'front' | 'back'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const publicUrl = await uploadFile(file);
    if (!publicUrl) return;

    if (documentType === 'passport') {
      updateFormData({ 
        documentImage: file,
        documentType: 'passport'
      });
      await verifyDocument(publicUrl, formData, documentType);
    } else {
      if (side === 'front') {
        updateFormData({ 
          documentFrontImage: file,
          documentType
        });
        await verifyDocument(publicUrl, formData, documentType);
      } else if (side === 'back') {
        updateFormData({ 
          documentBackImage: file,
          documentType
        });
      }
    }
  };

  return {
    documentType,
    setDocumentType,
    isVerifying: isVerifying || isUploading,
    handleFileChange,
    canProceed: () => canProceed(formData),
  };
};