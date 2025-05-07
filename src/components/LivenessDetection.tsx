
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
  const [completedSteps, setCompletedSteps] = useState({
    lookStraight: false,
    turnHead: false,
    blink: false,
    smile: false
  });
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [lastBlinkTime, setLastBlinkTime] = useState(0);
  const [lastSmileTime, setLastSmileTime] = useState(0);

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
          faceapi.nets.faceExpressionNet.loadFromUri("/models"), // For smile detection
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

  const detectFacialExpressions = async () => {
    if (!videoRef.current || !isCameraActive) return;
    
    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();
      
      if (detections.length > 0) {
        // Face is detected
        if (!completedSteps.lookStraight) {
          setCompletedSteps(prev => ({ ...prev, lookStraight: true }));
        }
        
        // Check for smile
        const smileScore = detections[0].expressions.happy;
        if (smileScore > 0.7 && Date.now() - lastSmileTime > 2000) {
          console.log("Smile detected:", smileScore);
          setCompletedSteps(prev => ({ ...prev, smile: true }));
          setLastSmileTime(Date.now());
        }
        
        // Check for blink by monitoring eye landmarks
        const landmarks = detections[0].landmarks;
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();
        
        if (leftEye && rightEye) {
          const leftEyeTop = leftEye[1].y;
          const leftEyeBottom = leftEye[5].y;
          const leftEyeDistance = Math.abs(leftEyeTop - leftEyeBottom);
          
          const rightEyeTop = rightEye[1].y;
          const rightEyeBottom = rightEye[5].y;
          const rightEyeDistance = Math.abs(rightEyeTop - rightEyeBottom);
          
          const eyeDistanceThreshold = 5; // Adjust based on testing
          
          if (leftEyeDistance < eyeDistanceThreshold && rightEyeDistance < eyeDistanceThreshold && Date.now() - lastBlinkTime > 2000) {
            console.log("Blink detected");
            setCompletedSteps(prev => ({ ...prev, blink: true }));
            setLastBlinkTime(Date.now());
          }
        }
      }
    } catch (error) {
      console.error("Error detecting facial expressions:", error);
    }
  };

  useEffect(() => {
    let intervalId: number;
    if (isCameraActive) {
      intervalId = window.setInterval(() => {
        detectFacialExpressions();
      }, 500);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isCameraActive, lastBlinkTime, lastSmileTime]);

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
            face_detected: completedSteps.lookStraight,
            blink_detected: completedSteps.blink,
            smile_detected: completedSteps.smile,
            head_turn_detected: completedSteps.turnHead
          },
          liveness_score: calculateLivenessScore()
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

  const calculateLivenessScore = () => {
    let score = 0;
    if (completedSteps.lookStraight) score += 0.25;
    if (completedSteps.turnHead) score += 0.25;
    if (completedSteps.blink) score += 0.25;
    if (completedSteps.smile) score += 0.25;
    return score;
  };

  // Handle head turn detection from FaceDetectionCanvas
  const handleFaceDetectionUpdate = (detected: boolean, data?: any) => {
    setIsFaceDetected(detected);
    
    if (data?.headTurned && !completedSteps.turnHead) {
      console.log("Head turn detected");
      setCompletedSteps(prev => ({ ...prev, turnHead: true }));
    }
  };

  const allStepsCompleted = () => {
    return Object.values(completedSteps).every(step => step);
  };

  const getCurrentStepStatus = () => {
    switch (currentInstruction) {
      case 0: return completedSteps.lookStraight;
      case 1: return completedSteps.turnHead;
      case 2: return completedSteps.blink;
      case 3: return completedSteps.smile;
      default: return false;
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
        isStepComplete={getCurrentStepStatus()}
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
              onFaceDetected={(detected, data) => handleFaceDetectionUpdate(detected, data)}
            />
            <div className="absolute inset-x-0 bottom-0 bg-black/50 p-4">
              <p className="text-white font-semibold text-center text-lg">
                {instructions[currentInstruction]}
              </p>
              {getCurrentStepStatus() && (
                <p className="text-green-400 text-center text-sm">
                  ✓ Completed! Move to next instruction
                </p>
              )}
            </div>
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
              Next Instruction ({currentInstruction + 1}/{instructions.length})
            </Button>
            <Button 
              onClick={captureAndVerify}
              className={`w-full sm:w-auto ${allStepsCompleted() ? 'bg-green-600 hover:bg-green-700' : ''}`}
              disabled={!isFaceDetected}
            >
              {allStepsCompleted() ? "All Steps Completed! Finish Verification" : "Complete Verification"}
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
        {Object.entries(completedSteps).map(([step, completed], index) => (
          <div 
            key={step}
            className={`text-xs px-2 py-1 rounded text-center ${completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
          >
            {completed ? '✓ ' : '○ '}
            {step.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </div>
        ))}
      </div>
    </Card>
  );
}
