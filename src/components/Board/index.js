import { useEffect, useLayoutEffect, useRef } from "react";
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

    let isDrawing = false;

    const handleMouseDown = (e) => {
      isDrawing = true;
      shouldDraw.current = true;
      beginPath(e.clientX, e.clientY);
      socket.emit("beginPath", { x: e.clientX, y: e.clientY });
    };

    const handleTouchStart = (e) => {
      e.preventDefault();

      if (e.touches.length === 1) {
        isDrawing = true;
        const touch = e.touches[0];

        handleMouseDown({
          clientX: touch.clientX,
          clientY: touch.clientY,
        });
      }
    };

    const handleTouchMove = (e) => {
      if (isDrawing && e.touches.length === 1) {
        const touch = e.touches[0];
        // Replace e.clientX and e.clientY with touch.clientX and touch.clientY
        drawLine(touch.clientX, touch.clientY);
        socket.emit("drawLine", { x: touch.clientX, y: touch.clientY });
      } else if (e.touches.length === 2) {
        isDrawing = false;
        // Calculate the center point of the two fingers
        let centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        let centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

        if (initialCenter) {
          // Calculate the distance moved
          let dx = centerX - initialCenter.x;
          let dy = centerY - initialCenter.y;

          // Update the canvas position
          let transform = canvas.style.transform;
          transform += " translate(" + dx + "px, " + dy + "px)";
          canvas.style.transform = transform;
        }

        // Set the initial center for the next move event
        initialCenter = { x: centerX, y: centerY };
      }
    };

    const handleTouchEnd = (e) => {
      if (isDrawing && e.touches.length === 0) {
        isDrawing = false;
        shouldDraw.current = false;
        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
        drawHistory.current.push(imageData);
      } else if (e.touches.length < 2) {
        initialCenter = null; // Reset the initial center when a finger is lifted
      }
    };

    const handleMouseMove = (e) => {
      if (!shouldDraw.current) return;
      if (isDrawing) {
        drawLine(e.clientX, e.clientY);
        beginPath(e.clientX, e.clientY);
        socket.emit("drawLine", { x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = (e) => {
      isDrawing = false;
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

    let initialCenter = null;

    canvas.addEventListener(
      "touchmove",
      function (event) {
        if (event.touches.length === 2) {
          // Calculate the center point of the two fingers
          let centerX =
            (event.touches[0].clientX + event.touches[1].clientX) / 2;
          let centerY =
            (event.touches[0].clientY + event.touches[1].clientY) / 2;

          if (initialCenter) {
            // Calculate the distance moved
            let dx = centerX - initialCenter.x;
            let dy = centerY - initialCenter.y;

            // Update the canvas position
            let transform = canvas.style.transform;
            transform += " translate(" + dx + "px, " + dy + "px)";
            canvas.style.transform = transform;
          }

          // Set the initial center for the next move event
          initialCenter = { x: centerX, y: centerY };
        }
      },
      false
    );

    canvas.addEventListener(
      "touchend",
      function (event) {
        if (event.touches.length < 2) {
          initialCenter = null; // Reset the initial center when a finger is lifted
        }
      },
      false
    );

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
