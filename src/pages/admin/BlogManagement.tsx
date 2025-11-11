import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, ArrowLeft, LogOut } from "lucide-react";
import BlogPostsTable from "@/components/admin/BlogPostsTable";
import BlogPostForm from "@/components/admin/BlogPostForm";
import { getBlogPosts } from "@/lib/api/blog";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";

const CATEGORIES = [
  "All Categories",
  "Grooming Tips",
  "Style Trends",
  "News & Updates",
  "Promotions",
  "Product Reviews",
  "How-To Guides"
];

const BlogManagement = () => {
  const { signOut } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'scheduled'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const filters: any = {
        status: statusFilter,
        archived: false,
      };
      
      if (searchTerm) {
        filters.search = searchTerm;
      }
      
      if (selectedCategory !== "All Categories") {
        filters.category = selectedCategory;
      }

      const data = await getBlogPosts(filters);
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [statusFilter, selectedCategory, searchTerm]);

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingPost(null);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingPost(null);
    fetchPosts();
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => window.location.href = '/admin'}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Logo variant="dark" />
              <div>
                <h1 className="text-xl font-bold">Blog Management</h1>
                <p className="text-sm text-muted-foreground">Create and manage blog posts</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/admin'}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
        <TabsList>
          <TabsTrigger value="all">All Posts</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading posts...</div>
          ) : (
            <BlogPostsTable 
              posts={posts} 
              onEdit={handleEdit}
              onRefresh={fetchPosts}
            />
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Edit Post" : "Create New Post"}</DialogTitle>
          </DialogHeader>
          <BlogPostForm post={editingPost} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
      </main>
    </div>
  );
};

export default BlogManagement;
