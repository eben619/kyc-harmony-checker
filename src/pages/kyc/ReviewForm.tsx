import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Review from "@/components/kyc/Review";
import ProgressSteps from "@/components/kyc/ProgressSteps";
import { KYCData } from "@/components/KYCForm";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ReviewForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<KYCData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    address: "",
    country: "",
    zipCode: "",
    biometricData: {
      faceImage: null,
      fingerprintHash: null,
      livePhotoImage: null,
    },
  });

  useEffect(() => {
    const savedData = localStorage.getItem("kycFormData");
    if (savedData) {
      setFormData(JSON.parse(savedData));
    } else {
      navigate("/kyc");
    }
  }, [navigate]);

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase.from("kyc_verifications").insert({
        user_id: user.id,
        document_type: formData.documentType,
        form_data: formData,
        verification_status: "pending"
      });

      if (error) throw error;

      localStorage.removeItem("kycFormData");
      toast({
        title: "KYC Submitted Successfully",
        description: "We'll review your information and get back to you soon.",
      });
      navigate("/account");
    } catch (error) {
      console.error("Error submitting KYC:", error);
      toast({
        title: "Error",
        description: "Failed to submit KYC verification. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-center">KYC Verification</h1>
      <div className="bg-white rounded-xl shadow-lg p-8">
        <ProgressSteps currentStep={4} totalSteps={4} />
        <Review
          formData={formData}
          onSubmit={handleSubmit}
          onPrev={() => navigate("/kyc/biometric")}
        />
      </div>
    </div>
  );
};

export default ReviewForm;