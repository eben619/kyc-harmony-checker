import { useState, useRef, useEffect } from "react";
import { CheckCircle2, Camera } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BiometricData } from "./types";
import FaceDetection from "./FaceDetection";
import CameraFeed from "./camera/CameraFeed";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LivePhotoVerificationProps {
  biometricData: BiometricData;
  onCapture: (data: Partial<BiometricData>) => void;
}

const LivePhotoVerification = ({ biometricData, onCapture }: LivePhotoVerificationProps) => {
  const { toast } = useToast();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleStreamReady = (stream: MediaStream) => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      setIsCameraActive(true);
      console.log("Camera stream ready");
    }
  };

  const captureAndProceed = async () => {
    if (!videoRef.current || !isFaceDetected) return;

    try {
      setIsCapturing(true);
      console.log("Capturing live photo");

      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (!context) return;

      context.drawImage(videoRef.current, 0, 0);
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob(blob => resolve(blob!), 'image/jpeg'));
      
      const fileName = `live-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('biometric_data')
        .upload(`${fileName}`, blob);

      if (uploadError) throw uploadError;

      onCapture({ livePhotoImage: fileName });
      stopCamera();
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Live photo verification completed successfully",
      });
    } catch (error) {
      console.error('Live photo capture error:', error);
      toast({
        title: "Error",
        description: "Failed to capture live photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const startCamera = () => {
    setIsDialogOpen(true);
    setIsCameraActive(true);
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
    setIsDialogOpen(false);
  };

  return (
    <Card className="p-6">
      <div className="text-center space-y-4">
        {!biometricData.livePhotoImage ? (
          <>
            <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <Camera className={`w-16 h-16 ${isCameraActive ? 'text-primary animate-pulse' : 'text-gray-400'}`} />
            </div>
            
            <Button onClick={startCamera} className="w-full gap-2">
              <Camera className="w-4 h-4" />
              Start Live Photo Verification
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              if (!open) stopCamera();
              setIsDialogOpen(open);
            }}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Live Photo Verification</DialogTitle>
                </DialogHeader>
                <div className="relative">
                  <CameraFeed
                    onStreamReady={handleStreamReady}
                    isActive={isCameraActive}
                  />
                  {isCameraActive && (
                    <>
                      <FaceDetection
                        videoRef={videoRef}
                        onFaceDetected={setIsFaceDetected}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
                        <p className="text-white font-semibold text-lg">
                          Turn your head slowly sideways
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <Button 
                  onClick={captureAndProceed}
                  disabled={!isFaceDetected}
                  className="w-full mt-4"
                >
                  {isCapturing ? "Capturing..." : "Capture Photo"}
                </Button>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <h3 className="font-semibold">Live Photo Verification Complete</h3>
          </div>
        )}
      </div>
    </Card>
  );
};

export default LivePhotoVerification;