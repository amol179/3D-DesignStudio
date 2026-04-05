import PropTypes from "prop-types";
import { useEffect, useState, useCallback, useRef } from "react";
import { useCanvas } from "@/hooks/useCanvas";
import { useCanvasHistory } from "@/hooks/useCanvasHistory";
import { useToast } from "@/hooks/use-toast";
import * as fabric from "fabric";
import {
  MousePointer2,
  Pencil,
  Square,
  Circle,
  Triangle,
  Star,
  Slash,
  Type,
  ImagePlus,
  Sparkles,
  Undo2,
  Redo2,
  Palette,
  SunDim,
  ArrowUpToLine,
  ArrowDownToLine,
  FlipHorizontal2,
  FlipVertical2,
  Lock,
  Unlock,
  Copy,
  Trash2,
  ZoomIn,
  ZoomOut,
  Eraser,
  Save,
  Download,
} from "lucide-react";
import SaveDesign from "@/components/SaveDesign";
import AIDesignGenerator from "@/components/AIDesignGenerator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FONT_OPTIONS } from "@/constants/designConstants";

/* ────────────────────────────────────────────
   Reusable tiny button inside the toolbar
   ──────────────────────────────────────────── */
const ToolBtn = ({ icon: Icon, label, active, danger, onClick, disabled, children }) => (
  <TooltipProvider delayDuration={200}>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          disabled={disabled}
          className={`
            tool-btn relative flex items-center justify-center w-9 h-9 rounded-xl
            transition-all duration-200 ease-out
            ${active
              ? "bg-white/20 text-white shadow-lg shadow-white/10 scale-110"
              : danger
                ? "text-red-400 hover:bg-red-500/20 hover:text-red-300"
                : "text-white/70 hover:bg-white/10 hover:text-white hover:scale-105"
            }
            ${disabled ? "opacity-30 pointer-events-none" : ""}
          `}
        >
          {Icon && <Icon className="w-[18px] h-[18px]" />}
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs font-medium">
        {label}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const Divider = () => (
  <div className="w-px h-7 bg-white/10 mx-1 shrink-0" />
);

/* ────────────────────────────────────────────
   Main Bottom Toolbar
   ──────────────────────────────────────────── */
const BottomToolbar = ({ manualSync }) => {
  const { activeCanvas, selectedObject, setSelectedObject } = useCanvas();
  const { saveState, undo, redo, canUndo, canRedo } = useCanvasHistory(activeCanvas);
  const { toast } = useToast();

  // Tool modes
  const [activeTool, setActiveTool] = useState("select");
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [showContext, setShowContext] = useState(false);

  // Text context states
  const [textValue, setTextValue] = useState("");
  const [textFont, setTextFont] = useState("arial");
  const [textSize, setTextSize] = useState(20);
  const [textColor, setTextColor] = useState("#000000");

  // Object context states
  const [objOpacity, setObjOpacity] = useState(100);
  const [objLocked, setObjLocked] = useState(false);

  // Line context
  const [lineColor, setLineColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(2);

  // Export panel ref
  const [showExport, setShowExport] = useState(false);
  const colorInputRef = useRef(null);

  /* ── Sync context states when selection changes ── */
  useEffect(() => {
    if (!selectedObject) {
      setShowContext(false);
      return;
    }
    setShowContext(true);
    setObjOpacity(Math.round((selectedObject.opacity ?? 1) * 100));
    setObjLocked(selectedObject.lockMovementX && selectedObject.lockMovementY);

    if (selectedObject.type === "textbox") {
      setTextValue(selectedObject.text || "");
      setTextFont(selectedObject.fontFamily || "arial");
      setTextSize(selectedObject.fontSize || 20);
      setTextColor(selectedObject.fill || "#000000");
    }
    if (selectedObject.type === "line") {
      setLineColor(selectedObject.stroke || "#000000");
      setLineWidth(selectedObject.strokeWidth || 2);
    }
  }, [selectedObject]);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e) => {
      // Ignore when typing in an input/textarea
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedObject && activeCanvas) {
          e.preventDefault();
          handleDelete();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo, selectedObject, activeCanvas]);

  /* ── Save state after canvas modifications ── */
  useEffect(() => {
    if (!activeCanvas) return;
    const onModified = () => saveState();
    activeCanvas.on("object:modified", onModified);
    activeCanvas.on("object:added", onModified);
    activeCanvas.on("object:removed", onModified);
    return () => {
      activeCanvas.off("object:modified", onModified);
      activeCanvas.off("object:added", onModified);
      activeCanvas.off("object:removed", onModified);
    };
  }, [activeCanvas, saveState]);

  /* ── Helper: exit drawing mode ── */
  const exitDrawing = useCallback(() => {
    if (activeCanvas) {
      activeCanvas.isDrawingMode = false;
    }
    setActiveTool("select");
  }, [activeCanvas]);

  /* ── Tool actions ── */
  const selectMode = () => {
    exitDrawing();
    setActiveTool("select");
  };

  const drawMode = () => {
    if (!activeCanvas) return;
    const isOn = activeTool !== "draw";
    if (isOn) {
      activeCanvas.isDrawingMode = true;
      activeCanvas.freeDrawingBrush = activeCanvas.freeDrawingBrush || new fabric.PencilBrush(activeCanvas);
      activeCanvas.freeDrawingBrush.width = brushSize;
      activeCanvas.freeDrawingBrush.color = brushColor;
      setActiveTool("draw");
    } else {
      exitDrawing();
    }
    toast({ title: `Drawing ${isOn ? "enabled" : "disabled"}` });
  };

  /* ── Shape creation ── */
  const addShape = (type) => {
    if (!activeCanvas) return;
    exitDrawing();
    let shape;
    const center = { left: 200, top: 200 };
    switch (type) {
      case "rect":
        shape = new fabric.Rect({ ...center, width: 100, height: 80, fill: brushColor, rx: 4, ry: 4 });
        break;
      case "circle":
        shape = new fabric.Circle({ ...center, radius: 50, fill: brushColor });
        break;
      case "triangle":
        shape = new fabric.Triangle({ ...center, width: 100, height: 100, fill: brushColor });
        break;
      case "star": {
        const points = createStarPoints(5, 50, 25);
        shape = new fabric.Polygon(points, { ...center, fill: brushColor });
        break;
      }
      case "line":
        shape = new fabric.Line([50, 100, 250, 100], { ...center, stroke: brushColor, strokeWidth: 2 });
        break;
      default:
        return;
    }
    activeCanvas.add(shape);
    activeCanvas.setActiveObject(shape);
    activeCanvas.requestRenderAll();
    manualSync();
    toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} added` });
  };

  const addText = () => {
    if (!activeCanvas) return;
    exitDrawing();
    const text = new fabric.Textbox("Your Text", {
      left: 120, top: 150, width: 200, fontSize: 24, fill: "#000000",
      fontFamily: "arial",
    });
    activeCanvas.add(text);
    activeCanvas.setActiveObject(text);
    activeCanvas.requestRenderAll();
    manualSync();
    toast({ title: "Text added" });
  };

  const triggerFileInput = () => {
    const fi = document.getElementById("toolbar-file-input");
    if (fi) fi.click();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeCanvas) return;
    exitDrawing();
    const reader = new FileReader();
    reader.onload = (ev) => {
      const imgEl = new Image();
      imgEl.src = ev.target.result;
      imgEl.onload = () => {
        const scale = Math.min(410 / imgEl.width, 400 / imgEl.height, 1);
        const fabricImg = new fabric.Image(imgEl, {
          left: 225, top: 250, scaleX: scale, scaleY: scale,
          selectable: true, hasControls: true, hasBorders: true,
          cornerStyle: "circle", transparentCorners: false,
          lockUniScaling: true, objectCaching: true,
        });
        activeCanvas.add(fabricImg);
        activeCanvas.setActiveObject(fabricImg);
        activeCanvas.requestRenderAll();
        manualSync();
        toast({ title: "Image uploaded" });
      };
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  /* ── Object manipulation ── */
  const handleDelete = () => {
    if (!selectedObject || !activeCanvas) return;
    activeCanvas.remove(selectedObject);
    activeCanvas.discardActiveObject();
    setSelectedObject(null);
    activeCanvas.requestRenderAll();
    manualSync();
    toast({ title: "Deleted" });
  };

  const handleDuplicate = async () => {
    if (!selectedObject || !activeCanvas) return;
    try {
      const cloned = await selectedObject.clone();
      cloned.set({ left: selectedObject.left + 15, top: selectedObject.top + 15 });
      activeCanvas.add(cloned);
      activeCanvas.setActiveObject(cloned);
      activeCanvas.requestRenderAll();
      manualSync();
      toast({ title: "Duplicated" });
    } catch {
      toast({ title: "Could not duplicate", variant: "destructive" });
    }
  };

  const handleBringForward = () => {
    if (!selectedObject || !activeCanvas) return;
    activeCanvas.bringObjectForward(selectedObject);
    activeCanvas.requestRenderAll();
    manualSync();
  };

  const handleSendBackward = () => {
    if (!selectedObject || !activeCanvas) return;
    activeCanvas.sendObjectBackwards(selectedObject);
    activeCanvas.requestRenderAll();
    manualSync();
  };

  const handleFlipH = () => {
    if (!selectedObject || !activeCanvas) return;
    selectedObject.set("flipX", !selectedObject.flipX);
    activeCanvas.requestRenderAll();
    manualSync();
  };

  const handleFlipV = () => {
    if (!selectedObject || !activeCanvas) return;
    selectedObject.set("flipY", !selectedObject.flipY);
    activeCanvas.requestRenderAll();
    manualSync();
  };

  const handleToggleLock = () => {
    if (!selectedObject || !activeCanvas) return;
    const lock = !(selectedObject.lockMovementX && selectedObject.lockMovementY);
    selectedObject.set({
      lockMovementX: lock, lockMovementY: lock,
      lockScalingX: lock, lockScalingY: lock,
      lockRotation: lock, hasControls: !lock,
    });
    setObjLocked(lock);
    activeCanvas.requestRenderAll();
    toast({ title: lock ? "Locked" : "Unlocked" });
  };

  const handleOpacityChange = (val) => {
    if (!selectedObject || !activeCanvas) return;
    const op = Number(val) / 100;
    setObjOpacity(Number(val));
    selectedObject.set("opacity", op);
    activeCanvas.requestRenderAll();
    manualSync();
  };

  /* ── Zoom ── */
  const handleZoomIn = () => {
    if (!activeCanvas) return;
    const center = new fabric.Point(activeCanvas.width / 2, activeCanvas.height / 2);
    const newZoom = Math.min((activeCanvas.getZoom() || 1) * 1.15, 5);
    activeCanvas.zoomToPoint(center, newZoom);
  };

  const handleZoomOut = () => {
    if (!activeCanvas) return;
    const center = new fabric.Point(activeCanvas.width / 2, activeCanvas.height / 2);
    const newZoom = Math.max((activeCanvas.getZoom() || 1) / 1.15, 0.3);
    activeCanvas.zoomToPoint(center, newZoom);
  };

  const handleClearAll = () => {
    if (!activeCanvas) return;
    saveState();
    activeCanvas.clear();
    setSelectedObject(null);
    manualSync();
    toast({ title: "Canvas cleared" });
  };

  /* ── Brush colour / size ── */
  const handleBrushColorChange = (val) => {
    setBrushColor(val);
    if (activeCanvas?.freeDrawingBrush) {
      activeCanvas.freeDrawingBrush.color = val;
    }
  };

  const handleBrushSizeChange = (val) => {
    const s = Number(val);
    setBrushSize(s);
    if (activeCanvas?.freeDrawingBrush) {
      activeCanvas.freeDrawingBrush.width = s;
    }
  };

  /* ── Text context handlers ── */
  const handleTextChange = (v) => {
    setTextValue(v);
    if (selectedObject && activeCanvas) {
      selectedObject.set("text", v);
      activeCanvas.renderAll();
      manualSync();
    }
  };
  const handleTextFontChange = (v) => {
    setTextFont(v);
    if (selectedObject && activeCanvas) {
      selectedObject.set("fontFamily", v);
      activeCanvas.renderAll();
      manualSync();
    }
  };
  const handleTextSizeChange = (v) => {
    const n = parseInt(v, 10);
    if (isNaN(n) || n < 1) return;
    setTextSize(n);
    if (selectedObject && activeCanvas) {
      selectedObject.set("fontSize", n);
      activeCanvas.renderAll();
      manualSync();
    }
  };
  const handleTextColorChange = (v) => {
    setTextColor(v);
    if (selectedObject && activeCanvas) {
      selectedObject.set("fill", v);
      activeCanvas.renderAll();
      manualSync();
    }
  };

  /* ── Line context handlers ── */
  const handleLineColorChange = (v) => {
    setLineColor(v);
    if (selectedObject && activeCanvas) {
      selectedObject.set("stroke", v);
      activeCanvas.renderAll();
      manualSync();
    }
  };
  const handleLineWidthChange = (v) => {
    const n = parseInt(v, 10);
    if (isNaN(n) || n < 1) return;
    setLineWidth(n);
    if (selectedObject && activeCanvas) {
      selectedObject.set("strokeWidth", n);
      activeCanvas.renderAll();
      manualSync();
    }
  };

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */
  return (
    <>
      {/* Hidden file input */}
      <input id="toolbar-file-input" type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

      {/* ── Context Panel (slides up above toolbar when object selected) ── */}
      <div className={`context-panel ${showContext ? "context-panel--open" : ""}`}>
        {selectedObject?.type === "textbox" && (
          <div className="flex flex-wrap items-center gap-3 px-4 py-3">
            <label className="text-xs text-white/60 uppercase tracking-wider">Text</label>
            <input
              value={textValue}
              onChange={(e) => handleTextChange(e.target.value)}
              className="bg-white/10 text-white text-sm rounded-lg px-3 py-1.5 border border-white/10 w-36 focus:outline-none focus:ring-1 focus:ring-white/30"
            />
            <label className="text-xs text-white/60 uppercase tracking-wider">Font</label>
            <select
              value={textFont}
              onChange={(e) => handleTextFontChange(e.target.value)}
              className="bg-white/10 text-white text-sm rounded-lg px-2 py-1.5 border border-white/10 focus:outline-none"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value} className="bg-slate-800">{f.label}</option>
              ))}
            </select>
            <label className="text-xs text-white/60 uppercase tracking-wider">Size</label>
            <input
              type="number"
              value={textSize}
              min={1}
              onChange={(e) => handleTextSizeChange(e.target.value)}
              className="bg-white/10 text-white text-sm rounded-lg px-2 py-1.5 border border-white/10 w-16 focus:outline-none"
            />
            <label className="text-xs text-white/60 uppercase tracking-wider">Color</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => handleTextColorChange(e.target.value)}
              className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer bg-transparent"
            />
          </div>
        )}

        {selectedObject?.type === "line" && (
          <div className="flex flex-wrap items-center gap-3 px-4 py-3">
            <label className="text-xs text-white/60 uppercase tracking-wider">Line Color</label>
            <input
              type="color"
              value={lineColor}
              onChange={(e) => handleLineColorChange(e.target.value)}
              className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer bg-transparent"
            />
            <label className="text-xs text-white/60 uppercase tracking-wider">Weight</label>
            <input
              type="number"
              value={lineWidth}
              min={1}
              onChange={(e) => handleLineWidthChange(e.target.value)}
              className="bg-white/10 text-white text-sm rounded-lg px-2 py-1.5 border border-white/10 w-16 focus:outline-none"
            />
          </div>
        )}

        {selectedObject && (
          <div className="flex flex-wrap items-center gap-3 px-4 py-2 border-t border-white/5">
            <label className="text-xs text-white/60 uppercase tracking-wider">Opacity</label>
            <input
              type="range"
              min={0}
              max={100}
              value={objOpacity}
              onChange={(e) => handleOpacityChange(e.target.value)}
              className="w-24 accent-violet-400"
            />
            <span className="text-xs text-white/50 w-8">{objOpacity}%</span>

            <ToolBtn icon={ArrowUpToLine} label="Bring forward" onClick={handleBringForward} />
            <ToolBtn icon={ArrowDownToLine} label="Send backward" onClick={handleSendBackward} />
            <ToolBtn icon={FlipHorizontal2} label="Flip horizontal" onClick={handleFlipH} />
            <ToolBtn icon={FlipVertical2} label="Flip vertical" onClick={handleFlipV} />
            <ToolBtn icon={objLocked ? Lock : Unlock} label={objLocked ? "Unlock" : "Lock"} onClick={handleToggleLock} active={objLocked} />
            <ToolBtn icon={Copy} label="Duplicate" onClick={handleDuplicate} />
            <ToolBtn icon={Trash2} label="Delete" onClick={handleDelete} danger />
          </div>
        )}
      </div>

      {/* ── Main Toolbar ── */}
      <div className="bottom-toolbar">
        <div className="flex items-center gap-0.5 overflow-x-auto px-2 py-1.5 no-scrollbar">
          {/* Selection / Draw */}
          <ToolBtn icon={MousePointer2} label="Select (V)" active={activeTool === "select"} onClick={selectMode} />
          <ToolBtn icon={Pencil} label="Draw (B)" active={activeTool === "draw"} onClick={drawMode} />

          {activeTool === "draw" && (
            <div className="flex items-center gap-1.5 mx-1 px-2 py-1 bg-white/5 rounded-lg">
              <input
                type="color"
                value={brushColor}
                onChange={(e) => handleBrushColorChange(e.target.value)}
                className="w-6 h-6 rounded border border-white/20 cursor-pointer bg-transparent"
              />
              <input
                type="range"
                min={1}
                max={30}
                value={brushSize}
                onChange={(e) => handleBrushSizeChange(e.target.value)}
                className="w-16 accent-violet-400"
              />
            </div>
          )}

          <Divider />

          {/* Shapes */}
          <ToolBtn icon={Square} label="Rectangle" onClick={() => addShape("rect")} />
          <ToolBtn icon={Circle} label="Circle" onClick={() => addShape("circle")} />
          <ToolBtn icon={Triangle} label="Triangle" onClick={() => addShape("triangle")} />
          <ToolBtn icon={Star} label="Star" onClick={() => addShape("star")} />
          <ToolBtn icon={Slash} label="Line" onClick={() => addShape("line")} />

          <Divider />

          {/* Content */}
          <ToolBtn icon={Type} label="Add text" onClick={addText} />
          <ToolBtn icon={ImagePlus} label="Upload image" onClick={triggerFileInput} />
          <AIDesignGenerator activeCanvas={activeCanvas} manualSync={manualSync} toolbar />

          <Divider />

          {/* History */}
          <ToolBtn icon={Undo2} label="Undo (Ctrl+Z)" onClick={undo} disabled={!canUndo} />
          <ToolBtn icon={Redo2} label="Redo (Ctrl+Shift+Z)" onClick={redo} disabled={!canRedo} />

          <Divider />

          {/* Canvas */}
          <ToolBtn icon={ZoomIn} label="Zoom in" onClick={handleZoomIn} />
          <ToolBtn icon={ZoomOut} label="Zoom out" onClick={handleZoomOut} />
          <ToolBtn icon={Eraser} label="Clear canvas" onClick={handleClearAll} danger />

          <Divider />

          {/* Export */}
          <ToolBtn icon={Download} label="Export" onClick={() => setShowExport(!showExport)} active={showExport} />
        </div>

        {/* Export sub‑panel */}
        {showExport && (
          <div className="absolute bottom-full mb-2 right-2 z-50 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl w-72">
            <SaveDesign />
          </div>
        )}
      </div>
    </>
  );
};

/* ── Helper: star polygon points ── */
function createStarPoints(numPoints, outerR, innerR) {
  const pts = [];
  const step = Math.PI / numPoints;
  for (let i = 0; i < 2 * numPoints; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    pts.push({ x: r * Math.cos(angle), y: r * Math.sin(angle) });
  }
  return pts;
}

BottomToolbar.propTypes = {
  manualSync: PropTypes.func.isRequired,
};

export default BottomToolbar;
