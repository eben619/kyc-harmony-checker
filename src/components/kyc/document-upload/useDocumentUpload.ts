
import { useState } from "react";
import { KYCData } from "../../KYCForm";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useDocumentUpload = (
  formData: KYCData,
  updateFormData: (data: Partial<KYCData>) => void
) => {
  const [documentType, setDocumentType] = useState<string>(formData.documentType || "");
  const [isVerifying, setIsVerifying] = useState({
    front: false,
    back: false,
    passport: false
  });
  const { toast } = useToast();

  const canProceed = () => {
    if (!documentType) return false;
    
    if (documentType === 'passport') {
      return Boolean(formData.documentImagePath);
    } else {
      return Boolean(formData.documentFrontImagePath && formData.documentBackImagePath);
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    side: 'front' | 'back' | 'passport' = 'passport'
  ) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast({
        title: "Error",
        description: "No file selected",
        variant: "destructive",
      });
      return;
    }

    try {
      // Set loading state for the specific side being uploaded
      setIsVerifying(prev => ({ ...prev, [side]: true }));

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create a blob from the file to ensure proper handling
      const blob = new Blob([file], { type: file.type });

      // Create folder path with user ID
      const folderPath = `${user.id}/`;
      const fileName = `${folderPath}${side}-${Date.now()}-${file.name}`;

      const { error: uploadError, data } = await supabase.storage
        .from('kyc_documents')
        .upload(fileName, blob, {
          cacheControl: '3600',
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Update form data based on document type and side
      if (side === 'passport') {
        updateFormData({ 
          documentImagePath: fileName,
          documentType: 'passport'
        });
      } else if (side === 'front') {
        updateFormData({ 
          documentFrontImagePath: fileName,
          documentType
        });
      } else if (side === 'back') {
        updateFormData({ 
          documentBackImagePath: fileName,
          documentType
        });
      }

      toast({
        title: "Success",
        description: `Document ${side} uploaded successfully`,
      });

      console.log('File uploaded successfully:', fileName);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(prev => ({ ...prev, [side]: false }));
    }
  };

  return {
    documentType,
    setDocumentType,
    isVerifying,
    handleFileChange,
    canProceed,
  };
};
