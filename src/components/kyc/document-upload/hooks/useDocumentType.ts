import { useState } from "react";
import type { KYCData } from "../../../KYCForm";

export const useDocumentType = (formData: KYCData) => {
  const [documentType, setDocumentType] = useState<string>(formData.documentType || "");

  const canProceed = (formData: KYCData) => {
    if (documentType === 'passport') {
      return !!formData.documentImage;
    }
    return !!formData.documentFrontImage && !!formData.documentBackImage;
  };

  return {
    documentType,
    setDocumentType,
    canProceed,
  };
};