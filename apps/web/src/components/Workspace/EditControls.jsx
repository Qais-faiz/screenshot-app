import { Crop } from "lucide-react";

export function EditControls({
  hasImages,
  borderRadius,
  setBorderRadius,
  shadowType,
  setShadowType,
  shadowStrength,
  setShadowStrength,
  noiseIntensity,
  setNoiseIntensity,
  cropMode,
  setCropMode,
}) {
  if (!hasImages) return null;

  return (
    <div className="mb-8">
      {/* Border Radius Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-white">
            Border Radius
          </label>
          <span className="text-sm text-[#AAAAAA]">
            {borderRadius}px
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={borderRadius}
          onChange={(e) => setBorderRadius(Number(e.target.value))}
          className="w-full h-2 bg-[#3A3A3A] rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #8B70F6 0%, #8B70F6 ${borderRadius}%, #3A3A3A ${borderRadius}%, #3A3A3A 100%)`
          }}
        />
      </div>

      {/* Crop Feature */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-white">
            Crop Image
          </label>
          {cropMode && (
            <span className="text-xs text-[#8B70F6] font-medium">
              Active
            </span>
          )}
        </div>
        <button
          onClick={() => setCropMode(!cropMode)}
          className={`w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl font-medium transition-all duration-150 ${
            cropMode
              ? "bg-[#8B70F6] text-white hover:bg-[#7E64F2]"
              : "bg-[#1E1E1E] border border-[#3A3A3A] text-white hover:bg-[#2A2A2A]"
          }`}
        >
          <Crop size={16} />
          <span>Crop Image</span>
        </button>
        {cropMode && (
          <p className="text-xs text-[#AAAAAA] mt-2 text-center">
            Use the toolbar above the canvas to apply or cancel
          </p>
        )}
      </div>

      {/* Shadow System */}
      <div>
        <h4 className="text-sm font-medium text-white mb-3">
          Shadow
        </h4>
        
        {/* Shadow Preset Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => setShadowType("none")}
            className={`px-3 py-2 text-sm font-medium rounded-xl transition-all duration-150 ${
              shadowType === "none"
                ? "bg-[#8B70F6] text-white"
                : "bg-[#1E1E1E] border border-[#3A3A3A] text-white hover:bg-[#2A2A2A]"
            }`}
          >
            None
          </button>
          <button
            onClick={() => setShadowType("soft")}
            className={`px-3 py-2 text-sm font-medium rounded-xl transition-all duration-150 ${
              shadowType === "soft"
                ? "bg-[#8B70F6] text-white"
                : "bg-[#1E1E1E] border border-[#3A3A3A] text-white hover:bg-[#2A2A2A]"
            }`}
          >
            Soft
          </button>
          <button
            onClick={() => setShadowType("deep")}
            className={`px-3 py-2 text-sm font-medium rounded-xl transition-all duration-150 ${
              shadowType === "deep"
                ? "bg-[#8B70F6] text-white"
                : "bg-[#1E1E1E] border border-[#3A3A3A] text-white hover:bg-[#2A2A2A]"
            }`}
          >
            Deep
          </button>
          <button
            onClick={() => setShadowType("glow")}
            className={`px-3 py-2 text-sm font-medium rounded-xl transition-all duration-150 ${
              shadowType === "glow"
                ? "bg-[#8B70F6] text-white"
                : "bg-[#1E1E1E] border border-[#3A3A3A] text-white hover:bg-[#2A2A2A]"
            }`}
          >
            Glow
          </button>
        </div>

        {/* Shadow Strength Slider - Only show if not "none" */}
        {shadowType !== "none" && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-white">
                Shadow Strength
              </label>
              <span className="text-sm text-[#AAAAAA]">
                {shadowStrength}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={shadowStrength}
              onChange={(e) => setShadowStrength(Number(e.target.value))}
              className="w-full h-2 bg-[#3A3A3A] rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #8B70F6 0%, #8B70F6 ${shadowStrength}%, #3A3A3A ${shadowStrength}%, #3A3A3A 100%)`
              }}
            />
          </div>
        )}

        {/* Noise Intensity Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-white">
              Noise
            </label>
            <span className="text-sm text-[#AAAAAA]">
              {noiseIntensity}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={noiseIntensity}
            onChange={(e) => setNoiseIntensity(Number(e.target.value))}
            className="w-full h-2 bg-[#3A3A3A] rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #8B70F6 0%, #8B70F6 ${noiseIntensity}%, #3A3A3A ${noiseIntensity}%, #3A3A3A 100%)`
            }}
          />
        </div>
      </div>
    </div>
  );
}
