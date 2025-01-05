import { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { useToast } from "@/components/ui/use-toast";

interface FaceDetectionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onFaceDetected: (detected: boolean) => void;
  onHeadTurn: (turned: boolean) => void;
}

const FaceDetection = ({ videoRef, onFaceDetected, onHeadTurn }: FaceDetectionProps) => {
  const { toast } = useToast();
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [lastNosePosition, setLastNosePosition] = useState<{ x: number, y: number } | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);
        setIsModelLoaded(true);
        console.log("Face detection models loaded successfully");
      } catch (error) {
        console.error('Error loading face detection models:', error);
        toast({
          title: "Error",
          description: "Failed to load face detection models. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    loadModels();
  }, [toast]);

  useEffect(() => {
    if (!isModelLoaded || !videoRef.current) return;

    let animationFrameId: number;

    const detectFace = async () => {
      if (!videoRef.current) return;

      try {
        const detections = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks();

        const hasFace = !!detections;
        onFaceDetected(hasFace);

        if (hasFace) {
          const nose = detections.landmarks.getNose()[0];
          
          if (lastNosePosition) {
            const movement = Math.abs(nose.x - lastNosePosition.x);
            const threshold = videoRef.current.videoWidth * 0.15; // 15% of video width
            
            if (movement > threshold) {
              onHeadTurn(true);
            }
          }
          
          setLastNosePosition({ x: nose.x, y: nose.y });
        }

      } catch (error) {
        console.error('Face detection error:', error);
      }

      animationFrameId = requestAnimationFrame(detectFace);
    };

    detectFace();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isModelLoaded, videoRef, onFaceDetected, onHeadTurn, lastNosePosition]);

  return null;
};

export default FaceDetection;