
import { Check } from "lucide-react";

interface InstructionsDisplayProps {
  currentInstruction: number;
  instructions: string[];
  isFaceDetected: boolean;
  isStepComplete?: boolean;
}

const InstructionsDisplay = ({ 
  currentInstruction, 
  instructions, 
  isFaceDetected,
  isStepComplete = false
}: InstructionsDisplayProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-bold">Liveness Verification</h3>
        <p className="text-gray-500">Follow the instructions below</p>
      </div>
      
      <div className="flex items-center justify-center space-x-1">
        {!isFaceDetected ? (
          <div className="text-yellow-600 bg-yellow-50 px-4 py-2 rounded-md">
            Please position your face in the camera
          </div>
        ) : isStepComplete ? (
          <div className="text-green-600 bg-green-50 px-4 py-2 rounded-md flex items-center">
            <Check className="w-4 h-4 mr-1" /> 
            {instructions[currentInstruction]} - Completed!
          </div>
        ) : (
          <div className="text-blue-600 bg-blue-50 px-4 py-2 rounded-md">
            {instructions[currentInstruction]}
          </div>
        )}
      </div>
      
      <div className="flex justify-center">
        <div className="flex space-x-2">
          {instructions.map((_, index) => (
            <div 
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentInstruction 
                  ? 'bg-blue-600' 
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default InstructionsDisplay;
