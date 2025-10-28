import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Search } from 'lucide-react';

interface Transaction {
  id: string;
  customer_id: string;
  action_type: string;
  points_earned: number;
  points_redeemed: number;
  description: string | null;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
}

export const RewardTransactionsTable = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['reward-transactions-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rewards_activity')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      
      // Fetch customer names separately
      const customerIds = [...new Set(data.map(tx => tx.customer_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', customerIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return data.map(tx => ({
        ...tx,
        profiles: profileMap.get(tx.customer_id) || null
      })) as Transaction[];
    }
  });

  const filteredTransactions = transactions?.filter(tx => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      tx.profiles?.full_name.toLowerCase().includes(search) ||
      tx.description?.toLowerCase().includes(search) ||
      tx.action_type.toLowerCase().includes(search)
    );
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Recent Transactions</h3>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by customer or action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTransactions && filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="font-medium">
                  {tx.profiles?.full_name || 'Unknown Customer'}
                </TableCell>
                <TableCell className="text-sm">
                  {tx.description || tx.action_type}
                </TableCell>
                <TableCell>
                  <Badge variant={tx.action_type === 'earned' ? 'default' : 'secondary'}>
                    {tx.action_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={tx.points_earned > 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                    {tx.points_earned > 0 ? '+' : '-'}
                    {tx.points_earned || tx.points_redeemed} pts
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(tx.created_at), 'MMM d, yyyy • h:mm a')}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                {searchTerm ? 'No transactions match your search' : 'No transactions found'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};
