
import { useUser } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface TaxDeduction {
  id: string;
  amount: number;
  description: string;
  deduction_date: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-green-500';
    case 'rejected':
      return 'bg-red-500';
    default:
      return 'bg-yellow-500';
  }
};

const TaxDeductionsList = () => {
  const user = useUser();

  const { data: deductions, isLoading } = useQuery({
    queryKey: ['taxDeductions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_deductions')
        .select('*')
        .order('deduction_date', { ascending: false });
      
      if (error) throw error;
      return data as TaxDeduction[];
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return <div>Loading deductions...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Deductions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deductions?.map((deduction) => (
              <TableRow key={deduction.id}>
                <TableCell>{new Date(deduction.deduction_date).toLocaleDateString()}</TableCell>
                <TableCell>{deduction.category}</TableCell>
                <TableCell>{deduction.description}</TableCell>
                <TableCell className="text-right">${deduction.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getStatusColor(deduction.status)}>
                    {deduction.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {(!deductions || deductions.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">No tax deductions found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TaxDeductionsList;
