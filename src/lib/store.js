import { configureStore } from "@reduxjs/toolkit";
import tshirtReducer from "../features/tshirtSlice";
import cartReducer from "../features/cartSlice";
// import canvasReducer from "../features/canvasSlice";

const loadCartState = () => {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const stored = window.localStorage.getItem("design-studio-cart");
    if (!stored) {
      return undefined;
    }

    const parsed = JSON.parse(stored);
    return parsed?.items ? parsed : undefined;
  } catch {
    return undefined;
  }
};

const preloadedCartState = loadCartState();

export const store = configureStore({
  preloadedState: preloadedCartState ? { cart: preloadedCartState } : undefined,
  reducer: {
    tshirt: tshirtReducer,
    cart: cartReducer,
    // canvas: canvasReducer,
  },
});

if (typeof window !== "undefined") {
  store.subscribe(() => {
    try {
      const state = store.getState();
      window.localStorage.setItem(
        "design-studio-cart",
        JSON.stringify(state.cart),
      );
    } catch {
      // Ignore localStorage write failures.
    }
  });
}

export default store;
