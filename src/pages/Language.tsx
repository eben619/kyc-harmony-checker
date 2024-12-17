import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    if (!acceptedTerms) {
      toast({
        title: "Terms & Conditions Required",
        description: "Please accept the terms and conditions before saving.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Language Updated",
      description: `Your language has been set to ${
        languages.find((lang) => lang.id === selectedLanguage)?.name
      }`,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Language Settings</h1>
        <p className="text-muted-foreground mt-2">
          Choose your preferred language and region
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-end gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="language" className="mb-2 block">
              Select Language
            </Label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((language) => (
                  <SelectItem key={language.id} value={language.id}>
                    <span className="font-medium">{language.name}</span>
                    <span className="text-muted-foreground ml-2">
                      ({language.region})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave}>Save Language Preference</Button>
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm">
              I accept the terms and conditions for language preferences. This includes
              receiving notifications and content in the selected language.
            </Label>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            By accepting these terms, you acknowledge that some content may still be
            displayed in English or other languages when translations are not available.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Language;