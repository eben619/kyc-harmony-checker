import { useState } from "react";
import { Fingerprint, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { BiometricData } from "./types";

interface FingerprintVerificationProps {
  biometricData: BiometricData;
  onCapture: (data: Partial<BiometricData>) => void;
}

const FingerprintVerification = ({ biometricData, onCapture }: FingerprintVerificationProps) => {
  const { toast } = useToast();
  const [isCapturing, setIsCapturing] = useState(false);

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
        const fingerprintHash = btoa(JSON.stringify(credential));
        onCapture({ fingerprintHash });

        toast({
          title: "Success",
          description: "Fingerprint verification completed",
        });
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

  return (
    <Card className="p-6">
      <div className="text-center space-y-4">
        <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
          {biometricData.fingerprintHash ? (
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          ) : (
            <Fingerprint className="w-16 h-16 text-gray-400" />
          )}
        </div>
        <h3 className="font-semibold">Fingerprint Verification</h3>
        <p className="text-sm text-gray-600">
          Use your device's fingerprint sensor
        </p>
        <Button
          onClick={handleFingerprintCapture}
          disabled={isCapturing || !!biometricData.fingerprintHash}
          className="w-full"
        >
          {biometricData.fingerprintHash ? "Verified" : "Verify Fingerprint"}
        </Button>
      </div>
    </Card>
  );
};

export default FingerprintVerification;