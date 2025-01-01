import { useState, useEffect } from 'react';
import { pipeline } from '@huggingface/transformers';
import { useToast } from "@/components/ui/use-toast";

interface FaceDetectionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onFaceDetected: (detected: boolean) => void;
}

const FaceDetection = ({ videoRef, onFaceDetected }: FaceDetectionProps) => {
  const { toast } = useToast();
  const [detector, setDetector] = useState<any>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const objectDetector = await pipeline(
          'object-detection',
          'Xenova/detr-resnet-50'
        );
        setDetector(objectDetector);
        console.log("Face detection model loaded successfully");
      } catch (error) {
        console.error('Error loading face detection model:', error);
        toast({
          title: "Error",
          description: "Failed to load face detection model. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    loadModel();
  }, [toast]);

  useEffect(() => {
    if (!detector || !videoRef.current) return;

    const detectFace = async () => {
      if (!videoRef.current) return;

      try {
        const output = await detector(videoRef.current);
        const hasFace = output.some((detection: any) => 
          detection.label === 'person' && detection.score > 0.85
        );
        onFaceDetected(hasFace);
        console.log("Face detection result:", hasFace);
      } catch (error) {
        console.error('Face detection error:', error);
      }
    };

    const interval = setInterval(detectFace, 1000);
    return () => clearInterval(interval);
  }, [detector, videoRef, onFaceDetected]);

  return null;
};

export default FaceDetection;