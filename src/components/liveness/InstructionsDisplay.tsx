import React from 'react';

interface InstructionsDisplayProps {
  currentInstruction: number;
  isFaceDetected: boolean;
  instructions: string[];
}

const InstructionsDisplay = ({ 
  currentInstruction, 
  isFaceDetected, 
  instructions 
}: InstructionsDisplayProps) => {
  return (
    <div className="text-center mb-4">
      <h3 className="text-lg font-semibold mb-2">Face Verification</h3>
      <p className={`text-sm transition-colors duration-200 ${isFaceDetected ? 'text-green-500 font-medium' : 'text-muted-foreground'}`}>
        {instructions[currentInstruction]}
      </p>
      {!isFaceDetected && (
        <p className="text-xs text-red-500 mt-1">
          No face detected. Please ensure your face is clearly visible.
        </p>
      )}
    </div>
  );
};

export default InstructionsDisplay;