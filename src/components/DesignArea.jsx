import { useSelector, useDispatch } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TSHIRT_TYPES } from "../constants/designConstants";
import TshirtCanvasFront from "./TshirtCanvasFront";
import TshirtCanvasBack from "./TshirtCanvasBack";
import { setSelectedView } from "../features/tshirtSlice";
import { useCanvas } from "@/hooks/useCanvas";

const viewMeta = {
  front: {
    label: "Front",
    hint: "Best for logos, hero art, and bold messaging.",
  },
  back: {
    label: "Back",
    hint: "Great for sponsor grids, statements, and numbers.",
  },
};

const DesignArea = () => {
  // Get values from Redux store
  const dispatch = useDispatch();
  const selectedType = useSelector((state) => state.tshirt.selectedType);
  const selectedView = useSelector((state) => state.tshirt.selectedView);
  const { activeCanvas, setSelectedObject } = useCanvas();

  const getSvgPath = (view) => {
    const tshirtType = TSHIRT_TYPES[selectedType];
    return view === "front" ? tshirtType.frontPath : tshirtType.backPath;
  };

  const handleViewChange = (view) => {
    if (view !== selectedView) {
      // Clear selected object before switching views
      if (activeCanvas) {
        activeCanvas.discardActiveObject();
        activeCanvas.renderAll();
      }
      setSelectedObject(null);
      dispatch(setSelectedView(view));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-2xl border bg-gradient-to-br from-white/90 via-slate-50/90 to-white/70 p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Canvas
            </p>
            <h3 className="text-lg font-semibold leading-tight">
              Design Surface
            </h3>
            <p className="text-sm text-muted-foreground">
              Switch views, refine placement, and preview the exact print zone.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {Object.entries(viewMeta).map(([key, meta]) => (
              <Button
                key={key}
                onClick={() => handleViewChange(key)}
                variant={selectedView === key ? "default" : "ghost"}
                className={`rounded-full border ${selectedView === key ? "shadow-md" : "border-dashed"}`}
              >
                {meta.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 text-amber-900 px-3 py-1 border border-amber-100">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            {viewMeta[selectedView].hint}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 text-slate-900 px-3 py-1 border border-slate-200">
            {TSHIRT_TYPES[selectedType].name}
          </span>
        </div>
      </div>

      {/* Conditional Rendering: Only show the selected canvas */}
      <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-50">
        <CardContent className="p-0">
          <div className="relative isolate">
            <div className="absolute inset-0 opacity-60" aria-hidden>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(255,255,255,0.05),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(125,211,252,0.1),transparent_28%),linear-gradient(120deg,rgba(15,23,42,0.65),rgba(15,23,42,0.95))]" />
              <div className="absolute inset-6 rounded-3xl border border-white/10" />
              <div className="absolute inset-6 rounded-3xl bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_60%)]" />
            </div>

            <div className="relative z-10 p-4 sm:p-6">
              <div className="aspect-square w-full max-w-3xl mx-auto grid place-items-center">
                <div className="relative w-full max-w-2xl">
                  <div
                    className="absolute inset-0 rounded-2xl bg-slate-950/60 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
                    aria-hidden
                  />
                  <div className="relative rounded-2xl overflow-hidden">
                    {selectedView === "front" && (
                      <TshirtCanvasFront svgPath={getSvgPath("front")} />
                    )}
                    {selectedView === "back" && (
                      <TshirtCanvasBack svgPath={getSvgPath("back")} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesignArea;
