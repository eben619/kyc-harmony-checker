import React, { useRef, useEffect, useState } from 'react';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const STEPS = {
  FACE_POSITION: 'Position your face in the frame',
  BLINK: 'Please blink',
  SMILE: 'Please smile',
  HEAD_TURN: 'Turn your head left and right',
  COMPLETE: 'Verification complete'
};

export function LivenessDetection({ userId, onComplete }: { userId: string, onComplete: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(STEPS.FACE_POSITION);
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [verificationProgress, setVerificationProgress] = useState({
    faceDetected: false,
    blinkDetected: false,
    smileDetected: false,
    headTurnDetected: false
  });

  useEffect(() => {
    const initializeMediaPipe = async () => {
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
    };

    initializeMediaPipe();
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        toast({
          title: "Camera Error",
          description: "Unable to access camera. Please ensure camera permissions are granted.",
          variant: "destructive"
        });
      }
    };

    startCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!faceLandmarker || !videoRef.current) return;

    let animationFrameId: number;
    let lastVideoTime = -1;

    const detectFaceGestures = async () => {
      if (!videoRef.current || !faceLandmarker) return;
      
      if (videoRef.current.currentTime === lastVideoTime) {
        animationFrameId = requestAnimationFrame(detectFaceGestures);
        return;
      }
      lastVideoTime = videoRef.current.currentTime;

      const results = faceLandmarker.detectForVideo(videoRef.current, Date.now());

      if (results.faceBlendshapes?.length) {
        const blendshapes = results.faceBlendshapes[0].categories;
        
        // Face detection
        if (!verificationProgress.faceDetected && results.faceLandmarks.length > 0) {
          setVerificationProgress(prev => ({ ...prev, faceDetected: true }));
          setCurrentStep(STEPS.BLINK);
          await updateVerificationStatus({ face_detected: true });
        }

        // Blink detection
        if (verificationProgress.faceDetected && !verificationProgress.blinkDetected) {
          const eyeBlinkLeft = blendshapes.find(b => b.categoryName === 'eyeBlinkLeft')?.score || 0;
          const eyeBlinkRight = blendshapes.find(b => b.categoryName === 'eyeBlinkRight')?.score || 0;
          
          if (eyeBlinkLeft > 0.8 && eyeBlinkRight > 0.8) {
            setVerificationProgress(prev => ({ ...prev, blinkDetected: true }));
            setCurrentStep(STEPS.SMILE);
            await updateVerificationStatus({ blink_detected: true });
          }
        }

        // Smile detection
        if (verificationProgress.blinkDetected && !verificationProgress.smileDetected) {
          const mouthSmile = blendshapes.find(b => b.categoryName === 'mouthSmile')?.score || 0;
          
          if (mouthSmile > 0.7) {
            setVerificationProgress(prev => ({ ...prev, smileDetected: true }));
            setCurrentStep(STEPS.HEAD_TURN);
            await updateVerificationStatus({ smile_detected: true });
          }
        }

        // Head turn detection
        if (verificationProgress.smileDetected && !verificationProgress.headTurnDetected) {
          const headTurnLeft = blendshapes.find(b => b.categoryName === 'headTurnLeft')?.score || 0;
          const headTurnRight = blendshapes.find(b => b.categoryName === 'headTurnRight')?.score || 0;
          
          if (headTurnLeft > 0.5 || headTurnRight > 0.5) {
            setVerificationProgress(prev => ({ ...prev, headTurnDetected: true }));
            setCurrentStep(STEPS.COMPLETE);
            await updateVerificationStatus({ head_turn_detected: true });
            onComplete();
          }
        }
      }

      animationFrameId = requestAnimationFrame(detectFaceGestures);
    };

    detectFaceGestures();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [faceLandmarker, verificationProgress]);

  const updateVerificationStatus = async (stepUpdate: any) => {
    try {
      await supabase
        .from('kyc_verifications')
        .update({
          biometric_steps: {
            ...verificationProgress,
            ...stepUpdate
          }
        })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error updating verification status:', error);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative aspect-video w-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Current Step: {currentStep}</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-2 ${verificationProgress.faceDetected ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span>Face Detection</span>
          </div>
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-2 ${verificationProgress.blinkDetected ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span>Blink Detection</span>
          </div>
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-2 ${verificationProgress.smileDetected ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span>Smile Detection</span>
          </div>
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-2 ${verificationProgress.headTurnDetected ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span>Head Turn Detection</span>
          </div>
        </div>
      </div>
    </div>
  );
}
