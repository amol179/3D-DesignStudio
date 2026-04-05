import { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import DesignerPage from "./pages/DesignerPage";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useSelector, useDispatch } from "react-redux";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import { clearCart } from "./features/cartSlice";

function App() {
  const [view, setView] = useState("landing");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light");
  const [orderDetails, setOrderDetails] = useState(null);
  const cartCount = useSelector((state) =>
    state.cart.items.reduce((total, item) => total + (item.quantity || 0), 0),
  );
  const dispatch = useDispatch();

  useEffect(() => {
    const initialTheme =
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    // Listen to Firebase authentication state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // User is logged in, show the landing dashboard page first
        setView("landing");
      } else {
        // User is logged out
        setView("landing");
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!loading && !user && view === "designer") {
      setView("login");
    }
    if (!loading && user && (view === "login" || view === "signup")) {
      setView("landing");
    }
  }, [loading, user, view]);

  const handleGoLanding = () => {
    setView("landing");
  };

  const handleContinueToDashboard = () => {
    const currentAuthUser = auth.currentUser;
    setUser(currentAuthUser);
    setView("landing");
  };

  const handleOpenDesigner = () => setView("designer");
  const handleOpenCart = () => setView("cart");
  const handleOpenCheckout = () => setView("checkout");
  const handleOrderPlaced = (details) => {
    setOrderDetails(details);
    dispatch(clearCart());
    setView("success");
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      setUser(null);
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
        isAuthenticated={!!user}
        onStart={() => {
          if (user) {
            setView("designer");
          } else {
            setView("login");
          }
        }}
        onLogin={() => setView("login")}
        onSignup={() => setView("signup")}
        onLogout={handleLogout}
      />
    );
  }

  if (view === "cart") {
    return (
      <CartPage
        onBack={handleOpenDesigner}
        onCheckout={handleOpenCheckout}
        cartCount={cartCount}
      />
    );
  }

  if (view === "checkout") {
    return (
      <CheckoutPage
        onBack={handleOpenCart}
        onOrderPlaced={handleOrderPlaced}
        cartCount={cartCount}
      />
    );
  }

  if (view === "success") {
    return (
      <OrderSuccessPage
        orderDetails={orderDetails}
        onContinue={handleOpenDesigner}
        cartCount={cartCount}
      />
    );
  }

  if (view === "login") {
    return (
      <AuthPage
        initialMode="login"
        onBack={handleGoLanding}
        onContinue={handleContinueToDashboard}
      />
    );
  }

  if (view === "signup") {
    return (
      <AuthPage
        initialMode="signup"
        onBack={handleGoLanding}
        onContinue={handleContinueToDashboard}
      />
    );
  }

  return (
    <DesignerPage
      onLanding={handleGoLanding}
      onCart={handleOpenCart}
      cartCount={cartCount}
      onLogout={handleLogout}
    />
  );
}

export default App;
