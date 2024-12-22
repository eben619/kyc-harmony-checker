import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TaxForm {
  id: number;
  form_code: string;
  form_name: string;
  description: string | null;
  applicable_countries: string[];
}

interface TaxFormSelectorProps {
  forms: TaxForm[];
  onSelect: (formId: number) => void;
}

const TaxFormSelector = ({ forms, onSelect }: TaxFormSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<TaxForm | null>(null);

  const handleSelect = (form: TaxForm) => {
    setSelectedForm(form);
    setOpen(false);
    onSelect(form.id);
  };

  return (
    <div className="space-y-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedForm ? selectedForm.form_name : "Select a tax form..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search tax forms..." />
            <CommandEmpty>No tax form found.</CommandEmpty>
            <CommandGroup>
              {forms.map((form) => (
                <CommandItem
                  key={form.id}
                  value={form.form_code}
                  onSelect={() => handleSelect(form)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedForm?.id === form.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div>
                    <p>{form.form_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {form.description}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedForm && (
        <div className="text-sm text-muted-foreground">
          <p>This form is applicable for: {selectedForm.applicable_countries.join(", ")}</p>
        </div>
      )}
    </div>
  );
};

export default TaxFormSelector;