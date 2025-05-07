
import { Check, Loader2 } from "lucide-react";

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
      
      <div className="flex items-center justify-center">
        {!isFaceDetected ? (
          <div className="text-yellow-600 bg-yellow-50 px-4 py-2 rounded-md flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Please position your face in the camera</span>
          </div>
        ) : isStepComplete ? (
          <div className="text-green-600 bg-green-50 px-4 py-2 rounded-md flex items-center">
            <Check className="w-5 h-5 mr-2" /> 
            <span className="font-medium">{instructions[currentInstruction]} - Completed!</span>
          </div>
        ) : (
          <div className="text-blue-600 bg-blue-50 px-4 py-3 rounded-md shadow-sm">
            <p className="font-medium text-center">{instructions[currentInstruction]}</p>
            <p className="text-xs text-blue-500 text-center mt-1">Keep your face within the frame</p>
          </div>
        )}
      </div>
      
      <div className="flex justify-center">
        <div className="flex space-x-2">
          {instructions.map((_, index) => (
            <div 
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentInstruction 
                  ? 'bg-blue-600 scale-110' 
                  : index < currentInstruction
                    ? 'bg-green-500'
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
