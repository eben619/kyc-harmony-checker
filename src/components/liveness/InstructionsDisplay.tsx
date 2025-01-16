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
      <p className={`text-sm ${isFaceDetected ? 'text-green-500' : 'text-muted-foreground'}`}>
        {instructions[currentInstruction]}
      </p>
    </div>
  );
};

export default InstructionsDisplay;