import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface UseImageUploadOptions {
  bucket?: string;
  folder?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export const useImageUpload = (options: UseImageUploadOptions = {}) => {
  const {
    bucket = "church-images",
    folder = "uploads",
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
  } = options;

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      img.onload = () => {
        let { width, height } = img;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          // Use better image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Failed to compress image"));
              }
            },
            "image/webp",
            quality
          );
        } else {
          reject(new Error("Canvas context not available"));
        }
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      setProgress(10);

      // Compress the image
      const compressedBlob = await compressImage(file);
      setProgress(40);

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const fileName = `${folder}/${timestamp}-${randomString}.webp`;

      setProgress(50);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, compressedBlob, {
          contentType: "image/webp",
          cacheControl: "3600",
          upsert: false,
        });

      setProgress(90);

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setProgress(100);
      
      toast({
        title: "Imagem enviada!",
        description: "A imagem foi otimizada e salva com sucesso.",
      });

      return urlData.publicUrl;
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Erro ao enviar imagem",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const deleteImage = async (url: string): Promise<boolean> => {
    try {
      // Extract path from URL
      const urlParts = url.split(`${bucket}/`);
      if (urlParts.length < 2) return false;

      const path = urlParts[1];

      const { error } = await supabase.storage.from(bucket).remove([path]);

      if (error) {
        throw error;
      }

      return true;
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "Erro ao excluir imagem",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    uploading,
    progress,
  };
};
