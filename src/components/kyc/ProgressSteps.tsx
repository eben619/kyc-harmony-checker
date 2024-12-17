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
    <div className="flex items-center w-full mb-8">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center relative flex-1">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index + 1 <= currentStep
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {index + 1}
            </div>
            <div className="text-sm mt-2 text-center">{step}</div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`h-1 absolute top-4 left-1/2 w-full ${
                index + 1 < currentStep ? "bg-primary" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressSteps;