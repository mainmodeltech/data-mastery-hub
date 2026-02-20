import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import bootcamp1 from "@/assets/gallery/bootcamp-1.jpg";
import bootcamp2 from "@/assets/gallery/bootcamp-2.jpg";
import bootcamp3 from "@/assets/gallery/bootcamp-3.jpg";
import bootcamp4 from "@/assets/gallery/bootcamp-4.jpg";

const staticGalleryImages = [
  { url: bootcamp1, caption: "Session intensive Power BI", bootcamp_name: "Participants en formation Power BI" },
  { url: bootcamp2, caption: "Coaching individuel", bootcamp_name: "Accompagnement personnalisé" },
  { url: bootcamp3, caption: "Promotion Data Analytics", bootcamp_name: "Équipe de participants bootcamp" },
  { url: bootcamp4, caption: "Succès de nos apprenants", bootcamp_name: "Participante certifiée" },
];

type GalleryImage = { url: string; caption: string | null; bootcamp_name: string | null };

export const GallerySection = () => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["gallery-home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_photos")
        .select("url, caption, bootcamp_name")
        .eq("published", true)
        .order("display_order", { ascending: true })
        .limit(8);
      if (error) throw error;
      return data as GalleryImage[];
    },
  });

  const images = data && data.length > 0 ? data : staticGalleryImages;

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Camera className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Nos Bootcamps en images</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Galerie
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez l'ambiance de nos formations à travers les moments forts de nos bootcamps
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="group relative aspect-square overflow-hidden rounded-xl cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image.url}
                  alt={image.bootcamp_name || image.caption || "Photo bootcamp"}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-background text-sm font-medium">{image.caption}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl p-0 bg-background border-border overflow-hidden">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
            {selectedImage && (
              <div className="relative">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.bootcamp_name || selectedImage.caption || "Photo bootcamp"}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
                <div className="p-4 bg-background">
                  <p className="text-foreground font-medium">{selectedImage.caption}</p>
                  <p className="text-muted-foreground text-sm">{selectedImage.bootcamp_name}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};
