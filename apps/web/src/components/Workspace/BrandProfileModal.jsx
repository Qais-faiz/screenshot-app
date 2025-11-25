import { useState, useEffect, useRef } from "react";
import { X, Edit3, Sparkles } from "lucide-react";

export function BrandProfileModal({ isOpen, onClose, brandData, onEdit }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const modalRef = useRef(null);

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
      document.body.style.overflow = 'hidden';
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
    }, 200);
  };

  const handleEditClick = () => {
    handleClose();
    setTimeout(() => {
      onEdit();
    }, 250);
  };

  if (!isOpen) return null;

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
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-[#8B70F6] to-[#9D7DFF] rounded-lg">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">My Brand</h2>
                <p className="text-sm text-gray-500">Your brand profile</p>
              </div>
            </div>

            {/* Brand Details */}
            <div className="space-y-4">
              {/* Logo Section */}
              {brandData?.logoPreview && (
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={brandData.logoPreview}
                    alt="Brand logo"
                    className="w-12 h-12 object-contain rounded-lg border border-gray-200"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Brand Logo</p>
                    <p className="text-xs text-gray-500">Custom uploaded logo</p>
                  </div>
                </div>
              )}

              {/* Brand Name */}
              {brandData?.brandName && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 mb-1">Brand Name</p>
                  <p className="text-sm text-gray-900 font-medium">@{brandData.brandName}</p>
                </div>
              )}

              {/* Brand Color */}
              {brandData?.brandColor && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 mb-2">Brand Color</p>
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-lg border border-gray-200"
                      style={{ backgroundColor: brandData.brandColor }}
                    />
                    <span className="text-sm text-gray-900 font-mono">{brandData.brandColor}</span>
                  </div>
                </div>
              )}

              {/* No Brand Data */}
              {(!brandData?.brandName && !brandData?.brandColor && !brandData?.logoPreview) && (
                <div className="text-center py-8">
                  <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
                    <Sparkles size={24} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mb-2">No brand profile yet</p>
                  <p className="text-xs text-gray-400">Create your brand to get started</p>
                </div>
              )}
            </div>

            {/* Edit Button */}
            <button
              onClick={handleEditClick}
              className="w-full mt-6 flex items-center justify-center space-x-2 py-2.5 bg-gradient-to-r from-[#8B70F6] to-[#9D7DFF] hover:from-[#7E64F2] hover:to-[#8B70F6] text-white text-sm font-medium rounded-lg transition-all duration-150"
            >
              <Edit3 size={16} />
              <span>Edit Brand</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}