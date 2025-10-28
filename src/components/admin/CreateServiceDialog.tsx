import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createService, uploadServiceImage, CreateServiceData } from "@/lib/api/services";
import { Loader2, Upload, X } from "lucide-react";

const serviceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  regular_price: z.number().min(0, "Price must be positive"),
  vip_price: z.number().min(0, "Price must be positive"),
  duration_minutes: z.number().min(5, "Duration must be at least 5 minutes"),
  category: z.string().min(1, "Category is required"),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface CreateServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateServiceDialog({ open, onOpenChange, onSuccess }: CreateServiceDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      regular_price: 0,
      vip_price: 0,
      duration_minutes: 30,
    }
  });

  const category = watch("category");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const onSubmit = async (data: ServiceFormData) => {
    setIsLoading(true);
    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        imageUrl = await uploadServiceImage(imageFile);
      }

      const serviceData: CreateServiceData = {
        name: data.name,
        description: data.description || null,
        regular_price: data.regular_price,
        vip_price: data.vip_price,
        duration_minutes: data.duration_minutes,
        category: data.category,
        image_url: imageUrl,
      };

      await createService(serviceData);

      toast({
        title: "Service Created",
        description: "The service has been created successfully.",
      });

      reset();
      removeImage();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create service",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Service</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Service Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., Classic Haircut"
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Brief description of the service..."
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select onValueChange={(value) => setValue("category", value)} value={category}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="haircut">Haircut</SelectItem>
                  <SelectItem value="beard">Beard</SelectItem>
                  <SelectItem value="shave">Shave</SelectItem>
                  <SelectItem value="combo">Combo</SelectItem>
                  <SelectItem value="special">Special</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="duration_minutes">Duration (minutes) *</Label>
              <Input
                id="duration_minutes"
                type="number"
                {...register("duration_minutes", { valueAsNumber: true })}
              />
              {errors.duration_minutes && (
                <p className="text-sm text-destructive mt-1">{errors.duration_minutes.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="regular_price">Regular Price ($) *</Label>
              <Input
                id="regular_price"
                type="number"
                step="0.01"
                {...register("regular_price", { valueAsNumber: true })}
              />
              {errors.regular_price && (
                <p className="text-sm text-destructive mt-1">{errors.regular_price.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="vip_price">VIP Price ($) *</Label>
              <Input
                id="vip_price"
                type="number"
                step="0.01"
                {...register("vip_price", { valueAsNumber: true })}
              />
              {errors.vip_price && (
                <p className="text-sm text-destructive mt-1">{errors.vip_price.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label>Service Image</Label>
            {imagePreview ? (
              <div className="relative mt-2">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="mt-2">
                <label htmlFor="image" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (MAX. 5MB)</p>
                  </div>
                  <input
                    id="image"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Service
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
