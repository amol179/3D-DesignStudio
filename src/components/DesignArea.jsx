import { useSelector, useDispatch } from "react-redux";
import { TSHIRT_TYPES, TSHIRT_COLOR_CODES } from "../constants/designConstants";
import TshirtCanvasFront from "./TshirtCanvasFront";
import TshirtCanvasBack from "./TshirtCanvasBack";
import { setSelectedView, setTshirtColor } from "../features/tshirtSlice";
import { useCanvas } from "@/hooks/useCanvas";

const DesignArea = () => {
  const dispatch = useDispatch();
  const selectedView = useSelector((state) => state.tshirt.selectedView);
  const tshirtColor = useSelector((state) => state.tshirt.tshirtColor);
  const { activeCanvas, setSelectedObject } = useCanvas();

  const tshirtType = TSHIRT_TYPES["crew-neck"];
  const getSvgPath = (view) => {
    return view === "front" ? tshirtType.frontPath : tshirtType.backPath;
  };

  const handleViewChange = (view) => {
    if (view !== selectedView) {
      if (activeCanvas) {
        activeCanvas.discardActiveObject();
        activeCanvas.renderAll();
      }
      setSelectedObject(null);
      dispatch(setSelectedView(view));
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Compact header bar: color picker + view toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: color swatches */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {TSHIRT_COLOR_CODES.map((c) => (
              <button
                key={c}
                onClick={() => dispatch(setTshirtColor(c))}
                className={`w-5 h-5 rounded-full border-2 transition-all duration-150 hover:scale-125 ${
                  tshirtColor === c
                    ? "border-violet-400 ring-2 ring-violet-400/30 scale-110"
                    : "border-white/20"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Right: view toggle */}
        <div className="flex items-center gap-1 bg-white/5 rounded-xl px-1 py-1 border border-white/10">
          {["front", "back"].map((v) => (
            <button
              key={v}
              onClick={() => handleViewChange(v)}
              className={`text-xs font-medium px-4 py-1.5 rounded-lg transition-all duration-200 ${
                selectedView === v
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 relative flex items-center justify-center min-h-[340px] rounded-xl overflow-hidden bg-slate-950/40 border border-white/5">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-20" aria-hidden>
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }} />
        </div>

        <div className="relative z-10 w-full max-w-3xl px-2">
          <div className="canvas-shell relative w-full mx-auto max-w-2xl aspect-[9/10]">
            <div className="relative rounded-2xl overflow-hidden flex items-center justify-center bg-transparent">
              {selectedView === "front" && (
                <TshirtCanvasFront svgPath={getSvgPath("front")} variant="tshirt" />
              )}
              {selectedView === "back" && (
                <TshirtCanvasBack svgPath={getSvgPath("back")} variant="tshirt" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignArea;
