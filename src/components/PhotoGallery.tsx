import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { X, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface PhotoGalleryProps {
  entityType: "event" | "ministry";
  entityId: string;
}

interface EntityPhoto {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  sort_order: number;
}

const PhotoGallery = ({ entityType, entityId }: PhotoGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ["entity-photos", entityType, entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entity_photos")
        .select("*")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as EntityPhoto[];
    },
  });

  const handlePrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Galeria de Fotos</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <ImageIcon className="h-5 w-5 text-primary" />
        Galeria de Fotos
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="aspect-square rounded-lg overflow-hidden cursor-pointer group relative"
            onClick={() => setSelectedIndex(index)}
          >
            <img
              src={photo.image_url}
              alt={photo.title || `Foto ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-0">
          {selectedIndex !== null && photos[selectedIndex] && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 text-white hover:bg-white/20"
                onClick={() => setSelectedIndex(null)}
              >
                <X className="h-6 w-6" />
              </Button>

              <div className="flex items-center justify-center min-h-[60vh]">
                <img
                  src={photos[selectedIndex].image_url}
                  alt={photos[selectedIndex].title || ""}
                  className="max-h-[80vh] max-w-full object-contain"
                />
              </div>

              {photos[selectedIndex].title && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <p className="font-medium">{photos[selectedIndex].title}</p>
                  {photos[selectedIndex].description && (
                    <p className="text-sm text-white/80">
                      {photos[selectedIndex].description}
                    </p>
                  )}
                </div>
              )}

              {/* Navigation */}
              {photos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 disabled:opacity-30"
                    onClick={handlePrev}
                    disabled={selectedIndex === 0}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 disabled:opacity-30"
                    onClick={handleNext}
                    disabled={selectedIndex === photos.length - 1}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          i === selectedIndex ? "bg-white" : "bg-white/40"
                        }`}
                        onClick={() => setSelectedIndex(i)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhotoGallery;
