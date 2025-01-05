import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { KYCData } from "../../KYCForm";

interface PersonalNameFieldsProps {
  register: UseFormRegister<KYCData>;
  errors: FieldErrors<KYCData>;
}

const PersonalNameFields = ({ register, errors }: PersonalNameFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            {...register("firstName")}
            placeholder="Enter your first name"
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="middleName">Middle Name (Optional)</Label>
          <Input
            id="middleName"
            {...register("middleName")}
            placeholder="Enter your middle name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name *</Label>
        <Input
          id="lastName"
          {...register("lastName")}
          placeholder="Enter your last name"
        />
        {errors.lastName && (
          <p className="text-sm text-destructive">{errors.lastName.message}</p>
        )}
      </div>
    </>
  );
};

export default PersonalNameFields;