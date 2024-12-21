import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KYCData } from "../KYCForm";
import { Upload } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@supabase/auth-helpers-react";

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
  const { toast } = useToast();
  const user = useUser();
  const [documentType, setDocumentType] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, side?: 'front' | 'back') => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      
      try {
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${user?.id}/${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('kyc_documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL for verification
        const { data: { publicUrl } } = supabase.storage
          .from('kyc_documents')
          .getPublicUrl(fileName);

        if (documentType === 'passport') {
          updateFormData({ 
            documentImage: file,
            documentType: 'passport'
          });
          
          // Verify the document
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
      } catch (error) {
        console.error('Error uploading document:', error);
        toast({
          title: "Error",
          description: "Failed to upload document. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const verifyDocument = async (documentUrl: string) => {
    setIsVerifying(true);
    try {
      const response = await supabase.functions.invoke('verify-document', {
        body: {
          documentUrl,
          formData: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            dateOfBirth: formData.dateOfBirth,
            address: formData.address,
          },
          userId: user?.id,
          documentType,
        },
      });

      if (response.error) throw response.error;

      const { matchScore, status } = response.data;

      toast({
        title: status === 'verified' ? "Verification Successful" : "Verification Needs Review",
        description: status === 'verified' 
          ? "Document information matches your submitted data."
          : "Some information might need manual review.",
        variant: status === 'verified' ? "default" : "warning",
      });

    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Error",
        description: "Failed to verify document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
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
            Please select your document type and upload clear images
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
                    disabled={isVerifying}
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
                      disabled={isVerifying}
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
                      disabled={isVerifying}
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
          disabled={!documentType || !canProceed() || isVerifying}
        >
          {isVerifying ? "Verifying..." : "Next Step"}
        </Button>
      </div>
    </div>
  );
};

export default DocumentUpload;