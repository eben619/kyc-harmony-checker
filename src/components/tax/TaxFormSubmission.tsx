
import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationsContext";

interface TaxFormSubmissionProps {
  formId: number;
  onCancel: () => void;
}

const TaxFormSubmission = ({ formId, onCancel }: TaxFormSubmissionProps) => {
  const user = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useNotifications();

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('user_tax_forms')
        .insert({
          user_id: user.id,
          form_id: formId,
          form_data: {}, // This would be replaced with actual form data
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Tax form submitted successfully",
        description: "We'll review your submission and get back to you.",
      });

      // Add notification for tax form submission
      addNotification({
        title: "Tax Form Submitted",
        message: "Your tax form has been submitted successfully and is under review.",
        type: "success",
        category: "tax",
        action_url: "/tax"
      });

      queryClient.invalidateQueries({ queryKey: ['userTaxForms'] });
      onCancel();
    } catch (error) {
      console.error('Error submitting tax form:', error);
      toast({
        title: "Error submitting tax form",
        description: "Please try again later.",
        variant: "destructive",
      });

      // Add notification for failed submission
      addNotification({
        title: "Tax Form Submission Failed",
        message: "There was an error submitting your tax form. Please try again.",
        type: "error",
        category: "tax",
        action_url: "/tax"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Please review the form details before submitting. Make sure all information is accurate.
        </p>
        
        {/* Form fields would go here */}
        <div className="p-4 border rounded bg-muted/50">
          <p className="text-sm">Form implementation coming soon...</p>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Submit Form
        </Button>
      </div>
    </div>
  );
};

export default TaxFormSubmission;
