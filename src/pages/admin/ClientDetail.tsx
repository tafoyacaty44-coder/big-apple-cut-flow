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
              <CardDescription>{notes?.length || 0} notes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notes?.map(note => (
                  <div key={note.id} className="border rounded-lg p-4 space-y-2">
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
                ))}

                {(!notes || notes.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">
                    No notes yet. Add a note or photo above.
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
