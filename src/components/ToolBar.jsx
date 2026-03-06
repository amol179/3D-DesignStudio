import { useDispatch, useSelector } from "react-redux";
import * as fabric from "fabric";
import { Button } from "@/components/ui/button";
import { ImagePlus, Palette, Slash, Trash, Type, Wand2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CANVAS_CONFIG,
  DEFAULT_TEXT_CONFIG,
  TSHIRT_TYPES,
  TSHIRT_COLOR_CODES,
} from "../constants/designConstants";

import {
  setSelectedType,
  setTshirtColor,
  setSelectedView,
} from "../features/tshirtSlice";
import { useRef } from "react";
import SaveDesign from "./SaveDesign";
import { useCanvas } from "@/hooks/useCanvas";
import { FrontT } from "./FrontT";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import canvasStorageManager from "@/utils/canvasStorageManager";

const ToolBar = ({ manualSync }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null); // use for handle image input
  const selectedType = useSelector((state) => state.tshirt.selectedType);
  const { activeCanvas, selectedObject } = useCanvas();

  const handleTypeChange = (value) => {
    console.log("Selected Tshirt " + value);
    dispatch(setSelectedType(value));
    dispatch(setSelectedView("front"));
  };

  const handleColorChange = (color) => {
    dispatch(setTshirtColor(color));
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAddImage = (e) => {
    if (!activeCanvas || !e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const imgObj = new Image();
      imgObj.src = event.target.result;

      imgObj.onload = () => {
        const image = new fabric.Image(imgObj);

        // Calculate scaling to fit within canvas
        const maxWidth = CANVAS_CONFIG.width * 0.5;
        const maxHeight = CANVAS_CONFIG.height * 0.5;

        if (image.width > maxWidth || image.height > maxHeight) {
          const scale = Math.min(
            maxWidth / image.width,
            maxHeight / image.height,
          );
          image.scale(scale);
        }

        // Center the image
        image.set({
          left: (activeCanvas.width - image.getScaledWidth()) / 2,
          top: (activeCanvas.height - image.getScaledHeight()) / 2,
        });

        activeCanvas.add(image);
        activeCanvas.setActiveObject(image);
        activeCanvas.renderAll();
      };
    };

    reader.readAsDataURL(file);
    // Reset input value to allow uploading the same image again
    e.target.value = "";
  };

  const handleAddText = () => {
    if (!activeCanvas) return;

    const text = new fabric.Textbox("Add Your Text Here...", {
      ...DEFAULT_TEXT_CONFIG,
      left: activeCanvas.width / 2,
      top: activeCanvas.height / 2,
      width: 200,
      editable: false,
    });

    activeCanvas.add(text);
    activeCanvas.setActiveObject(text);
    activeCanvas.renderAll();
  };

  const handleAddLine = () => {
    if (!activeCanvas) return;

    const line = new fabric.Line([100, 200, 250, 200], {
      stroke: "black",
      strokeWidth: 3,
      selectable: true,
      hasControls: true,
      strokeLineCap: "round",
    });

    activeCanvas.add(line);
    activeCanvas.setActiveObject(line);
    activeCanvas.renderAll();
  };

  const handleDelete = () => {
    if (!activeCanvas || !selectedObject) return;

    activeCanvas.remove(selectedObject);
    activeCanvas.discardActiveObject();
    activeCanvas.renderAll();
    manualSync();
  };

  // Add a clear all function if needed
  const handleClearAll = () => {
    if (!activeCanvas) return;

    // Clear all objects from canvas
    activeCanvas.clear();

    // Clear storage for current view
    canvasStorageManager.clearCanvasStorage("all");

    // Re-initialize canvas with basic settings if needed
    activeCanvas.renderAll();
    manualSync();
  };

  return (
    <div className="flex flex-col gap-4 w-full min-w-[190px] md:min-w-[210px]">
      <div className="rounded-xl border bg-white/70 shadow-sm p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Setup
            </p>
            <h4 className="font-semibold leading-tight">Base garment</h4>
          </div>
          <Wand2 className="h-5 w-5 text-amber-500" />
        </div>

        <Select value={selectedType} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select T-Shirt" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {Object.entries(TSHIRT_TYPES).map(([value, { name }]) => (
                <SelectItem key={value} value={value}>
                  {name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button className="w-full justify-start gap-2" variant="secondary">
              <Palette />
              <span>Base color</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="ml-2 w-80">
            <div className="grid gap-4">
              <div className="space-y-1">
                <h4 className="font-semibold leading-tight">Palette</h4>
                <p className="text-sm text-muted-foreground">
                  Pick a print-ready cotton swatch.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {TSHIRT_COLOR_CODES.map((color) => (
                  <Button
                    key={color}
                    className="w-9 h-9 rounded-full p-0 border-2 border-white shadow-md hover:scale-105 transition"
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                  />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="rounded-xl border bg-white/70 shadow-sm p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Add
            </p>
            <h4 className="font-semibold leading-tight">Artwork & text</h4>
          </div>
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleAddImage}
          className="hidden"
        />
        <Button
          onClick={triggerFileInput}
          className="w-full justify-start gap-2"
          variant="default"
        >
          <ImagePlus />
          <span>Upload artwork</span>
        </Button>

        <Button
          onClick={handleAddText}
          className="w-full justify-start gap-2"
          variant="secondary"
        >
          <Type />
          <span>Add text block</span>
        </Button>

        <Button
          onClick={handleAddLine}
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <Slash />
          <span>Guideline</span>
        </Button>
      </div>

      <div className="rounded-xl border bg-white/70 shadow-sm p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Cleanup
            </p>
            <h4 className="font-semibold leading-tight">Housekeeping</h4>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleDelete}
            variant="destructive"
            className="justify-start gap-2"
          >
            <Trash />
            <span>Remove</span>
          </Button>
          <Button
            onClick={handleClearAll}
            variant="outline"
            className="justify-start gap-2"
          >
            <Trash />
            <span>Clear all</span>
          </Button>
        </div>
      </div>
      {/* <SaveDesign /> */}
    </div>
  );
};

export default ToolBar;
