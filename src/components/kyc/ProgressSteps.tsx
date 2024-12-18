interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressSteps = ({ currentStep, totalSteps }: ProgressStepsProps) => {
  const steps = [
    "Personal Info",
    "Document Upload",
    "Biometric Verification",
    "Submit & Review",
  ];

  return (
    <div className="flex items-center justify-around w-full mb-8">
      {steps.map((step, index) => (
        <div 
          key={step} 
          className="flex flex-col items-center flex-1"
        >
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center 
            ${currentStep > index + 1 ? 'bg-green-500' : currentStep === index + 1 ? 'bg-primary' : 'bg-gray-200'}
            text-white text-sm font-semibold relative
          `}>
            {index + 1}
            {index !== steps.length - 1 && (
              <div className={`absolute w-full h-0.5 left-full top-1/2 transform -translate-y-1/2
                ${currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-200'}`}
                style={{ width: '100%' }}
              />
            )}
          </div>
          <div className="text-xs mt-2 text-center font-medium">
            {step}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgressSteps;
