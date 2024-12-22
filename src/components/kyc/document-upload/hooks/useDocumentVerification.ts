import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import type { KYCData } from "../../../KYCForm";

export const useDocumentVerification = () => {
  const { toast } = useToast();
  const user = useUser();
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyDocument = async (
    documentUrl: string,
    formData: KYCData,
    documentType: string
  ) => {
    if (!user) return;

    try {
      setIsVerifying(true);
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

      return { matchScore, status };
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Error",
        description: "Failed to verify document. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    verifyDocument,
    isVerifying,
  };
};