import { useCallback, useRef, useState } from "react";

const MAX_HISTORY = 30;

/**
 * Provides undo/redo history for a Fabric.js canvas.
 * Usage:
 *   const { saveState, undo, redo, canUndo, canRedo } = useCanvasHistory(activeCanvas);
 *   // Call saveState() after every meaningful change.
 */
export const useCanvasHistory = (activeCanvas) => {
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const isRestoring = useRef(false);

  const syncFlags = useCallback(() => {
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(redoStack.current.length > 0);
  }, []);

  /** Capture the current canvas state onto the undo stack. */
  const saveState = useCallback(() => {
    if (!activeCanvas || isRestoring.current) return;
    try {
      const json = JSON.stringify(activeCanvas.toJSON());
      undoStack.current.push(json);
      if (undoStack.current.length > MAX_HISTORY) {
        undoStack.current.shift();
      }
      // Any new action clears the redo stack.
      redoStack.current = [];
      syncFlags();
    } catch {
      // Swallow serialisation errors silently.
    }
  }, [activeCanvas, syncFlags]);

  /** Restore a JSON state string onto the canvas. */
  const restoreState = useCallback(
    (json) => {
      if (!activeCanvas || !json) return;
      isRestoring.current = true;
      activeCanvas.loadFromJSON(JSON.parse(json), () => {
        activeCanvas.renderAll();
        isRestoring.current = false;
        syncFlags();
      });
    },
    [activeCanvas, syncFlags],
  );

  const undo = useCallback(() => {
    if (!activeCanvas || undoStack.current.length === 0) return;
    // Push current state onto redo before restoring.
    const currentJson = JSON.stringify(activeCanvas.toJSON());
    redoStack.current.push(currentJson);
    const prevState = undoStack.current.pop();
    restoreState(prevState);
  }, [activeCanvas, restoreState]);

  const redo = useCallback(() => {
    if (!activeCanvas || redoStack.current.length === 0) return;
    // Push current state onto undo before restoring.
    const currentJson = JSON.stringify(activeCanvas.toJSON());
    undoStack.current.push(currentJson);
    const nextState = redoStack.current.pop();
    restoreState(nextState);
  }, [activeCanvas, restoreState]);

  return { saveState, undo, redo, canUndo, canRedo };
};
