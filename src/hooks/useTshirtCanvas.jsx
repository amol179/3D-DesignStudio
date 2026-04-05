import { useCallback, useEffect, useRef } from "react";
import * as fabric from "fabric";
import { CANVAS_CONFIG } from "../constants/designConstants";
import { useDispatch, useSelector } from "react-redux";
import { useCanvas } from "@/hooks/useCanvas";
import canvasStorageManager from "@/utils/canvasStorageManager";
import { canvasSyncManager } from "@/utils/canvasSyncManager";

// Constants for safe print zone
const SAFE_ZONE_CONFIG = {
  minX: 20,
  minY: 80,
  maxX: 430,
  maxY: 480,
};

export const useTshirtCanvas = ({ svgPath, view, onDesignUpdate, variant = "tshirt" }) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const tshirtColor = useSelector((state) => state.tshirt.tshirtColor);
  const selectedView = useSelector((state) => state.tshirt.selectedView);
  const dispatch = useDispatch();

  const { setActiveCanvas, setSelectedObject, setFrontCanvas, setBackCanvas } =
    useCanvas();

  // Function to constrain object within safe zone
  const constrainObjectInBounds = useCallback((obj) => {
    if (!obj) return;
    
    const objBounds = obj.getBoundingRect();
    let adjusted = false;

    // Check left boundary
    if (objBounds.left < SAFE_ZONE_CONFIG.minX) {
      obj.left = SAFE_ZONE_CONFIG.minX + (obj.left - objBounds.left);
      adjusted = true;
    }

    // Check top boundary
    if (objBounds.top < SAFE_ZONE_CONFIG.minY) {
      obj.top = SAFE_ZONE_CONFIG.minY + (obj.top - objBounds.top);
      adjusted = true;
    }

    // Check right boundary
    if (objBounds.left + objBounds.width > SAFE_ZONE_CONFIG.maxX) {
      obj.left = SAFE_ZONE_CONFIG.maxX - objBounds.width + (obj.left - objBounds.left);
      adjusted = true;
    }

    // Check bottom boundary
    if (objBounds.top + objBounds.height > SAFE_ZONE_CONFIG.maxY) {
      obj.top = SAFE_ZONE_CONFIG.maxY - objBounds.height + (obj.top - objBounds.top);
      adjusted = true;
    }

    if (adjusted) {
      obj.setCoords();
    }

    return adjusted;
  }, []);

  // Function to save canvas objects
  const saveCanvas = useCallback(() => {
    if (fabricCanvasRef.current) {
      canvasStorageManager.saveCanvasObjects(view, fabricCanvasRef.current);
    }
  }, [view]);

  // Function to notify design changes
  const notifyDesignChange = useCallback(() => {
    if (fabricCanvasRef.current && onDesignUpdate) {
      const textureDataUrl = canvasSyncManager.getCanvasTexture(
        fabricCanvasRef.current,
      );
      onDesignUpdate(textureDataUrl);
    }
  }, [onDesignUpdate]);

  // Handle object movement to keep within bounds
  const handleObjectMovement = useCallback((e) => {
    if (e.target) {
      constrainObjectInBounds(e.target);
    }
  }, [constrainObjectInBounds]);

  // Handle object scaling to prevent distortion
  const handleObjectScaling = useCallback((e) => {
    if (e.target) {
      // Maintain aspect ratio for images
      if (e.target.type === "image") {
        const maxScale = Math.min(
          (SAFE_ZONE_CONFIG.maxX - SAFE_ZONE_CONFIG.minX) / e.target.width,
          (SAFE_ZONE_CONFIG.maxY - SAFE_ZONE_CONFIG.minY) / e.target.height
        );
        if (e.target.scaleX > maxScale) e.target.scaleX = maxScale;
        if (e.target.scaleY > maxScale) e.target.scaleY = maxScale;
      }
      constrainObjectInBounds(e.target);
    }
  }, [constrainObjectInBounds]);

  // Initialize Fabric.js Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      ...CANVAS_CONFIG,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;

    if (view === "front") setFrontCanvas(canvas);
    if (view === "back") setBackCanvas(canvas);

    if (selectedView === view) {
      setActiveCanvas(canvas);
    }

    // Save canvas data when the page is about to unload (refresh/close)
    window.addEventListener("beforeunload", saveCanvas);

    // Load saved objects
    const savedObjects = canvasStorageManager.loadCanvasObjects(view);
    if (savedObjects) {
      savedObjects.forEach((obj) => addFabricObject(canvas, obj));
      canvas.renderAll();
    }

    // Set canvas interaction defaults
    canvas.selection = true;
    canvas.defaultCursor = "default";
    canvas.hoverCursor = "move";
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.color = "#000000";
    canvas.freeDrawingBrush.width = 5;

    // Handle Object Selection
    canvas.on("selection:created", (e) => {
      setSelectedObject(e.selected[0]);
    });

    canvas.on("selection:updated", (e) => {
      setSelectedObject(e.selected[0]);
    });

    canvas.on("selection:cleared", () => {
      setSelectedObject(null);
    });

    // Listen for any changes on the canvas
    canvas.on("object:modified", (e) => {
      constrainObjectInBounds(e.target);
      notifyDesignChange();
    });
    canvas.on("object:added", notifyDesignChange);
    canvas.on("object:removed", notifyDesignChange);
    canvas.on("object:moving", handleObjectMovement);
    canvas.on("object:scaling", handleObjectScaling);

    // Cleanup
    return () => {
      saveCanvas();
      canvas.off("object:modified", notifyDesignChange);
      canvas.off("object:added", notifyDesignChange);
      canvas.off("object:removed", notifyDesignChange);
      canvas.off("object:moving", handleObjectMovement);
      canvas.off("object:scaling", handleObjectScaling);
      canvas.dispose();
      fabricCanvasRef.current = null;
      if (view === "front") setFrontCanvas(null);
      if (view === "back") setBackCanvas(null);
      if (selectedView === view) {
        setActiveCanvas(null);
      }
      setSelectedObject(null);
    };
  }, [
    dispatch,
    view,
    handleObjectMovement,
    handleObjectScaling,
    notifyDesignChange,
    constrainObjectInBounds,
    saveCanvas,
    selectedView,
    setActiveCanvas,
    setBackCanvas,
    setFrontCanvas,
    setSelectedObject,
  ]); // Runs on mount

  // Switch Active Canvas When View Changes
  useEffect(() => {
    if (selectedView === view && fabricCanvasRef.current) {
      setActiveCanvas(fabricCanvasRef.current);
    }
  }, [selectedView, dispatch, view, setActiveCanvas]);

  return { canvasRef, fabricCanvasRef, tshirtColor };
};

// Helper function to add objects to canvas
// Helper function to add objects to canvas
const addFabricObject = (canvas, objectData) => {
  switch (objectData.type) {
    case "Line": {
      const line = new fabric.Line([objectData.x1, objectData.y1, objectData.x2, objectData.y2], {
        left: objectData.left || 0,
        top: objectData.top || 0,
        stroke: objectData.stroke || "black",
        strokeWidth: objectData.strokeWidth || 2,
        strokeLineCap: objectData.strokeLineCap || "round",
        strokeLineJoin: objectData.strokeLineJoin || "miter",
        opacity: objectData.opacity || 1,
        angle: objectData.angle || 0,
        scaleX: objectData.scaleX || 1,
        scaleY: objectData.scaleY || 1,
        selectable: true,
        hasControls: true,
        hasBorders: true,
      });
      canvas.add(line);
      break;
    }
    case "Textbox": {
      const textbox = new fabric.Textbox(objectData.text, {
        left: objectData.left,
        top: objectData.top,
        width: objectData.width,
        fontSize: objectData.fontSize,
        fontFamily: objectData.fontFamily,
        textAlign: objectData.textAlign,
        fill: objectData.fill,
        scaleX: objectData.scaleX,
        scaleY: objectData.scaleY,
        angle: objectData.angle,
        opacity: objectData.opacity,
      });

      // Force text re-rendering and positioning
      textbox.initDimensions();
      textbox.set({
        width: textbox.width,
        height: textbox.height,
      });

      canvas.add(textbox);
      canvas.renderAll();
      break;
    }
    case "Image": {
      if (!objectData.src.startsWith("data:image")) return;
      const imgElement = new Image();
      imgElement.src = objectData.src;
      imgElement.onload = () => {
        // Calculate appropriate scale to fit within safe zone
        const maxWidth = SAFE_ZONE_CONFIG.maxX - SAFE_ZONE_CONFIG.minX - 40;
        const maxHeight = SAFE_ZONE_CONFIG.maxY - SAFE_ZONE_CONFIG.minY - 40;
        let initialScale = Math.min(maxWidth / imgElement.width, maxHeight / imgElement.height, 1);

        const fabricImg = new fabric.Image(imgElement, {
          left: objectData.left || 100,
          top: objectData.top || 100,
          scaleX: (objectData.scaleX || initialScale),
          scaleY: (objectData.scaleY || initialScale),
          angle: objectData.angle || 0,
          opacity: objectData.opacity || 1,
          selectable: true,
          hasControls: true,
          hasBorders: true,
          cornerStyle: "circle",
          transparentCorners: false,
          lockUniScaling: true, // Lock aspect ratio
          objectCaching: true,
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

        canvas.add(fabricImg);
        canvas.renderAll();
      };
      break;
    }
  }
};
