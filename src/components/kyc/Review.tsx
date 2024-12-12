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

          <div>
            <h3 className="font-medium text-gray-600">ID Document</h3>
            <p>{formData.documentImage?.name}</p>
          </div>

          <div>
            <h3 className="font-medium text-gray-600">Selfie</h3>
            <p>{formData.selfieImage?.name}</p>
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