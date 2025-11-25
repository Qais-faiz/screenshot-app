import { useState, useRef, useEffect } from "react";

export function CropOverlay({ 
  image, 
  cropMode, 
  onCropChange, 
  canvasRef 
}) {
  const [cropArea, setCropArea] = useState({
    x: 0,
    y: 0,
    width: image.width,
    height: image.height
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const overlayRef = useRef(null);

  // Initialize crop area when crop mode is enabled
  useEffect(() => {
    if (cropMode && image) {
      setCropArea({
        x: image.x,
        y: image.y,
        width: image.width,
        height: image.height
      });
    }
  }, [cropMode, image]);

  // Update parent when crop area changes
  useEffect(() => {
    if (onCropChange) {
      onCropChange(cropArea);
    }
  }, [cropArea, onCropChange]);

  if (!cropMode || !image) return null;

  const handleMouseDown = (e, handle) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragHandle(handle);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !dragHandle) return;

    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;

    setCropArea(prev => {
      let newArea = { ...prev };

      switch (dragHandle) {
        case 'top-left':
          newArea.x = Math.max(image.x, prev.x + deltaX);
          newArea.y = Math.max(image.y, prev.y + deltaY);
          newArea.width = Math.max(20, prev.width - deltaX);
          newArea.height = Math.max(20, prev.height - deltaY);
          break;
        case 'top-right':
          newArea.y = Math.max(image.y, prev.y + deltaY);
          newArea.width = Math.max(20, prev.width + deltaX);
          newArea.height = Math.max(20, prev.height - deltaY);
          break;
        case 'bottom-left':
          newArea.x = Math.max(image.x, prev.x + deltaX);
          newArea.width = Math.max(20, prev.width - deltaX);
          newArea.height = Math.max(20, prev.height + deltaY);
          break;
        case 'bottom-right':
          newArea.width = Math.max(20, prev.width + deltaX);
          newArea.height = Math.max(20, prev.height + deltaY);
          break;
        case 'move':
          newArea.x = Math.max(image.x, Math.min(image.x + image.width - prev.width, prev.x + deltaX));
          newArea.y = Math.max(image.y, Math.min(image.y + image.height - prev.height, prev.y + deltaY));
          break;
      }

      // Constrain to image bounds
      newArea.x = Math.max(image.x, Math.min(image.x + image.width - newArea.width, newArea.x));
      newArea.y = Math.max(image.y, Math.min(image.y + image.height - newArea.height, newArea.y));
      newArea.width = Math.min(image.width - (newArea.x - image.x), newArea.width);
      newArea.height = Math.min(image.height - (newArea.y - image.y), newArea.height);

      return newArea;
    });

    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragHandle(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragHandle, startPos]);

  const handleStyle = "absolute w-3 h-3 bg-white border-2 border-[#8B70F6] rounded-full cursor-pointer hover:scale-110 transition-transform duration-150";

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1000 }}
    >
      {/* Crop overlay */}
      <div
        className="absolute border-2 border-[#8B70F6] pointer-events-auto"
        style={{
          left: cropArea.x,
          top: cropArea.y,
          width: cropArea.width,
          height: cropArea.height,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Move handle (center area) */}
        <div
          className="absolute inset-0 cursor-move"
          onMouseDown={(e) => handleMouseDown(e, 'move')}
        />

        {/* Corner handles */}
        <div
          className={handleStyle}
          style={{ top: -6, left: -6 }}
          onMouseDown={(e) => handleMouseDown(e, 'top-left')}
        />
        <div
          className={handleStyle}
          style={{ top: -6, right: -6 }}
          onMouseDown={(e) => handleMouseDown(e, 'top-right')}
        />
        <div
          className={handleStyle}
          style={{ bottom: -6, left: -6 }}
          onMouseDown={(e) => handleMouseDown(e, 'bottom-left')}
        />
        <div
          className={handleStyle}
          style={{ bottom: -6, right: -6 }}
          onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}
        />

        {/* Grid lines for better cropping guidance */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-full h-px bg-white/30" style={{ top: '33.33%' }} />
          <div className="absolute w-full h-px bg-white/30" style={{ top: '66.66%' }} />
          <div className="absolute h-full w-px bg-white/30" style={{ left: '33.33%' }} />
          <div className="absolute h-full w-px bg-white/30" style={{ left: '66.66%' }} />
        </div>
      </div>
    </div>
  );
}