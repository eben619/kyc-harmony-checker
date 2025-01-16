import React, { useRef, useEffect } from 'react';
import { DeepFace } from 'deepface';

interface FaceDetectionCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onFaceDetected: (detected: boolean) => void;
}

const FaceDetectionCanvas = ({ videoRef, onFaceDetected }: FaceDetectionCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    let isProcessing = false;

    const detectFace = async () => {
      if (!videoRef.current || !canvasRef.current || isProcessing) {
        animationFrameId = requestAnimationFrame(detectFace);
        return;
      }

      try {
        isProcessing = true;
        const context = canvasRef.current.getContext('2d');
        if (!context) return;

        // Capture current frame
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Detect face using DeepFace
        const result = await DeepFace.detectFace(imageData);
        const faceDetected = result && result.length > 0;
        
        onFaceDetected(faceDetected);

        // Draw detection rectangle if face is detected
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        if (faceDetected && result[0].box) {
          const { x, y, w, h } = result[0].box;
          context.strokeStyle = '#00ff00';
          context.lineWidth = 2;
          context.strokeRect(x, y, w, h);
        }

      } catch (error) {
        console.error('Face detection error:', error);
      } finally {
        isProcessing = false;
        animationFrameId = requestAnimationFrame(detectFace);
      }
    };

    detectFace();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
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