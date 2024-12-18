import { Button } from "@/components/ui/button";
import { KYCData } from "../KYCForm";

interface ReviewProps {
  formData: KYCData;
  onSubmit: () => void;
  onPrev: () => void;
}

const Review = ({ formData, onSubmit, onPrev }: ReviewProps) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-center mb-4">Review Your Information</h2>

        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-600">First Name</h3>
              <p>{formData.firstName}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-600">Last Name</h3>
              <p>{formData.lastName}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-600">Date of Birth</h3>
            <p>{formData.dateOfBirth}</p>
          </div>

          <div>
            <h3 className="font-medium text-gray-600">Address</h3>
            <p>{formData.address}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-600">Country</h3>
              <p>{formData.country}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-600">Zip Code</h3>
              <p>{formData.zipCode}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-600">Document Type</h3>
            <p>{formData.documentType}</p>
          </div>

          <div>
            <h3 className="font-medium text-gray-600">Document Images</h3>
            {formData.documentType === 'passport' ? (
              <p>{formData.documentImage?.name}</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <p>Front: {formData.documentFrontImage?.name}</p>
                <p>Back: {formData.documentBackImage?.name}</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-medium text-gray-600">Biometric Data</h3>
            <p>Face Verification: {formData.biometricData.faceImage ? "Completed" : "Not completed"}</p>
            <p>Fingerprint: {formData.biometricData.fingerprintHash ? "Completed" : "Not completed"}</p>
            <p>Live Photo: {formData.biometricData.livePhotoImage ? "Completed" : "Not completed"}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Previous
        </Button>
        <Button onClick={onSubmit} className="bg-success hover:bg-success/90">
          Submit KYC
        </Button>
      </div>
    </div>
  );
};

export default Review;