import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Radio, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface WebRadioSectionProps {
  sectionData?: {
    title: string | null;
    subtitle: string | null;
    content: {
      badge?: string;
      radio_name?: string;
      stream_url?: string;
      description?: string;
    };
  };
}

const WebRadioSection = ({ sectionData }: WebRadioSectionProps) => {
  const ref = useRef(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([70]);
  const [isMuted, setIsMuted] = useState(false);

  const content = sectionData?.content || {};
  const badge = content.badge || "Ao Vivo";
  const title = sectionData?.title || "Web Rádio";
  const subtitle = sectionData?.subtitle || content.description || "Ouça nossa programação com músicas, mensagens e reflexões para abençoar seu dia.";
  const radioName = content.radio_name || "Rádio Luz do Evangelho";
  const streamUrl = content.stream_url || "";

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0] / 100;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!streamUrl) return;
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <section id="radio" className="section-padding bg-primary text-primary-foreground" ref={ref}>
      <div className="container-custom">
        {/* Hidden Audio Element */}
        {streamUrl && <audio ref={audioRef} src={streamUrl} preload="none" />}

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1 mb-4 rounded-full bg-white/10 text-gold text-sm font-medium">
            <Radio className="w-4 h-4 inline mr-2" />
            {badge}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
            {title.includes(" ") ? (
              <>
                {title.split(" ")[0]} <span className="text-gold">{title.split(" ").slice(1).join(" ")}</span>
              </>
            ) : (
              <>Web <span className="text-gold">Rádio</span></>
            )}
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        {/* Radio Player */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Album Art / Radio Icon */}
                <div className="relative">
                  <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full bg-gold/20 flex items-center justify-center ${isPlaying ? "animate-pulse-soft" : ""}`}>
                    <Radio className="w-12 h-12 md:w-16 md:h-16 text-gold" />
                  </div>
                  {isPlaying && (
                    <div className="absolute -inset-2 rounded-full border-2 border-gold/30 animate-ping" />
                  )}
                </div>

                {/* Player Controls */}
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-1">
                    {radioName}
                  </h3>
                  <p className="text-white/60 text-sm mb-4">
                    {!streamUrl ? "Configure a URL do stream no painel admin" : isPlaying ? "🔴 Ao Vivo" : "Clique para ouvir"}
                  </p>

                  {/* Controls */}
                  <div className="flex items-center gap-4 justify-center sm:justify-start">
                    {/* Play/Pause Button */}
                    <Button
                      onClick={togglePlay}
                      size="lg"
                      className="w-14 h-14 rounded-full bg-gold hover:bg-gold/90 text-gold-foreground"
                      disabled={!streamUrl}
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6" fill="currentColor" />
                      ) : (
                        <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
                      )}
                    </Button>

                    {/* Volume Controls */}
                    <div className="flex items-center gap-3 flex-1 max-w-48">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleMute}
                        className="text-white/70 hover:text-white hover:bg-white/10"
                      >
                        {isMuted || volume[0] === 0 ? (
                          <VolumeX className="w-5 h-5" />
                        ) : (
                          <Volume2 className="w-5 h-5" />
                        )}
                      </Button>
                      <Slider
                        value={volume}
                        onValueChange={setVolume}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default WebRadioSection;
