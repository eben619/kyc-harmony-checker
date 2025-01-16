import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

interface FaceDetectionCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onFaceDetected: (detected: boolean) => void;
}

const FaceDetectionCanvas = ({ videoRef, onFaceDetected }: FaceDetectionCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animationFrameId: number;

    const detectFace = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      try {
        const detections = await faceapi.detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        );

        const detected = !!detections;
        onFaceDetected(detected);

        // Draw detection rectangle if face is detected
        const context = canvasRef.current.getContext('2d');
        if (context) {
          context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          if (detected && detections) {
            context.strokeStyle = '#00ff00';
            context.lineWidth = 2;
            context.strokeRect(
              detections.box.x,
              detections.box.y,
              detections.box.width,
              detections.box.height
            );
          }
        }
      } catch (error) {
        console.error('Face detection error:', error);
      }

      animationFrameId = requestAnimationFrame(detectFace);
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