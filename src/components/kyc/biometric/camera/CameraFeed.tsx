import { useState, useRef, useEffect } from "react";
import { Camera, SwitchCamera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface CameraFeedProps {
  onStreamReady: (stream: MediaStream) => void;
  isActive: boolean;
}

const CameraFeed = ({ onStreamReady, isActive }: CameraFeedProps) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        onStreamReady(stream);
        console.log("Camera started successfully with facing mode:", facingMode);
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

  const switchCamera = async () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  };

  useEffect(() => {
    if (isActive) {
      startCamera();
    }
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive, facingMode]);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-video bg-gray-100 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      {isActive && (
        <Button
          onClick={switchCamera}
          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
          size="icon"
        >
          <SwitchCamera className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default CameraFeed;