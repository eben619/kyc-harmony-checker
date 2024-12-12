interface ProgressStepsProps {
  currentStep: number;
}

const ProgressSteps = ({ currentStep }: ProgressStepsProps) => {
  const steps = [
    "Personal Info",
    "Document Upload",
    "Selfie",
    "Review",
  ];

  return (
    <div className="flex justify-between items-center w-full">
      {steps.map((step, index) => (
        <div key={step} className="flex flex-col items-center flex-1">
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
          {index < steps.length - 1 && (
            <div
              className={`h-1 w-full mt-4 ${
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