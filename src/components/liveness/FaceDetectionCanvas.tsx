
import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceDetection from '@tensorflow-models/face-detection';

interface FaceDetectionCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onFaceDetected: (detected: boolean, data?: any) => void;
}

const FaceDetectionCanvas = ({ videoRef, onFaceDetected }: FaceDetectionCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detector, setDetector] = useState<faceDetection.FaceDetector | null>(null);
  const [xPositions, setXPositions] = useState<number[]>([]);
  const [headTurnDetected, setHeadTurnDetected] = useState(false);
  const [lastProcessingTime, setLastProcessingTime] = useState(0);

  useEffect(() => {
    let isActive = true;
    
    const loadModel = async () => {
      try {
        await tf.ready();
        console.log("TensorFlow.js is ready");
        
        const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
        const detectorConfig = {
          runtime: 'tfjs' as const,
          maxFaces: 1,
          modelType: 'short' as const
        };
        
        const faceDetector = await faceDetection.createDetector(model, detectorConfig);
        if (isActive) {
          console.log("Face detection model loaded successfully");
          setDetector(faceDetector);
        }
      } catch (error) {
        console.error("Error loading face detection model:", error);
      }
    };

    loadModel();
    
    return () => {
      isActive = false;
      // Clean up TensorFlow resources
      tf.engine().disposeVariables();
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number | undefined;
    let isProcessing = false;

    const detectFace = async () => {
      if (!videoRef.current || !canvasRef.current || !detector || isProcessing) {
        animationFrameId = requestAnimationFrame(detectFace);
        return;
      }

      const now = Date.now();
      // Limit processing to at most 5 times per second
      if (now - lastProcessingTime < 200) {
        animationFrameId = requestAnimationFrame(detectFace);
        return;
      }

      try {
        isProcessing = true;
        setLastProcessingTime(now);
        
        const context = canvasRef.current.getContext('2d');
        if (!context) return;

        // Clear previous drawings
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Make sure video is playing before detection
        if (videoRef.current.readyState < 2) {
          isProcessing = false;
          animationFrameId = requestAnimationFrame(detectFace);
          return;
        }

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
            const newPositions = [...prev, faceCenterX].slice(-20); // Keep last 20 positions
            return newPositions;
          });
          
          // Draw detection boxes
          context.strokeStyle = headTurnDetected ? '#00ff00' : '#ffff00';
          context.lineWidth = 4;
          context.strokeRect(
            box.xMin,
            box.yMin,
            box.width,
            box.height
          );
          
          // Add labels
          context.fillStyle = headTurnDetected ? '#00ff00' : '#ffff00';
          context.font = '18px Arial';
          context.fillText(
            headTurnDetected ? 'Head Turn ✓' : 'Face Detected',
            box.xMin,
            box.yMin - 10
          );
          
          // Detect head turn by analyzing position history
          if (xPositions.length >= 10) {
            const minX = Math.min(...xPositions);
            const maxX = Math.max(...xPositions);
            const movementRange = maxX - minX;
            
            // Log movement data for debugging
            console.log("Movement range:", movementRange, "Min:", minX, "Max:", maxX);
            
            // Significant horizontal movement detected (reduced threshold for easier detection)
            if (movementRange > 0.12 && !headTurnDetected) { // 12% movement threshold
              console.log("Head turn detected! Movement range:", movementRange);
              setHeadTurnDetected(true);
            }
          }
        } else {
          // No face detected
          context.fillStyle = 'rgba(255, 0, 0, 0.5)';
          context.font = '24px Arial';
          context.fillText(
            'No face detected',
            canvasRef.current.width / 2 - 80,
            30
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

    if (detector && videoRef.current) {
      detectFace();
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [detector, videoRef, onFaceDetected, xPositions, headTurnDetected, lastProcessingTime]);

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
      // Also try to update dimensions periodically
      const intervalId = setInterval(updateCanvasDimensions, 1000);
      
      return () => {
        videoRef.current?.removeEventListener('loadedmetadata', updateCanvasDimensions);
        clearInterval(intervalId);
      };
    }
  }, [videoRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-10 w-full h-full"
    />
  );
};

export default FaceDetectionCanvas;
