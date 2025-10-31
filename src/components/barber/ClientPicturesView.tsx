import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ImageIcon } from 'lucide-react';

interface ClientPicturesViewProps {
  appointmentId: string;
}

interface ClientNote {
  id: string;
  photo_url: string | null;
  note: string | null;
  created_at: string;
}

export const ClientPicturesView = ({ appointmentId }: ClientPicturesViewProps) => {
  // Fetch appointment details to get client_id
  const { data: appointment } = useQuery({
    queryKey: ['appointment-client', appointmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('client_id, appointment_date, appointment_time')
        .eq('id', appointmentId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch client pictures (notes with photos) - only if we have a client_id
  const { data: clientPictures, isLoading } = useQuery({
    queryKey: ['client-pictures', appointment?.client_id],
    queryFn: async () => {
      if (!appointment?.client_id) return [];
      
      const { data, error } = await supabase
        .from('client_notes')
        .select('id, photo_url, note, created_at')
        .eq('client_id', appointment.client_id)
        .not('photo_url', 'is', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ClientNote[];
    },
    enabled: !!appointment?.client_id,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!clientPictures || clientPictures.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Client Reference Photos
          </CardTitle>
          <CardDescription>Style reference and history photos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No photos available for this client
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Client Reference Photos
        </CardTitle>
        <CardDescription>
          {clientPictures.length} photo{clientPictures.length !== 1 ? 's' : ''} on file
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {clientPictures.map((pic) => (
            <div key={pic.id} className="space-y-2">
              <div className="aspect-square overflow-hidden rounded-lg border">
                <img
                  src={pic.photo_url!}
                  alt="Client style reference"
                  className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => window.open(pic.photo_url!, '_blank')}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(pic.created_at), 'MMM d, yyyy')}
              </div>
              {pic.note && (
                <div className="text-xs text-foreground line-clamp-2">
                  {pic.note}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};