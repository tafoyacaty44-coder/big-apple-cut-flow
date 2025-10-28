import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBlogPost, incrementViews } from "@/lib/api/blog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Clock, Eye } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ShareButtons from "@/components/blog/ShareButtons";
import RelatedPosts from "@/components/blog/RelatedPosts";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      
      setLoading(true);
      try {
        const data = await getBlogPost(slug);
        setPost(data);
        if (data?.id) {
          incrementViews(data.id);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="text-center">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
            <Link to="/blog">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        <article className="container mx-auto px-4 py-12 max-w-4xl">
          <Link to="/blog" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline">{post.category}</Badge>
                {post.is_featured && (
                  <Badge className="bg-gradient-primary">Featured</Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-6 border-b">
              {post.published_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(post.published_at), "MMMM d, yyyy")}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.reading_time_minutes} min read
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.views_count} views
              </div>
              {post.profiles?.full_name && (
                <div>By {post.profiles.full_name}</div>
              )}
            </div>

            {post.featured_image_url && (
              <div className="aspect-video overflow-hidden rounded-lg">
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div 
              className="prose prose-lg max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-6 border-t">
                {post.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t">
              <ShareButtons 
                title={post.title} 
                url={window.location.href}
              />
            </div>
          </div>

          <RelatedPosts postId={post.id} category={post.category} />
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
