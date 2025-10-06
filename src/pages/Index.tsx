import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { ImageProcessor } from "@/components/ImageProcessor";
import { Sparkles } from "lucide-react";

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-primary shadow-glow">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            AI Image Colorizer
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform grayscale images to color with AI, or convert any image to grayscale instantly
          </p>
        </header>

        <main className="max-w-5xl mx-auto">
          {!selectedImage ? (
            <ImageUpload onImageSelect={setSelectedImage} />
          ) : (
            <ImageProcessor
              imageFile={selectedImage}
              onReset={() => setSelectedImage(null)}
            />
          )}
        </main>

        <footer className="text-center mt-16 text-sm text-muted-foreground">
          <p>Upload an image to get started • Supports JPG, PNG, and WebP formats</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
