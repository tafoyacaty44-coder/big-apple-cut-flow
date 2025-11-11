import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Pin, Star } from "lucide-react";
import { format } from "date-fns";
import { togglePublishStatus, deleteBlogPost } from "@/lib/api/blog";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface BlogPostsTableProps {
  posts: any[];
  onEdit: (post: any) => void;
  onRefresh: () => void;
}

const BlogPostsTable = ({ posts, onEdit, onRefresh }: BlogPostsTableProps) => {
  const handleTogglePublish = async (post: any) => {
    try {
      await togglePublishStatus(post.id, !post.is_published);
      toast.success(post.is_published ? "Post unpublished" : "Post published");
      onRefresh();
    } catch (error) {
      console.error("Error toggling publish status:", error);
      toast.error("Failed to update post status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    try {
      await deleteBlogPost(id);
      toast.success("Post deleted successfully");
      onRefresh();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const getStatusBadge = (post: any) => {
    if (post.archived_at) {
      return <Badge variant="secondary">Archived</Badge>;
    }
    if (post.is_published && post.published_at && new Date(post.published_at) <= new Date()) {
      return <Badge variant="default">Published</Badge>;
    }
    if (post.scheduled_publish_at) {
      return <Badge variant="outline">Scheduled</Badge>;
    }
    return <Badge variant="secondary">Draft</Badge>;
  };

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead className="hidden md:table-cell">Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Views</TableHead>
            <TableHead className="hidden lg:table-cell">Published</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No blog posts found
              </TableCell>
            </TableRow>
          ) : (
            posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {post.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                    {post.is_featured && <Star className="h-4 w-4 text-yellow-500" />}
                    <span className="font-medium whitespace-nowrap">{post.title}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline">{post.category}</Badge>
                </TableCell>
                <TableCell>{getStatusBadge(post)}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    {post.views_count}
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell whitespace-nowrap">
                  {post.published_at
                    ? format(new Date(post.published_at), "MMM d, yyyy")
                    : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Switch
                      checked={post.is_published}
                      onCheckedChange={() => handleTogglePublish(post)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(post)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default BlogPostsTable;
