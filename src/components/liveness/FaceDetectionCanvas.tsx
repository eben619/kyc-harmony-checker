
import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceDetection from '@tensorflow-models/face-detection';

interface FaceDetectionCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onFaceDetected: (detected: boolean, data?: any) => void;
}

interface DetectorConfig {
  runtime: 'tfjs';
  maxFaces: number;
  modelType: 'short' | 'full';
}

const FaceDetectionCanvas = ({ videoRef, onFaceDetected }: FaceDetectionCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [xPositions, setXPositions] = useState<number[]>([]);
  const [headTurnDetected, setHeadTurnDetected] = useState(false);

  useEffect(() => {
    let detector: faceDetection.FaceDetector | null = null;
    let animationFrameId: number | undefined;
    let isProcessing = false;

    const loadModel = async () => {
      try {
        const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
        const detectorConfig: DetectorConfig = {
          runtime: 'tfjs',
          maxFaces: 1,
          modelType: 'short'
        };
        
        detector = await faceDetection.createDetector(model, detectorConfig);
        console.log("Face detection model loaded successfully");
      } catch (error) {
        console.error("Error loading face detection model:", error);
      }
    };

    const detectFace = async () => {
      if (!videoRef.current || !canvasRef.current || !detector || isProcessing) {
        animationFrameId = requestAnimationFrame(detectFace);
        return;
      }

      try {
        isProcessing = true;
        const context = canvasRef.current.getContext('2d');
        if (!context) return;

        // Clear previous drawings
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Detect faces
        const faces = await detector.estimateFaces(videoRef.current);
        const faceDetected = faces.length > 0;
        
        if (faceDetected) {
          const face = faces[0];
          const box = face.box;
          
          // Calculate face center x position (normalized 0-1)
          const faceCenterX = (box.xMin + box.width / 2) / videoRef.current.videoWidth;
          
          // Track face center positions
          setXPositions(prev => {
            const newPositions = [...prev, faceCenterX].slice(-15); // Keep last 15 positions
            return newPositions;
          });
          
          // Detect head turn by analyzing position history
          if (xPositions.length >= 10) {
            const minX = Math.min(...xPositions);
            const maxX = Math.max(...xPositions);
            const movementRange = maxX - minX;
            
            // Significant horizontal movement detected
            if (movementRange > 0.15 && !headTurnDetected) { // 15% movement threshold
              console.log("Head turn detected! Movement range:", movementRange);
              setHeadTurnDetected(true);
            }
          }

          // Draw detection boxes
          context.strokeStyle = headTurnDetected ? '#00ff00' : '#ffff00';
          context.lineWidth = 2;
          context.strokeRect(
            box.xMin,
            box.yMin,
            box.width,
            box.height
          );
          
          // Add labels
          context.fillStyle = headTurnDetected ? '#00ff00' : '#ffff00';
          context.font = '16px Arial';
          context.fillText(
            headTurnDetected ? 'Head Turn ✓' : 'Face Detected',
            box.xMin,
            box.yMin - 10
          );
        }
        
        // Pass both face detection and head turn status
        onFaceDetected(faceDetected, { headTurned: headTurnDetected });

      } catch (error) {
        console.error('Face detection error:', error);
        onFaceDetected(false);
      } finally {
        isProcessing = false;
        animationFrameId = requestAnimationFrame(detectFace);
      }
    };

    loadModel().then(() => {
      detectFace();
    });

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      // Clean up TensorFlow resources
      if (detector) {
        tf.dispose();
      }
    };
  }, [videoRef, onFaceDetected, xPositions, headTurnDetected]);

  useEffect(() => {
    // Update canvas dimensions when video dimensions change
    const updateCanvasDimensions = () => {
      if (canvasRef.current && videoRef.current) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
      }
    };

    if (videoRef.current) {
      videoRef.current.addEventListener('loadedmetadata', updateCanvasDimensions);
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('loadedmetadata', updateCanvasDimensions);
      }
    };
  }, [videoRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-10 w-full h-full"
      width={videoRef.current?.videoWidth || 640}
      height={videoRef.current?.videoHeight || 480}
    />
  );
};

export default FaceDetectionCanvas;
