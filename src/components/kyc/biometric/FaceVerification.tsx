import { useState } from "react";
import { Camera, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BiometricData } from "./types";

interface FaceVerificationProps {
  biometricData: BiometricData;
  onCapture: (data: Partial<BiometricData>) => void;
}

const FaceVerification = ({ biometricData, onCapture }: FaceVerificationProps) => {
  const { toast } = useToast();
  const [isCapturing, setIsCapturing] = useState(false);

  const handleFaceCapture = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoTrack = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(videoTrack);
      const blob = await imageCapture.takePhoto();
      
      const fileName = `face-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('biometric_data')
        .upload(`${fileName}`, blob);

      if (uploadError) throw uploadError;

      onCapture({ faceImage: fileName });

      stream.getTracks().forEach(track => track.stop());
      toast({
        title: "Success",
        description: "Face capture completed successfully",
      });
    } catch (error) {
      console.error('Face capture error:', error);
      toast({
        title: "Error",
        description: "Failed to capture face image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="text-center space-y-4">
        <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
          {biometricData.faceImage ? (
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          ) : (
            <Camera className="w-16 h-16 text-gray-400" />
          )}
        </div>
        <h3 className="font-semibold">Face Verification</h3>
        <p className="text-sm text-gray-600">
          Position your face within the frame for verification
        </p>
        <Button
          onClick={handleFaceCapture}
          disabled={isCapturing || !!biometricData.faceImage}
          className="w-full"
        >
          {biometricData.faceImage ? "Captured" : "Start Face Scan"}
        </Button>
      </div>
    </Card>
  );
};

export default FaceVerification;