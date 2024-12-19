import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

interface Language {
  code: string;
  name: string;
}

const Language = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [languages, setLanguages] = useState<Language[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openItems, setOpenItems] = useState<number[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchLanguages();
    fetchFAQs();
  }, [selectedLanguage]);

  const fetchLanguages = async () => {
    const { data, error } = await supabase
      .from("languages")
      .select("code, name");
    
    if (error) {
      console.error("Error fetching languages:", error);
      return;
    }
    
    setLanguages(data || []);
  };

  const fetchFAQs = async () => {
    const { data: translatedFaqs, error: translationError } = await supabase
      .from("faq_translations")
      .select("id, question, answer")
      .eq("language_code", selectedLanguage);

    if (translationError || !translatedFaqs?.length) {
      // Fallback to default FAQs if no translation found
      const { data: defaultFaqs, error: faqError } = await supabase
        .from("faqs")
        .select("id, question, answer");

      if (faqError) {
        console.error("Error fetching FAQs:", faqError);
        return;
      }

      setFaqs(defaultFaqs || []);
      return;
    }

    setFaqs(translatedFaqs);
  };

  const toggleItem = (id: number) => {
    setOpenItems((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const handleLanguageChange = async (language: string) => {
    setSelectedLanguage(language);
    localStorage.setItem("preferredLanguage", language);
    toast({
      title: "Language Updated",
      description: `Your language preference has been saved.`,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">FAQ & Terms</h1>
        <div className="flex items-end gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="language" className="mb-2 block">
              Select Language
            </Label>
            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((language) => (
                  <SelectItem key={language.code} value={language.code}>
                    {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {faqs.map((faq) => (
            <Collapsible
              key={faq.id}
              open={openItems.includes(faq.id)}
              onOpenChange={() => toggleItem(faq.id)}
              className="border rounded-lg p-4"
            >
              <CollapsibleTrigger className="flex w-full justify-between items-center text-left">
                <span className="font-medium">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    openItems.includes(faq.id) ? "transform rotate-180" : ""
                  }`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <p className="text-muted-foreground">{faq.answer}</p>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Language;