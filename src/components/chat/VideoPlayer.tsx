import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  src: string;
  isOwn?: boolean;
}

const VideoPlayer = ({ src, isOwn }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  return (
    <div 
      className="relative rounded-lg overflow-hidden max-w-[280px] group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => !isPlaying && setShowControls(true)}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full rounded-lg"
        onEnded={handleVideoEnd}
        playsInline
        preload="metadata"
      />
      
      {/* Play overlay when paused */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          onClick={togglePlay}
        >
          <div className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center",
            isOwn 
              ? "bg-primary-foreground/90 text-primary" 
              : "bg-primary/90 text-primary-foreground"
          )}>
            <Play className="w-7 h-7 ml-1" />
          </div>
        </div>
      )}

      {/* Controls bar */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent transition-opacity",
        showControls || !isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )}>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            className="h-8 w-8 text-white hover:bg-white/20"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="h-8 w-8 text-white hover:bg-white/20"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>

          <div className="flex-1" />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleFullscreen}
            className="h-8 w-8 text-white hover:bg-white/20"
          >
            <Maximize className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
