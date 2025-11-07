import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Search } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";

const pages = [
  { slug: 'home', label: 'Home Page' },
  { slug: 'book', label: 'Book Appointment' },
  { slug: 'barbers', label: 'Barbers Page' },
  { slug: 'gallery', label: 'Gallery Page' },
  { slug: 'blog', label: 'Blog Page' },
  { slug: 'rewards', label: 'Rewards Page' },
];

export default function SeoManagement() {
  const [selectedPage, setSelectedPage] = useState('home');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: seoData, isLoading } = useQuery({
    queryKey: ['seo', selectedPage],
    queryFn: async () => {
      const { data } = await supabase
        .from('seo_settings')
        .select('*')
        .eq('page_slug', selectedPage)
        .maybeSingle();
      return data;
    },
  });

  const [formData, setFormData] = useState({
    meta_title: '',
    meta_description: '',
    keywords: '',
    og_title: '',
    og_description: '',
    og_image_url: '',
    canonical_url: '',
    robots: 'index, follow',
  });

  // Update form when data loads
  useState(() => {
    if (seoData) {
      setFormData({
        meta_title: seoData.meta_title || '',
        meta_description: seoData.meta_description || '',
        keywords: seoData.keywords?.join(', ') || '',
        og_title: seoData.og_title || '',
        og_description: seoData.og_description || '',
        og_image_url: seoData.og_image_url || '',
        canonical_url: seoData.canonical_url || '',
        robots: seoData.robots || 'index, follow',
      });
    }
  });

  const { mutate: saveSeo, isPending } = useMutation({
    mutationFn: async (values: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('seo_settings')
        .upsert({
          page_slug: selectedPage,
          meta_title: values.meta_title,
          meta_description: values.meta_description,
          keywords: values.keywords.split(',').map(k => k.trim()).filter(k => k),
          og_title: values.og_title || values.meta_title,
          og_description: values.og_description || values.meta_description,
          og_image_url: values.og_image_url,
          canonical_url: values.canonical_url,
          robots: values.robots,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "SEO Settings Saved",
        description: "Your changes will be visible on the website immediately.",
      });
      queryClient.invalidateQueries({ queryKey: ['seo', selectedPage] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSeo(formData);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            <Link to="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Search className="h-8 w-8" />
            SEO Management
          </h1>
          <p className="text-muted-foreground">
            Control how your pages appear in search engines and social media
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Page</CardTitle>
            <CardDescription>Choose which page you want to edit SEO settings for</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedPage} onValueChange={setSelectedPage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pages.map(page => (
                  <SelectItem key={page.slug} value={page.slug}>
                    {page.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Basic Meta Tags</CardTitle>
                <CardDescription>These appear in search engine results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Meta Title</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    placeholder="Big Apple Barbers - Best Barbershop in NYC"
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.meta_title.length}/60 characters (optimal: 50-60)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    placeholder="Premium barbershop in Manhattan's East Village..."
                    maxLength={160}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.meta_description.length}/160 characters (optimal: 150-160)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    placeholder="barber, haircut, NYC, grooming"
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated keywords for this page
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Open Graph (Social Sharing)</CardTitle>
                <CardDescription>How your page looks when shared on social media</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="og_title">OG Title</Label>
                  <Input
                    id="og_title"
                    value={formData.og_title}
                    onChange={(e) => setFormData({ ...formData, og_title: e.target.value })}
                    placeholder="Leave empty to use Meta Title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="og_description">OG Description</Label>
                  <Textarea
                    id="og_description"
                    value={formData.og_description}
                    onChange={(e) => setFormData({ ...formData, og_description: e.target.value })}
                    placeholder="Leave empty to use Meta Description"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="og_image_url">OG Image URL</Label>
                  <Input
                    id="og_image_url"
                    value={formData.og_image_url}
                    onChange={(e) => setFormData({ ...formData, og_image_url: e.target.value })}
                    placeholder="https://..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended size: 1200x630px
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="canonical_url">Canonical URL</Label>
                  <Input
                    id="canonical_url"
                    value={formData.canonical_url}
                    onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                    placeholder="https://bigapplebarbers.com/"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty if not needed (prevents duplicate content issues)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="robots">Robots</Label>
                  <Select
                    value={formData.robots}
                    onValueChange={(value) => setFormData({ ...formData, robots: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="index, follow">Index, Follow (Default)</SelectItem>
                      <SelectItem value="noindex, follow">No Index, Follow</SelectItem>
                      <SelectItem value="index, nofollow">Index, No Follow</SelectItem>
                      <SelectItem value="noindex, nofollow">No Index, No Follow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Google Search Preview</CardTitle>
                <CardDescription>How your page might appear in search results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border border-border rounded-lg p-4 bg-muted/30">
                  <div className="text-sm text-primary truncate mb-1">
                    bigapplebarbers.com
                  </div>
                  <div className="text-lg text-primary font-medium mb-1 line-clamp-1">
                    {formData.meta_title || 'Your page title'}
                  </div>
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {formData.meta_description || 'Your page description will appear here...'}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Link to="/admin">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
