import React, { useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceDetection from '@tensorflow-models/face-detection';

interface FaceDetectionCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onFaceDetected: (detected: boolean) => void;
}

const FaceDetectionCanvas = ({ videoRef, onFaceDetected }: FaceDetectionCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animationFrameId: number | undefined;
    let detector: faceDetection.FaceDetector | null = null;
    let isProcessing = false;

    const loadModel = async () => {
      try {
        const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
        const detectorConfig = {
          runtime: 'tfjs',
          maxFaces: 1,
          modelType: 'short'
        } as const;
        
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
        onFaceDetected(faceDetected);

        // Draw detection boxes
        if (faceDetected) {
          faces.forEach((face) => {
            const box = face.box;
            context.strokeStyle = '#00ff00';
            context.lineWidth = 2;
            context.strokeRect(
              box.xMin,
              box.yMin,
              box.width,
              box.height
            );
          });
        }

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
  }, [videoRef, onFaceDetected]);

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