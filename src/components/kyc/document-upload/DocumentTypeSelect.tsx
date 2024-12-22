import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DocumentTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const DocumentTypeSelect = ({ value, onChange }: DocumentTypeSelectProps) => {
  return (
    <div className="space-y-2">
      <Label>Document Type</Label>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select document type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="passport">Passport</SelectItem>
          <SelectItem value="national_id">National ID</SelectItem>
          <SelectItem value="drivers_license">Driver's License</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default DocumentTypeSelect;