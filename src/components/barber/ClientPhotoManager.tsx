import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Camera, Image } from 'lucide-react';
import { PhotoCapture } from '@/components/admin/PhotoCapture';
import { createClientNote } from '@/lib/api/clients';
import { toast } from 'sonner';

interface ClientPhotoManagerProps {
  clientId: string;
  barberId: string | null;
  appointmentId?: string;
}

export const ClientPhotoManager = ({ clientId, barberId, appointmentId }: ClientPhotoManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState('');
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const createNoteMutation = useMutation({
    mutationFn: async () => {
      if (!uploadedPhotoUrl) {
        throw new Error('Please capture or upload a photo first');
      }
      return createClientNote(clientId, barberId, note || 'Client photo', uploadedPhotoUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-notes', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-pictures', appointmentId] });
      toast.success('Photo saved successfully');
      setIsOpen(false);
      setNote('');
      setUploadedPhotoUrl(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save photo');
    },
  });

  const handlePhotoUploaded = (url: string) => {
    setUploadedPhotoUrl(url);
  };

  const handleSave = () => {
    createNoteMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Camera className="mr-2 h-4 w-4" />
          Add Client Photo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Capture Client Photo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <PhotoCapture
            clientId={clientId}
            onPhotoUploaded={handlePhotoUploaded}
          />

          {uploadedPhotoUrl && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Image className="h-4 w-4" />
                Photo captured successfully
              </div>
              <img
                src={uploadedPhotoUrl}
                alt="Captured"
                className="w-full max-w-md rounded-lg border"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="note">Add Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="e.g., Fade on sides, longer on top..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!uploadedPhotoUrl || createNoteMutation.isPending}
            >
              {createNoteMutation.isPending ? 'Saving...' : 'Save Photo'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
