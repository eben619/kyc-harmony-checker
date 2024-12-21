import { useState, useRef, useEffect } from "react";
import { Camera, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BiometricData } from "./types";
import * as faceapi from "face-api.js";

interface FaceVerificationProps {
  biometricData: BiometricData;
  onCapture: (data: Partial<BiometricData>) => void;
}

const FaceVerification = ({ biometricData, onCapture }: FaceVerificationProps) => {
  const { toast } = useToast();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentInstruction, setCurrentInstruction] = useState(0);

  const instructions = [
    "Look straight at the camera",
    "Slowly turn your head left",
    "Slowly turn your head right",
    "Smile naturally",
  ];

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceExpressionNet.loadFromUri("/models"),
        ]);
      } catch (error) {
        console.error("Error loading face detection models:", error);
      }
    };
    loadModels();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
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
    }
  };

  const handleFaceCapture = async () => {
    try {
      setIsCapturing(true);
      if (!videoRef.current) return;

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

      onCapture({ faceImage: fileName });
      stopCamera();
      
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

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Card className="p-6">
      <div className="text-center space-y-4">
        {!biometricData.faceImage ? (
          <>
            <div className="relative w-full max-w-md mx-auto aspect-video bg-gray-100 rounded-lg overflow-hidden">
              {isCameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                    {instructions[currentInstruction]}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Camera className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
            <h3 className="font-semibold">Face Verification</h3>
            <p className="text-sm text-gray-600">
              Please follow the instructions to complete face verification
            </p>
            {!isCameraActive ? (
              <Button
                onClick={startCamera}
                className="w-full"
              >
                Start Camera
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  onClick={() => setCurrentInstruction((prev) => (prev + 1) % instructions.length)}
                  variant="outline"
                  className="w-full"
                >
                  Next Instruction
                </Button>
                <Button
                  onClick={handleFaceCapture}
                  disabled={isCapturing}
                  className="w-full"
                >
                  Capture
                </Button>
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <h3 className="font-semibold">Face Verification Complete</h3>
          </div>
        )}
      </div>
    </Card>
  );
};

export default FaceVerification;