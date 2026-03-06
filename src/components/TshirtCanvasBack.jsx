import { CANVAS_CONFIG } from "@/constants/designConstants";
import { useTshirtCanvas } from "@/hooks/useTshirtCanvas";

const TshirtCanvasBack = ({ svgPath }) => {
  const { canvasRef, tshirtColor } = useTshirtCanvas({
    svgPath,
    view: "back",
  });

  return (
    <div className="tshirt-stage">
      <svg
        viewBox="0 0 810 810"
        preserveAspectRatio="xMidYMid meet"
        className="tshirt-layer"
      >
        <path d={svgPath} fill={tshirtColor} stroke="#000" strokeWidth="1" />
      </svg>
      <canvas
        ref={canvasRef}
        className="tshirt-layer tshirt-canvas z-10"
        width={CANVAS_CONFIG.width}
        height={CANVAS_CONFIG.height}
      />
    </div>
  );
};

export default TshirtCanvasBack;
