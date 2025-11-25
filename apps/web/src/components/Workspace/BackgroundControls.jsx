import { useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { getAllGradientGroups } from "@/utils/backgroundOptions";
import { Palette, X } from "lucide-react";
import "./colorPicker.css";

export function BackgroundControls({
  background,
  setBackground,
  colorOptions,
  hasImages,
  brandColor,
}) {
  if (!hasImages) return null;

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [gradientGroups, setGradientGroups] = useState({});

  // Update gradient groups when brand color changes
  useEffect(() => {
    setGradientGroups(getAllGradientGroups(brandColor));
  }, [brandColor]);

  const selectBackground = (gradientValue) => {
    setBackground((prev) => ({ ...prev, gradient: gradientValue }));
  };

  const handleColorPickerClick = () => {
    setShowColorPicker(!showColorPicker);
  };

  const handleColorChange = (color) => {
    setBackground((prev) => ({ ...prev, color }));
  };

  const closeColorPicker = () => {
    setShowColorPicker(false);
  };
  
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-white mb-4">
        Background
      </h3>

      {/* Background type toggle */}
      <div className="flex bg-[#1E1E1E] rounded-2xl p-1 mb-4">
        <button
          onClick={() =>
            setBackground((prev) => ({ ...prev, type: "gradient" }))
          }
          className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all duration-150 ${
            background.type === "gradient"
              ? "bg-[#3A3A3A] text-white shadow-sm"
              : "text-[#AAAAAA]"
          }`}
        >
          Gradients
        </button>
        <button
          onClick={() => setBackground((prev) => ({ ...prev, type: "color" }))}
          className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all duration-150 ${
            background.type === "color"
              ? "bg-[#3A3A3A] text-white shadow-sm"
              : "text-[#AAAAAA]"
          }`}
        >
          Solids
        </button>
      </div>

      {/* Gradient options - New grouped layout */}
      {background.type === "gradient" && (
        <div className="max-h-80 overflow-y-auto overflow-x-hidden pr-2 -mr-2 scroll-smooth">
          {Object.entries(gradientGroups).map(([groupKey, group]) => (
            <div key={groupKey} className="mb-4">
              {/* Group label */}
              <h4 className="text-xs font-medium text-[#AAAAAA] mb-2 uppercase tracking-wide">
                {group.name}
              </h4>
              
              {/* 4-column grid of smaller thumbnails */}
              <div className="grid grid-cols-4 gap-2">
                {group.gradients.map((gradient, index) => (
                  <button
                    key={`${groupKey}-${index}`}
                    onClick={() => selectBackground(gradient)}
                    className={`w-12 h-12 rounded-lg border-2 transition-all duration-150 hover:scale-105 ${
                      background.gradient === gradient
                        ? "border-[#8B70F6] ring-2 ring-[#8B70F6]/20"
                        : "border-[#3A3A3A] hover:border-[#8B70F6]/50"
                    }`}
                    style={{ background: gradient }}
                    title={`${group.name} ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Color options - Updated to 4-column layout with color picker */}
      {background.type === "color" && (
        <div className="relative">
          <div className="grid grid-cols-4 gap-2">
            {/* Color Picker Button - First Option */}
            <button
              onClick={handleColorPickerClick}
              className="w-12 h-12 rounded-lg border-2 border-[#E0E0E0] dark:border-[#404040] hover:border-[#8B70F6]/50 transition-all duration-150 hover:scale-105 flex items-center justify-center bg-gradient-to-br from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 relative overflow-hidden"
              title="Custom Color Picker"
            >
              <div className="absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-sm"></div>
              <Palette className="w-6 h-6 text-white relative z-10 drop-shadow-lg" />
            </button>

            {/* Brand Color - Second Option (if brand exists) */}
            {brandColor && (
              <button
                onClick={() => setBackground((prev) => ({ ...prev, color: brandColor }))}
                className={`w-12 h-12 rounded-lg border-2 transition-all duration-150 hover:scale-105 relative ${
                  background.color === brandColor
                    ? "border-[#8B70F6] ring-2 ring-[#8B70F6]/20"
                    : "border-[#3A3A3A] hover:border-[#8B70F6]/50"
                }`}
                style={{ backgroundColor: brandColor }}
                title="Brand Color"
              >
                {/* Brand indicator */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-[#8B70F6] to-[#9D7DFF] rounded-full border border-[#252525]" />
              </button>
            )}

            {/* Preset Color Options */}
            {colorOptions.map((color, index) => (
              <button
                key={index}
                onClick={() => setBackground((prev) => ({ ...prev, color }))}
                className={`w-12 h-12 rounded-lg border-2 transition-all duration-150 hover:scale-105 ${
                  background.color === color
                    ? "border-[#8B70F6] ring-2 ring-[#8B70F6]/20"
                    : "border-[#3A3A3A] hover:border-[#8B70F6]/50"
                }`}
                style={{ backgroundColor: color }}
                title={`Color ${index + 1}`}
              />
            ))}
          </div>

          {/* Custom Color Picker Popup */}
          {showColorPicker && (
            <div className="absolute top-0 left-0 z-50 bg-[#2A2A2A] rounded-2xl shadow-2xl border border-[#3A3A3A] p-4 w-64">
              {/* Close Button */}
              <button
                onClick={closeColorPicker}
                className="absolute top-3 right-3 p-1 rounded-lg hover:bg-[#333333] transition-colors z-10"
                title="Close"
              >
                <X className="w-5 h-5 text-[#AAAAAA]" />
              </button>

              {/* Title */}
              <h4 className="text-sm font-semibold text-white mb-3">
                Pick a Color
              </h4>

              {/* React Colorful Color Picker */}
              <div className="mb-3">
                <HexColorPicker color={background.color} onChange={handleColorChange} />
              </div>

              {/* Current Color Display */}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-medium text-[#AAAAAA]">
                  Current Color
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg border-2 border-[#3A3A3A]"
                    style={{ backgroundColor: background.color }}
                  />
                  <span className="text-xs font-mono text-white uppercase">
                    {background.color}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}


    </div>
  );
}
