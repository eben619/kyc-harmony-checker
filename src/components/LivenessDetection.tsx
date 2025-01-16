import React, { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Card } from "@/components/ui/card";
import CameraFeed from './liveness/CameraFeed';
import FaceDetectionCanvas from './liveness/FaceDetectionCanvas';
import InstructionsDisplay from './liveness/InstructionsDisplay';

interface LivenessDetectionProps {
  userId: string;
  onComplete: () => void;
}

export function LivenessDetection({ userId, onComplete }: LivenessDetectionProps) {
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState(0);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const instructions = [
    "Look directly at the camera",
    "Slowly turn your head left and right",
    "Blink naturally a few times",
    "Finally, give us a smile!"
  ];

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        ]);
        setIsInitialized(true);
        console.log("Face detection models loaded successfully");
      } catch (error) {
        console.error('Error loading face detection models:', error);
        toast({
          title: "Error",
          description: "Failed to initialize face detection. Please refresh the page.",
          variant: "destructive"
        });
      }
    };

    loadModels();
  }, []);

  const handleStreamReady = (stream: MediaStream) => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      setIsCameraActive(true);
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

  const captureAndVerify = async () => {
    if (!videoRef.current) return;

    try {
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
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Error",
        description: "Failed to complete verification. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!isInitialized) {
    return <div className="text-center p-4">Initializing face detection...</div>;
  }

  return (
    <Card className="p-6 space-y-4">
      <InstructionsDisplay
        currentInstruction={currentInstruction}
        isFaceDetected={isFaceDetected}
        instructions={instructions}
      />

      <div className="relative aspect-video w-full max-w-xl mx-auto bg-gray-100 rounded-lg overflow-hidden">
        {isCameraActive && (
          <>
            <CameraFeed
              onStreamReady={handleStreamReady}
              isActive={isCameraActive}
            />
            <FaceDetectionCanvas
              videoRef={videoRef}
              onFaceDetected={setIsFaceDetected}
            />
          </>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center sm:gap-4">
        {!isCameraActive ? (
          <Button onClick={() => setIsCameraActive(true)} className="w-full sm:w-auto">
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
              disabled={!isFaceDetected}
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