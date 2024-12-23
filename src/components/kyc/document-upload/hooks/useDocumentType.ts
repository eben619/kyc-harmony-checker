import { useState } from "react";
import type { KYCData } from "../../../KYCForm";

export const useDocumentType = (formData: KYCData) => {
  const [documentType, setDocumentType] = useState<string>(formData.documentType || "");

  const canProceed = (formData: KYCData) => {
    if (documentType === 'passport') {
      return !!formData.documentImagePath;
    }
    return !!formData.documentFrontImagePath && !!formData.documentBackImagePath;
  };

  return {
    documentType,
    setDocumentType,
    canProceed,
  };
};