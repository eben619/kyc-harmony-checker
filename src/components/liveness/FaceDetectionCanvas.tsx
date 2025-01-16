import React, { useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

interface FaceDetectionCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onFaceDetected: (detected: boolean) => void;
}

const FaceDetectionCanvas = ({ videoRef, onFaceDetected }: FaceDetectionCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    let model: blazeface.BlazeFaceModel | null = null;
    let isProcessing = false;

    const loadModel = async () => {
      try {
        model = await blazeface.load();
        console.log("BlazeFace model loaded successfully");
      } catch (error) {
        console.error("Error loading BlazeFace model:", error);
      }
    };

    const detectFace = async () => {
      if (!videoRef.current || !canvasRef.current || !model || isProcessing) {
        animationFrameId = requestAnimationFrame(detectFace);
        return;
      }

      try {
        isProcessing = true;
        const context = canvasRef.current.getContext('2d');
        if (!context) return;

        // Clear previous drawings
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Get video frame as tensor
        const videoTensor = tf.browser.fromPixels(videoRef.current);
        const predictions = await model.estimateFaces(videoTensor, false);
        videoTensor.dispose(); // Clean up tensor

        const faceDetected = predictions.length > 0;
        onFaceDetected(faceDetected);

        // Draw detection boxes
        if (faceDetected) {
          predictions.forEach((prediction) => {
            const start = prediction.topLeft as [number, number];
            const end = prediction.bottomRight as [number, number];
            const size = [end[0] - start[0], end[1] - start[1]];

            context.strokeStyle = '#00ff00';
            context.lineWidth = 2;
            context.strokeRect(start[0], start[1], size[0], size[1]);
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
      if (model) {
        // Clean up any tensors
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