import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";

interface SingleDocumentUploadProps {
  id: string;
  label: string;
  fileName?: string;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SingleDocumentUpload = ({
  id,
  label,
  fileName,
  disabled,
  onChange,
}: SingleDocumentUploadProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onChange(e);
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isHovered ? 'border-primary bg-primary/5' : 'border-gray-300'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <input
        type="file"
        id={id}
        className="hidden"
        accept="image/*,.pdf"
        onChange={handleChange}
        disabled={disabled}
        // Add these attributes for better cross-browser compatibility
        capture="environment"
        multiple={false}
      />
      <Label
        htmlFor={id}
        className={`cursor-pointer flex flex-col items-center ${disabled ? 'opacity-50' : ''}`}
      >
        <Upload className={`h-12 w-12 mb-4 ${isHovered ? 'text-primary' : 'text-gray-400'}`} />
        <span className="text-sm text-gray-600">
          {fileName || label}
        </span>
        {disabled && (
          <div className="mt-4 w-full">
            <Progress value={100} className="w-full" />
            <span className="text-xs text-gray-500 mt-1">Processing...</span>
          </div>
        )}
      </Label>
    </div>
  );
};

export default SingleDocumentUpload;