import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { getClientById, getClientNotes, createClientNote } from '@/lib/api/clients';
import { PhotoCapture } from '@/components/admin/PhotoCapture';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getBarbers } from '@/lib/api/barbers';
import { supabase } from '@/integrations/supabase/client';

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [noteText, setNoteText] = useState('');

  const { data: client, isLoading: clientLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: () => getClientById(id!),
    enabled: !!id,
  });

  const { data: notes, isLoading: notesLoading } = useQuery({
    queryKey: ['client-notes', id],
    queryFn: () => getClientNotes(id!),
    enabled: !!id,
  });

  const { data: barbers } = useQuery({
    queryKey: ['barbers'],
    queryFn: getBarbers,
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['client-appointments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services(name),
          barbers(full_name)
        `)
        .eq('client_id', id)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  const createNoteMutation = useMutation({
    mutationFn: (photoUrl?: string) => {
      const barber = barbers?.find(b => b.user_id === user?.id);
      return createClientNote(id!, barber?.id || null, noteText, photoUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-notes', id] });
      setNoteText('');
      toast({
        title: 'Success',
        description: 'Note added successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add note',
        variant: 'destructive',
      });
    },
  });

  const handlePhotoUploaded = (url: string) => {
    createNoteMutation.mutate(url);
  };

  const handleSaveNote = () => {
    if (!noteText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a note',
        variant: 'destructive',
      });
      return;
    }
    createNoteMutation.mutate(undefined);
  };

  if (clientLoading || notesLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!client) {
    return <div className="p-6">Client not found</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/clients')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clients
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{client.full_name}</CardTitle>
            <CardDescription>
              <div className="space-y-1">
                {client.phone && <div>Phone: {client.phone}</div>}
                {client.email && <div>Email: {client.email}</div>}
                <div>Client since {new Date(client.created_at).toLocaleDateString()}</div>
              </div>
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Note</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add notes about the client..."
                  rows={4}
                />
                <Button onClick={handleSaveNote} disabled={createNoteMutation.isPending}>
                  {createNoteMutation.isPending ? 'Saving...' : 'Save Note'}
                </Button>
              </CardContent>
            </Card>

            <PhotoCapture clientId={id!} onPhotoUploaded={handlePhotoUploaded} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>History & Notes</CardTitle>
              <CardDescription>
                {(notes?.length || 0) + (appointments?.length || 0)} total entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Combine notes and appointments, sort by date */}
                {[
                  ...(notes?.map(note => ({ type: 'note' as const, data: note, date: note.created_at })) || []),
                  ...(appointments?.map(apt => ({ type: 'appointment' as const, data: apt, date: apt.created_at })) || [])
                ]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((item, index) => {
                    if (item.type === 'note') {
                      const note = item.data;
                      return (
                        <div key={`note-${note.id}`} className="border rounded-lg p-4 space-y-2">
                          {note.photo_url && (
                            <img
                              src={note.photo_url}
                              alt="Client photo"
                              className="w-full h-48 object-cover rounded-md"
                            />
                          )}
                          {note.note && (
                            <p className="text-sm">{note.note}</p>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {new Date(note.created_at).toLocaleString()}
                            {note.barber_id && (
                              <span className="ml-2">
                                by {barbers?.find(b => b.id === note.barber_id)?.full_name}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    } else {
                      const apt = item.data;
                      const statusColors = {
                        pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
                        confirmed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                        scheduled: 'bg-green-500/10 text-green-500 border-green-500/20',
                        completed: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
                        cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
                        no_show: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
                      };
                      
                      return (
                        <div key={`apt-${apt.id}`} className="border rounded-lg p-4 space-y-2 bg-muted/50">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                Appointment: {(apt.services as any)?.name || 'Service'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(apt.appointment_date).toLocaleDateString()} at{' '}
                                {apt.appointment_time}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Barber: {(apt.barbers as any)?.full_name || 'Not assigned'}
                              </p>
                            </div>
                            <Badge className={statusColors[apt.status as keyof typeof statusColors] || ''}>
                              {apt.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Booked {new Date(apt.created_at).toLocaleString()}
                          </div>
                        </div>
                      );
                    }
                  })}

                {(!notes || notes.length === 0) && (!appointments || appointments.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">
                    No history yet. Add a note or photo above.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;
