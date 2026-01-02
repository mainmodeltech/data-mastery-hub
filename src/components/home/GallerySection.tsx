import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Camera, X } from "lucide-react";

import bootcamp1 from "@/assets/gallery/bootcamp-1.jpg";
import bootcamp2 from "@/assets/gallery/bootcamp-2.jpg";
import bootcamp3 from "@/assets/gallery/bootcamp-3.jpg";
import bootcamp4 from "@/assets/gallery/bootcamp-4.jpg";

const galleryImages = [
  {
    src: bootcamp1,
    alt: "Participants en formation Power BI",
    caption: "Session intensive Power BI"
  },
  {
    src: bootcamp2,
    alt: "Accompagnement personnalisé",
    caption: "Coaching individuel"
  },
  {
    src: bootcamp3,
    alt: "Équipe de participants bootcamp",
    caption: "Promotion Data Analytics"
  },
  {
    src: bootcamp4,
    alt: "Participante certifiée",
    caption: "Succès de nos apprenants"
  }
];

export const GallerySection = () => {
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null);

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-xl cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.src}
                alt={image.alt}
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
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
                <div className="p-4 bg-background">
                  <p className="text-foreground font-medium">{selectedImage.caption}</p>
                  <p className="text-muted-foreground text-sm">{selectedImage.alt}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};
