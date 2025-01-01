import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface CameraControlsProps {
  isCameraActive: boolean;
  isCapturing: boolean;
  isFaceDetected: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onCapture: () => void;
}

const CameraControls = ({
  isCameraActive,
  isCapturing,
  isFaceDetected,
  onStartCamera,
  onStopCamera,
  onCapture,
}: CameraControlsProps) => {
  if (!isCameraActive) {
    return (
      <Button onClick={onStartCamera} className="w-full gap-2">
        <Camera className="h-4 w-4" />
        Start Camera
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={onCapture}
        disabled={isCapturing || !isFaceDetected}
        className="w-full"
      >
        {isCapturing ? "Capturing..." : "Capture"}
      </Button>
      <Button
        onClick={onStopCamera}
        variant="outline"
        className="w-full"
      >
        Stop Camera
      </Button>
    </div>
  );
};

export default CameraControls;