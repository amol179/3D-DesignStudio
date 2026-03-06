import { useDispatch, useSelector } from "react-redux";
import DesignArea from "./components/DesignArea";
import Header from "./components/Header";
import { Toaster } from "@/components/ui/toaster";
import { Canvas } from "@react-three/fiber";
import { Environment, Loader, OrbitControls } from "@react-three/drei";
import { setSelectedView } from "./features/tshirtSlice";
import { useCanvas } from "./hooks/useCanvas";
import { TshirtModel } from "./components/TShirtModel";
import { CapModel } from "./components/CapModel";
import { useCanvasTextureSync } from "./hooks/useCanvasTextureSync";
import { Suspense, useState, useEffect } from "react";
import { ToolsSidebar } from "./components/ToolsSidebar";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

function DesignerApp({ onBack }) {
  const tshirtColor = useSelector((state) => state.tshirt.tshirtColor);
  const selectedType = useSelector((state) => state.tshirt.selectedType);
  const selectedView = useSelector((state) => state.tshirt.selectedView);
  const dispatch = useDispatch();
  const { frontCanvas, backCanvas } = useCanvas();

  const { designTextureFront, designTextureBack, manualTriggerSync } =
    useCanvasTextureSync({
      frontCanvas,
      backCanvas,
      selectedView,
    });

  // Function to Manually trigger a texture sync
  const manualSync = () => {
    manualTriggerSync(selectedView);
  };

  // Function to update the selected view
  const handleViewChange = (view) => {
    if (view !== selectedView) {
      dispatch(setSelectedView(view));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf4e5] via-[#eef4ff] to-white text-foreground dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
      <div
        className="absolute -top-10 -left-10 h-48 w-48 rounded-full bg-amber-200/60 blur-3xl dark:bg-amber-500/20"
        aria-hidden
      />
      <div
        className="absolute -bottom-16 -right-20 h-60 w-60 rounded-full bg-sky-200/60 blur-3xl dark:bg-sky-500/20"
        aria-hidden
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12 relative z-10">
        <Header onBack={onBack} />

        <div className="mt-6 sm:mt-8 grid lg:grid-cols-[minmax(200px,240px)_1fr] gap-4 sm:gap-6 items-start">
          <ToolsSidebar manualSync={manualSync} />

          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="rounded-2xl border bg-card/80 shadow-xl backdrop-blur-sm p-3 sm:p-4">
              <div className="rounded-xl border bg-muted/40 p-3">
                <div className="w-full relative overflow-hidden rounded-xl responsive-3d">
                  <Canvas>
                    <OrbitControls
                      maxPolarAngle={Math.PI / 2}
                      minPolarAngle={Math.PI / 3}
                    />
                    <Suspense fallback={null}>
                      {selectedType === "cap" ? (
                        <CapModel
                          tshirtColor={tshirtColor}
                          onViewChange={handleViewChange}
                          designTexture={designTextureFront}
                        />
                      ) : (
                        <TshirtModel
                          tshirtColor={tshirtColor}
                          onViewChange={handleViewChange}
                          designTexture={designTextureFront}
                          designTextureBack={designTextureBack}
                        />
                      )}
                      <Environment preset="sunset" />
                    </Suspense>
                  </Canvas>
                  <Loader
                    containerStyles={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      background: "rgba(255, 255, 255, 0.6)",
                      pointerEvents: "none",
                    }}
                    dataStyles={{
                      color: "#0f172a",
                      fontSize: "14px",
                      fontWeight: "600",
                    }}
                    barStyles={{
                      backgroundColor: "#f59e0b",
                      height: "2px",
                    }}
                  />
                </div>
              </div>
              <div className="mt-3 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                <span>💡</span>
                <p className="font-semibold">
                  Click the 3D model to swap views.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border bg-card/80 shadow-xl backdrop-blur-sm p-3 sm:p-4">
              <div className="rounded-xl border bg-muted/40 p-3 sm:p-4">
                <DesignArea />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

function App() {
  const [view, setView] = useState("landing");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase authentication state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // User is logged in, set view to designer
        setView("designer");
      } else {
        // User is logged out, set view to landing
        setView("landing");
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      setView("landing");
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdf4e5] via-[#eef4ff] to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (view === "landing") {
    return (
      <LandingPage
        onStart={() => setView("designer")}
        onLogin={() => setView("login")}
        onSignup={() => setView("signup")}
      />
    );
  }

  if (view === "login") {
    return (
      <AuthPage
        initialMode="login"
        onBack={() => setView("landing")}
        onContinue={() => setView("designer")}
      />
    );
  }

  if (view === "signup") {
    return (
      <AuthPage
        initialMode="signup"
        onBack={() => setView("landing")}
        onContinue={() => setView("designer")}
      />
    );
  }

  return <DesignerApp onBack={handleLogout} />;
}

export default App;