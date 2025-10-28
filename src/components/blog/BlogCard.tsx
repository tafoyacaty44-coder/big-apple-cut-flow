import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Clock, Eye, Calendar } from "lucide-react";

interface BlogCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    featured_image_url?: string;
    category: string;
    published_at?: string;
    reading_time_minutes: number;
    views_count: number;
    is_featured?: boolean;
  };
}

const BlogCard = ({ post }: BlogCardProps) => {
  return (
    <Link to={`/blog/${post.slug}`}>
      <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group">
        {post.featured_image_url && (
          <div className="aspect-video overflow-hidden">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline">{post.category}</Badge>
            {post.is_featured && (
              <Badge className="bg-gradient-primary">Featured</Badge>
            )}
          </div>
          <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-muted-foreground line-clamp-3 mb-4">
              {post.excerpt}
            </p>
          )}
        </CardContent>
        <CardFooter className="px-6 pb-6 pt-0 flex items-center gap-4 text-sm text-muted-foreground">
          {post.published_at && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(post.published_at), "MMM d, yyyy")}
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {post.reading_time_minutes} min read
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {post.views_count}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default BlogCard;
