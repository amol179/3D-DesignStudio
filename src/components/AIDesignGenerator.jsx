import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as fabric from "fabric";

const AIDesignGenerator = ({ activeCanvas, manualSync, toolbar = false }) => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const notify = (title, description, variant = "default") => {
    toast({ title, description, variant });
  };

  const containsBlockedFranchisePrompt = (text) => {
    const normalized = text.toLowerCase();
    const blockedTerms = [
      "one piece",
      "naruto",
      "dragon ball",
      "attack on titan",
      "marvel",
      "dc",
      "pokemon",
      "mickey mouse",
    ];

    return blockedTerms.some((term) => normalized.includes(term));
  };

  const fetchFromHuggingFace = async (text, apiToken) => {
    const model = import.meta.env.VITE_AI_MODEL || "black-forest-labs/FLUX.1-schnell";
    const response = await fetch(
      `https://router.huggingface.co/hf-inference/models/${model}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: text,
          options: { wait_for_model: true },
        }),
      }
    );

    if (!response.ok) {
      let details = "";
      try {
        details = await response.text();
      } catch {
        details = "";
      }

      throw new Error(
        `Hugging Face request failed (${response.status})${details ? `: ${details.slice(0, 220)}` : ""}`
      );
    }

    const blob = await response.blob();
    if (!blob.type.startsWith("image/")) {
      throw new Error("Hugging Face did not return an image.");
    }

    return blob;
  };

  const generateDesignFromPrompt = async () => {
    if (!prompt.trim()) {
      notify("Empty prompt", "Please enter a design description.");
      return;
    }

    if (!activeCanvas) {
      notify("No canvas available", "Please open a design canvas first.");
      return;
    }

    if (containsBlockedFranchisePrompt(prompt)) {
      notify(
        "Prompt Not Allowed",
        "Use an original description instead of copyrighted characters/franchises.",
        "destructive"
      );
      return;
    }

    const apiToken = import.meta.env.VITE_HF_API_TOKEN;
    if (!apiToken) {
      notify(
        "API Token Missing",
        "Add VITE_HF_API_TOKEN in .env and restart the dev server.",
        "destructive"
      );
      return;
    }

    setIsLoading(true);

    try {
      const blob = await fetchFromHuggingFace(prompt, apiToken);

      const imageUrl = URL.createObjectURL(blob);
      const imgElement = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Failed to decode generated image."));
        image.src = imageUrl;
      });

      const safeZoneWidth = 410;
      const safeZoneHeight = 400;
      const scaleFactor = Math.min(
        safeZoneWidth / imgElement.width,
        safeZoneHeight / imgElement.height,
        1
      );

      const fabricImg = new fabric.Image(imgElement, {
        left: 225,
        top: 250,
        scaleX: scaleFactor,
        scaleY: scaleFactor,
        selectable: true,
        hasControls: true,
        hasBorders: true,
        cornerStyle: "circle",
        transparentCorners: false,
        lockUniScaling: true,
        objectCaching: true,
        minScaleLimit: 0.3,
        maxScaleLimit: 2,
      });

      // Keep only the latest AI image on the current side.
      activeCanvas.getObjects().forEach((obj) => {
        if (obj?.aiGenerated === true) {
          activeCanvas.remove(obj);
        }
      });

      fabricImg.set("aiGenerated", true);

      fabricImg.setControlsVisibility({
        mt: true,
        mb: true,
        ml: true,
        mr: true,
        bl: true,
        br: true,
        tl: true,
        tr: true,
        mtr: true,
      });

      activeCanvas.add(fabricImg);
      activeCanvas.setActiveObject(fabricImg);
      activeCanvas.requestRenderAll();
      manualSync();

      notify("AI Design Generated", `Design "${prompt}" has been added to your canvas.`);
      setPrompt("");
      setOpen(false);
      URL.revokeObjectURL(imageUrl);
    } catch (error) {
      console.error("AI generation error:", error);
      const errorMessage = String(error?.message || "");
      const isAuthOrRateIssue =
        errorMessage.includes("403") ||
        errorMessage.includes("401") ||
        errorMessage.includes("429");
      const isBadModel = errorMessage.includes("404");

      notify(
        "Generation Failed",
        isBadModel
          ? "Model not found. Set VITE_AI_MODEL=black-forest-labs/FLUX.1-schnell in .env and restart dev server."
          :
        isAuthOrRateIssue
          ? "AI provider denied the request (auth/rate limit). Try again later or update your Hugging Face token/model in .env."
          : "Could not generate image. Please check your internet connection and try another prompt.",
        "destructive"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading) {
      generateDesignFromPrompt();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {toolbar ? (
          <button
            className="tool-btn relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 ease-out text-white/70 hover:bg-white/10 hover:text-white hover:scale-105"
            title="AI Design Generator"
          >
            <Sparkles className="w-[18px] h-[18px]" />
          </button>
        ) : (
          <Button
            className="w-full flex items-center justify-center gap-2 whitespace-nowrap"
            variant="secondary"
          >
            <Sparkles className="h-4 w-4" />
            <span>AI Design Generator</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Design with AI</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="prompt">Design Description</Label>
            <Input
              id="prompt"
              placeholder="e.g., 'A futuristic geometric pattern with blue neon lights'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="col-span-3"
            />
            <p className="text-xs text-muted-foreground">
              Describe the design you want to generate. Be specific for better results.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={generateDesignFromPrompt}
            disabled={isLoading || !prompt.trim()}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIDesignGenerator;
