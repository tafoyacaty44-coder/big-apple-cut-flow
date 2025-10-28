import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Gift, Trophy, Receipt, Award } from 'lucide-react';
import { RewardActionsTable } from '@/components/admin/RewardActionsTable';
import { RewardTiersTable } from '@/components/admin/RewardTiersTable';
import { RewardTransactionsTable } from '@/components/admin/RewardTransactionsTable';

const RewardsManagement = () => {
  const [activeTab, setActiveTab] = useState('actions');

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Gift className="w-8 h-8 text-accent" />
            Rewards Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage reward actions, tiers, and view customer transactions
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Reward Actions
            </TabsTrigger>
            <TabsTrigger value="tiers" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Reward Tiers
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="actions">
            <Card className="p-6">
              <RewardActionsTable />
            </Card>
          </TabsContent>

          <TabsContent value="tiers">
            <Card className="p-6">
              <RewardTiersTable />
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="p-6">
              <RewardTransactionsTable />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RewardsManagement;
