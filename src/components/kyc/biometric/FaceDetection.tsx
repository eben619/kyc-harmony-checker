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
        const objectDetector = await pipeline('object-detection', 'Xenova/detr-resnet-50', {
          quantized: false,
        });
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
        // Create a canvas to capture the video frame
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) return;

        // Set canvas dimensions to match video
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        // Draw the current video frame to canvas
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // Get the data URL from canvas
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

        // Run detection on the data URL string
        const output = await detector(dataUrl);
        
        // Check if a person is detected with high confidence
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