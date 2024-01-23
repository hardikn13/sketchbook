import { createSlice } from "@reduxjs/toolkit";
import { MENU_ITEMS } from "@/constants";

const initialState = {
  activeMenuItem: MENU_ITEMS.PENCIL,
  actionMenuItem: null,
};

export const menuSlice = createSlice({
  name: "menu",
  initialState: {},
  reducers: {
    setActiveMenuItem: (state, action) => {
      state.activeMenuItem = action.payload;
    },
    setActionMenuItem: (state, action) => {
      state.actionMenuItem = action.payload;
    },
  },
});

export const { setActiveMenuItem, setActionMenuItem } = menuSlice.actions;
export default menuSlice.reducer;
