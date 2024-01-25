import { createSlice } from "@reduxjs/toolkit";
import { MENU_ITEMS } from "@/constants";
import COLORS from "../constants";

const initialState = {
  [MENU_ITEMS.PENCIL]: {
    color: COLORS.BLACK,
    size: 4,
  },
  [MENU_ITEMS.ERASER]: {
    color: COLORS.WHITE,
    size: 4,
  },
  [MENU_ITEMS.UNDO]: null,
  [MENU_ITEMS.REDO]: null,
  [MENU_ITEMS.DOWNLOAD]: null,
};

export const toolboxSlice = createSlice({
  name: "toolbox",
  initialState,
  reducers: {
    changeColor: (state, action) => {
      state[action.payload.item].color = action.payload.color;
    },
    changeBrushSize: (state, action) => {
      state[action.payload.item].size = action.payload.size;
    },
  },
});

export const { changeColor, changeBrushSize } = toolboxSlice.actions;
export default toolboxSlice.reducer;
