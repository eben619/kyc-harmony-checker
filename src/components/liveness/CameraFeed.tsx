import React, { useRef, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

interface CameraFeedProps {
  onStreamReady: (stream: MediaStream) => void;
  isActive: boolean;
}

const CameraFeed = ({ onStreamReady, isActive }: CameraFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          onStreamReady(stream);
          console.log("Camera started successfully with facing mode: user");
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

    if (isActive) {
      startCamera();
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive, onStreamReady]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="w-full h-full object-cover"
    />
  );
};

export default CameraFeed;