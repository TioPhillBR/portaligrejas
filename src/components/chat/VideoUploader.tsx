import { useState, useRef } from "react";
import { Video, X, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VideoUploaderProps {
  onVideoUploaded: (videoUrl: string) => Promise<void>;
  disabled?: boolean;
  bucket?: string;
  folder?: string;
  maxSizeMB?: number;
}

const VideoUploader = ({ 
  onVideoUploaded, 
  disabled,
  bucket = "chat-media",
  folder = "video",
  maxSizeMB = 50
}: VideoUploaderProps) => {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione um arquivo de vídeo.",
        variant: "destructive",
      });
      return;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      toast({
        title: "Arquivo muito grande",
        description: `O tamanho máximo é ${maxSizeMB}MB. Este arquivo tem ${fileSizeMB.toFixed(1)}MB.`,
        variant: "destructive",
      });
      return;
    }

    setSelectedVideo(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleCancel = () => {
    setSelectedVideo(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedVideo) return;

    setUploading(true);

    try {
      const fileExt = selectedVideo.name.split(".").pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, selectedVideo, {
          contentType: selectedVideo.type,
          upsert: false,
        });

      if (error) {
        throw error;
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

      await onVideoUploaded(urlData.publicUrl);

      handleCancel();
      toast({ title: "Vídeo enviado!" });
    } catch (error: any) {
      console.error("Error uploading video:", error);
      toast({
        title: "Erro ao enviar vídeo",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // If a video is selected, show preview with upload/cancel buttons
  if (selectedVideo && previewUrl) {
    return (
      <div className="flex items-center gap-2 bg-muted rounded-full px-3 py-1.5">
        <video
          src={previewUrl}
          className="w-10 h-10 rounded object-cover"
        />
        <span className="text-sm text-muted-foreground truncate max-w-[100px]">
          {selectedVideo.name}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="h-8 w-8 text-destructive hover:text-destructive"
          disabled={uploading}
        >
          <X className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="default"
          size="icon"
          onClick={handleUpload}
          disabled={uploading}
          className="h-8 w-8"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
        </Button>
      </div>
    );
  }

  // Default button to select video
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
        id="chat-video-upload"
        disabled={disabled}
      />
      <label htmlFor="chat-video-upload">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 cursor-pointer"
          disabled={disabled}
          asChild
        >
          <span>
            <Video className="w-5 h-5" />
          </span>
        </Button>
      </label>
    </>
  );
};

export default VideoUploader;
