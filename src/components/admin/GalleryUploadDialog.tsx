import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createGalleryImage, uploadGalleryImage } from "@/lib/api/gallery";
import { Loader2, Upload, X, Check } from "lucide-react";

interface GalleryUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ImageToUpload {
  file: File;
  preview: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export function GalleryUploadDialog({ open, onOpenChange, onSuccess }: GalleryUploadDialogProps) {
  const { toast } = useToast();
  const [images, setImages] = useState<ImageToUpload[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const newImages: ImageToUpload[] = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      title: '',
      description: '',
      category: 'Haircuts',
      status: 'pending' as const,
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const updateImage = (index: number, updates: Partial<ImageToUpload>) => {
    setImages(prev => prev.map((img, i) => i === index ? { ...img, ...updates } : img));
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const uploadAll = async () => {
    setIsUploading(true);

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      if (image.status === 'success') continue;

      updateImage(i, { status: 'uploading' });

      try {
        const imageUrl = await uploadGalleryImage(image.file);
        
        await createGalleryImage({
          image_url: imageUrl,
          category: image.category,
          title: image.title || null,
          description: image.description || null,
        });

        updateImage(i, { status: 'success' });
      } catch (error: any) {
        updateImage(i, { 
          status: 'error',
          error: error.message || 'Upload failed'
        });
      }
    }

    setIsUploading(false);

    const successCount = images.filter(img => img.status === 'success').length;
    const errorCount = images.filter(img => img.status === 'error').length;

    if (errorCount === 0) {
      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${successCount} image(s).`,
      });
      setImages([]);
      onSuccess();
      onOpenChange(false);
    } else {
      toast({
        title: "Upload Completed with Errors",
        description: `${successCount} succeeded, ${errorCount} failed.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Gallery Images</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {images.length === 0 ? (
            <div>
              <label htmlFor="images" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-12 h-12 mb-4 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (MAX. 5MB per file)</p>
                  <p className="text-xs text-muted-foreground mt-1">Select multiple files to upload at once</p>
                </div>
                <input
                  id="images"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleFilesChange}
                />
              </label>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="relative">
                      <img 
                        src={image.preview} 
                        alt="Preview" 
                        className="w-full h-40 object-cover rounded"
                      />
                      {image.status === 'success' && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white p-1 rounded-full">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                      {image.status !== 'uploading' && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Category *</Label>
                        <Select 
                          value={image.category}
                          onValueChange={(value) => updateImage(index, { category: value })}
                          disabled={image.status === 'uploading' || image.status === 'success'}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Haircuts">Haircuts</SelectItem>
                            <SelectItem value="Shaves">Shaves</SelectItem>
                            <SelectItem value="Beard Work">Beard Work</SelectItem>
                            <SelectItem value="Transformations">Transformations</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs">Title (optional)</Label>
                        <Input
                          value={image.title}
                          onChange={(e) => updateImage(index, { title: e.target.value })}
                          placeholder="Image title"
                          className="h-8"
                          disabled={image.status === 'uploading' || image.status === 'success'}
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Description (optional)</Label>
                        <Textarea
                          value={image.description}
                          onChange={(e) => updateImage(index, { description: e.target.value })}
                          placeholder="Brief description"
                          rows={2}
                          className="text-sm"
                          disabled={image.status === 'uploading' || image.status === 'success'}
                        />
                      </div>

                      {image.status === 'error' && (
                        <p className="text-xs text-destructive">{image.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <label htmlFor="images-more" className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      Add More Images
                    </span>
                  </Button>
                  <input
                    id="images-more"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleFilesChange}
                  />
                </label>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button 
            onClick={uploadAll} 
            disabled={images.length === 0 || isUploading}
          >
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload {images.length > 0 && `(${images.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
