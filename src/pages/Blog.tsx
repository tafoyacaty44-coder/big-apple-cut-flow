import { useState, useEffect } from "react";
import { getBlogPosts } from "@/lib/api/blog";
import BlogCard from "@/components/blog/BlogCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import SectionHeading from "@/components/ui/section-heading";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const CATEGORIES = [
  "All",
  "Grooming Tips",
  "Style Trends",
  "News & Updates",
  "Promotions",
  "Product Reviews",
  "How-To Guides"
];

const Blog = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const filters: any = {
        status: 'published',
        archived: false,
      };
      
      if (searchTerm) {
        filters.search = searchTerm;
      }
      
      if (selectedCategory !== "All") {
        filters.category = selectedCategory;
      }

      const data = await getBlogPosts(filters);
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, searchTerm]);

  const featuredPosts = posts.filter(p => p.is_featured).slice(0, 3);
  const regularPosts = posts.filter(p => !p.is_featured);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <SectionHeading
          title="Our Blog"
          subtitle="Tips, trends, and stories from the barbershop"
        />

        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-12">
          <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
            {CATEGORIES.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading articles...</div>
        ) : (
          <>
            {featuredPosts.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Featured Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {featuredPosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}

            {regularPosts.length > 0 ? (
              <div>
                <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {regularPosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No articles found
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
