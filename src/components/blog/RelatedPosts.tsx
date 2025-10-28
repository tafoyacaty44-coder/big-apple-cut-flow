import { useEffect, useState } from "react";
import { getRelatedPosts } from "@/lib/api/blog";
import BlogCard from "./BlogCard";

interface RelatedPostsProps {
  postId: string;
  category: string;
}

const RelatedPosts = ({ postId, category }: RelatedPostsProps) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const data = await getRelatedPosts(postId, category, 3);
        setPosts(data || []);
      } catch (error) {
        console.error("Error fetching related posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [postId, category]);

  if (loading || posts.length === 0) return null;

  return (
    <div className="mt-12 border-t pt-12">
      <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default RelatedPosts;
