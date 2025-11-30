'use client';

import { useCallback } from "react";

export function useImageTransforms({
  setImages,
  selectedImageId,
  setCropMode,
  cropArea,
  setCropArea,
  canvasSize = { width: 1200, height: 900 }, // Default canvas size
  canvasRef, // Need canvas ref to get actual dimensions
}) {
  const rotateImage = useCallback(() => {
    if (!selectedImageId) return;
    setImages((prev) =>
      prev.map((img) =>
        img.id === selectedImageId
          ? { ...img, rotation: img.rotation + Math.PI / 2 }
          : img,
      ),
    );
  }, [selectedImageId, setImages]);

  const flipHorizontal = useCallback(() => {
    if (!selectedImageId) return;
    setImages((prev) =>
      prev.map((img) =>
        img.id === selectedImageId ? { ...img, scaleX: img.scaleX * -1 } : img,
      ),
    );
  }, [selectedImageId, setImages]);

  const flipVertical = useCallback(() => {
    if (!selectedImageId) return;
    setImages((prev) =>
      prev.map((img) =>
        img.id === selectedImageId ? { ...img, scaleY: img.scaleY * -1 } : img,
      ),
    );
  }, [selectedImageId, setImages]);

  const scaleImage = useCallback(
    (factor) => {
      if (!selectedImageId) return;
      setImages((prev) =>
        prev.map((img) => {
          if (img.id === selectedImageId) {
            // Calculate aspect ratio from current dimensions (works for both cropped and uncropped)
            const currentAspectRatio = img.width / img.height;
            
            // Calculate new dimensions
            let newWidth = img.width * factor;
            let newHeight = newWidth / currentAspectRatio;
            
            // For cropped images, limit scaling to prevent quality loss
            if (img.cropData) {
              // Calculate the maximum size based on original image dimensions and crop area
              const maxWidth = img.originalWidth * img.cropData.width;
              const maxHeight = img.originalHeight * img.cropData.height;
              
              // Don't scale beyond original resolution
              if (newWidth > maxWidth) {
                newWidth = maxWidth;
                newHeight = maxWidth / currentAspectRatio;
              }
              if (newHeight > maxHeight) {
                newHeight = maxHeight;
                newWidth = maxHeight * currentAspectRatio;
              }
            } else {
              // For uncropped images, limit to original dimensions
              if (newWidth > img.originalWidth) {
                newWidth = img.originalWidth;
                newHeight = img.originalHeight;
              }
            }
            
            // Ensure minimum size
            newWidth = Math.max(50, newWidth);
            newHeight = Math.max(50, newHeight);
            
            return {
              ...img,
              width: newWidth,
              height: newHeight,
            };
          }
          return img;
        }),
      );
    },
    [selectedImageId, setImages],
  );

  const deleteImage = useCallback(() => {
    if (!selectedImageId) return;
    setImages((prev) => prev.filter((img) => img.id !== selectedImageId));
  }, [selectedImageId, setImages]);

  // Apply crop to selected image
  const applyCrop = useCallback(() => {
    if (!selectedImageId || !cropArea) return;

    setImages(prev => prev.map(img => {
      if (img.id === selectedImageId) {
        // Calculate crop relative to original image
        const relativeX = (cropArea.x - img.x) / img.width;
        const relativeY = (cropArea.y - img.y) / img.height;
        const relativeWidth = cropArea.width / img.width;
        const relativeHeight = cropArea.height / img.height;

        // Get actual canvas dimensions from the rendered canvas
        const canvas = canvasRef?.current;
        const rect = canvas ? canvas.getBoundingClientRect() : canvasSize;
        
        // Calculate center position using actual rendered canvas dimensions
        const centerX = (rect.width - cropArea.width) / 2;
        const centerY = (rect.height - cropArea.height) / 2;

        return {
          ...img,
          // Update display dimensions to match crop area
          width: cropArea.width,
          height: cropArea.height,
          // Center the cropped image on canvas
          x: centerX,
          y: centerY,
          cropData: {
            x: relativeX,
            y: relativeY,
            width: relativeWidth,
            height: relativeHeight
          }
        };
      }
      return img;
    }));

    setCropMode(false);
    setCropArea(null);
  }, [selectedImageId, cropArea, setImages, setCropMode, setCropArea, canvasSize, canvasRef]);

  // Cancel crop mode
  const cancelCrop = useCallback(() => {
    setCropMode(false);
    setCropArea(null);
  }, [setCropMode, setCropArea]);

  return {
    rotateImage,
    flipHorizontal,
    flipVertical,
    scaleImage,
    deleteImage,
    applyCrop,
    cancelCrop,
  };
}
