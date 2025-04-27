
import { useEffect, useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TaxReceipt {
  id: string;
  amount: number;
  description: string;
  receipt_date: string;
  category: string;
  receipt_number: string;
}

const TaxReceiptsList = () => {
  const user = useUser();

  const { data: receipts, isLoading } = useQuery({
    queryKey: ['taxReceipts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_receipts')
        .select('*')
        .order('receipt_date', { ascending: false });
      
      if (error) throw error;
      return data as TaxReceipt[];
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return <div>Loading receipts...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Receipts</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Receipt #</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts?.map((receipt) => (
              <TableRow key={receipt.id}>
                <TableCell>{new Date(receipt.receipt_date).toLocaleDateString()}</TableCell>
                <TableCell>{receipt.receipt_number}</TableCell>
                <TableCell>{receipt.category}</TableCell>
                <TableCell>{receipt.description}</TableCell>
                <TableCell className="text-right">${receipt.amount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
            {(!receipts || receipts.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">No tax receipts found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TaxReceiptsList;
