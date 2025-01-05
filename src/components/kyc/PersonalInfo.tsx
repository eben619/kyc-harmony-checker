import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KYCData } from "../KYCForm";
import { useToast } from "@/components/ui/use-toast";
import PersonalNameFields from "./personal-info/PersonalNameFields";
import AddressFields from "./personal-info/AddressFields";

interface PersonalInfoProps {
  formData: KYCData;
  updateFormData: (data: Partial<KYCData>) => void;
  onNext: () => void;
}

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  middleName: z.string().optional(),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  country: z.string().min(1, "Country is required"),
  zipCode: z.string().min(1, "Zip code is required"),
});

const PersonalInfo = ({ formData, updateFormData, onNext }: PersonalInfoProps) => {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    trigger,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: formData,
    mode: "onChange",
  });

  const onSubmit = async (data: any) => {
    const isFormValid = await trigger();
    if (!isFormValid) {
      toast({
        title: "Error",
        description: "Please fill in all required fields correctly",
        variant: "destructive",
      });
      return;
    }
    updateFormData(data);
    onNext();
  };

  const handleCountryChange = (value: string) => {
    setValue("country", value, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-fadeIn">
      <PersonalNameFields register={register} errors={errors} />

      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
        <Input
          id="dateOfBirth"
          type="date"
          {...register("dateOfBirth")}
        />
        {errors.dateOfBirth && (
          <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>
        )}
      </div>

      <AddressFields
        register={register}
        errors={errors}
        onCountryChange={handleCountryChange}
        defaultCountry={formData.country}
      />

      <Button 
        type="submit" 
        className="w-full"
        disabled={!isValid}
      >
        Next Step
      </Button>
    </form>
  );
};

export default PersonalInfo;