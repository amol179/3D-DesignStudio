import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCanvas } from "@/hooks/useCanvas";
import { useToast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { useCanvasTextureSync } from "@/hooks/useCanvasTextureSync";
import SaveDesign from "@/components/SaveDesign";
import AIDesignGenerator from "@/components/AIDesignGenerator";
import { Trash, ZoomIn, ZoomOut, ImagePlus, Type, Slash } from "lucide-react";
import * as fabric from "fabric";

const ToolBar = ({ manualSync }) => {
  const { activeCanvas, selectedObject } = useCanvas();
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [drawingMode, setDrawingMode] = useState(false);
  const { view } = useSelector((state) => state.tshirt);
  const { toast } = useToast();

  useCanvasTextureSync({ view });

  useEffect(() => {
    if (selectedObject && selectedObject.type === "line") {
      setBrushColor(selectedObject.stroke || "#000000");
      setBrushSize(selectedObject.strokeWidth || 5);
    }
  }, [selectedObject]);

  const handleColorChange = (colorValue) => {
    setBrushColor(colorValue);

    if (activeCanvas) {
      activeCanvas.freeDrawingBrush = activeCanvas.freeDrawingBrush || new fabric.PencilBrush(activeCanvas);
      activeCanvas.freeDrawingBrush.color = colorValue;
      if (!activeCanvas.isDrawingMode && selectedObject) {
        selectedObject.set("stroke", colorValue);
        selectedObject.set("fill", colorValue);
      }
      activeCanvas.renderAll();
    }

    if (selectedObject) {
      selectedObject.set("stroke", colorValue);
      selectedObject.set("fill", colorValue);
    }
    manualSync();
  };

  const handleBrushSizeChange = (e) => {
    const size = Number(e.target.value);
    if (size <= 0) return;
    setBrushSize(size);

    if (activeCanvas) {
      activeCanvas.freeDrawingBrush = activeCanvas.freeDrawingBrush || new fabric.PencilBrush(activeCanvas);
      activeCanvas.freeDrawingBrush.width = size;
      activeCanvas.renderAll();
    }

    if (selectedObject) {
      selectedObject.set("strokeWidth", size);
      selectedObject.set("fontSize", selectedObject.fontSize ? selectedObject.fontSize : size);
      activeCanvas?.renderAll();
    }
    manualSync();
  };

  const handleDelete = () => {
    if (!selectedObject || !activeCanvas) return;
    activeCanvas.remove(selectedObject);
    activeCanvas.discardActiveObject();
    activeCanvas.requestRenderAll();
    manualSync();
    toast({ title: "Shape removed", description: "Selected object deleted." });
  };

  const handleDuplicate = () => {
    if (!selectedObject || !activeCanvas) return;
    selectedObject.clone((cloned) => {
      cloned.set({ left: selectedObject.left + 10, top: selectedObject.top + 10 });
      activeCanvas.add(cloned);
      activeCanvas.setActiveObject(cloned);
      activeCanvas.requestRenderAll();
      manualSync();
      toast({ title: "Duplicated", description: "Object duplicated." });
    });
  };

  const handleCenter = () => {
    if (!selectedObject || !activeCanvas) return;
    selectedObject.center();
    selectedObject.setCoords();
    activeCanvas.requestRenderAll();
    manualSync();
    toast({ title: "Centered", description: "Object centered on canvas." });
  };

  const handleClearAll = () => {
    if (!activeCanvas) return;
    activeCanvas.clear();
    manualSync();
    toast({ title: "Reset", description: "Canvas cleared successfully." });
  };

  const handleZoomIn = () => {
    if (!activeCanvas) return;
    activeCanvas.setZoom((activeCanvas.getZoom() || 1) * 1.1);
  };

  const toggleDrawingMode = () => {
    if (!activeCanvas) return;
    const isOn = !drawingMode;
    setDrawingMode(isOn);
    activeCanvas.isDrawingMode = isOn;
    activeCanvas.freeDrawingBrush = activeCanvas.freeDrawingBrush || new fabric.PencilBrush(activeCanvas);
    activeCanvas.freeDrawingBrush.width = brushSize;
    activeCanvas.freeDrawingBrush.color = brushColor;
    toast({
      title: `Drawing mode ${isOn ? "enabled" : "disabled"}`,
      description: `You can now ${isOn ? "draw" : "select"} on canvas.`,
    });
  };

  const handleZoomOut = () => {
    if (!activeCanvas) return;
    activeCanvas.setZoom((activeCanvas.getZoom() || 1) / 1.1);
  };

  const handleAddText = () => {
    if (!activeCanvas) return;
    const text = new fabric.Textbox("Your Text", {
      left: 100,
      top: 100,
      width: 200,
      fontSize: 20,
      fill: "#000000",
    });
    activeCanvas.add(text);
    activeCanvas.setActiveObject(text);
    activeCanvas.requestRenderAll();
    manualSync();
    toast({ title: "Text added", description: "Text block added to canvas." });
  };

  const handleAddLine = () => {
    if (!activeCanvas) return;
    const line = new fabric.Line([50, 100, 200, 100], {
      stroke: "#000000",
      strokeWidth: 2,
    });
    activeCanvas.add(line);
    activeCanvas.setActiveObject(line);
    activeCanvas.requestRenderAll();
    manualSync();
    toast({ title: "Line added", description: "Guideline added to canvas." });
  };

  const triggerFileInput = () => {
    const fileInput = document.getElementById("file-input");
    if (fileInput) fileInput.click();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !activeCanvas) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const imgElement = new Image();
      imgElement.src = event.target.result;
      imgElement.onload = () => {
        // Calculate appropriate scale to fit within safe zone
        const safeZoneWidth = 410;
        const safeZoneHeight = 400;
        let scaleFactor = Math.min(safeZoneWidth / imgElement.width, safeZoneHeight / imgElement.height, 1);

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
          lockUniScaling: true, // Lock aspect ratio to prevent distortion
          lockRotation: false,
          objectCaching: true,
          minScaleLimit: 0.3, // Minimum scale
          maxScaleLimit: 2, // Maximum scale
        });
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
        toast({ title: "Image uploaded", description: "Artwork added to canvas." });
      };
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="toolbar-container p-3 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 max-h-[calc(100vh-200px)] overflow-y-auto" style={{ minHeight: '220px' }}>
      <input
        id="file-input"
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="toolbar-card p-3 space-y-3">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Add Elements</p>
        <h4 className="font-semibold leading-tight">Insert content</h4>
        <div className="grid grid-cols-1 gap-2">
          <Button
            onClick={toggleDrawingMode}
            className="w-full flex items-center justify-center gap-2 whitespace-nowrap"
            variant={drawingMode ? "primary" : "outline"}
          >
            <span>{drawingMode ? "Disable" : "Enable"} Draw</span>
          </Button>
          <Button
            onClick={triggerFileInput}
            className="w-full flex items-center justify-center gap-2 whitespace-nowrap"
            variant="default"
          >
            <ImagePlus className="h-4 w-4" />
            <span>Upload artwork</span>
          </Button>

          <AIDesignGenerator activeCanvas={activeCanvas} manualSync={manualSync} />

          <Button
            onClick={handleAddText}
            className="w-full flex items-center justify-center gap-2 whitespace-nowrap"
            variant="secondary"
          >
            <Type className="h-4 w-4" />
            <span>Add text block</span>
          </Button>

          <Button
            onClick={handleAddLine}
            className="w-full flex items-center justify-center gap-2 whitespace-nowrap"
            variant="outline"
          >
            <Slash className="h-4 w-4" />
            <span>Guideline</span>
          </Button>
        </div>
      </div>

      <div className="toolbar-card p-3 space-y-3">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Quick Actions</p>
        <h4 className="font-semibold leading-tight">Editor controls</h4>
        <div className="grid grid-cols-1 gap-2">
          <Button onClick={handleZoomIn} className="w-full flex items-center justify-center gap-2 whitespace-nowrap" variant="outline"><ZoomIn className="h-4 w-4" /> Zoom In</Button>
          <Button onClick={handleZoomOut} className="w-full flex items-center justify-center gap-2 whitespace-nowrap" variant="outline"><ZoomOut className="h-4 w-4" /> Zoom Out</Button>
          <Button onClick={handleClearAll} className="w-full flex items-center justify-center gap-2 whitespace-nowrap" variant="outline"><Trash className="h-4 w-4" /> Clear Canvas</Button>
        </div>
      </div>

      <div className="toolbar-card p-3 space-y-2">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Brush Tools</p>
        <h4 className="font-semibold leading-tight">Paint style</h4>
        <div className="flex flex-col gap-2">
            <label className="text-sm">Brush Color</label>
            <input
              type="color"
              value={brushColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-20 h-10 p-0 border rounded"
            />
            <label className="text-sm">Brush Size</label>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={handleBrushSizeChange}
            />
          </div>
      </div>

      <div className="toolbar-card p-3 space-y-2">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Object Actions</p>
        <h4 className="font-semibold leading-tight">Modify selected object</h4>
        <div className="grid grid-cols-1 gap-2">
          <Button onClick={handleDelete} variant="destructive" className="w-full flex items-center justify-center gap-2 whitespace-nowrap"><Trash className="h-4 w-4" /> Remove</Button>
          <Button onClick={handleDuplicate} variant="secondary" className="w-full flex items-center justify-center gap-2 whitespace-nowrap">Duplicate</Button>
          <Button onClick={handleCenter} variant="outline" className="w-full flex items-center justify-center gap-2 whitespace-nowrap">Center</Button>
          <Button onClick={handleClearAll} variant="outline" className="w-full flex items-center justify-center gap-2 whitespace-nowrap"><Trash className="h-4 w-4" /> Clear all</Button>
        </div>
      </div>

      <div className="toolbar-card p-3">
        <SaveDesign />
      </div>
    </div>
  );
};

ToolBar.propTypes = {
  manualSync: PropTypes.func.isRequired,
};

export default ToolBar;
