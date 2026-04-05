import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCanvas } from "@/hooks/useCanvas";
import { useSelector } from "react-redux";
import { TSHIRT_TYPES, CANVAS_CONFIG } from "@/constants/designConstants";

const SaveDesign = () => {
  const { toast } = useToast();
  const { frontCanvas, backCanvas } = useCanvas();
  const [resolution, setResolution] = useState(2);
  const selectedType = useSelector((state) => state.tshirt.selectedType);
  const tshirtColor = useSelector((state) => state.tshirt.tshirtColor);

  /**
   * Render the SVG garment path onto an offscreen canvas so we can
   * composite it with the Fabric.js design layer.
   */
  const renderGarmentToCanvas = (view, width, height) => {
    return new Promise((resolve) => {
      const tshirtType = TSHIRT_TYPES[selectedType];
      if (!tshirtType) { resolve(null); return; }
      const svgPath = view === "front" ? tshirtType.frontPath : tshirtType.backPath;

      // Build a standalone SVG with the garment path
      const svgNS = "http://www.w3.org/2000/svg";
      const svgElem = document.createElementNS(svgNS, "svg");
      svgElem.setAttribute("xmlns", svgNS);
      svgElem.setAttribute("viewBox", "0 0 810 810");
      svgElem.setAttribute("width", String(width));
      svgElem.setAttribute("height", String(height));

      // Background fill
      const bg = document.createElementNS(svgNS, "rect");
      bg.setAttribute("width", "810");
      bg.setAttribute("height", "810");
      bg.setAttribute("fill", "#f1f5f9");
      svgElem.appendChild(bg);

      // Garment path
      const path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", svgPath);
      path.setAttribute("fill", tshirtColor);
      path.setAttribute("stroke", "#1e293b");
      path.setAttribute("stroke-width", "2");
      svgElem.appendChild(path);

      // Print zone guide
      const guide = document.createElementNS(svgNS, "rect");
      guide.setAttribute("x", "36");
      guide.setAttribute("y", "144");
      guide.setAttribute("width", "740");
      guide.setAttribute("height", "691");
      guide.setAttribute("fill", "none");
      guide.setAttribute("stroke", "#9ca3af");
      guide.setAttribute("stroke-width", "1.5");
      guide.setAttribute("stroke-dasharray", "8,4");
      guide.setAttribute("opacity", "0.3");
      svgElem.appendChild(guide);

      // Serialize → blob → Image
      const svgData = new XMLSerializer().serializeToString(svgElem);
      const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });
  };

  const saveCanvasToFile = async (canvas, filename, view, includeShirt = false, scale = resolution) => {
    try {
      if (includeShirt) {
        // Composite: garment SVG + design overlay
        const outW = CANVAS_CONFIG.width * scale;
        const outH = CANVAS_CONFIG.height * scale;

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = outW;
        tempCanvas.height = outH;
        const ctx = tempCanvas.getContext("2d");

        // 1. Draw the garment
        const garmentImg = await renderGarmentToCanvas(view, outW, outH);
        if (garmentImg) {
          ctx.drawImage(garmentImg, 0, 0, outW, outH);
        } else {
          // Fallback: solid color background
          ctx.fillStyle = tshirtColor;
          ctx.fillRect(0, 0, outW, outH);
        }

        // 2. Overlay the design from Fabric canvas
        const designDataUrl = canvas.toDataURL({
          format: "png",
          quality: 1,
          multiplier: scale,
        });
        const designImg = await loadImage(designDataUrl);
        ctx.drawImage(designImg, 0, 0, outW, outH);

        // 3. Export
        const dataUrl = tempCanvas.toDataURL("image/png");
        downloadFile(dataUrl, filename);
      } else {
        // Design only — transparent background
        const dataUrl = canvas.toDataURL({
          format: "png",
          quality: 1,
          multiplier: scale,
        });
        downloadFile(dataUrl, filename);
      }
      return true;
    } catch (error) {
      console.error(`Error saving ${filename}:`, error);
      return false;
    }
  };

  const handleSave = async (includeShirt = false) => {
    try {
      if (!frontCanvas && !backCanvas) {
        toast({
          variant: "destructive",
          title: "No Design Found",
          description: "Please create a design before saving.",
          duration: 3000,
        });
        return;
      }

      let savedCount = 0;
      let failedCount = 0;
      const typeName = TSHIRT_TYPES[selectedType]?.name?.toLowerCase().replace(/\s+/g, "-") || "garment";

      if (frontCanvas) {
        const ok = await saveCanvasToFile(
          frontCanvas,
          `${typeName}-front-${includeShirt ? "with-garment" : "design-only"}-${resolution}x.png`,
          "front",
          includeShirt,
          resolution
        );
        ok ? savedCount++ : failedCount++;
      }

      if (backCanvas) {
        const ok = await saveCanvasToFile(
          backCanvas,
          `${typeName}-back-${includeShirt ? "with-garment" : "design-only"}-${resolution}x.png`,
          "back",
          includeShirt,
          resolution
        );
        ok ? savedCount++ : failedCount++;
      }

      toast({
        variant: failedCount > 0 ? "destructive" : "default",
        title: failedCount > 0 ? "Save Error" : "Design Saved!",
        description: failedCount > 0
          ? `Failed to save ${failedCount} file(s).`
          : `Saved ${savedCount} file(s) at ${resolution}x resolution.`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        variant: "destructive",
        title: "Save Error",
        description: "An unexpected error occurred while saving.",
        duration: 3000,
      });
    }
  };

  return (
    <div className="w-full space-y-3">
      <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Export Design</p>
      <div className="flex gap-2">
        <Button
          onClick={() => handleSave(false)}
          className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-xs"
          size="sm"
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Design Only
        </Button>
        <Button
          onClick={() => handleSave(true)}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
          size="sm"
        >
          <Save className="mr-1.5 h-3.5 w-3.5" />
          With Garment
        </Button>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <label htmlFor="resolution" className="text-white/50">Resolution</label>
        <select
          id="resolution"
          value={resolution}
          onChange={(e) => setResolution(Number(e.target.value))}
          className="rounded-lg border border-white/10 bg-white/5 text-white px-2 py-1 text-xs focus:outline-none"
        >
          <option value={1} className="bg-slate-800">1x</option>
          <option value={2} className="bg-slate-800">2x</option>
          <option value={4} className="bg-slate-800">4x</option>
          <option value={8} className="bg-slate-800">8x (print)</option>
        </select>
      </div>
    </div>
  );
};

/* ── Helpers ── */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function downloadFile(dataUrl, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default SaveDesign;
