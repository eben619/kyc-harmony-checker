import { useEffect, useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TaxFormSelector from "@/components/tax/TaxFormSelector";
import TaxFormSubmission from "@/components/tax/TaxFormSubmission";
import { Skeleton } from "@/components/ui/skeleton";

const Tax = () => {
  const user = useUser();
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);

  const { data: taxForms, isLoading: isLoadingForms } = useQuery({
    queryKey: ['taxForms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_forms')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: userForms, isLoading: isLoadingUserForms } = useQuery({
    queryKey: ['userTaxForms', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('user_tax_forms')
        .select('*, tax_forms(*)')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoadingForms || isLoadingUserForms) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Tax Information</h1>
      
      <div className="grid gap-6">
        {/* Submitted Forms */}
        {userForms && userForms.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Submitted Tax Forms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userForms.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{submission.tax_forms.form_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="capitalize px-3 py-1 text-sm rounded-full bg-primary/10 text-primary">
                      {submission.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* New Form Submission */}
        <Card>
          <CardHeader>
            <CardTitle>Submit New Tax Form</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedFormId ? (
              <TaxFormSubmission
                formId={selectedFormId}
                onCancel={() => setSelectedFormId(null)}
              />
            ) : (
              <TaxFormSelector
                forms={taxForms || []}
                onSelect={setSelectedFormId}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Tax;