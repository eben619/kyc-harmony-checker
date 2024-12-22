import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

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
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      <input
        type="file"
        id={id}
        className="hidden"
        accept="image/*"
        onChange={onChange}
        disabled={disabled}
      />
      <Label
        htmlFor={id}
        className="cursor-pointer flex flex-col items-center"
      >
        <Upload className="h-12 w-12 text-gray-400 mb-4" />
        <span className="text-sm text-gray-600">
          {fileName || label}
        </span>
      </Label>
    </div>
  );
};

export default SingleDocumentUpload;