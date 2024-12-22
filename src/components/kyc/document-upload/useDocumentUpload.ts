import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@supabase/auth-helpers-react";
import type { KYCData } from "../../KYCForm";

export const useDocumentUpload = (
  formData: KYCData,
  updateFormData: (data: Partial<KYCData>) => void
) => {
  const { toast } = useToast();
  const user = useUser();
  const [documentType, setDocumentType] = useState<string>(formData.documentType || "");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>, 
    side?: 'front' | 'back'
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) {
      console.log("No file selected or user not authenticated");
      return;
    }
    
    try {
      setIsVerifying(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('kyc_documents')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('kyc_documents')
        .getPublicUrl(fileName);

      if (documentType === 'passport') {
        updateFormData({ 
          documentImage: file,
          documentType: 'passport'
        });
        await verifyDocument(publicUrl);
      } else {
        if (side === 'front') {
          updateFormData({ 
            documentFrontImage: file,
            documentType
          });
          await verifyDocument(publicUrl);
        } else if (side === 'back') {
          updateFormData({ 
            documentBackImage: file,
            documentType
          });
        }
      }

      toast({
        title: "Upload Successful",
        description: "Document uploaded successfully",
      });

    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyDocument = async (documentUrl: string) => {
    if (!user) return;

    try {
      const response = await supabase.functions.invoke('verify-document', {
        body: {
          documentUrl,
          formData: {
            firstName: formData.firstName || '',
            lastName: formData.lastName || '',
            dateOfBirth: formData.dateOfBirth || '',
            address: formData.address || '',
          },
          userId: user.id,
          documentType,
        },
      });

      if (response.error) throw response.error;

      const { matchScore, status } = response.data || {};

      toast({
        title: status === 'verified' ? "Verification Successful" : "Verification Needs Review",
        description: status === 'verified' 
          ? "Document information matches your submitted data."
          : "Some information might need manual review.",
        variant: status === 'verified' ? "default" : "destructive",
      });

    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Error",
        description: "Failed to verify document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const canProceed = () => {
    if (documentType === 'passport') {
      return !!formData.documentImage;
    }
    return !!formData.documentFrontImage && !!formData.documentBackImage;
  };

  return {
    documentType,
    setDocumentType,
    isVerifying,
    handleFileChange,
    canProceed,
  };
};