import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { GalleryImage } from "@/lib/api/gallery";

interface GalleryImagesTableProps {
  images: GalleryImage[];
  onEdit: (image: GalleryImage) => void;
  onDelete: (image: GalleryImage) => void;
  onToggleActive: (image: GalleryImage) => void;
}

export function GalleryImagesTable({ images, onEdit, onDelete, onToggleActive }: GalleryImagesTableProps) {
  return (
    <div className="rounded-md border bg-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead className="hidden sm:table-cell">Title</TableHead>
            <TableHead className="hidden md:table-cell">Category</TableHead>
            <TableHead className="hidden lg:table-cell">Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {images.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No images found. Upload your first image to get started.
              </TableCell>
            </TableRow>
          ) : (
            images.map((image) => (
              <TableRow key={image.id}>
                <TableCell>
                  <img 
                    src={image.image_url} 
                    alt={image.title || "Gallery image"}
                    className="w-16 h-16 object-cover rounded"
                  />
                </TableCell>
                <TableCell className="hidden sm:table-cell font-medium whitespace-nowrap">
                  {image.title || <span className="text-muted-foreground italic">No title</span>}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline">{image.category}</Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell max-w-xs truncate">
                  {image.description || <span className="text-muted-foreground italic">No description</span>}
                </TableCell>
                <TableCell>
                  {image.is_active ? (
                    <Badge variant="default">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onToggleActive(image)}
                      title={image.is_active ? "Deactivate" : "Activate"}
                    >
                      {image.is_active ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(image)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onDelete(image)}
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
}
