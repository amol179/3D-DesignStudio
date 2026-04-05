import PropTypes from "prop-types";
import { useMemo } from "react";
import { CANVAS_CONFIG } from "@/constants/designConstants";
import { useTshirtCanvas } from "@/hooks/useTshirtCanvas";

const TshirtCanvasFront = ({ svgPath }) => {
  const { canvasRef, tshirtColor } = useTshirtCanvas({
    svgPath,
    view: "front",
    variant: "tshirt",
  });

  // CSS mask using the same SVG path — guarantees pixel-perfect alignment
  const maskStyle = useMemo(() => {
    const svgMask = `url("data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 810 900'><path d='${svgPath}' fill='white'/></svg>`
    )}")`;
    return {
      WebkitMaskImage: svgMask,
      maskImage: svgMask,
      WebkitMaskSize: "100% 100%",
      maskSize: "100% 100%",
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
    };
  }, [svgPath]);

  return (
    <div className="tshirt-stage">
      <svg
        viewBox="0 0 810 900"
        preserveAspectRatio="xMidYMid meet"
        className="tshirt-layer"
      >
        <path d={svgPath} fill={tshirtColor} stroke="#000" strokeWidth="1" />
        {/* Safe print zone guide */}
        <rect
          x="36"
          y="144"
          width="740"
          height="691"
          fill="none"
          stroke="#6B7280"
          strokeWidth="2"
          strokeDasharray="10,5"
          opacity="0.5"
        />
        {/* Safe zone label */}
        <text
          x="60"
          y="130"
          fontSize="20"
          fill="#6B7280"
          opacity="0.7"
          fontFamily="Arial"
        >
          Print Zone
        </text>
      </svg>
      <canvas
        ref={canvasRef}
        className="tshirt-layer tshirt-canvas z-10"
        width={CANVAS_CONFIG.width}
        height={CANVAS_CONFIG.height}
        style={maskStyle}
      />
    </div>
  );
};

TshirtCanvasFront.propTypes = {
  svgPath: PropTypes.string.isRequired,
};

export default TshirtCanvasFront;
