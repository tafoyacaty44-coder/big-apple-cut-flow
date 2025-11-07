import { useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadClientPhoto } from '@/lib/api/clients';
import { Input } from '@/components/ui/input';

interface PhotoCaptureProps {
  clientId: string;
  onPhotoUploaded: (url: string) => void;
}

export const PhotoCapture = ({ clientId, onPhotoUploaded }: PhotoCaptureProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: ({ file, clientId }: { file: File; clientId: string }) => 
      uploadClientPhoto(file, clientId),
    onSuccess: (url) => {
      onPhotoUploaded(url);
      toast({
        title: 'Success',
        description: 'Photo uploaded successfully',
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to upload photo',
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    uploadMutation.mutate({ file, clientId });
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          disabled={uploadMutation.isPending}
          className="hidden"
          id="photo-capture-input"
        />
        
        <div className="flex gap-2">
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            variant="outline" 
            className="flex-1"
            disabled={uploadMutation.isPending}
          >
            <Camera className="mr-2 h-4 w-4" />
            {uploadMutation.isPending ? 'Uploading...' : 'Take Photo'}
          </Button>
          
          <Button 
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.removeAttribute('capture');
                fileInputRef.current.click();
                setTimeout(() => fileInputRef.current?.setAttribute('capture', 'environment'), 100);
              }
            }} 
            variant="outline" 
            className="flex-1"
            disabled={uploadMutation.isPending}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Photo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
