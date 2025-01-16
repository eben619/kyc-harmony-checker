import { useState, useEffect } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

interface FaceDetectionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onFaceDetected: (detected: boolean) => void;
  onHeadTurn: (turned: boolean) => void;
}

const FaceDetection = ({ videoRef, onFaceDetected, onHeadTurn }: FaceDetectionProps) => {
  const [detector, setDetector] = useState<FaceLandmarker | null>(null);
  const [lastXPosition, setLastXPosition] = useState<number | null>(null);

  useEffect(() => {
    const initializeDetector = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1
        });
        
        setDetector(faceLandmarker);
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
          const results = detector.detectForVideo(videoRef.current, now);
          const facePresent = results.faceLandmarks.length > 0;
          onFaceDetected(facePresent);

          if (facePresent) {
            // Calculate the average x position of face landmarks
            const xPositions = results.faceLandmarks[0].map(landmark => landmark.x);
            const avgX = xPositions.reduce((a, b) => a + b, 0) / xPositions.length;

            if (lastXPosition !== null) {
              const movement = Math.abs(avgX - lastXPosition);
              // Detect significant horizontal movement (threshold can be adjusted)
              if (movement > 0.15) { // 15% movement threshold
                onHeadTurn(true);
              }
            }
            setLastXPosition(avgX);
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