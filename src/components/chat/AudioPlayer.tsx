import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  src: string;
  isOwn?: boolean;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const AudioPlayer = ({ src, isOwn }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 min-w-[180px]">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={togglePlay}
        className={cn(
          "h-10 w-10 rounded-full shrink-0",
          isOwn
            ? "bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
            : "bg-primary/20 hover:bg-primary/30 text-primary"
        )}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5 ml-0.5" />
        )}
      </Button>

      <div className="flex-1 space-y-1">
        {/* Progress bar */}
        <div
          className={cn(
            "h-1 rounded-full overflow-hidden",
            isOwn ? "bg-primary-foreground/30" : "bg-primary/30"
          )}
        >
          <div
            className={cn(
              "h-full transition-all",
              isOwn ? "bg-primary-foreground" : "bg-primary"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Time display */}
        <div
          className={cn(
            "text-xs",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
