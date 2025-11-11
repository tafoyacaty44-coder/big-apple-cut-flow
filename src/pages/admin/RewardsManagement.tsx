import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Trophy, Receipt, Award, ArrowLeft, LogOut } from 'lucide-react';
import { RewardActionsTable } from '@/components/admin/RewardActionsTable';
import { RewardTiersTable } from '@/components/admin/RewardTiersTable';
import { RewardTransactionsTable } from '@/components/admin/RewardTransactionsTable';
import Logo from '@/components/Logo';

const RewardsManagement = () => {
  const [activeTab, setActiveTab] = useState('actions');

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => window.location.href = '/admin'}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Logo variant="dark" />
              <div>
                <h1 className="text-xl font-bold flex items-center gap-3">
                  <Gift className="w-6 h-6 text-accent" />
                  Rewards Management
                </h1>
                <p className="text-sm text-muted-foreground">Manage reward actions, tiers, and view customer transactions</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => window.location.href = '/admin'}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">

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
      </main>
    </div>
  );
};

export default RewardsManagement;
