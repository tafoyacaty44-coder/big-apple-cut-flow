import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Linkedin, Link2, Mail } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonsProps {
  title: string;
  url: string;
}

const ShareButtons = ({ title, url }: ShareButtonsProps) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const shareLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "hover:text-blue-600"
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: "hover:text-blue-400"
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: "hover:text-blue-700"
    },
    {
      name: "Email",
      icon: Mail,
      url: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      color: "hover:text-gray-600"
    },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium mr-2">Share:</span>
      {shareLinks.map((link) => (
        <Button
          key={link.name}
          variant="ghost"
          size="sm"
          className={link.color}
          onClick={() => window.open(link.url, '_blank')}
        >
          <link.icon className="h-4 w-4" />
        </Button>
      ))}
      <Button variant="ghost" size="sm" onClick={copyToClipboard} className="hover:text-primary">
        <Link2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ShareButtons;
