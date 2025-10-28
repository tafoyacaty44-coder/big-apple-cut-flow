import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import RichTextEditor from "./RichTextEditor";
import { createBlogPost, updateBlogPost, uploadBlogImage, saveDraft } from "@/lib/api/blog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Upload } from "lucide-react";

const CATEGORIES = [
  "Grooming Tips",
  "Style Trends",
  "News & Updates",
  "Promotions",
  "Product Reviews",
  "How-To Guides"
];

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  featured_image_url: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  tags: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().max(160, "Meta description must be less than 160 characters").optional(),
  is_published: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  is_pinned: z.boolean().default(false),
  scheduled_publish_at: z.string().optional(),
  series_name: z.string().optional(),
  series_order: z.coerce.number().optional(),
});

interface BlogPostFormProps {
  post?: any;
  onSuccess?: () => void;
}

const BlogPostForm = ({ post, onSuccess }: BlogPostFormProps) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [featuredImagePreview, setFeaturedImagePreview] = useState(post?.featured_image_url || "");
  const autoSaveTimerRef = useRef<NodeJS.Timeout>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post?.title || "",
      slug: post?.slug || "",
      content: post?.content || "",
      excerpt: post?.excerpt || "",
      featured_image_url: post?.featured_image_url || "",
      category: post?.category || "",
      tags: post?.tags?.join(", ") || "",
      meta_title: post?.meta_title || "",
      meta_description: post?.meta_description || "",
      is_published: post?.is_published || false,
      is_featured: post?.is_featured || false,
      is_pinned: post?.is_pinned || false,
      scheduled_publish_at: post?.scheduled_publish_at || "",
      series_name: post?.series_name || "",
      series_order: post?.series_order || undefined,
    },
  });

  // Auto-save draft
  useEffect(() => {
    if (!post?.id) return;

    const subscription = form.watch(() => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      
      autoSaveTimerRef.current = setTimeout(async () => {
        const values = form.getValues();
        try {
          await saveDraft(post.id, {
            title: values.title,
            content: values.content,
            excerpt: values.excerpt,
            category: values.category,
            tags: values.tags ? values.tags.split(',').map(t => t.trim()) : [],
          });
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }, 30000); // Auto-save every 30 seconds
    });

    return () => {
      subscription.unsubscribe();
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [form, post?.id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.loading("Uploading image...");
      const url = await uploadBlogImage(file);
      form.setValue("featured_image_url", url);
      setFeaturedImagePreview(url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const postData = {
        title: values.title,
        slug: values.slug || undefined,
        content: values.content,
        excerpt: values.excerpt || undefined,
        featured_image_url: values.featured_image_url || undefined,
        category: values.category,
        tags: values.tags ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        meta_title: values.meta_title || undefined,
        meta_description: values.meta_description || undefined,
        is_published: values.is_published,
        is_featured: values.is_featured,
        is_pinned: values.is_pinned,
        scheduled_publish_at: values.scheduled_publish_at || undefined,
        series_name: values.series_name || undefined,
        series_order: values.series_order || undefined,
      };

      if (post?.id) {
        await updateBlogPost(post.id, postData);
        toast.success("Blog post updated successfully");
      } else {
        await createBlogPost(postData);
        toast.success("Blog post created successfully");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/admin/blog");
      }
    } catch (error: any) {
      console.error("Error saving blog post:", error);
      toast.error(error.message || "Failed to save blog post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter post title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug (URL)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Auto-generated from title" />
              </FormControl>
              <FormDescription>Leave empty to auto-generate</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Featured Image</FormLabel>
          <div className="mt-2 space-y-4">
            {featuredImagePreview && (
              <img src={featuredImagePreview} alt="Preview" className="w-full max-w-md rounded-lg" />
            )}
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="featured-image"
              />
              <Button type="button" variant="outline" onClick={() => document.getElementById('featured-image')?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Brief summary for post cards" rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <RichTextEditor
                  content={field.value}
                  onChange={field.onChange}
                  placeholder="Write your blog post content..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input {...field} placeholder="haircut, styling, grooming (comma-separated)" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="series_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Series Name (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., Summer Style Guide" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="series_order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Series Order</FormLabel>
                <FormControl>
                  <Input type="number" {...field} placeholder="1, 2, 3..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
          
          <FormField
            control={form.control}
            name="meta_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meta Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="SEO title (defaults to post title)" maxLength={60} />
                </FormControl>
                <FormDescription>Max 60 characters</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="meta_description"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Meta Description</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="SEO description" rows={2} maxLength={160} />
                </FormControl>
                <FormDescription>Max 160 characters</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Publishing Options</h3>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="is_published"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel>Publish Post</FormLabel>
                    <FormDescription>Make this post visible to the public</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduled_publish_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule Publish Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormDescription>Leave empty to publish immediately</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_featured"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel>Featured Post</FormLabel>
                    <FormDescription>Highlight this post on the homepage</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_pinned"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel>Pin to Top</FormLabel>
                    <FormDescription>Keep this post at the top of the list</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : post ? "Update Post" : "Create Post"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/admin/blog")}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BlogPostForm;
