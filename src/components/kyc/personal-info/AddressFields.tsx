import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import countries from "@/data/countries";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { KYCData } from "../../KYCForm";

interface AddressFieldsProps {
  register: UseFormRegister<KYCData>;
  errors: FieldErrors<KYCData>;
  onCountryChange: (value: string) => void;
  defaultCountry?: string;
}

const AddressFields = ({ register, errors, onCountryChange, defaultCountry }: AddressFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Input
          id="address"
          {...register("address")}
          placeholder="Enter your address"
        />
        {errors.address && (
          <p className="text-sm text-destructive">{errors.address.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Country *</Label>
        <Select onValueChange={onCountryChange} defaultValue={defaultCountry}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select your country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.country && (
          <p className="text-sm text-destructive">{errors.country.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="zipCode">Zip Code *</Label>
        <Input
          id="zipCode"
          {...register("zipCode")}
          placeholder="Enter your zip code"
        />
        {errors.zipCode && (
          <p className="text-sm text-destructive">{errors.zipCode.message}</p>
        )}
      </div>
    </>
  );
};

export default AddressFields;