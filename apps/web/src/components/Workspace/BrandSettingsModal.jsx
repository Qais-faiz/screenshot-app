'use client';

import { useState, useEffect, useRef } from "react";
import { X, Upload } from "lucide-react";

export function BrandSettingsModal({ isOpen, onClose, onSave }) {
  const [brandName, setBrandName] = useState("");
  const [brandColor, setBrandColor] = useState("#808080");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const modalRef = useRef(null);

  // Always reset form to empty when modal opens
  useEffect(() => {
    if (isOpen) {
      // Always start with empty form for new brand creation
      setBrandName("");
      setBrandColor("#808080");
      setLogoPreview(null);
      setLogoFile(null);
    }
  }, [isOpen]);

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 200); // Match animation duration
  };

  if (!isOpen) return null;

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
    // Reset input value to allow re-uploading same file
    e.target.value = '';
  };

  const handleSave = () => {
    const brandData = {
      brandName,
      brandColor,
      logoFile,
      logoPreview
    };
    
    if (onSave) {
      onSave(brandData);
    }
    
    handleClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity duration-200 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          ref={modalRef}
          className={`bg-white rounded-xl shadow-2xl w-full max-w-md relative border border-gray-200 transition-all duration-200 ${
            isAnimating 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 translate-y-4'
          }`}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-150"
          >
            <X size={16} className="text-gray-600" />
          </button>

          {/* Content */}
          <div className="p-5">
            {/* Title */}
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Brand Settings
            </h2>

            {/* Logo Upload Area */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Logo
              </label>
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#8B70F6]/50 transition-colors duration-150 bg-gray-50">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-16 w-16 object-contain rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload size={24} className="text-gray-500 mb-1.5" />
                    <span className="text-xs text-gray-500">Upload Logo</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Brand Name Input */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Brand Name
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Enter your brand name"
                className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B70F6] focus:border-transparent transition-all duration-150 placeholder:text-gray-400"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                Will appear as @{brandName || "BrandName"} on the final image
              </p>
            </div>

            {/* Brand Color Picker */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Brand Color
              </label>
              <div className="flex items-center space-x-2.5">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-12 h-9 rounded-lg cursor-pointer border-2 border-gray-300"
                />
                <input
                  type="text"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  placeholder="#808080"
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B70F6] focus:border-transparent transition-all duration-150 font-mono text-xs placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="w-full py-2 bg-gradient-to-r from-[#8B70F6] to-[#9D7DFF] hover:from-[#7E64F2] hover:to-[#8B70F6] text-white text-sm font-medium rounded-lg transition-all duration-150"
            >
              Save Brand
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
