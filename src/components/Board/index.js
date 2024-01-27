import React, { useEffect, useLayoutEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { MENU_ITEMS } from "@/constants";
import { setActionMenuItem } from "@/slice/menuSlice";
import { socket } from "@/socket";

const Board = () => {
  const dispatch = useDispatch();
  const canvasRef = useRef(null);
  const drawHistory = useRef([]);
  const historyPointer = useRef(0);
  const shouldDraw = useRef(false);
  const { activeMenuItem, actionMenuItem } = useSelector((state) => state.menu);
  const { color, size } = useSelector((state) => state.toolbox[activeMenuItem]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (actionMenuItem === MENU_ITEMS.DOWNLOAD) {
      const URL = canvas.toDataURL();
      const anchor = document.createElement("a");
      anchor.href = URL;
      anchor.download = "sketch.jpg";
      anchor.click();
    } else if (
      actionMenuItem === MENU_ITEMS.UNDO ||
      actionMenuItem === MENU_ITEMS.REDO
    ) {
      if (historyPointer.current > 0 && actionMenuItem === MENU_ITEMS.UNDO) {
        historyPointer.current -= 1;
      } else if (
        historyPointer.current === 0 &&
        actionMenuItem === MENU_ITEMS.UNDO
      ) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        dispatch(setActionMenuItem(null));
        return;
      }
      if (
        historyPointer.current < drawHistory.current.length - 1 &&
        actionMenuItem === MENU_ITEMS.REDO
      )
        historyPointer.current += 1;
      const imageData = drawHistory.current[historyPointer.current];
      context.putImageData(imageData, 0, 0);
    } else if (actionMenuItem === MENU_ITEMS.CLEAR) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
    dispatch(setActionMenuItem(null));
  }, [actionMenuItem, dispatch]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const changeConfig = (color, size) => {
      context.strokeStyle = color;
      context.lineWidth = size;
    };

    const handleChangeConfig = (config) => {
      changeConfig(config.color, config.size);
    };

    changeConfig(color, size);
    socket.on("changeConfig", handleChangeConfig);

    return () => {
      socket.off("changeConfig", handleChangeConfig);
    };
  }, [color, size]);

  useLayoutEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const beginPath = (x, y) => {
      context.beginPath();
      context.moveTo(x, y);
    };

    const drawLine = (x, y) => {
      context.lineTo(x, y);
      context.stroke();
    };

    const handleMouseDown = (e) => {
      shouldDraw.current = true;
      beginPath(e.clientX, e.clientY);
      socket.emit("beginPath", { x: e.clientX, y: e.clientY });
    };

    const handleTouchStart = (e) => {
      e.preventDefault();

      if (e.touches.length === 1) {
        // Single touch - treat it as a normal drawing
        const touch = e.touches[0];

        handleMouseDown({
          clientX: touch.clientX,
          clientY: touch.clientY,
        });
      } else if (e.touches.length === 2) {
        // Two touches - initiate infinite scroll
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        const initialDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );

        const handleTouchMoveScroll = (e) => {
          e.preventDefault();

          if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];

            const currentDistance = Math.hypot(
              touch2.clientX - touch1.clientX,
              touch2.clientY - touch1.clientY
            );

            const distanceDelta = currentDistance - initialDistance;

            // Adjust canvas size based on the distance change
            canvas.width += distanceDelta * 2;
            canvas.height += distanceDelta * 2;
          }
        };

        const handleTouchEndScroll = (e) => {
          // Remove the scroll event listeners when the touches end
          document.removeEventListener("touchmove", handleTouchMoveScroll);
          document.removeEventListener("touchend", handleTouchEndScroll);
        };

        // Attach the scroll event listeners
        document.addEventListener("touchmove", handleTouchMoveScroll);
        document.addEventListener("touchend", handleTouchEndScroll);
      }
    };

    const handleTouchMove = (e) => {
      e.preventDefault();

      const touch = e.touches[0];

      handleMouseMove({
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
    };

    const handleTouchEnd = (e) => {
      handleMouseUp(e);
    };

    const handleMouseMove = (e) => {
      if (!shouldDraw.current) return;
      drawLine(e.clientX, e.clientY);
      beginPath(e.clientX, e.clientY);
      socket.emit("drawLine", { x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = (e) => {
      shouldDraw.current = false;
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      drawHistory.current.push(imageData);
      historyPointer.current = drawHistory.current.length - 1;
    };

    const handleBeginPath = (path) => {
      beginPath(path.x, path.y);
    };

    const handleDrawLine = (path) => {
      drawLine(path.x, path.y);
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchmove", handleTouchMove);
    canvas.addEventListener("touchend", handleTouchEnd);

    socket.on("beginPath", handleBeginPath);
    socket.on("drawLine", handleDrawLine);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);

      socket.off("beginPath", handleBeginPath);
      socket.off("drawLine", handleDrawLine);
    };
  }, []);

  return <canvas ref={canvasRef} />;
};

export default Board;
