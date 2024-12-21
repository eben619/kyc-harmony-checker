import { useState } from "react";
import { Fingerprint, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { BiometricData } from "./types";

interface FingerprintVerificationProps {
  biometricData: BiometricData;
  onCapture: (data: Partial<BiometricData>) => void;
}

const FingerprintVerification = ({ biometricData, onCapture }: FingerprintVerificationProps) => {
  const { toast } = useToast();
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedPrints, setCapturedPrints] = useState<string[]>([]);

  const fingerprintSteps = [
    { position: "Center of fingerprint", instruction: "Place your finger flat on the sensor" },
    { position: "Left side", instruction: "Tilt your finger slightly to the left" },
    { position: "Right side", instruction: "Tilt your finger slightly to the right" },
    { position: "Upper area", instruction: "Roll your finger upward" },
    { position: "Lower area", instruction: "Roll your finger downward" },
  ];

  const handleFingerprintCapture = async () => {
    try {
      setIsCapturing(true);
      
      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: new Uint8Array(32),
        rp: {
          name: "Universal KYC",
          id: window.location.hostname,
        },
        user: {
          id: new Uint8Array(16),
          name: 'user',
          displayName: 'User',
        },
        pubKeyCredParams: [{alg: -7, type: "public-key"}],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
        timeout: 60000,
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });

      if (credential) {
        const credentialData = {
          id: credential.id,
          type: credential.type,
          timestamp: Date.now(),
          position: fingerprintSteps[currentStep].position
        };

        const newPrints = [...capturedPrints, JSON.stringify(credentialData)];
        setCapturedPrints(newPrints);

        if (currentStep === fingerprintSteps.length - 1) {
          // Combine all fingerprint data into one hash
          const fingerprintHash = btoa(JSON.stringify(newPrints));
          onCapture({ fingerprintHash });
          
          toast({
            title: "Success",
            description: "All fingerprint positions captured successfully",
          });
        } else {
          setCurrentStep(prev => prev + 1);
          toast({
            title: "Position Captured",
            description: "Please proceed with the next position",
          });
        }
      }
    } catch (error) {
      console.error('Fingerprint error:', error);
      toast({
        title: "Error",
        description: "Failed to verify fingerprint. Please ensure your device supports biometric authentication.",
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const progress = (currentStep / fingerprintSteps.length) * 100;

  return (
    <Card className="p-6">
      <div className="text-center space-y-4">
        {!biometricData.fingerprintHash ? (
          <>
            <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <Fingerprint className={`w-16 h-16 ${isCapturing ? 'text-primary animate-pulse' : 'text-gray-400'}`} />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">Fingerprint Verification - Step {currentStep + 1} of 5</h3>
              <p className="text-sm text-gray-600">
                {fingerprintSteps[currentStep].instruction}
              </p>
            </div>

            <Progress value={progress} className="w-full" />

            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <AlertCircle className="w-4 h-4" />
              <p>Captured {currentStep} of 5 positions</p>
            </div>

            <Button
              onClick={handleFingerprintCapture}
              disabled={isCapturing}
              className="w-full"
            >
              {isCapturing ? "Capturing..." : `Capture ${fingerprintSteps[currentStep].position}`}
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <h3 className="font-semibold">Fingerprint Verification Complete</h3>
            <p className="text-sm text-gray-600">All positions successfully captured</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default FingerprintVerification;