import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const findMatchingItemIndex = (items, incomingItem) =>
  items.findIndex(
    (item) =>
      item.garmentType === incomingItem.garmentType &&
      item.color === incomingItem.color &&
      item.size === incomingItem.size &&
      item.view === incomingItem.view &&
      item.designSnapshot === incomingItem.designSnapshot,
  );

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action) => {
      const incomingItem = action.payload;
      const matchingIndex = findMatchingItemIndex(state.items, incomingItem);

      if (matchingIndex >= 0) {
        state.items[matchingIndex].quantity += incomingItem.quantity ?? 1;
        return;
      }

      state.items.push({
        ...incomingItem,
        quantity: incomingItem.quantity ?? 1,
      });
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const targetItem = state.items.find((item) => item.id === id);
      if (!targetItem) return;
      targetItem.quantity = Math.max(1, Number(quantity) || 1);
    },
    updateItemSize: (state, action) => {
      const { id, size } = action.payload;
      const targetItem = state.items.find((item) => item.id === id);
      if (!targetItem) return;
      targetItem.size = size;
    },
    clearCart: () => initialState,
  },
});

export const {
  addItem,
  removeItem,
  updateQuantity,
  updateItemSize,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
