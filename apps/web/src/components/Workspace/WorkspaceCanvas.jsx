'use client';

import { Upload } from "lucide-react";
import { CropOverlay } from "./CropOverlay";
import { CropToolbar } from "./CropToolbar";

export function WorkspaceCanvas({
  canvasRef,
  images,
  handleDragOver,
  handleDrop,
  cropMode,
  selectedImageId,
  onCropChange,
  onApplyCrop,
  onCancelCrop,
  showAddBrand,
  setShowAddBrand,
}) {
  return (
    <div
      className="flex-1 p-6 flex flex-col items-center bg-[#1A1A1A] pt-5"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="relative bg-[#2A2A2A] rounded-3xl shadow-lg border border-[#3A3A3A] p-6 w-full max-w-4xl">
        {/* Crop Toolbar */}
        <CropToolbar
          cropMode={cropMode}
          onApplyCrop={onApplyCrop}
          onCancelCrop={onCancelCrop}
        />

        <div className="relative">
          <canvas
            ref={canvasRef}
            className={`w-full rounded-2xl ${cropMode ? 'cursor-default' : 'cursor-crosshair'}`}
            style={{
              display: "block",
              maxHeight: "calc(100vh - 200px)",
            }}
          />

          {/* Crop Overlay */}
          {cropMode && selectedImageId && (
            <CropOverlay
              image={images.find(img => img.id === selectedImageId)}
              cropMode={cropMode}
              onCropChange={onCropChange}
              canvasRef={canvasRef}
            />
          )}
        </div>

        {images.length === 0 && (
          <div className="absolute inset-6 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <Upload className="mx-auto mb-4 text-[#8B70F6]" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">
                Drop your images here
              </h3>
              <p className="text-[#AAAAAA]">
                Or use the upload button on the left
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add Brand Checkbox - Only show when images exist */}
      {images.length > 0 && (
        <div className="mt-4 flex justify-center">
          <label className="flex items-center space-x-3 cursor-pointer bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-4 py-3 hover:bg-[#333333] transition-all duration-150">
            <input
              type="checkbox"
              checked={showAddBrand}
              onChange={(e) => setShowAddBrand(e.target.checked)}
              className="w-4 h-4 text-[#8B70F6] bg-[#2A2A2A] border-[#3A3A3A] rounded focus:ring-[#8B70F6] focus:ring-2"
            />
            <span className="text-sm font-medium text-white">Add Brand</span>
          </label>
        </div>
      )}
    </div>
  );
}
