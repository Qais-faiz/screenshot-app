'use client';

import { Upload } from "lucide-react";

export function UploadSection({ handleFileUpload, fileInputRef }) {
  const handleChange = (e) => {
    handleFileUpload(e.target.files);
    // Reset the input value to allow uploading the same file again
    e.target.value = '';
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-white mb-4">
        Upload Images
      </h3>

      <label className="block">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="sr-only"
        />
        <div className="border-2 border-dashed border-[#8B70F6] rounded-2xl p-6 text-center cursor-pointer hover:bg-[#8B70F6]/10 transition-colors duration-150">
          <Upload className="mx-auto mb-2 text-[#8B70F6]" size={24} />
          <p className="text-sm text-white font-medium">
            Click to upload or drag & drop
          </p>
          <p className="text-xs text-[#AAAAAA] mt-1">
            PNG, JPG, GIF up to 10MB
          </p>
        </div>
      </label>
    </div>
  );
}
