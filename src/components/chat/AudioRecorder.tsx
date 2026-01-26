import { Mic, Square, Send, Trash2, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface AudioRecorderProps {
  onSendAudio: (audioUrl: string) => Promise<void>;
  disabled?: boolean;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const AudioRecorder = ({ onSendAudio, disabled }: AudioRecorderProps) => {
  const {
    isRecording,
    isPaused,
    recordingTime,
    audioUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    uploadAudio,
    isUploading,
  } = useAudioRecorder({ folder: "audio", bucket: "chat-media" });

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioUrl) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSend = async () => {
    const url = await uploadAudio();
    if (url) {
      await onSendAudio(url);
    }
  };

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error) {
      console.error("Microphone permission denied");
    }
  };

  // Not recording and no audio recorded - show mic button
  if (!isRecording && !audioUrl) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleStartRecording}
        disabled={disabled}
        className="shrink-0"
        title="Gravar áudio"
      >
        <Mic className="w-5 h-5" />
      </Button>
    );
  }

  // Recording in progress
  if (isRecording) {
    return (
      <div className="flex items-center gap-2 bg-destructive/10 rounded-full px-3 py-1.5 animate-pulse">
        <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
        <span className="text-sm font-medium text-destructive min-w-[40px]">
          {formatTime(recordingTime)}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={isPaused ? resumeRecording : pauseRecording}
          className="h-8 w-8"
        >
          {isPaused ? (
            <Mic className="w-4 h-4" />
          ) : (
            <Pause className="w-4 h-4" />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={cancelRecording}
          className="h-8 w-8 text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="default"
          size="icon"
          onClick={stopRecording}
          className="h-8 w-8"
        >
          <Square className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // Audio recorded, ready to send
  return (
    <div className="flex items-center gap-2 bg-muted rounded-full px-3 py-1.5">
      <span className="text-sm text-muted-foreground">
        {formatTime(recordingTime)}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handlePlayPause}
        className="h-8 w-8"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={cancelRecording}
        className="h-8 w-8 text-destructive hover:text-destructive"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
      <Button
        type="button"
        variant="default"
        size="icon"
        onClick={handleSend}
        disabled={isUploading}
        className="h-8 w-8"
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default AudioRecorder;
