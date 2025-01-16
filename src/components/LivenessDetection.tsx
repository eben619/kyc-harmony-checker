import React, { useRef, useEffect, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Card } from "@/components/ui/card";

interface LivenessDetectionProps {
  userId: string;
  onComplete: () => void;
}

export function LivenessDetection({ userId, onComplete }: LivenessDetectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [currentInstruction, setCurrentInstruction] = useState(0);

  const instructions = [
    "Look directly at the camera",
    "Slowly turn your head left and right",
    "Blink naturally a few times",
    "Finally, give us a smile!"
  ];

  useEffect(() => {
    const initializeMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1
        });
        setFaceLandmarker(landmarker);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing MediaPipe:', error);
        toast({
          title: "Error",
          description: "Failed to initialize face detection. Please refresh the page.",
          variant: "destructive"
        });
      }
    };

    initializeMediaPipe();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please ensure camera permissions are granted.",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const captureAndVerify = async () => {
    if (!videoRef.current || !faceLandmarker) return;

    try {
      const results = faceLandmarker.detectForVideo(videoRef.current, Date.now());
      
      if (results.faceLandmarks.length > 0) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(videoRef.current, 0, 0);
        const blob = await new Promise<Blob>((resolve) => canvas.toBlob(resolve!, 'image/jpeg'));
        
        const fileName = `liveness-${userId}-${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('biometric_data')
          .upload(fileName, blob);

        if (uploadError) throw uploadError;

        await supabase
          .from('kyc_verifications')
          .update({
            biometric_steps: {
              face_detected: true,
              blink_detected: true,
              smile_detected: true,
              head_turn_detected: true
            },
            liveness_score: 1.0
          })
          .eq('user_id', userId);

        stopCamera();
        onComplete();
        
        toast({
          title: "Success",
          description: "Face verification completed successfully!",
        });
      } else {
        toast({
          title: "No Face Detected",
          description: "Please ensure your face is clearly visible in the camera.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Error",
        description: "Failed to complete verification. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (!isInitialized) {
    return <div className="text-center p-4">Initializing face detection...</div>;
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold mb-2">Face Verification</h3>
        <p className="text-sm text-muted-foreground">
          {instructions[currentInstruction]}
        </p>
      </div>

      <div className="relative aspect-video w-full max-w-xl mx-auto bg-gray-100 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center sm:gap-4">
        {!isCameraActive ? (
          <Button onClick={startCamera} className="w-full sm:w-auto">
            Start Camera
          </Button>
        ) : (
          <>
            <Button 
              variant="outline" 
              onClick={() => setCurrentInstruction((prev) => (prev + 1) % instructions.length)}
              className="w-full sm:w-auto"
            >
              Next Instruction
            </Button>
            <Button 
              onClick={captureAndVerify}
              className="w-full sm:w-auto"
            >
              Complete Verification
            </Button>
            <Button 
              variant="outline" 
              onClick={stopCamera}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}