'use client';

import { useState, useCallback, useEffect, useRef } from "react";

export function useCanvasInteraction(
  canvasRef,
  images,
  setImages,
  selectedImageId,
  setSelectedImageId,
  getCanvasCoordinates,
  brandElement = null,
  onBrandElementClick = null,
  onBrandPositionUpdate = null,
) {
  // Drag and resize state
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState(null);
  const [resizeStart, setResizeStart] = useState(null); // Store original image state
  
  // Use refs for brand dragging to avoid closure issues
  const isDraggingBrandRef = useRef(false);
  const brandDragStartRef = useRef({ x: 0, y: 0 });

  // Check if click is on resize handle
  const getResizeHandle = useCallback((x, y, img) => {
    const handleSize = 16; // Larger hit area for easier interaction
    const handles = {
      nw: { x: img.x - handleSize / 2, y: img.y - handleSize / 2 },
      ne: { x: img.x + img.width - handleSize / 2, y: img.y - handleSize / 2 },
      sw: { x: img.x - handleSize / 2, y: img.y + img.height - handleSize / 2 },
      se: {
        x: img.x + img.width - handleSize / 2,
        y: img.y + img.height - handleSize / 2,
      },
      n: {
        x: img.x + img.width / 2 - handleSize / 2,
        y: img.y - handleSize / 2,
      },
      s: {
        x: img.x + img.width / 2 - handleSize / 2,
        y: img.y + img.height - handleSize / 2,
      },
      w: {
        x: img.x - handleSize / 2,
        y: img.y + img.height / 2 - handleSize / 2,
      },
      e: {
        x: img.x + img.width - handleSize / 2,
        y: img.y + img.height / 2 - handleSize / 2,
      },
    };

    for (const [handle, pos] of Object.entries(handles)) {
      if (
        x >= pos.x &&
        x <= pos.x + handleSize &&
        y >= pos.y &&
        y <= pos.y + handleSize
      ) {
        return handle;
      }
    }
    return null;
  }, []);

  // Mouse down handler for canvas
  const handleCanvasMouseDown = useCallback(
    (e) => {
      const { x, y } = getCanvasCoordinates(e);

      // Check if we clicked on brand element first
      if (brandElement && images.length > 0 && onBrandElementClick) {
        // ALWAYS use stored position - brand should NEVER move with image
        if (brandElement.position && brandElement.position.x !== undefined && brandElement.position.y !== undefined) {
          const brandCenterX = brandElement.position.x;
          const brandCenterY = brandElement.position.y;

        let brandX, brandY, brandWidth, brandHeight;

        if (brandElement.type === "logo") {
          const logoSize = brandElement.style?.size || 24;
          const hitPadding = 10; // Extra padding for easier clicking
          brandX = brandCenterX - logoSize / 2 - hitPadding;
          brandY = brandCenterY - hitPadding;
          brandWidth = logoSize + hitPadding * 2;
          brandHeight = logoSize + hitPadding * 2;
        } else if (brandElement.type === "name") {
          const fontSize = brandElement.style?.size || 16;
          const textWidth = brandElement.data.length * fontSize * 0.6; // Approximate text width
          const hitPadding = 10; // Extra padding for easier clicking
          brandX = brandCenterX - textWidth / 2 - hitPadding;
          brandY = brandCenterY - hitPadding;
          brandWidth = textWidth + hitPadding * 2;
          brandHeight = fontSize * 1.5 + hitPadding * 2; // Increase hit area height
        }

        if (
          x >= brandX &&
          x <= brandX + brandWidth &&
          y >= brandY &&
          y <= brandY + brandHeight
        ) {
          // Check if it's a double-click for editing
          const now = Date.now();
          const timeSinceLastClick = now - (window.lastBrandClickTime || 0);
          window.lastBrandClickTime = now;
          
          if (timeSinceLastClick < 300) {
            // Double-click - open editor
            onBrandElementClick();
          } else {
            // Single click - start dragging
            isDraggingBrandRef.current = true;
            brandDragStartRef.current = { x: x - brandCenterX, y: y - brandCenterY };
          }
          return;
        }
        }
      }

      // Check if we clicked on an image (from top to bottom)
      let clickedImageId = null;
      let clickedImage = null;

      for (let i = images.length - 1; i >= 0; i--) {
        const img = images[i];
        if (
          x >= img.x &&
          x <= img.x + img.width &&
          y >= img.y &&
          y <= img.y + img.height
        ) {
          clickedImageId = img.id;
          clickedImage = img;
          break;
        }
      }

      if (clickedImage) {
        setSelectedImageId(clickedImageId);

        // Check if we clicked on a resize handle
        const handle = getResizeHandle(x, y, clickedImage);
        if (handle) {
          setIsResizing(true);
          setResizeHandle(handle);
          setDragStart({ x, y });
          // Store the original image state when resize starts
          setResizeStart({
            x: clickedImage.x,
            y: clickedImage.y,
            width: clickedImage.width,
            height: clickedImage.height,
          });
        } else {
          // Start dragging
          setIsDragging(true);
          setDragStart({ x: x - clickedImage.x, y: y - clickedImage.y });
        }
      } else {
        setSelectedImageId(null);
      }
    },
    [images, getCanvasCoordinates, getResizeHandle, setSelectedImageId, brandElement, onBrandElementClick, onBrandPositionUpdate],
  );

  // Mouse move handler
  const handleCanvasMouseMove = useCallback(
    (e) => {
      const { x, y } = getCanvasCoordinates(e);

      if (isDraggingBrandRef.current && brandElement && onBrandPositionUpdate) {
        const newX = x - brandDragStartRef.current.x;
        const newY = y - brandDragStartRef.current.y;
        onBrandPositionUpdate({ x: newX, y: newY });
      } else if (isDragging && selectedImageId) {
        setImages((prev) =>
          prev.map((img) =>
            img.id === selectedImageId
              ? { ...img, x: x - dragStart.x, y: y - dragStart.y }
              : img,
          ),
        );
      } else if (isResizing && selectedImageId && resizeHandle && resizeStart) {
        const selectedImage = images.find((img) => img.id === selectedImageId);
        if (!selectedImage) return;

        setImages((prev) =>
          prev.map((img) => {
            if (img.id !== selectedImageId) return img;

            // Calculate delta from the ORIGINAL start position
            const deltaX = x - dragStart.x;
            const deltaY = y - dragStart.y;
            let newImg = { ...img };

            // Calculate aspect ratio - use current dimensions for cropped images
            const aspectRatio = resizeStart.width / resizeStart.height;
            
            // Calculate maximum size to prevent quality loss
            let maxWidth, maxHeight;
            if (img.cropData) {
              // For cropped images, limit to original pixels in crop area
              maxWidth = img.originalWidth * img.cropData.width;
              maxHeight = img.originalHeight * img.cropData.height;
            } else {
              // For uncropped images, limit to original dimensions
              maxWidth = img.originalWidth;
              maxHeight = img.originalHeight;
            }

            switch (resizeHandle) {
              case "se": // Bottom-right - use horizontal delta as primary
                newImg.width = Math.max(50, Math.min(maxWidth, resizeStart.width + deltaX));
                newImg.height = Math.max(50, Math.min(maxHeight, newImg.width / aspectRatio));
                newImg.x = resizeStart.x;
                newImg.y = resizeStart.y;
                break;
              case "sw": // Bottom-left
                newImg.width = Math.max(50, Math.min(maxWidth, resizeStart.width - deltaX));
                newImg.height = Math.max(50, Math.min(maxHeight, newImg.width / aspectRatio));
                newImg.x = resizeStart.x + (resizeStart.width - newImg.width);
                newImg.y = resizeStart.y;
                break;
              case "ne": // Top-right
                newImg.width = Math.max(50, Math.min(maxWidth, resizeStart.width + deltaX));
                newImg.height = Math.max(50, Math.min(maxHeight, newImg.width / aspectRatio));
                newImg.x = resizeStart.x;
                newImg.y = resizeStart.y + (resizeStart.height - newImg.height);
                break;
              case "nw": // Top-left
                newImg.width = Math.max(50, Math.min(maxWidth, resizeStart.width - deltaX));
                newImg.height = Math.max(50, Math.min(maxHeight, newImg.width / aspectRatio));
                newImg.x = resizeStart.x + (resizeStart.width - newImg.width);
                newImg.y = resizeStart.y + (resizeStart.height - newImg.height);
                break;
              case "e": // Right - resize horizontally, center vertically
                newImg.width = Math.max(50, Math.min(maxWidth, resizeStart.width + deltaX));
                newImg.height = Math.max(50, Math.min(maxHeight, newImg.width / aspectRatio));
                newImg.x = resizeStart.x;
                // Center vertically by adjusting y position
                newImg.y = resizeStart.y + (resizeStart.height - newImg.height) / 2;
                break;
              case "w": // Left - resize horizontally, center vertically
                newImg.width = Math.max(50, Math.min(maxWidth, resizeStart.width - deltaX));
                newImg.height = Math.max(50, Math.min(maxHeight, newImg.width / aspectRatio));
                newImg.x = resizeStart.x + (resizeStart.width - newImg.width);
                // Center vertically by adjusting y position
                newImg.y = resizeStart.y + (resizeStart.height - newImg.height) / 2;
                break;
              case "s": // Bottom - resize vertically, center horizontally
                newImg.height = Math.max(50, Math.min(maxHeight, resizeStart.height + deltaY));
                newImg.width = Math.max(50, Math.min(maxWidth, newImg.height * aspectRatio));
                // Center horizontally by adjusting x position
                newImg.x = resizeStart.x + (resizeStart.width - newImg.width) / 2;
                newImg.y = resizeStart.y;
                break;
              case "n": // Top - resize vertically, center horizontally
                newImg.height = Math.max(50, Math.min(maxHeight, resizeStart.height - deltaY));
                newImg.width = Math.max(50, Math.min(maxWidth, newImg.height * aspectRatio));
                // Center horizontally by adjusting x position
                newImg.x = resizeStart.x + (resizeStart.width - newImg.width) / 2;
                newImg.y = resizeStart.y + (resizeStart.height - newImg.height);
                break;
            }

            return newImg;
          }),
        );
      } else {
        // Update cursor based on hover
        const canvas = canvasRef.current;
        if (!canvas) return;

        let cursor = "default";

        // Check if hovering over brand element first
        if (brandElement && images.length > 0 && brandElement.position?.x !== undefined && brandElement.position?.y !== undefined) {
          // ALWAYS use stored position - brand should NEVER move with image
          const brandCenterX = brandElement.position.x;
          const brandCenterY = brandElement.position.y;

          let brandX, brandY, brandWidth, brandHeight;

          if (brandElement.type === "logo") {
            const logoSize = brandElement.style?.size || 24;
            const hitPadding = 10;
            brandX = brandCenterX - logoSize / 2 - hitPadding;
            brandY = brandCenterY - hitPadding;
            brandWidth = logoSize + hitPadding * 2;
            brandHeight = logoSize + hitPadding * 2;
          } else if (brandElement.type === "name") {
            const fontSize = brandElement.style?.size || 16;
            const textWidth = brandElement.data.length * fontSize * 0.6;
            const hitPadding = 10;
            brandX = brandCenterX - textWidth / 2 - hitPadding;
            brandY = brandCenterY - hitPadding;
            brandWidth = textWidth + hitPadding * 2;
            brandHeight = fontSize * 1.5 + hitPadding * 2;
          }

          if (
            x >= brandX &&
            x <= brandX + brandWidth &&
            y >= brandY &&
            y <= brandY + brandHeight
          ) {
            cursor = "move";
            canvas.style.cursor = cursor;
            return;
          }
        }

        // Check images
        for (let i = images.length - 1; i >= 0; i--) {
          const img = images[i];
          if (
            x >= img.x &&
            x <= img.x + img.width &&
            y >= img.y &&
            y <= img.y + img.height
          ) {
            if (img.id === selectedImageId) {
              const handle = getResizeHandle(x, y, img);
              if (handle) {
                const cursors = {
                  nw: "nw-resize",
                  ne: "ne-resize",
                  sw: "sw-resize",
                  se: "se-resize",
                  n: "n-resize",
                  s: "s-resize",
                  w: "w-resize",
                  e: "e-resize",
                };
                cursor = cursors[handle] || "pointer";
              } else {
                cursor = "move";
              }
            } else {
              cursor = "pointer";
            }
            break;
          }
        }

        canvas.style.cursor = cursor;
      }
    },
    [
      isDragging,
      isResizing,
      selectedImageId,
      resizeHandle,
      resizeStart,
      dragStart,
      images,
      getCanvasCoordinates,
      getResizeHandle,
      setImages,
      brandElement,
      onBrandPositionUpdate,
    ],
  );

  // Mouse up handler
  const handleCanvasMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    isDraggingBrandRef.current = false;
    setResizeHandle(null);
    setResizeStart(null); // Clear resize start state
  }, []);

  // Add mouse event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("mousedown", handleCanvasMouseDown);
    canvas.addEventListener("mousemove", handleCanvasMouseMove);
    canvas.addEventListener("mouseup", handleCanvasMouseUp);
    canvas.addEventListener("mouseleave", handleCanvasMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleCanvasMouseDown);
      canvas.removeEventListener("mousemove", handleCanvasMouseMove);
      canvas.removeEventListener("mouseup", handleCanvasMouseUp);
      canvas.removeEventListener("mouseleave", handleCanvasMouseUp);
    };
  }, [handleCanvasMouseDown, handleCanvasMouseMove, handleCanvasMouseUp]);

  return {
    isDragging,
    isResizing,
  };
}
