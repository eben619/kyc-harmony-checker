import { useState, useRef, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BiometricData } from "./types";
import FaceDetection from "./FaceDetection";
import CameraFeed from "./camera/CameraFeed";

interface LivePhotoVerificationProps {
  biometricData: BiometricData;
  onCapture: (data: Partial<BiometricData>) => void;
}

const LivePhotoVerification = ({ biometricData, onCapture }: LivePhotoVerificationProps) => {
  const { toast } = useToast();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState(0);
  const [instructionCompleted, setInstructionCompleted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const instructionTimeout = useRef<NodeJS.Timeout>();

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

  const captureAndProceed = async () => {
    if (!videoRef.current || !isFaceDetected) return;

    try {
      setIsCapturing(true);
      console.log(`Capturing photo for instruction: ${instructions[currentInstruction]}`);

      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (!context) return;

      context.drawImage(videoRef.current, 0, 0);
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob(blob => resolve(blob!), 'image/jpeg'));
      
      const fileName = `live-${Date.now()}-${currentInstruction}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('biometric_data')
        .upload(`${fileName}`, blob);

      if (uploadError) throw uploadError;

      if (currentInstruction === instructions.length - 1) {
        onCapture({ livePhotoImage: fileName });
        stopCamera();
        toast({
          title: "Success",
          description: "Live photo verification completed successfully",
        });
      } else {
        setCurrentInstruction(prev => prev + 1);
        setInstructionCompleted(false);
      }
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

  useEffect(() => {
    if (instructionCompleted && isFaceDetected) {
      instructionTimeout.current = setTimeout(() => {
        captureAndProceed();
      }, 1000);
    }
    return () => {
      if (instructionTimeout.current) {
        clearTimeout(instructionTimeout.current);
      }
    };
  }, [instructionCompleted, isFaceDetected]);

  const startCamera = () => setIsCameraActive(true);
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  return (
    <Card className="p-6">
      <div className="text-center space-y-4">
        {!biometricData.livePhotoImage ? (
          <>
            <div className="relative">
              <CameraFeed
                onStreamReady={handleStreamReady}
                isActive={isCameraActive}
              />
              {isCameraActive && (
                <>
                  <FaceDetection
                    videoRef={videoRef}
                    onFaceDetected={(detected) => {
                      setIsFaceDetected(detected);
                      if (detected) {
                        setInstructionCompleted(true);
                      }
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
                    <p className="text-blue-400 font-semibold text-lg">
                      {instructions[currentInstruction]}
                    </p>
                  </div>
                </>
              )}
            </div>
            <h3 className="font-semibold">Live Photo Verification</h3>
            <p className="text-sm text-gray-600">
              Please follow the on-screen instructions
            </p>
            {!isCameraActive ? (
              <Button onClick={startCamera} className="w-full gap-2">
                Start Camera
              </Button>
            ) : (
              <Button onClick={stopCamera} variant="outline" className="w-full">
                Stop Camera
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