import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Fingerprint, Scan, CheckCircle2 } from "lucide-react";
import { KYCData } from "../KYCForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import "./types/image-capture.d.ts";

interface BiometricVerificationProps {
  formData: KYCData;
  updateFormData: (data: Partial<KYCData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const BiometricVerification = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
}: BiometricVerificationProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("face");
  const [isCapturing, setIsCapturing] = useState(false);

  const handleFaceCapture = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoTrack = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(videoTrack);
      const blob = await imageCapture.takePhoto();
      
      // Upload to Supabase Storage
      const fileName = `face-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('biometric_data')
        .upload(`${fileName}`, blob);

      if (uploadError) throw uploadError;

      updateFormData({
        biometricData: {
          ...formData.biometricData,
          faceImage: fileName,
        },
      });

      // Clean up
      stream.getTracks().forEach(track => track.stop());
      toast({
        title: "Success",
        description: "Face capture completed successfully",
      });
    } catch (error) {
      console.error('Face capture error:', error);
      toast({
        title: "Error",
        description: "Failed to capture face image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const handleFingerprintCapture = async () => {
    try {
      setIsCapturing(true);
      
      // Request biometric authentication
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
        updateFormData({
          biometricData: {
            ...formData.biometricData,
            fingerprintHash: fingerprintHash,
          },
        });

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

  const handleLivePhotoCapture = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoTrack = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(videoTrack);
      const blob = await imageCapture.takePhoto();
      
      // Upload to Supabase Storage
      const fileName = `live-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('biometric_data')
        .upload(`${fileName}`, blob);

      if (uploadError) throw uploadError;

      updateFormData({
        biometricData: {
          ...formData.biometricData,
          livePhotoImage: fileName,
        },
      });

      // Clean up
      stream.getTracks().forEach(track => track.stop());
      toast({
        title: "Success",
        description: "Live photo captured successfully",
      });
    } catch (error) {
      console.error('Live photo error:', error);
      toast({
        title: "Error",
        description: "Failed to capture live photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const isComplete = 
    formData.biometricData.faceImage &&
    formData.biometricData.fingerprintHash &&
    formData.biometricData.livePhotoImage;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">Biometric Verification</h2>
        <p className="text-gray-600 mt-2">
          Please complete all three verification steps
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="face">Face Scan</TabsTrigger>
          <TabsTrigger value="fingerprint">Fingerprint</TabsTrigger>
          <TabsTrigger value="live">Live Photo</TabsTrigger>
        </TabsList>

        <TabsContent value="face" className="mt-4">
          <Card className="p-6">
            <div className="text-center space-y-4">
              <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                {formData.biometricData.faceImage ? (
                  <CheckCircle2 className="w-16 h-16 text-green-500" />
                ) : (
                  <Camera className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <h3 className="font-semibold">Face Verification</h3>
              <p className="text-sm text-gray-600">
                Position your face within the frame for verification
              </p>
              <Button
                onClick={handleFaceCapture}
                disabled={isCapturing || !!formData.biometricData.faceImage}
                className="w-full"
              >
                {formData.biometricData.faceImage ? "Captured" : "Start Face Scan"}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="fingerprint" className="mt-4">
          <Card className="p-6">
            <div className="text-center space-y-4">
              <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                {formData.biometricData.fingerprintHash ? (
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
                disabled={isCapturing || !!formData.biometricData.fingerprintHash}
                className="w-full"
              >
                {formData.biometricData.fingerprintHash ? "Verified" : "Verify Fingerprint"}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="live" className="mt-4">
          <Card className="p-6">
            <div className="text-center space-y-4">
              <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                {formData.biometricData.livePhotoImage ? (
                  <CheckCircle2 className="w-16 h-16 text-green-500" />
                ) : (
                  <Scan className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <h3 className="font-semibold">Live Photo Verification</h3>
              <p className="text-sm text-gray-600">
                Take a live photo for verification
              </p>
              <Button
                onClick={handleLivePhotoCapture}
                disabled={isCapturing || !!formData.biometricData.livePhotoImage}
                className="w-full"
              >
                {formData.biometricData.livePhotoImage ? "Captured" : "Take Live Photo"}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onPrev}>
          Previous
        </Button>
        <Button onClick={onNext} disabled={!isComplete}>
          Next Step
        </Button>
      </div>
    </div>
  );
};

export default BiometricVerification;
