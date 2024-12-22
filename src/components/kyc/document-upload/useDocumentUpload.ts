import { useState } from "react";
import { KYCData } from "../../KYCForm";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useDocumentUpload = (
  formData: KYCData,
  updateFormData: (data: Partial<KYCData>) => void
) => {
  const [documentType, setDocumentType] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const canProceed = () => {
    if (!documentType) return false;
    
    if (documentType === 'passport') {
      return !!formData.documentImage;
    } else {
      return !!formData.documentFrontImage && !!formData.documentBackImage;
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    side?: 'front' | 'back'
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
      setIsVerifying(true);

      // Create folder path with user ID if available
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      const folderPath = userId ? `${userId}/` : '';
      const fileName = `${folderPath}${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('kyc_documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      if (documentType === 'passport') {
        updateFormData({ 
          documentImage: file,
          documentType: 'passport'
        });
      } else {
        if (side === 'front') {
          updateFormData({ 
            documentFrontImage: file,
            documentType
          });
        } else if (side === 'back') {
          updateFormData({ 
            documentBackImage: file,
            documentType
          });
        }
      }

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
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