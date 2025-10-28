import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadClientPhoto } from '@/lib/api/clients';

interface PhotoCaptureProps {
  clientId: string;
  onPhotoUploaded: (url: string) => void;
}

export const PhotoCapture = ({ clientId, onPhotoUploaded }: PhotoCaptureProps) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: ({ file, clientId }: { file: File; clientId: string }) => 
      uploadClientPhoto(file, clientId),
    onSuccess: (url) => {
      onPhotoUploaded(url);
      toast({
        title: 'Success',
        description: 'Photo uploaded successfully',
      });
      stopCamera();
      setCapturedImage(null);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to upload photo',
        variant: 'destructive',
      });
    },
  });

  const startCamera = async (useFrontCamera: boolean = false) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: useFrontCamera ? 'user' : 'environment'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not access camera',
        variant: 'destructive',
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        const imageData = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  const uploadCapturedPhoto = async () => {
    if (!capturedImage) return;

    // Convert data URL to File
    const response = await fetch(capturedImage);
    const blob = await response.blob();
    const file = new File([blob], `client-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });

    uploadMutation.mutate({ file, clientId });
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {!isStreaming && !capturedImage && (
          <div className="flex gap-2">
            <Button onClick={() => startCamera(false)} variant="outline">
              <Camera className="mr-2 h-4 w-4" />
              Take Photo
            </Button>
            <Button onClick={() => startCamera(true)} variant="outline">
              <Camera className="mr-2 h-4 w-4" />
              Front Camera
            </Button>
          </div>
        )}

        {isStreaming && (
          <div className="space-y-2">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg border"
            />
            <div className="flex gap-2">
              <Button onClick={capturePhoto}>Capture</Button>
              <Button onClick={stopCamera} variant="outline">Cancel</Button>
            </div>
          </div>
        )}

        {capturedImage && (
          <div className="space-y-2">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full rounded-lg border"
            />
            <div className="flex gap-2">
              <Button onClick={uploadCapturedPhoto} disabled={uploadMutation.isPending}>
                {uploadMutation.isPending ? 'Uploading...' : 'Upload Photo'}
              </Button>
              <Button onClick={() => setCapturedImage(null)} variant="outline">Retake</Button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
};
