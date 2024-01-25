import styles from "./index.module.css";
import COLORS from "../../constants";
import { MENU_ITEMS } from "@/constants";
import cx from "classnames";
import { useSelector, useDispatch } from "react-redux";
import { changeColor, changeBrushSize } from "@/slice/toolboxSlice";

const Toolbox = () => {
  const dispatch = useDispatch();
  const activeMenuItem = useSelector((state) => state.menu.activeMenuItem);
  const { color, size } = useSelector((state) => state.toolbox[activeMenuItem]);
  const showStrokeToolOptions = activeMenuItem === MENU_ITEMS.PENCIL;
  const showEraserToolOptions =
    activeMenuItem === MENU_ITEMS.ERASER ||
    activeMenuItem === MENU_ITEMS.PENCIL;

  const updateEraserSize = (e) => {
    dispatch(changeBrushSize({ item: activeMenuItem, size: e.target.value }));
  };

  const updateColor = (newColor) => {
    dispatch(changeColor({ item: activeMenuItem, color: newColor }));
  };

  return (
    <div className={styles.toolboxContainer}>
      {showStrokeToolOptions && (
        <div className={styles.toolItem}>
          <h4 className={styles.toolText}>Stroke Color</h4>
          <div className={styles.itemContainer}>
            <div
              className={cx(styles.colorBox, {
                [styles.active]: color === COLORS.BLACK,
              })}
              style={{
                border: "1px solid white",
                backgroundColor: COLORS.BLACK,
              }}
              onClick={() => updateColor(COLORS.BLACK)}
            />
            <div
              className={cx(styles.colorBox, {
                [styles.active]: color === COLORS.LIME,
              })}
              style={{ backgroundColor: COLORS.LIME }}
              onClick={() => updateColor(COLORS.LIME)}
            />
            <div
              className={cx(styles.colorBox, {
                [styles.active]: color === COLORS.RED,
              })}
              style={{ backgroundColor: COLORS.RED }}
              onClick={() => updateColor(COLORS.RED)}
            />
            <div
              className={cx(styles.colorBox, {
                [styles.active]: color === COLORS.GREEN,
              })}
              style={{ backgroundColor: COLORS.GREEN }}
              onClick={() => updateColor(COLORS.GREEN)}
            />
            <div
              className={cx(styles.colorBox, {
                [styles.active]: color === COLORS.BLUE,
              })}
              style={{ backgroundColor: COLORS.BLUE }}
              onClick={() => updateColor(COLORS.BLUE)}
            />
            <div
              className={cx(styles.colorBox, {
                [styles.active]: color === COLORS.YELLOW,
              })}
              style={{ backgroundColor: COLORS.YELLOW }}
              onClick={() => updateColor(COLORS.YELLOW)}
            />
            <div
              className={cx(styles.colorBox, {
                [styles.active]: color === COLORS.ORANGE,
              })}
              style={{ backgroundColor: COLORS.ORANGE }}
              onClick={() => updateColor(COLORS.ORANGE)}
            />
          </div>
          <div className={styles.itemContainer}>
            <div
              className={cx(styles.colorBox, {
                [styles.active]: color === COLORS.PURPLE,
              })}
              style={{ backgroundColor: COLORS.PURPLE }}
              onClick={() => updateColor(COLORS.PURPLE)}
            />
            <div
              className={cx(styles.colorBox, {
                [styles.active]: color === COLORS.PINK,
              })}
              style={{ backgroundColor: COLORS.PINK }}
              onClick={() => updateColor(COLORS.PINK)}
            />
            <div
              className={cx(styles.colorBox, {
                [styles.active]: color === COLORS.DARKBLUE,
              })}
              style={{ backgroundColor: COLORS.DARKBLUE }}
              onClick={() => updateColor(COLORS.DARKBLUE)}
            />
            <div
              className={cx(styles.colorBox, {
                [styles.active]: color === COLORS.GRAY,
              })}
              style={{ backgroundColor: COLORS.GRAY }}
              onClick={() => updateColor(COLORS.GRAY)}
            />
            <div
              className={cx(styles.colorBox, {
                [styles.active]: color === COLORS.CYAN,
              })}
              style={{ backgroundColor: COLORS.CYAN }}
              onClick={() => updateColor(COLORS.CYAN)}
            />
            <div
              className={cx(styles.colorBox, {
                [styles.active]: color === COLORS.BROWN,
              })}
              style={{ backgroundColor: COLORS.BROWN }}
              onClick={() => updateColor(COLORS.BROWN)}
            />
            <div
              className={cx(styles.colorBox, {
                [styles.active]: color === COLORS.WHITE,
              })}
              style={{
                border: "1px solid black",
                backgroundColor: COLORS.WHITE,
              }}
              onClick={() => updateColor(COLORS.WHITE)}
            />
          </div>
        </div>
      )}

      {showEraserToolOptions && (
        <div className={styles.toolItem}>
          <h4 className={styles.toolText}>Brush Size</h4>
          <div className={styles.itemContainer}>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              onChange={updateEraserSize}
              value={size}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Toolbox;
