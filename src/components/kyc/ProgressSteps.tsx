interface ProgressStepsProps {
  currentStep: number;
}

const ProgressSteps = ({ currentStep }: ProgressStepsProps) => {
  const steps = [
    "Personal Info",
    "Biometric Verification",
    "Review",
  ];

  return (
    <div className="flex items-center justify-center w-full mb-8">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary text-white text-lg font-semibold">
          {currentStep}
        </div>
        <div className="text-sm mt-2 text-center font-medium">
          {steps[currentStep - 1]}
        </div>
      </div>
    </div>
  );
};

export default ProgressSteps;