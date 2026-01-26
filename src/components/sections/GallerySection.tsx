import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const galleryImages = [
  { id: 1, src: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&h=400&fit=crop", alt: "Culto de Adoração", category: "Cultos" },
  { id: 2, src: "https://images.unsplash.com/photo-1519491050282-cf00c82424ca?w=600&h=400&fit=crop", alt: "Batismo nas Águas", category: "Batismos" },
  { id: 3, src: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=600&h=400&fit=crop", alt: "Encontro de Jovens", category: "Eventos" },
  { id: 4, src: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=600&h=400&fit=crop", alt: "Louvor e Adoração", category: "Cultos" },
  { id: 5, src: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=400&fit=crop", alt: "Ministério de Louvor", category: "Cultos" },
  { id: 6, src: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&h=400&fit=crop", alt: "Família na Igreja", category: "Eventos" },
  { id: 7, src: "https://images.unsplash.com/photo-1559582798-678dfc71ccd8?w=600&h=400&fit=crop", alt: "Oração em Grupo", category: "Cultos" },
  { id: 8, src: "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?w=600&h=400&fit=crop", alt: "Evento Especial", category: "Eventos" },
];

const categories = ["Todos", "Cultos", "Eventos", "Batismos"];

const GallerySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null);

  const filteredImages = activeCategory === "Todos"
    ? galleryImages
    : galleryImages.filter((img) => img.category === activeCategory);

  return (
    <section id="galeria" className="section-padding bg-secondary/30" ref={ref}>
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1 mb-4 rounded-full bg-gold/10 text-gold text-sm font-medium">
            <Camera className="w-4 h-4 inline mr-2" />
            Momentos Especiais
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Nossa <span className="text-gold">Galeria</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Reviva os momentos especiais que vivemos juntos em nossa comunidade.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground hover:bg-accent/50"
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="relative group cursor-pointer overflow-hidden rounded-xl aspect-square"
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
                <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lightbox */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none">
            {selectedImage && (
              <div className="relative">
                <img
                  src={selectedImage.src.replace("w=600&h=400", "w=1200&h=800")}
                  alt={selectedImage.alt}
                  className="w-full h-auto rounded-lg"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white font-medium">{selectedImage.alt}</p>
                  <span className="text-white/70 text-sm">{selectedImage.category}</span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default GallerySection;
