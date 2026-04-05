import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import Header from "../components/Header";
import DesignArea from "../components/DesignArea";
import BottomToolbar from "../components/BottomToolbar";
import { Toaster } from "@/components/ui/toaster";
import { Canvas } from "@react-three/fiber";
import { Environment, Loader, OrbitControls } from "@react-three/drei";
import { setSelectedView } from "../features/tshirtSlice";
import { useCanvas } from "../hooks/useCanvas";
import { TshirtModel } from "../components/TShirtModel";
import { useCanvasTextureSync } from "../hooks/useCanvasTextureSync";
import { Suspense } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addItem } from "@/features/cartSlice";
import { AVAILABLE_SIZES, GARMENT_PRICES } from "@/constants/pricingConstants";
import { TSHIRT_TYPES } from "@/constants/designConstants";
import { ShoppingBag } from "lucide-react";
import { canvasSyncManager } from "@/utils/canvasSyncManager";
import { useState } from "react";

function DesignerPage({ onLanding, onCart, cartCount }) {
  const tshirtColor = useSelector((state) => state.tshirt.tshirtColor);
  const selectedView = useSelector((state) => state.tshirt.selectedView);
  const dispatch = useDispatch();
  const { frontCanvas, backCanvas } = useCanvas();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState("M");

  const { manualTriggerSync, designTextureFront, designTextureBack } =
    useCanvasTextureSync({
      frontCanvas,
      backCanvas,
      selectedView,
    });

  const manualSync = () => {
    manualTriggerSync(selectedView);
  };

  const handleViewChange = (view) => {
    if (view !== selectedView) {
      dispatch(setSelectedView(view));
    }
  };



  const handleAddToCart = async () => {
    const activeCanvas = selectedView === "front" ? frontCanvas : backCanvas;

    if (!activeCanvas || activeCanvas.getObjects().length === 0) {
      toast({
        variant: "destructive",
        title: "No design to add",
        description: "Create a design on the current view before adding it to cart.",
      });
      return;
    }

    const designSnapshot = canvasSyncManager.getCanvasTexture(activeCanvas);
    if (!designSnapshot) {
      toast({
        variant: "destructive",
        title: "Preview unavailable",
        description: "We could not capture the current design snapshot.",
      });
      return;
    }

    const garmentPrice = GARMENT_PRICES["crew-neck"];

    dispatch(
      addItem({
        id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
        garmentType: "crew-neck",
        garmentName: TSHIRT_TYPES["crew-neck"]?.name || "T-Shirt",
        color: tshirtColor,
        size: selectedSize,
        view: selectedView,
        designSnapshot,
        unitPrice: garmentPrice,
        quantity: 1,
      }),
    );

    toast({
      title: "Added to cart",
      description: `${TSHIRT_TYPES["crew-neck"]?.name || "T-Shirt"} in size ${selectedSize} was added to your cart.`,
    });
  };

  return (
    <div className="designer-page min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-cyan-600/8 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-20 px-4 pt-3">
        <Header
          isAuthenticated={true}
          onDashboard={onLanding}
          onCart={onCart}
          cartCount={cartCount}
          showLogout={false}
          hideDashboardButton={false}
          dashboardLabel="Back to Dashboard"
        />
      </div>

      <div className="relative z-20 px-4 pt-3">
        <div className="panel-surface flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/40">Cart Prep</p>
            <p className="text-sm text-white/70">Choose size, capture the active view, and add it to cart.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-[140px]">
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAddToCart}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold"
            >
              <ShoppingBag className="h-4 w-4" />
              Add to Cart
            </Button>
            <Button variant="outline" onClick={onCart}>
              View Cart
            </Button>
          </div>
        </div>
      </div>

      {/* Main editor area — 2 column */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row gap-4 px-4 py-4 pb-24 overflow-hidden">
        {/* Left: 3D Preview */}
        <div className="lg:w-[42%] xl:w-[40%] flex flex-col gap-3 min-h-0">
          <div className="panel-surface flex-1 flex flex-col p-3 min-h-[300px]">
            <div className="rounded-xl bg-slate-950/60 border border-white/5 flex-1 relative overflow-hidden">
              <Canvas
                camera={{ position: [0, 0, 2.5], fov: 45 }}
                dpr={[1, 2]}
                gl={{ antialias: true, preserveDrawingBuffer: true }}
              >
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={0.8} />
                <directionalLight position={[-3, 3, -3]} intensity={0.3} />
                <OrbitControls
                  maxPolarAngle={Math.PI / 2}
                  minPolarAngle={Math.PI / 3}
                  enableDamping
                  dampingFactor={0.08}
                />
                <Suspense fallback={null}>
                  <TshirtModel
                    tshirtColor={tshirtColor}
                    onViewChange={handleViewChange}
                    designTexture={designTextureFront}
                    designTextureBack={designTextureBack}
                  />
                  <Environment preset="sunset" />
                </Suspense>
              </Canvas>
              <Loader
                containerStyles={{
                  position: "absolute",
                  top: 0, left: 0, width: "100%", height: "100%",
                  background: "rgba(0,0,0,0.5)",
                  pointerEvents: "none",
                }}
                dataStyles={{ color: "#fff", fontSize: "13px", fontWeight: "600" }}
                barStyles={{ backgroundColor: "#a78bfa", height: "2px" }}
              />
            </div>
            <div className="mt-2 text-center text-xs text-white/40 flex items-center justify-center gap-1.5">
              <span>💡</span>
              <span className="font-medium">Click the 3D model to swap views</span>
            </div>
          </div>
        </div>

        {/* Right: Design Canvas */}
        <div className="lg:flex-1 flex flex-col min-h-0">
          <div className="panel-surface flex-1 flex flex-col p-3 overflow-hidden">
            <DesignArea />
          </div>
        </div>
      </div>

      {/* Bottom Toolbar */}
      <BottomToolbar manualSync={manualSync} />

      <Toaster />
    </div>
  );
}

DesignerPage.propTypes = {
  onLanding: PropTypes.func.isRequired,
  onCart: PropTypes.func.isRequired,
  cartCount: PropTypes.number.isRequired,
};

export default DesignerPage;
