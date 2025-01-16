import React, { useRef, useEffect } from 'react';
// Import as a module with any type to avoid TypeScript errors
import * as deepface from 'deepface';

interface FaceDetectionCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onFaceDetected: (detected: boolean) => void;
}

interface DetectionResult {
  box: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
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
        
        // Convert canvas to blob for DeepFace
        const blob = await new Promise<Blob>((resolve) => 
          canvasRef.current!.toBlob((b) => resolve(b!), 'image/jpeg')
        );

        // Create a temporary URL for the blob
        const imageUrl = URL.createObjectURL(blob);

        // Detect face using DeepFace
        const result = await (deepface as any).detectFace(imageUrl) as DetectionResult[];
        const faceDetected = result && result.length > 0;
        
        onFaceDetected(faceDetected);

        // Clean up the temporary URL
        URL.revokeObjectURL(imageUrl);

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
        onFaceDetected(false);
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