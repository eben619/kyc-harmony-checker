import { useState } from "react";
import { Scan, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BiometricData } from "./types";

interface LivePhotoVerificationProps {
  biometricData: BiometricData;
  onCapture: (data: Partial<BiometricData>) => void;
}

const LivePhotoVerification = ({ biometricData, onCapture }: LivePhotoVerificationProps) => {
  const { toast } = useToast();
  const [isCapturing, setIsCapturing] = useState(false);

  const handleLivePhotoCapture = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoTrack = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(videoTrack);
      const blob = await imageCapture.takePhoto();
      
      const fileName = `live-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('biometric_data')
        .upload(`${fileName}`, blob);

      if (uploadError) throw uploadError;

      onCapture({ livePhotoImage: fileName });

      stream.getTracks().forEach(track => track.stop());
      toast({
        title: "Success",
        description: "Live photo captured successfully",
      });
    } catch (error) {
      console.error('Live photo error:', error);
      toast({
        title: "Error",
        description: "Failed to capture live photo. Please try again.",
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
          {biometricData.livePhotoImage ? (
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          ) : (
            <Scan className="w-16 h-16 text-gray-400" />
          )}
        </div>
        <h3 className="font-semibold">Live Photo Verification</h3>
        <p className="text-sm text-gray-600">
          Take a live photo for verification
        </p>
        <Button
          onClick={handleLivePhotoCapture}
          disabled={isCapturing || !!biometricData.livePhotoImage}
          className="w-full"
        >
          {biometricData.livePhotoImage ? "Captured" : "Take Live Photo"}
        </Button>
      </div>
    </Card>
  );
};

export default LivePhotoVerification;