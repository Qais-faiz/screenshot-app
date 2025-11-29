'use client';

import { useEffect, useCallback } from "react";

export function useWorkspaceCanvas(
  canvasRef,
  images,
  background,
  canvasSize,
  selectedImageId,
  borderRadius = 0,
  shadowType = "none",
  shadowStrength = 100,
  noiseIntensity = 0,
  brandElement = null,
  onBrandElementClick = null,
  brandRenderKey = 0, // Force re-render trigger
) {
  // Shadow calculation function
  const getShadowStyle = (type, strength) => {
    if (type === "none") return "none";
    
    const shadowPresets = {
      soft: { x: 0, y: 8, blur: 24, baseOpacity: 0.4 },
      deep: { x: 0, y: 12, blur: 32, baseOpacity: 0.6 },
      glow: { x: 0, y: 0, blur: 20, baseOpacity: 0.5 }
    };
    
    const preset = shadowPresets[type];
    if (!preset) return "none";
    
    const finalOpacity = preset.baseOpacity * (strength / 100);
    return `${preset.x}px ${preset.y}px ${preset.blur}px rgba(0, 0, 0, ${finalOpacity})`;
  };
  // Canvas drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    
    // Get the actual displayed size of the canvas element
    const rect = canvas.getBoundingClientRect();
    
    // Use device pixel ratio for high-DPI displays (Retina, 4K, etc.)
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas internal resolution higher for crisp rendering
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // Scale the context to account for device pixel ratio
    ctx.scale(dpr, dpr);

    // Clear canvas (use logical dimensions, not physical)
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw background
    if (background.type === "gradient") {
      // Parse CSS gradient string to extract colors and positions
      const parseGradient = (gradientStr) => {
        // Extract colors and percentages from CSS gradient string
        const colorMatches = gradientStr.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\)/g);
        const percentMatches = gradientStr.match(/(\d+(?:\.\d+)?)%/g);
        
        if (!colorMatches) return [{ color: "#8B70F6", position: 0 }, { color: "#9D7DFF", position: 1 }];
        
        return colorMatches.map((color, index) => ({
          color,
          position: percentMatches && percentMatches[index] 
            ? parseFloat(percentMatches[index]) / 100 
            : index / (colorMatches.length - 1)
        }));
      };

      // Create gradient background (use logical dimensions)
      const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      const colorStops = parseGradient(background.gradient);
      
      colorStops.forEach(({ color, position }) => {
        gradient.addColorStop(position, color);
      });
      
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = background.color;
    }
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Add noise texture to background if intensity > 0
    if (noiseIntensity > 0) {
      // Get image data using physical canvas dimensions (accounting for DPR)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const noiseAmount = noiseIntensity * 2.55; // Convert 0-100 to 0-255
      
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * noiseAmount;
        data[i] += noise;     // Red
        data[i + 1] += noise; // Green
        data[i + 2] += noise; // Blue
        // Alpha channel (i + 3) remains unchanged
      }
      
      ctx.putImageData(imageData, 0, 0);
    }

    // Draw images
    images.forEach((img) => {
      if (img.element) {
        ctx.save();

        // Apply transformations
        const centerX = img.x + img.width / 2;
        const centerY = img.y + img.height / 2;

        ctx.translate(centerX, centerY);
        ctx.rotate(img.rotation);
        ctx.scale(img.scaleX, img.scaleY);
        ctx.translate(-img.width / 2, -img.height / 2);

        // Draw shadow if enabled
        if (shadowType !== "none") {
          const shadowPresets = {
            soft: { x: 0, y: 8, blur: 24, baseOpacity: 0.4 },
            deep: { x: 0, y: 12, blur: 32, baseOpacity: 0.6 },
            glow: { x: 0, y: 0, blur: 20, baseOpacity: 0.5 }
          };
          
          const preset = shadowPresets[shadowType];
          if (preset) {
            const finalOpacity = preset.baseOpacity * (shadowStrength / 100);
            
            ctx.save();
            ctx.shadowOffsetX = preset.x;
            ctx.shadowOffsetY = preset.y;
            ctx.shadowBlur = preset.blur;
            ctx.shadowColor = `rgba(0, 0, 0, ${finalOpacity})`;
            
            // Draw shadow shape
            if (borderRadius > 0) {
              ctx.beginPath();
              ctx.moveTo(borderRadius, 0);
              ctx.lineTo(img.width - borderRadius, 0);
              ctx.quadraticCurveTo(img.width, 0, img.width, borderRadius);
              ctx.lineTo(img.width, img.height - borderRadius);
              ctx.quadraticCurveTo(img.width, img.height, img.width - borderRadius, img.height);
              ctx.lineTo(borderRadius, img.height);
              ctx.quadraticCurveTo(0, img.height, 0, img.height - borderRadius);
              ctx.lineTo(0, borderRadius);
              ctx.quadraticCurveTo(0, 0, borderRadius, 0);
              ctx.closePath();
              ctx.fill();
            } else {
              ctx.fillRect(0, 0, img.width, img.height);
            }
            ctx.restore();
          }
        }

        // Apply border radius clipping if set
        if (borderRadius > 0) {
          ctx.beginPath();
          ctx.moveTo(borderRadius, 0);
          ctx.lineTo(img.width - borderRadius, 0);
          ctx.quadraticCurveTo(img.width, 0, img.width, borderRadius);
          ctx.lineTo(img.width, img.height - borderRadius);
          ctx.quadraticCurveTo(img.width, img.height, img.width - borderRadius, img.height);
          ctx.lineTo(borderRadius, img.height);
          ctx.quadraticCurveTo(0, img.height, 0, img.height - borderRadius);
          ctx.lineTo(0, borderRadius);
          ctx.quadraticCurveTo(0, 0, borderRadius, 0);
          ctx.closePath();
          ctx.clip();
        }

        // Draw image with high-quality smoothing for crisp text and details
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        
        // Handle cropping if crop data exists
        if (img.cropData) {
          const { x: cropX, y: cropY, width: cropWidth, height: cropHeight } = img.cropData;
          const sourceX = cropX * img.originalWidth;
          const sourceY = cropY * img.originalHeight;
          const sourceWidth = cropWidth * img.originalWidth;
          const sourceHeight = cropHeight * img.originalHeight;
          
          ctx.drawImage(
            img.element,
            sourceX, sourceY, sourceWidth, sourceHeight,
            0, 0, img.width, img.height
          );
        } else {
          ctx.drawImage(img.element, 0, 0, img.width, img.height);
        }

        // Selection border and handles removed - resize still works invisibly

        ctx.restore();
      }
    });

    // Draw brand element if it exists and there are images
    if (brandElement && images.length > 0) {
      // ALWAYS use stored position - brand should NEVER move with image
      if (brandElement.position && brandElement.position.x !== undefined && brandElement.position.y !== undefined) {
        ctx.save();
        
        const brandCenterX = brandElement.position.x;
        const brandCenterY = brandElement.position.y;

      if (brandElement.type === "logo" && brandElement.data) {
        // Create image element for logo
        const logoImg = new Image();
        logoImg.onload = () => {
          const logoSize = brandElement.style?.size || 24; // Use style size or default to 24
          // Center the logo at the brand position
          ctx.drawImage(logoImg, brandCenterX - logoSize / 2, brandCenterY, logoSize, logoSize);
        };
        logoImg.src = brandElement.data;
      } else if (brandElement.type === "name") {
        // Draw text
        const fontSize = brandElement.style?.size || 16;
        let fontStyle = `${fontSize}px Inter, system-ui, sans-serif`;
        
        if (brandElement.style?.bold && brandElement.style?.italic) {
          fontStyle = `bold italic ${fontStyle}`;
        } else if (brandElement.style?.bold) {
          fontStyle = `bold ${fontStyle}`;
        } else if (brandElement.style?.italic) {
          fontStyle = `italic ${fontStyle}`;
        }
        
        ctx.font = fontStyle;
        ctx.fillStyle = brandElement.style?.color || brandElement.color || "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        
        // Text is already centered with textAlign="center"
        ctx.fillText(brandElement.data, brandCenterX, brandCenterY);
      }
      
      ctx.restore();
      }
    }
  }, [images, background, canvasSize, selectedImageId, borderRadius, shadowType, shadowStrength, noiseIntensity, brandElement, brandElement?.position?.x, brandElement?.position?.y, brandRenderKey]);

  // Get canvas coordinates from mouse event
  const getCanvasCoordinates = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    // Since we're using ctx.scale(dpr, dpr), we work in logical coordinates
    // So mouse coordinates should be relative to the display size, not physical canvas size
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  // Export function
  const exportCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "designcraft-export.png";
    link.href = canvas.toDataURL();
    link.click();
  }, []);

  return { getCanvasCoordinates, exportCanvas };
}
