import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { getClients } from '@/lib/api/clients';
import { useNavigate } from 'react-router-dom';

const Clients = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  const filteredClients = clients?.filter(client => {
    const query = searchQuery.toLowerCase();
    return (
      client.full_name.toLowerCase().includes(query) ||
      client.phone?.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Client Database</h1>
          <p className="text-muted-foreground">
            View and manage client information
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid gap-4">
          {filteredClients?.map(client => (
            <Card
              key={client.id}
              className="cursor-pointer hover:border-accent transition-colors"
              onClick={() => navigate(`/admin/clients/${client.id}`)}
            >
              <CardHeader>
                <CardTitle>{client.full_name}</CardTitle>
                <CardDescription>
                  <div className="space-y-1">
                    {client.phone && <div>Phone: {client.phone}</div>}
                    {client.email && <div>Email: {client.email}</div>}
                    <div className="text-xs">
                      Client since {new Date(client.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>
          ))}

          {filteredClients?.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No clients found matching your search.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Clients;
