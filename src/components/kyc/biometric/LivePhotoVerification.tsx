import { useState, useRef } from "react";
import { Scan, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BiometricData } from "./types";
import FaceDetection from "./FaceDetection";
import CameraFeed from "./camera/CameraFeed";
import CameraControls from "./camera/CameraControls";

interface LivePhotoVerificationProps {
  biometricData: BiometricData;
  onCapture: (data: Partial<BiometricData>) => void;
}

const LivePhotoVerification = ({ biometricData, onCapture }: LivePhotoVerificationProps) => {
  const { toast } = useToast();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentInstruction, setCurrentInstruction] = useState(0);

  const instructions = [
    "Blink your eyes slowly",
    "Open your mouth slightly",
    "Turn your head to the left",
    "Turn your head to the right",
    "Nod your head up and down",
  ];

  const handleStreamReady = (stream: MediaStream) => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      setIsCameraActive(true);
      console.log("Camera stream ready");
    }
  };

  const handleLivePhotoCapture = async () => {
    if (!videoRef.current || !isFaceDetected) return;

    try {
      setIsCapturing(true);
      console.log("Starting live photo capture");

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
      
      toast({
        title: "Success",
        description: "Live photo captured successfully",
      });
      console.log("Live photo captured successfully");
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

  const startCamera = () => setIsCameraActive(true);
  const stopCamera = () => setIsCameraActive(false);

  return (
    <Card className="p-6">
      <div className="text-center space-y-4">
        {!biometricData.livePhotoImage ? (
          <>
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
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                  {instructions[currentInstruction]}
                </div>
              </>
            )}
            <h3 className="font-semibold">Live Photo Verification</h3>
            <p className="text-sm text-gray-600">
              Please follow the instructions to complete liveness check
            </p>
            <CameraControls
              isCameraActive={isCameraActive}
              isCapturing={isCapturing}
              isFaceDetected={isFaceDetected}
              onStartCamera={startCamera}
              onStopCamera={stopCamera}
              onCapture={handleLivePhotoCapture}
            />
            {isCameraActive && (
              <Button
                onClick={() => setCurrentInstruction((prev) => (prev + 1) % instructions.length)}
                variant="outline"
                className="w-full"
              >
                Next Instruction
              </Button>
            )}
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