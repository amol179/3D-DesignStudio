import { canvasSyncManager } from "@/utils/canvasSyncManager";
import { useCallback, useEffect, useRef, useState } from "react";

export const useCanvasTextureSync = (options = {}) => {
  const { frontCanvas, backCanvas, selectedView = "front" } = options;

  const [designTextureFront, setDesignTextureFront] = useState(null);
  const [designTextureBack, setDesignTextureBack] = useState(null);

  // Persistent cache for snapshots (survives re-renders and view switches)
  const snapshotCache = useRef({ front: null, back: null });

  // Capture a snapshot from a live canvas
  const captureSnapshot = useCallback((canvas, view) => {
    if (!canvas) return null;
    try {
      if (canvas.getObjects().length === 0) return snapshotCache.current[view];
      const dataURL = canvasSyncManager.getCanvasTexture(canvas);
      if (dataURL) {
        snapshotCache.current[view] = dataURL;
      }
      return dataURL;
    } catch {
      return snapshotCache.current[view];
    }
  }, []);

  // Front canvas: capture live + snapshot on unmount
  useEffect(() => {
    if (!frontCanvas) {
      // Canvas just unmounted — use cached snapshot
      if (snapshotCache.current.front) {
        setDesignTextureFront(snapshotCache.current.front);
      }
      return;
    }

    // Canvas is mounted — capture initial state
    const snap = captureSnapshot(frontCanvas, "front");
    if (snap) setDesignTextureFront(snap);

    // Listen for changes
    const onUpdate = canvasSyncManager.debounce(() => {
      const s = captureSnapshot(frontCanvas, "front");
      if (s) setDesignTextureFront(s);
    }, 100);

    const events = ["object:modified", "object:added", "object:removed", "path:created"];
    events.forEach((e) => frontCanvas.on(e, onUpdate));

    // Cleanup: snapshot before unmounting
    return () => {
      captureSnapshot(frontCanvas, "front");
      events.forEach((e) => frontCanvas.off(e, onUpdate));
    };
  }, [frontCanvas, captureSnapshot]);

  // Back canvas: same logic
  useEffect(() => {
    if (!backCanvas) {
      if (snapshotCache.current.back) {
        setDesignTextureBack(snapshotCache.current.back);
      }
      return;
    }

    const snap = captureSnapshot(backCanvas, "back");
    if (snap) setDesignTextureBack(snap);

    const onUpdate = canvasSyncManager.debounce(() => {
      const s = captureSnapshot(backCanvas, "back");
      if (s) setDesignTextureBack(s);
    }, 100);

    const events = ["object:modified", "object:added", "object:removed", "path:created"];
    events.forEach((e) => backCanvas.on(e, onUpdate));

    return () => {
      captureSnapshot(backCanvas, "back");
      events.forEach((e) => backCanvas.off(e, onUpdate));
    };
  }, [backCanvas, captureSnapshot]);

  const manualTriggerSync = useCallback(
    (view = "front") => {
      const canvas = view === "front" ? frontCanvas : backCanvas;
      const setter = view === "front" ? setDesignTextureFront : setDesignTextureBack;
      if (!canvas) return;
      const snap = captureSnapshot(canvas, view);
      if (snap) setter(snap);
    },
    [frontCanvas, backCanvas, captureSnapshot]
  );

  return {
    designTextureFront,
    designTextureBack,
    manualTriggerSync,
  };
};
