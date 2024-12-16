import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BiometricCaptureProps {
  onCaptureComplete: (hash: string) => void;
}

const BiometricCapture = ({ onCaptureComplete }: BiometricCaptureProps) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        ]);
        setIsInitialized(true);
      } catch (error) {
        console.error("Error loading face detection models:", error);
        toast({
          title: "Error",
          description: "Failed to initialize face detection. Please try again.",
          variant: "destructive",
        });
      }
    };

    loadModels();
  }, [toast]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
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

  const captureBiometric = async () => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) return;

    try {
      // Detect face in the video stream
      const detections = await faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      );

      if (!detections) {
        toast({
          title: "No face detected",
          description: "Please ensure your face is clearly visible",
          variant: "destructive",
        });
        return;
      }

      // Capture the frame
      const context = canvasRef.current.getContext("2d");
      if (!context) return;

      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) =>
        canvasRef.current!.toBlob((blob) => resolve(blob!), "image/jpeg")
      );

      // Upload to Supabase Storage
      const fileName = `${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("biometric_data")
        .upload(fileName, blob);

      if (uploadError) {
        throw uploadError;
      }

      // Generate a hash of the biometric data
      const arrayBuffer = await blob.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

      onCaptureComplete(hashHex);
      stopCamera();

      toast({
        title: "Success",
        description: "Biometric data captured successfully",
      });
    } catch (error) {
      console.error("Error capturing biometric:", error);
      toast({
        title: "Error",
        description: "Failed to capture biometric data. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (!isInitialized) {
    return <div>Loading face detection models...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-video w-full max-w-xl mx-auto bg-gray-100 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex justify-center gap-4">
        {!isCameraActive ? (
          <Button onClick={startCamera} className="gap-2">
            <Camera className="h-4 w-4" />
            Start Camera
          </Button>
        ) : (
          <>
            <Button onClick={stopCamera} variant="outline">
              Stop Camera
            </Button>
            <Button onClick={captureBiometric}>
              Capture Biometric
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default BiometricCapture;