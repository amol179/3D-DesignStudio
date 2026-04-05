import { CANVAS_CONFIG, TSHIRT_TYPES } from "@/constants/designConstants";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function createGarmentSvg({ garmentType, color, view }) {
  const garment = TSHIRT_TYPES[garmentType] || TSHIRT_TYPES["crew-neck"];
  const path = view === "back" ? garment.backPath : garment.frontPath;

  const svgElem = document.createElementNS(SVG_NAMESPACE, "svg");
  svgElem.setAttribute("xmlns", SVG_NAMESPACE);
  svgElem.setAttribute("viewBox", "0 0 810 810");
  svgElem.setAttribute("width", String(CANVAS_CONFIG.width));
  svgElem.setAttribute("height", String(CANVAS_CONFIG.height));

  const background = document.createElementNS(SVG_NAMESPACE, "rect");
  background.setAttribute("width", "810");
  background.setAttribute("height", "810");
  background.setAttribute("fill", "#f8fafc");
  svgElem.appendChild(background);

  const garmentPath = document.createElementNS(SVG_NAMESPACE, "path");
  garmentPath.setAttribute("d", path);
  garmentPath.setAttribute("fill", color || "#ffffff");
  garmentPath.setAttribute("stroke", "#0f172a");
  garmentPath.setAttribute("stroke-width", "2");
  svgElem.appendChild(garmentPath);

  return svgElem;
}

export async function buildGarmentPreviewDataUrl(item) {
  if (typeof document === "undefined") return null;

  const width = CANVAS_CONFIG.width;
  const height = CANVAS_CONFIG.height;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const garmentSvg = createGarmentSvg(item);
  const svgString = new XMLSerializer().serializeToString(garmentSvg);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    const garmentImg = await loadImage(url);
    ctx.drawImage(garmentImg, 0, 0, width, height);

    if (item.designSnapshot) {
      const designImg = await loadImage(item.designSnapshot);
      ctx.drawImage(designImg, 0, 0, width, height);
    }

    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error("Failed to build garment preview:", error);
    return item.designSnapshot || null;
  } finally {
    URL.revokeObjectURL(url);
  }
}
