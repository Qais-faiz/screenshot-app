'use client';

import { Check, X } from "lucide-react";

export function CropToolbar({ cropMode, onApplyCrop, onCancelCrop }) {
  if (!cropMode) return null;

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center space-x-3 bg-[#1E1E1E] border border-[#3A3A3A] rounded-xl px-4 py-2 shadow-2xl">
      <button
        onClick={onApplyCrop}
        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all duration-150"
      >
        <Check size={16} />
        <span>Apply</span>
      </button>
      <button
        onClick={onCancelCrop}
        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all duration-150"
      >
        <X size={16} />
        <span>Cancel</span>
      </button>
    </div>
  );
}