import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faEraser,
  faRotateLeft,
  faRotateRight,
  faCircleDown,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./index.module.css";
import { useSelector, useDispatch } from "react-redux";
import { MENU_ITEMS } from "@/constants";
import { setActiveMenuItem, setActionMenuItem } from "@/slice/menuSlice";

const Menu = () => {
  const dispatch = useDispatch();

  const handleMenuClick = (menuItem) => {
    dispatch(setActiveMenuItem(menuItem));
  };

  const handleActionItemClick = (menuItem) => {
    dispatch(setActionMenuItem(menuItem));
  };

  return (
    <div className={styles.menuContainer}>
      <div
        className={styles.iconWrapper}
        onClick={() => handleMenuClick(MENU_ITEMS.PENCIL)}
      >
        <FontAwesomeIcon icon={faPencil} className={styles.icon} />
      </div>
      <div
        className={styles.iconWrapper}
        onClick={() => handleMenuClick(MENU_ITEMS.ERASER)}
      >
        <FontAwesomeIcon icon={faEraser} className={styles.icon} />
      </div>
      <div
        className={styles.iconWrapper}
        onClick={() => handleActionItemClick(MENU_ITEMS.UNDO)}
      >
        <FontAwesomeIcon icon={faRotateLeft} className={styles.icon} />
      </div>
      <div
        className={styles.iconWrapper}
        onClick={() => handleActionItemClick(MENU_ITEMS.REDO)}
      >
        <FontAwesomeIcon icon={faRotateRight} className={styles.icon} />
      </div>
      <div
        className={styles.iconWrapper}
        onClick={() => handleActionItemClick(MENU_ITEMS.DOWNLOAD)}
      >
        <FontAwesomeIcon icon={faCircleDown} className={styles.icon} />
      </div>
    </div>
  );
};

export default Menu;
