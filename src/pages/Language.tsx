import { useState } from "react";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const languages = [
  { id: "en", name: "English", region: "United States" },
  { id: "es", name: "Spanish", region: "Spain" },
  { id: "fr", name: "French", region: "France" },
  { id: "de", name: "German", region: "Germany" },
  { id: "it", name: "Italian", region: "Italy" },
  { id: "pt", name: "Portuguese", region: "Portugal" },
  { id: "nl", name: "Dutch", region: "Netherlands" },
  { id: "pl", name: "Polish", region: "Poland" },
];

const Language = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const { toast } = useToast();

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
  };

  const handleSave = () => {
    // Here you would typically save the language preference to your backend
    toast({
      title: "Language Updated",
      description: `Your language has been set to ${
        languages.find((lang) => lang.id === selectedLanguage)?.name
      }`,
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Language Settings</h1>
        <p className="text-muted-foreground mt-2">
          Choose your preferred language and region
        </p>
      </div>

      <Card className="p-6">
        <RadioGroup
          value={selectedLanguage}
          onValueChange={handleLanguageChange}
          className="space-y-4"
        >
          {languages.map((language) => (
            <div
              key={language.id}
              className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-accent"
            >
              <RadioGroupItem value={language.id} id={language.id} />
              <Label
                htmlFor={language.id}
                className="flex flex-1 items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="font-medium">{language.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {language.region}
                  </div>
                </div>
                {selectedLanguage === language.id && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="mt-6">
          <Button onClick={handleSave}>Save Language Preference</Button>
        </div>
      </Card>
    </div>
  );
};

export default Language;