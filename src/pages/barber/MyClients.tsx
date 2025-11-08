import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBarberClients, getClientNotes, getClientHistoryForBarber, BarberClient } from '@/lib/api/clients';
import { getBarberProfile } from '@/lib/api/barber';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, User, Calendar, Image as ImageIcon, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ClientPhotoManager } from '@/components/barber/ClientPhotoManager';
import Logo from '@/components/Logo';
import { Link } from 'react-router-dom';

const MyClients = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<BarberClient | null>(null);

  // Get barber profile
  const { data: barberProfile } = useQuery({
    queryKey: ['barber-profile', user?.id],
    queryFn: () => getBarberProfile(user!.id),
    enabled: !!user,
  });

  // Get barber's clients
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['barber-clients', barberProfile?.id],
    queryFn: () => getBarberClients(barberProfile!.id),
    enabled: !!barberProfile?.id,
  });

  // Get selected client's notes
  const { data: clientNotes = [] } = useQuery({
    queryKey: ['client-notes', selectedClient?.id],
    queryFn: () => getClientNotes(selectedClient!.id),
    enabled: !!selectedClient,
  });

  // Get selected client's appointment history with this barber
  const { data: clientHistory = [] } = useQuery({
    queryKey: ['client-history', selectedClient?.id, barberProfile?.id],
    queryFn: () => getClientHistoryForBarber(selectedClient!.id, barberProfile!.id),
    enabled: !!selectedClient && !!barberProfile,
  });

  // Filter clients by search query
  const filteredClients = clients.filter(client =>
    client.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo variant="dark" />
              <div>
                <h1 className="text-xl font-bold">My Clients</h1>
                <p className="text-sm text-muted-foreground">
                  {barberProfile?.full_name}
                </p>
              </div>
            </div>
            <Link to="/barber">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Client List</span>
              <Badge variant="secondary">{clients.length} clients</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Client List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'No clients found matching your search' : 'No clients yet'}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedClient(client)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{client.full_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {client.appointment_count} appointment{client.appointment_count !== 1 ? 's' : ''}
                          {' • '}
                          Last visit: {format(new Date(client.last_appointment_date), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Client Details Dialog */}
      <Dialog open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedClient?.full_name}</span>
              {selectedClient && barberProfile && (
                <ClientPhotoManager
                  clientId={selectedClient.id}
                  barberId={barberProfile.id}
                />
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedClient && (
            <div className="space-y-6">
              {/* Client Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Client Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">First visit:</span>
                    <span>{format(new Date(selectedClient.first_seen), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Total appointments:</span>
                    <span>{selectedClient.appointment_count}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Appointment History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Appointment History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {clientHistory.map((apt: any) => (
                      <div key={apt.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{apt.services.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(apt.appointment_date), 'MMM d, yyyy')} at{' '}
                            {format(new Date(`2000-01-01T${apt.appointment_time}`), 'h:mm a')}
                          </div>
                        </div>
                        <Badge variant={apt.status === 'completed' ? 'default' : 'secondary'}>
                          {apt.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Photos and Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Photos & Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {clientNotes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No photos or notes yet
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {clientNotes.map((note) => (
                        <div key={note.id} className="space-y-2">
                          {note.photo_url && (
                            <img
                              src={note.photo_url}
                              alt="Client reference"
                              className="w-full aspect-square object-cover rounded-lg border"
                            />
                          )}
                          {note.note && (
                            <div className="p-3 bg-muted rounded-lg">
                              <div className="flex items-start gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                <p className="text-sm">{note.note}</p>
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyClients;
