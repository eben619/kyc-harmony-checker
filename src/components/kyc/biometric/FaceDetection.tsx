import { useState, useEffect } from 'react';
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

interface FaceDetectionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onFaceDetected: (detected: boolean) => void;
  onHeadTurn: (turned: boolean) => void;
}

const FaceDetection = ({ videoRef, onFaceDetected, onHeadTurn }: FaceDetectionProps) => {
  const [detector, setDetector] = useState<FaceDetector | null>(null);
  const [lastXPosition, setLastXPosition] = useState<number | null>(null);

  useEffect(() => {
    const initializeDetector = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        const faceDetector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
            delegate: "GPU"
          },
          runningMode: "VIDEO"
        });
        
        setDetector(faceDetector);
        console.log("Face detection model loaded successfully");
      } catch (error) {
        console.error('Error initializing face detector:', error);
      }
    };

    initializeDetector();
  }, []);

  useEffect(() => {
    if (!detector || !videoRef.current) return;

    let animationFrameId: number;
    let lastDetectionTime = 0;
    const detectionInterval = 100; // Detect every 100ms

    const detectFace = async () => {
      if (!videoRef.current || !detector) return;

      const now = Date.now();
      if (now - lastDetectionTime >= detectionInterval) {
        try {
          const detections = detector.detectForVideo(videoRef.current, now);
          const facePresent = detections.detections.length > 0;
          onFaceDetected(facePresent);

          if (facePresent) {
            const face = detections.detections[0];
            const currentX = face.boundingBox.originX;

            if (lastXPosition !== null) {
              const movement = Math.abs(currentX - lastXPosition);
              // Detect significant horizontal movement
              if (movement > 50) {
                onHeadTurn(true);
              }
            }
            setLastXPosition(currentX);
          }
        } catch (error) {
          console.error('Face detection error:', error);
        }
        lastDetectionTime = now;
      }

      animationFrameId = requestAnimationFrame(detectFace);
    };

    detectFace();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [detector, videoRef, onFaceDetected, onHeadTurn, lastXPosition]);

  return null;
};

export default FaceDetection;