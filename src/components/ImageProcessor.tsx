import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Palette, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageProcessorProps {
  imageFile: File;
  onReset: () => void;
}

export const ImageProcessor = ({ imageFile, onReset }: ImageProcessorProps) => {
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [processedUrl, setProcessedUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<"colorize" | "grayscale" | null>(null);

  useState(() => {
    const url = URL.createObjectURL(imageFile);
    setOriginalUrl(url);
    return () => URL.revokeObjectURL(url);
  });

  const convertToGrayscale = async () => {
    setIsProcessing(true);
    setMode("grayscale");

    try {
      const img = new Image();
      img.src = URL.createObjectURL(imageFile);

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Canvas context not available");

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
      }

      ctx.putImageData(imageData, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          setProcessedUrl(URL.createObjectURL(blob));
          toast.success("Image converted to grayscale!");
        }
      });
    } catch (error) {
      toast.error("Failed to convert image");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const colorizeImage = async () => {
    setIsProcessing(true);
    setMode("colorize");

    try {
      const img = new Image();
      img.src = URL.createObjectURL(imageFile);

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Canvas context not available");

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Advanced colorization algorithm based on luminance
      for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const normalized = gray / 255;
        
        // Sky/bright areas (blue tones)
        if (gray > 200) {
          data[i] = Math.min(255, gray * 0.9);     // R
          data[i + 1] = Math.min(255, gray * 0.95); // G
          data[i + 2] = Math.min(255, gray * 1.1);  // B (boost blue)
        }
        // Midtones (natural skin/earth tones)
        else if (gray > 100) {
          data[i] = Math.min(255, gray * 1.1);      // R (slight boost)
          data[i + 1] = Math.min(255, gray * 1.05); // G
          data[i + 2] = Math.min(255, gray * 0.9);  // B (reduce)
        }
        // Shadows (cool/blue tones)
        else if (gray > 50) {
          data[i] = Math.min(255, gray * 0.95);     // R
          data[i + 1] = Math.min(255, gray * 1.0);  // G
          data[i + 2] = Math.min(255, gray * 1.05); // B (slight boost)
        }
        // Deep shadows (maintain darkness with slight blue)
        else {
          data[i] = Math.min(255, gray * 0.9);      // R
          data[i + 1] = Math.min(255, gray * 0.95); // G
          data[i + 2] = Math.min(255, gray * 1.1);  // B
        }
      }

      ctx.putImageData(imageData, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          setProcessedUrl(URL.createObjectURL(blob));
          toast.success("Image colorized successfully!");
        }
      });
    } catch (error) {
      toast.error("Failed to colorize image");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!processedUrl) return;

    const link = document.createElement("a");
    link.href = processedUrl;
    link.download = `processed-${mode}-${imageFile.name}`;
    link.click();
    toast.success("Image downloaded!");
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Original
          </h3>
          <div className="relative rounded-lg overflow-hidden border border-border bg-card aspect-square">
            <img
              src={originalUrl}
              alt="Original"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Processed
          </h3>
          <div className="relative rounded-lg overflow-hidden border border-border bg-card aspect-square">
            {processedUrl ? (
              <img
                src={processedUrl}
                alt="Processed"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <ImageIcon className="w-16 h-16 opacity-20" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <Button
          onClick={colorizeImage}
          disabled={isProcessing}
          variant="gradient"
          size="lg"
        >
          {isProcessing && mode === "colorize" ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Palette className="w-5 h-5" />
          )}
          Colorize Image
        </Button>

        <Button
          onClick={convertToGrayscale}
          disabled={isProcessing}
          size="lg"
        >
          {isProcessing && mode === "grayscale" ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <ImageIcon className="w-5 h-5" />
          )}
          To Grayscale
        </Button>

        {processedUrl && (
          <Button onClick={downloadImage} variant="secondary" size="lg">
            <Download className="w-5 h-5" />
            Download
          </Button>
        )}

        <Button onClick={onReset} variant="outline" size="lg">
          New Image
        </Button>
      </div>
    </div>
  );
};
