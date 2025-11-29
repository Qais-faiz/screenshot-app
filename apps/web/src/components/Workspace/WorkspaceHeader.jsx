'use client';

import { useState, useRef, useEffect } from "react";
import { FileText, Plus, Download, User, Trash2, Sparkles, LogOut } from "lucide-react";
import { BrandSettingsModal } from "./BrandSettingsModal";
import { BrandProfileModal } from "./BrandProfileModal";

export function WorkspaceHeader({
  projectTitle,
  setProjectTitle,
  newProject,
  exportCanvas,
  user,
  hasImages,
  selectedImageId,
  deleteSelectedImage,
  deleteAllImages,
  onBrandUpdate,
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showBrandProfile, setShowBrandProfile] = useState(false);
  const [brandData, setBrandData] = useState(null);
  const userMenuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle brand save
  const handleBrandSave = (savedBrandData) => {
    setBrandData(savedBrandData);
    localStorage.setItem('brandData', JSON.stringify(savedBrandData));
    // Notify parent component about brand update
    if (onBrandUpdate) {
      onBrandUpdate(savedBrandData);
    }
  };

  // Load brand data on mount
  useEffect(() => {
    const savedBrand = localStorage.getItem('brandData');
    if (savedBrand) {
      const parsedBrand = JSON.parse(savedBrand);
      setBrandData(parsedBrand);
      // Notify parent component about loaded brand
      if (onBrandUpdate) {
        onBrandUpdate(parsedBrand);
      }
    }
  }, [onBrandUpdate]);

  const handleMyBrandClick = () => {
    setShowUserMenu(false);
    setShowBrandProfile(true);
  };

  const handleEditBrand = () => {
    setShowBrandModal(true);
  };

  return (
    <header className="bg-[#252525] border-b border-[#3A3A3A] relative z-10">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Logo and Project Title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <img
              src="https://www.create.xyz/images/logoipsum/224"
              alt="Logo"
              className="h-8 w-8"
            />
            <span className="text-white text-xl font-semibold">
              DesignCraft
            </span>
          </div>

          {/* Project Title */}
          <div className="hidden md:flex items-center space-x-2">
            <FileText
              size={16}
              className="text-[#AAAAAA]"
            />
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="bg-transparent text-white font-medium text-sm border-none outline-none focus:bg-[#2A2A2A] px-2 py-1 rounded-lg transition-all duration-150"
              placeholder="Project title"
            />
          </div>
        </div>

        {/* Project Controls */}
        <div className="flex items-center space-x-3">
          {/* New Button */}
          <button
            onClick={newProject}
            className="flex items-center space-x-2 px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] text-white font-medium rounded-xl hover:bg-[#333333] transition-all duration-150"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New</span>
          </button>

          {/* Brand Button */}
          <button
            onClick={() => setShowBrandModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-[#2A2A2A] border border-[#3A3A3A] text-white font-medium rounded-xl hover:bg-[#333333] transition-all duration-150"
          >
            <Sparkles size={16} />
            <span className="hidden sm:inline">Brand</span>
          </button>

          {/* Delete Button - Only show when images exist */}
          {hasImages && (
            <button
              onClick={selectedImageId ? deleteSelectedImage : deleteAllImages}
              className="flex items-center space-x-2 px-4 py-2.5 bg-red-900/20 border border-red-800 text-red-400 font-medium rounded-2xl hover:bg-red-900/30 transition-all duration-150"
              title={selectedImageId ? "Delete selected image" : "Delete all images"}
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          )}

          {/* Export Button */}
          <button
            onClick={exportCanvas}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-t from-[#8B70F6] to-[#9D7DFF] hover:from-[#7E64F2] hover:to-[#8B70F6] text-white font-medium rounded-2xl transition-all duration-150"
          >
            <Download size={16} />
            <span>Export</span>
          </button>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center justify-center w-10 h-10 bg-[#2A2A2A] border border-[#3A3A3A] rounded-full hover:bg-[#333333] transition-all duration-150"
              title={user.email}
            >
              <User size={18} className="text-[#AAAAAA]" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-[#2A2A2A] border border-[#3A3A3A] rounded-2xl shadow-2xl overflow-hidden z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-[#3A3A3A]">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-[#3A3A3A] rounded-full">
                      <User size={18} className="text-[#AAAAAA]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-[#AAAAAA]">
                        Account
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={handleMyBrandClick}
                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-white hover:bg-[#333333] transition-colors duration-150"
                  >
                    <Sparkles size={16} className="text-[#AAAAAA]" />
                    <span className="text-sm">My Brand</span>
                    {brandData?.brandName && (
                      <div className="ml-auto flex items-center space-x-1">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: brandData.brandColor || '#8B70F6' }}
                        />
                      </div>
                    )}
                  </button>
                  <a
                    href="/account/logout"
                    className="flex items-center space-x-3 px-4 py-2.5 text-white hover:bg-[#333333] transition-colors duration-150"
                  >
                    <LogOut size={16} className="text-[#AAAAAA]" />
                    <span className="text-sm">Sign Out</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Brand Settings Modal */}
      <BrandSettingsModal
        isOpen={showBrandModal}
        onClose={() => setShowBrandModal(false)}
        onSave={handleBrandSave}
      />

      {/* Brand Profile Modal */}
      <BrandProfileModal
        isOpen={showBrandProfile}
        onClose={() => setShowBrandProfile(false)}
        brandData={brandData}
        onEdit={handleEditBrand}
      />
    </header>
  );
}
