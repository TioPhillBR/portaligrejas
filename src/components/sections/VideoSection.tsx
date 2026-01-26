import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Play, Video } from "lucide-react";

const VideoSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isPlaying, setIsPlaying] = useState(false);

  // Replace with your actual YouTube video ID
  const videoId = "dQw4w9WgXcQ";
  const thumbnailUrl = "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&h=675&fit=crop";

  return (
    <section id="video" className="section-padding" ref={ref}>
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1 mb-4 rounded-full bg-gold/10 text-gold text-sm font-medium">
            <Video className="w-4 h-4 inline mr-2" />
            Assista
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Vídeo <span className="text-gold">Institucional</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Conheça um pouco mais sobre nossa igreja e a obra que Deus tem
            realizado através de nós.
          </p>
        </motion.div>

        {/* Video Player */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl group">
            {!isPlaying ? (
              <>
                {/* Thumbnail */}
                <img
                  src={thumbnailUrl}
                  alt="Vídeo Institucional"
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 transition-opacity group-hover:bg-black/30" />

                {/* Play Button */}
                <button
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center"
                  aria-label="Reproduzir vídeo"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gold flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg">
                    <Play className="w-8 h-8 md:w-10 md:h-10 text-gold-foreground ml-1" fill="currentColor" />
                  </div>
                </button>

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-white text-xl font-display font-semibold">
                    Igreja Luz do Evangelho
                  </h3>
                  <p className="text-white/70 text-sm">
                    Transformando vidas desde 1985
                  </p>
                </div>
              </>
            ) : (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title="Vídeo Institucional"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoSection;
