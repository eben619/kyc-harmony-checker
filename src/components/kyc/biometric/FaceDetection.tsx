import { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { useToast } from "@/components/ui/use-toast";

interface FaceDetectionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onFaceDetected: (detected: boolean) => void;
}

const FaceDetection = ({ videoRef, onFaceDetected }: FaceDetectionProps) => {
  const { toast } = useToast();
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector_model-weights_manifest.json'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68_model-weights_manifest.json'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models/face_expression_model-weights_manifest.json')
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
          .withFaceLandmarks()
          .withFaceExpressions();

        const hasFace = !!detections;
        onFaceDetected(hasFace);

        if (hasFace) {
          console.log("Face detected with expressions:", detections.expressions);
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
  }, [isModelLoaded, videoRef, onFaceDetected]);

  return null;
};

export default FaceDetection;