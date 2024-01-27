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
  const pinchDistance = useRef(0);
  const offsetX = useRef(0);
  const offsetY = useRef(0);

  const { activeMenuItem, actionMenuItem } = useSelector((state) => state.menu);
  const { color, size } = useSelector((state) => state.toolbox[activeMenuItem]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // ... (unchanged code for handling other menu actions)

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
      beginPath(e.clientX - offsetX.current, e.clientY - offsetY.current);
      socket.emit("beginPath", {
        x: e.clientX - offsetX.current,
        y: e.clientY - offsetY.current,
      });
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
        // Two touches - initiate pinch gesture for zooming
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        pinchDistance.current = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
      }
    };

    const handleTouchMove = (e) => {
      e.preventDefault();

      if (e.touches.length === 1) {
        const touch = e.touches[0];

        if (shouldDraw.current) {
          handleMouseMove({
            clientX: touch.clientX,
            clientY: touch.clientY,
          });
        }
      } else if (e.touches.length === 2) {
        // Two touches - handle pinch gesture for zooming
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        const newPinchDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );

        // Calculate the pinch scale factor
        const scale = newPinchDistance / pinchDistance.current;

        // Update the offset to maintain the current drawing position
        offsetX.current *= scale;
        offsetY.current *= scale;

        pinchDistance.current = newPinchDistance;
      }
    };

    const handleTouchEnd = (e) => {
      if (e.touches.length === 0) {
        // No touches - end drawing
        handleMouseUp(e);
      }
    };

    const handleMouseMove = (e) => {
      if (!shouldDraw.current) return;
      drawLine(e.clientX - offsetX.current, e.clientY - offsetY.current);
      beginPath(e.clientX - offsetX.current, e.clientY - offsetY.current);
      socket.emit("drawLine", {
        x: e.clientX - offsetX.current,
        y: e.clientY - offsetY.current,
      });
    };

    const handleMouseUp = (e) => {
      shouldDraw.current = false;
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      drawHistory.current.push(imageData);
      historyPointer.current = drawHistory.current.length - 1;
    };

    const handleBeginPath = (path) => {
      beginPath(path.x + offsetX.current, path.y + offsetY.current);
    };

    const handleDrawLine = (path) => {
      drawLine(path.x + offsetX.current, path.y + offsetY.current);
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
