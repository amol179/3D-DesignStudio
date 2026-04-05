import { STORAGE_KEYS } from "./canvasStorageManager";
import * as fabric from "fabric";
// canvasSyncManager.js
export const canvasSyncManager = {
  getCanvasTexture: (fabricCanvas) => {
    if (!fabricCanvas) return null;
    try {
      // Force a render before getting the texture
      fabricCanvas.renderAll();

      // Use the upper canvas which contains the actual visible content
      const dataURL = fabricCanvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 1,
        enableRetinaScaling: true,
      });

      return dataURL;
    } catch (error) {
      console.error("Error generating texture:", error);
      return null;
    }
  },

  getCanvasTextureFromStorage: async (view) => {
    try {
      const storageKey =
        view === "front"
          ? STORAGE_KEYS.FRONT_CANVAS
          : STORAGE_KEYS.BACK_CANVAS;

      const storedObjects = localStorage.getItem(storageKey);
      if (!storedObjects) {
        return null;
      }

      const parsedObjects = JSON.parse(storedObjects);
      if (!parsedObjects || parsedObjects.length === 0) {
        return null;
      }

      // Create a temporary canvas
      const tempCanvas = new fabric.Canvas(null, {
        width: 450,
        height: 500,
      });

      // Fabric v6+ returns a Promise from enlivenObjects
      try {
        const objects = await fabric.util.enlivenObjects(parsedObjects);
        objects.forEach((obj) => {
          tempCanvas.add(obj);
        });
      } catch (enlivenError) {
        console.error("Error enlivening objects:", enlivenError);
        return null;
      }

      const dataURL = tempCanvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 1,
        enableRetinaScaling: true,
      });

      // Cleanup temp canvas
      tempCanvas.dispose();

      return dataURL;
    } catch (error) {
      console.error("Error retrieving canvas texture from storage:", error);
      return null;
    }
  },

  // utility function
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
};
