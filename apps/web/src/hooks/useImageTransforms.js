import { useCallback } from "react";

export function useImageTransforms(selectedImageId, setImages) {
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
            // Calculate aspect ratio from original dimensions
            const aspectRatio = img.originalWidth / img.originalHeight;
            
            // Scale both dimensions by the same factor to maintain aspect ratio
            const newWidth = Math.max(50, img.width * factor);
            const newHeight = Math.max(50, newWidth / aspectRatio);
            
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

  return {
    rotateImage,
    flipHorizontal,
    flipVertical,
    scaleImage,
    deleteImage,
  };
}
