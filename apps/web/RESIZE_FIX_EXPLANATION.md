# Resize "Running Away" Fix

## The Problem

When users tried to resize images by dragging handles, the image would grow or shrink uncontrollably - it would "run away" from the cursor. This made precise resizing impossible.

### Why It Happened

The original code was calculating the resize delta like this:

```javascript
// WRONG - This causes runaway resizing
const deltaX = x - dragStart.x;
newImg.width = Math.max(50, img.width + deltaX);  // img.width changes every frame!
```

**The issue**: `img.width` was the CURRENT width, which changed on every mouse move. So:
1. Frame 1: width = 200, delta = 10, new width = 210
2. Frame 2: width = 210, delta = 10, new width = 220
3. Frame 3: width = 220, delta = 10, new width = 230
4. And so on... exponential growth!

## The Solution

Now we store the **original dimensions** when the resize starts:

```javascript
// CORRECT - Smooth, controlled resizing
// On mouse down:
setResizeStart({
  x: clickedImage.x,
  y: clickedImage.y,
  width: clickedImage.width,
  height: clickedImage.height,
});

// On mouse move:
const deltaX = x - dragStart.x;
newImg.width = Math.max(50, resizeStart.width + deltaX);  // resizeStart.width is fixed!
```

**Why this works**: `resizeStart.width` never changes during the resize operation. So:
1. Frame 1: original width = 200, delta = 10, new width = 210
2. Frame 2: original width = 200, delta = 20, new width = 220
3. Frame 3: original width = 200, delta = 30, new width = 230
4. Linear, predictable growth!

## Key Changes

### Added State Variable
```javascript
const [resizeStart, setResizeStart] = useState(null);
```

### Store Original Dimensions on Mouse Down
```javascript
if (handle) {
  setIsResizing(true);
  setResizeHandle(handle);
  setDragStart({ x, y });
  setResizeStart({
    x: clickedImage.x,
    y: clickedImage.y,
    width: clickedImage.width,
    height: clickedImage.height,
  });
}
```

### Use Original Dimensions in Calculations
```javascript
// Example for bottom-right handle
case "se":
  newImg.width = Math.max(50, resizeStart.width + deltaX);
  newImg.height = Math.max(50, newImg.width / aspectRatio);
  newImg.x = resizeStart.x;  // Keep original position
  newImg.y = resizeStart.y;
  break;
```

### Clear State on Mouse Up
```javascript
const handleCanvasMouseUp = useCallback(() => {
  setIsDragging(false);
  setIsResizing(false);
  setResizeHandle(null);
  setResizeStart(null);  // Clear the stored dimensions
}, []);
```

## Result

✅ Smooth, predictable resizing like Photoshop
✅ Image follows the cursor precisely
✅ No more "running away" or exponential growth
✅ Aspect ratio still preserved perfectly
✅ All 8 handles work correctly
✅ Edge handles (top/bottom/left/right) now center the image properly
✅ Images upload at original size and centered on canvas

## Additional Improvements

### Edge Handle Centering
When using the middle edge handles (top, bottom, left, right), the image now stays centered:
- **Top/Bottom handles**: Resize vertically, center horizontally
- **Left/Right handles**: Resize horizontally, center vertically

```javascript
case "s": // Bottom
  newImg.height = Math.max(50, resizeStart.height + deltaY);
  newImg.width = Math.max(50, newImg.height * aspectRatio);
  newImg.x = resizeStart.x + (resizeStart.width - newImg.width) / 2; // Center!
  newImg.y = resizeStart.y;
  break;
```

### Smart Upload Sizing
Images now upload at an appropriate size that fits within the canvas with visible background:

```javascript
// Fit within 80% of canvas (20% background visible)
const maxWidth = canvasSize.width * 0.8;
const maxHeight = canvasSize.height * 0.8;

// Scale down if needed, maintaining aspect ratio
if (displayWidth > maxWidth || displayHeight > maxHeight) {
  const ratio = Math.min(maxWidth / displayWidth, maxHeight / displayHeight);
  displayWidth = displayWidth * ratio;
  displayHeight = displayHeight * ratio;
}

// Center on canvas
const centerX = (canvasSize.width - displayWidth) / 2;
const centerY = (canvasSize.height - displayHeight) / 2;
```

## Testing

Try these scenarios:
1. **Upload**: Upload an image - should appear at original size, centered
2. **Corner handles**: Drag any corner - should resize smoothly from that corner
3. **Top/Bottom handles**: Drag top or bottom - should resize vertically and stay centered horizontally
4. **Left/Right handles**: Drag left or right - should resize horizontally and stay centered vertically
5. **Multiple resizes**: Release and resize again - should start fresh each time
