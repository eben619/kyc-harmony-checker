import { useState, useRef } from "react";
import { Camera, CheckCircle2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BiometricData } from "./types";
import FaceDetection from "./FaceDetection";
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
  const [isHeadTurned, setIsHeadTurned] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error("Camera access error:", error);
      toast({
        title: "Error",
        description: "Failed to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
      setIsDialogOpen(false);
    }
  };

  const handleFaceCapture = async () => {
    if (!videoRef.current || !isFaceDetected || !isHeadTurned) return;

    try {
      setIsCapturing(true);

      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (!context) return;

      context.drawImage(videoRef.current, 0, 0);
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob(blob => resolve(blob!), 'image/jpeg'));
      
      const fileName = `face-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('biometric_data')
        .upload(`${fileName}`, blob);

      if (uploadError) throw uploadError;

      onCapture({ livePhotoImage: fileName });
      stopCamera();
      
      toast({
        title: "Success",
        description: "Face verification completed successfully",
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

  const handleHeadTurn = (turned: boolean) => {
    if (turned && !isHeadTurned) {
      setIsHeadTurned(true);
      toast({
        title: "Great!",
        description: "Head turn detected. You can now complete the verification.",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="text-center space-y-4">
        {!biometricData.livePhotoImage ? (
          <>
            <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <UserRound className="w-16 h-16 text-gray-400" />
            </div>
            
            <h3 className="font-semibold">Live Photo Verification</h3>
            <p className="text-sm text-gray-600">
              Please follow the instructions to complete face verification
            </p>

            <Button
              onClick={startCamera}
              className="w-full"
              disabled={isCapturing}
            >
              Start Camera
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              if (!open) stopCamera();
              setIsDialogOpen(open);
            }}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Live Photo Verification</DialogTitle>
                </DialogHeader>
                <div className="relative w-full aspect-video">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {isCameraActive && (
                    <>
                      <FaceDetection
                        videoRef={videoRef}
                        onFaceDetected={setIsFaceDetected}
                        onHeadTurn={handleHeadTurn}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
                        Turn your head slowly sideways
                      </div>
                    </>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={stopCamera}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleFaceCapture}
                    disabled={!isFaceDetected || !isHeadTurned || isCapturing}
                  >
                    {isCapturing ? "Capturing..." : "Complete Verification"}
                  </Button>
                </div>
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