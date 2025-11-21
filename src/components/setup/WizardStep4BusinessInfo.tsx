import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Upload } from "lucide-react";
import { z } from "zod";
import { uploadBusinessLogo, uploadHeroImage } from "@/lib/api/setup";
import { useToast } from "@/hooks/use-toast";

const businessSchema = z.object({
  business_name: z.string().min(2, "Business name is required").max(100),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().max(500).optional(),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color"),
  accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color"),
  staff_title: z.string().min(1).max(50),
  service_title: z.string().min(1).max(50),
  timezone: z.string(),
  currency: z.string(),
});

interface BusinessData {
  business_name: string;
  phone?: string;
  email?: string;
  address?: string;
  primary_color: string;
  accent_color: string;
  logo_url?: string;
  hero_image_url?: string;
  staff_title: string;
  service_title: string;
  timezone: string;
  currency: string;
}

interface WizardStep4BusinessInfoProps {
  onNext: (data: BusinessData) => void;
  onBack: () => void;
  initialData?: Partial<BusinessData>;
  selectedTemplate: any;
}

export const WizardStep4BusinessInfo = ({ 
  onNext, 
  onBack, 
  initialData,
  selectedTemplate 
}: WizardStep4BusinessInfoProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  
  const templateColors = selectedTemplate?.config_json?.colors || {};
  const [formData, setFormData] = useState<BusinessData>({
    business_name: initialData?.business_name || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    address: initialData?.address || "",
    primary_color: initialData?.primary_color || templateColors.primary || "#D4AF37",
    accent_color: initialData?.accent_color || templateColors.accent || "#1A1A1A",
    logo_url: initialData?.logo_url || "",
    hero_image_url: initialData?.hero_image_url || "",
    staff_title: initialData?.staff_title || selectedTemplate?.config_json?.staff_title || "Barber",
    service_title: initialData?.service_title || selectedTemplate?.config_json?.service_title || "Service",
    timezone: initialData?.timezone || "America/Chicago",
    currency: initialData?.currency || "USD",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadBusinessLogo(file);
      setFormData(prev => ({ ...prev, logo_url: url }));
      toast({ title: "Logo uploaded successfully" });
    } catch (error) {
      toast({ 
        title: "Upload failed", 
        description: "Failed to upload logo",
        variant: "destructive" 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadHeroImage(file);
      setFormData(prev => ({ ...prev, hero_image_url: url }));
      toast({ title: "Hero image uploaded successfully" });
    } catch (error) {
      toast({ 
        title: "Upload failed", 
        description: "Failed to upload hero image",
        variant: "destructive" 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = businessSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        if (error.path[0]) {
          newErrors[error.path[0] as string] = error.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onNext(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
          <Building2 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Business Information</h2>
        <p className="text-muted-foreground">
          Tell us about your business. You can update this anytime.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="business_name">Business Name *</Label>
            <Input
              id="business_name"
              value={formData.business_name}
              onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
              placeholder="Big Apple Barbershop"
              className={errors.business_name ? "border-red-500" : ""}
            />
            {errors.business_name && (
              <p className="text-sm text-red-500 mt-1">{errors.business_name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="info@business.com"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="address">Physical Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="123 Main St, New York, NY 10001"
              rows={2}
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold">Branding</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primary_color">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                  className="w-16 h-10 p-1"
                />
                <Input
                  type="text"
                  value={formData.primary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                  placeholder="#D4AF37"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="accent_color">Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  id="accent_color"
                  type="color"
                  value={formData.accent_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, accent_color: e.target.value }))}
                  className="w-16 h-10 p-1"
                />
                <Input
                  type="text"
                  value={formData.accent_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, accent_color: e.target.value }))}
                  placeholder="#1A1A1A"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="logo">Logo (Optional)</Label>
              <div className="mt-2">
                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <input
                    type="file"
                    id="logo"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  {formData.logo_url ? (
                    <img src={formData.logo_url} alt="Logo" className="max-h-28 object-contain" />
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Upload Logo</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
            <div>
              <Label htmlFor="hero">Hero Image (Optional)</Label>
              <div className="mt-2">
                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <input
                    type="file"
                    id="hero"
                    accept="image/*"
                    onChange={handleHeroUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  {formData.hero_image_url ? (
                    <img src={formData.hero_image_url} alt="Hero" className="max-h-28 object-contain" />
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Upload Hero</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold">Terminology</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="staff_title">Staff Title</Label>
              <Input
                id="staff_title"
                value={formData.staff_title}
                onChange={(e) => setFormData(prev => ({ ...prev, staff_title: e.target.value }))}
                placeholder="Barber, Stylist, Therapist..."
              />
            </div>
            <div>
              <Label htmlFor="service_title">Service Title</Label>
              <Input
                id="service_title"
                value={formData.service_title}
                onChange={(e) => setFormData(prev => ({ ...prev, service_title: e.target.value }))}
                placeholder="Service, Treatment, Procedure..."
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button type="submit" className="flex-1" disabled={uploading}>
            {uploading ? "Uploading..." : "Continue"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
