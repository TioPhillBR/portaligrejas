import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Play, Video } from "lucide-react";
import { useHomeSection } from "@/hooks/useHomeSections";

interface VideoSectionProps {
  sectionData?: {
    title?: string | null;
    subtitle?: string | null;
    content?: {
      video_id?: string;
      thumbnail_url?: string;
      video_title?: string;
      video_description?: string;
    };
  };
}

const VideoSection = ({ sectionData }: VideoSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Fallback to database if no sectionData provided
  const { section } = useHomeSection("video");
  const content = sectionData?.content || section?.content || {};

  // Get video ID from content or use default
  const videoId = content.video_id || "dQw4w9WgXcQ";
  const thumbnailUrl = content.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const videoTitle = content.video_title || "Igreja Luz do Evangelho";
  const videoDescription = content.video_description || "Transformando vidas desde 1985";
  const sectionTitle = sectionData?.title || section?.title || "Vídeo";
  const sectionSubtitle = sectionData?.subtitle || section?.subtitle || "Conheça um pouco mais sobre nossa igreja e a obra que Deus tem realizado através de nós.";

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
            {sectionTitle.includes(" ") ? (
              <>
                {sectionTitle.split(" ")[0]} <span className="text-gold">{sectionTitle.split(" ").slice(1).join(" ")}</span>
              </>
            ) : (
              <>Vídeo <span className="text-gold">Institucional</span></>
            )}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {sectionSubtitle}
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
                  onError={(e) => {
                    // Fallback to hqdefault if maxresdefault doesn't exist
                    e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                  }}
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
                    {videoTitle}
                  </h3>
                  <p className="text-white/70 text-sm">
                    {videoDescription}
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
