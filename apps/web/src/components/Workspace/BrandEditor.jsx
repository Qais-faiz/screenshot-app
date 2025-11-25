import { useState, useEffect } from "react";
import { Type, Image as ImageIcon, Bold, Italic } from "lucide-react";

export function BrandEditor({ 
  brandData, 
  onAddBrand, 
  onClose,
  existingBrandElement,
  onPreviewChange
}) {
  const [brandType, setBrandType] = useState("name"); // "name" or "logo"
  const [textStyle, setTextStyle] = useState({
    bold: true,
    italic: false,
    size: 16,
    color: "#ffffff"
  });

  // Initialize with existing brand element if editing
  useEffect(() => {
    if (existingBrandElement) {
      setBrandType(existingBrandElement.type);
      if (existingBrandElement.type === "name") {
        setTextStyle(existingBrandElement.style || {
          bold: true,
          italic: false,
          size: 16,
          color: "#ffffff"
        });
      }
    }
  }, [existingBrandElement]);

  // Auto-save changes to parent (no button needed)
  useEffect(() => {
    if (onAddBrand && brandData) {
      const brandElement = {
        type: brandType,
        data: brandType === "logo" ? brandData?.logoPreview : `@${brandData?.brandName || "Brand"}`,
        style: brandType === "logo" ? { size: textStyle.size } : textStyle, // Save size for logo too
        color: brandType === "name" ? textStyle.color : (brandData?.brandColor || "#8B70F6"),
        position: existingBrandElement?.position, // Preserve position
      };
      onAddBrand(brandElement);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandType, textStyle.bold, textStyle.italic, textStyle.size, textStyle.color, brandData?.brandName, brandData?.logoPreview, brandData?.brandColor]);

  if (!brandData) {
    return (
      <div className="p-6 text-center">
        <div className="text-[#AAAAAA] text-sm">
          No brand data found. Please create a brand first.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 relative">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#AAAAAA] hover:text-white transition-all duration-150"
        title="Close"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      <h3 className="text-lg font-semibold text-white mb-6">
        Brand Element
      </h3>

      {/* Brand Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white mb-3">
          Choose Brand Element
        </label>
        <div className="grid grid-cols-2 gap-3">
          {/* Logo Option */}
          {brandData.logoPreview && (
            <button
              onClick={() => setBrandType("logo")}
              className={`p-4 rounded-xl border-2 transition-all duration-150 ${
                brandType === "logo"
                  ? "border-[#8B70F6] bg-[#8B70F6]/10"
                  : "border-[#3A3A3A] bg-[#2A2A2A] hover:border-[#8B70F6]/50"
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <ImageIcon size={20} className="text-white" />
                <span className="text-xs text-white font-medium">Logo</span>
                {brandData.logoPreview && (
                  <img
                    src={brandData.logoPreview}
                    alt="Brand logo"
                    className="w-8 h-8 object-contain rounded"
                  />
                )}
              </div>
            </button>
          )}

          {/* Name Option */}
          <button
            onClick={() => setBrandType("name")}
            className={`p-4 rounded-xl border-2 transition-all duration-150 ${
              brandType === "name"
                ? "border-[#8B70F6] bg-[#8B70F6]/10"
                : "border-[#3A3A3A] bg-[#2A2A2A] hover:border-[#8B70F6]/50"
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              <Type size={20} className="text-white" />
              <span className="text-xs text-white font-medium">Name</span>
              <span className="text-xs text-[#AAAAAA]">
                @{brandData.brandName || "Brand"}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Logo Size Slider (only for logo) */}
      {brandType === "logo" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-3">
            Logo Size
          </label>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-white">
                Size
              </label>
              <span className="text-sm text-[#AAAAAA]">
                {textStyle.size}px
              </span>
            </div>
            <input
              type="range"
              min="16"
              max="64"
              value={textStyle.size}
              onChange={(e) => setTextStyle(prev => ({ ...prev, size: Number(e.target.value) }))}
              className="w-full h-2 bg-[#3A3A3A] rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #8B70F6 0%, #8B70F6 ${((textStyle.size - 16) / 48) * 100}%, #3A3A3A ${((textStyle.size - 16) / 48) * 100}%, #3A3A3A 100%)`
              }}
            />
          </div>
        </div>
      )}

      {/* Text Style Options (only for name) */}
      {brandType === "name" && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-3">
            Text Style
          </label>
          
          {/* Bold and Italic toggles */}
          <div className="flex items-center space-x-3 mb-4">
            <button
              onClick={() => setTextStyle(prev => ({ ...prev, bold: !prev.bold }))}
              className={`flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-all duration-150 ${
                textStyle.bold
                  ? "border-[#8B70F6] bg-[#8B70F6]/10 text-[#8B70F6]"
                  : "border-[#3A3A3A] bg-[#2A2A2A] text-white hover:border-[#8B70F6]/50"
              }`}
            >
              <Bold size={16} />
            </button>
            <button
              onClick={() => setTextStyle(prev => ({ ...prev, italic: !prev.italic }))}
              className={`flex items-center justify-center w-10 h-10 rounded-lg border-2 transition-all duration-150 ${
                textStyle.italic
                  ? "border-[#8B70F6] bg-[#8B70F6]/10 text-[#8B70F6]"
                  : "border-[#3A3A3A] bg-[#2A2A2A] text-white hover:border-[#8B70F6]/50"
              }`}
            >
              <Italic size={16} />
            </button>
          </div>

          {/* Font Size Slider */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-white">
                Font Size
              </label>
              <span className="text-sm text-[#AAAAAA]">
                {textStyle.size}px
              </span>
            </div>
            <input
              type="range"
              min="12"
              max="32"
              value={textStyle.size}
              onChange={(e) => setTextStyle(prev => ({ ...prev, size: Number(e.target.value) }))}
              className="w-full h-2 bg-[#3A3A3A] rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #8B70F6 0%, #8B70F6 ${((textStyle.size - 12) / 20) * 100}%, #3A3A3A ${((textStyle.size - 12) / 20) * 100}%, #3A3A3A 100%)`
              }}
            />
          </div>

          {/* Text Color Picker */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Text Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={textStyle.color}
                onChange={(e) => setTextStyle(prev => ({ ...prev, color: e.target.value }))}
                className="w-12 h-10 rounded-lg cursor-pointer border-2 border-[#3A3A3A] bg-[#2A2A2A]"
              />
              <input
                type="text"
                value={textStyle.color}
                onChange={(e) => setTextStyle(prev => ({ ...prev, color: e.target.value }))}
                placeholder="#ffffff"
                className="flex-1 px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B70F6] focus:border-transparent transition-all duration-150 font-mono text-sm placeholder:text-[#666666]"
              />
            </div>
            
            {/* Quick Color Presets */}
            <div className="flex items-center space-x-2 mt-3">
              <span className="text-xs text-[#AAAAAA]">Quick:</span>
              {["#ffffff", "#000000", "#8B70F6", "#FF6B6B", "#4ECDC4", "#45B7D1", "#FEE140", "#FA709A"].map((color) => (
                <button
                  key={color}
                  onClick={() => setTextStyle(prev => ({ ...prev, color }))}
                  className={`w-6 h-6 rounded-full border-2 transition-all duration-150 hover:scale-110 ${
                    textStyle.color === color ? "border-white" : "border-[#3A3A3A]"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="p-4 bg-[#1E1E1E] rounded-xl border border-[#3A3A3A]">
        <label className="block text-sm font-medium text-white mb-2">
          Preview
        </label>
        <div className="flex items-center justify-center h-16 bg-[#2A2A2A] rounded-lg">
          {brandType === "logo" && brandData.logoPreview ? (
            <img
              src={brandData.logoPreview}
              alt="Brand logo preview"
              className="h-8 object-contain"
            />
          ) : (
            <span
              style={{
                fontSize: `${textStyle.size}px`,
                fontWeight: textStyle.bold ? 'bold' : 'normal',
                fontStyle: textStyle.italic ? 'italic' : 'normal',
                color: textStyle.color || '#ffffff'
              }}
            >
              @{brandData.brandName || "Brand"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}