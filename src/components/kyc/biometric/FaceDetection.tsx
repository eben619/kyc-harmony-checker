
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
  const [xPositions, setXPositions] = useState<number[]>([]);
  const [headMovementDetected, setHeadMovementDetected] = useState(false);

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
            const currentXPositions = results.faceLandmarks[0].map(landmark => landmark.x);
            const avgX = currentXPositions.reduce((a, b) => a + b, 0) / currentXPositions.length;

            // Store historical positions for movement analysis
            setXPositions(prev => {
              const newPositions = [...prev, avgX].slice(-10); // Keep last 10 positions
              return newPositions;
            });

            // Detect head turn by analyzing position history
            if (xPositions.length >= 5) {
              const minX = Math.min(...xPositions);
              const maxX = Math.max(...xPositions);
              const movementRange = maxX - minX;
              
              // Significant horizontal movement detected
              if (movementRange > 0.15) { // 15% movement threshold
                setHeadMovementDetected(true);
                onHeadTurn(true);
                console.log("Head movement detected:", movementRange);
              }
            }

            if (lastXPosition !== null) {
              const movement = Math.abs(avgX - lastXPosition);
              // Log significant movements
              if (movement > 0.05) {
                console.log("Movement detected:", movement);
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
  }, [detector, videoRef, onFaceDetected, onHeadTurn, lastXPosition, xPositions]);

  return null;
};

export default FaceDetection;
