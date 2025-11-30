'use client';

import { useState, useRef, useEffect } from 'react';
import useUser from '@/src/utils/useUser';
import useUpload from '@/src/utils/useUpload';
import { useWorkspaceCanvas } from '@/src/hooks/useWorkspaceCanvas';
import { useCanvasInteraction } from '@/src/hooks/useCanvasInteraction';
import { useProjectManagement } from '@/src/hooks/useProjectManagement';
import { useImageTransforms } from '@/src/hooks/useImageTransforms';
import { WorkspaceHeader } from '@/src/components/Workspace/WorkspaceHeader';
import { UploadSection } from '@/src/components/Workspace/UploadSection';
import { EditControls } from '@/src/components/Workspace/EditControls';
import { BackgroundControls } from '@/src/components/Workspace/BackgroundControls';
import { WorkspaceCanvas } from '@/src/components/Workspace/WorkspaceCanvas';
import { BrandEditor } from '@/src/components/Workspace/BrandEditor';
import { FeedbackButton } from '@/src/components/Feedback/FeedbackButton';
import { gradientOptions, colorOptions, getDefaultBrandGradient } from '@/src/utils/backgroundOptions';

export default function WorkspacePage() {
  const { data: user, loading } = useUser();
  const [upload, { loading: uploading }] = useUpload();

  // Canvas and image state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<any[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 900 });

  // Project state
  const [projectTitle, setProjectTitle] = useState('Untitled Project');
  const [showProjectBrowser, setShowProjectBrowser] = useState(false);

  // Background state
  const [background, setBackground] = useState({
    type: 'gradient',
    gradient: 'linear-gradient(135deg, #8B70F6 0%, #9D7DFF 100%)',
    color: '#ffffff',
  });

  // Border radius state
  const [borderRadius, setBorderRadius] = useState(15);

  // Shadow state
  const [shadowType, setShadowType] = useState('soft');
  const [shadowStrength, setShadowStrength] = useState(100);
  
  // Noise state
  const [noiseIntensity, setNoiseIntensity] = useState(0);

  // Crop state
  const [cropMode, setCropMode] = useState(false);
  const [cropArea, setCropArea] = useState<any>(null);

  // Handle crop changes
  const handleCropChange = (newCropArea: any) => {
    setCropArea(newCropArea);
  };

  // Brand state
  const [brandData, setBrandData] = useState<any>(null);
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [brandElement, setBrandElement] = useState<any>(null);
  const [editingBrand, setEditingBrand] = useState(false);
  const [brandRenderKey, setBrandRenderKey] = useState(0);

  // Load brand data on mount
  useEffect(() => {
    const savedBrand = localStorage.getItem('brandData');
    if (savedBrand) {
      setBrandData(JSON.parse(savedBrand));
    }
  }, []);

  // Clear brand element when Add Brand is unchecked
  useEffect(() => {
    if (!showAddBrand) {
      setBrandElement(null);
      setEditingBrand(false);
    }
  }, [showAddBrand]);

  // Handle adding/updating brand element (auto-save from editor)
  const handleAddBrand = (newBrandElement: any) => {
    const updatedElement = {
      ...newBrandElement,
      position: brandElement?.position || newBrandElement.position
    };
    setBrandElement(updatedElement);
    setShowAddBrand(true);
    setBrandRenderKey((prev) => prev + 1); // Force canvas re-render
  };

  // Auto-add brand name and open editor when Add Brand is first checked
  useEffect(() => {
    if (showAddBrand && !brandElement && brandData?.brandName) {
      let initialPosition = { x: 400, y: 350 };
      
      if (images.length > 0) {
        const bottomImage = images.reduce((bottom, img) => {
          const imgBottom = img.y + img.height;
          const currentBottom = bottom.y + bottom.height;
          return imgBottom > currentBottom ? img : bottom;
        }, images[0]);
        
        initialPosition = {
          x: bottomImage.x + bottomImage.width / 2,
          y: bottomImage.y + bottomImage.height + 16
        };
      }
      
      const defaultBrandElement = {
        type: 'name',
        data: `@${brandData.brandName}`,
        style: {
          bold: true,
          italic: false,
          size: 16,
          color: '#ffffff'
        },
        color: '#ffffff',
        position: initialPosition
      };
      setBrandElement(defaultBrandElement);
      setEditingBrand(true);
    }
  }, [showAddBrand, brandElement, brandData, images]);

  // Use custom hooks
  const { getCanvasCoordinates, exportCanvas } = useWorkspaceCanvas(
    canvasRef,
    images,
    background,
    canvasSize,
    selectedImageId,
    borderRadius,
    shadowType,
    shadowStrength,
    noiseIntensity,
    brandElement,
    null, // onBrandElementClick
    brandRenderKey
  );

  const canvasInteraction = useCanvasInteraction(
    canvasRef,
    images,
    setImages,
    selectedImageId,
    setSelectedImageId,
    getCanvasCoordinates,
    brandElement,
    null, // onBrandElementClick
    (newPosition) => {
      if (brandElement) {
        setBrandElement({ ...brandElement, position: newPosition });
      }
    }
  );

  const projectManagement = useProjectManagement({
    projectTitle,
    setProjectTitle,
    images,
    setImages,
    background,
    setBackground,
    canvasSize,
    setCanvasSize,
    borderRadius,
    setBorderRadius,
    shadowType,
    setShadowType,
    shadowStrength,
    setShadowStrength,
    noiseIntensity,
    setNoiseIntensity,
    brandElement,
    setBrandElement,
    showAddBrand,
    setShowAddBrand,
  });

  const imageTransforms = useImageTransforms({
    images,
    setImages,
    selectedImageId,
    cropMode,
    setCropMode,
    cropArea,
    setCropArea,
    canvasSize,
    canvasRef,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/account/signin';
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Delete functions
  const deleteSelectedImage = () => {
    if (selectedImageId) {
      setImages((prev) => prev.filter((img) => img.id !== selectedImageId));
      setSelectedImageId(null);
    }
  };

  const deleteAllImages = () => {
    if (window.confirm('Are you sure you want to delete all images?')) {
      setImages([]);
      setSelectedImageId(null);
    }
  };

  const newProject = () => {
    if (images.length > 0 && window.confirm('Start a new project? Current work will be lost.')) {
      setImages([]);
      setSelectedImageId(null);
      setProjectTitle('Untitled Project');
      setBackground({
        type: 'gradient',
        gradient: 'linear-gradient(135deg, #8B70F6 0%, #9D7DFF 100%)',
        color: '#ffffff',
      });
      setBorderRadius(15);
      setShadowType('soft');
      setShadowStrength(100);
      setNoiseIntensity(0);
      setBrandElement(null);
      setShowAddBrand(false);
    } else if (images.length === 0) {
      // Just reset if no images
      setProjectTitle('Untitled Project');
    }
  };

  // Compute values before JSX to avoid hydration issues
  const hasImages = images.length > 0;
  const brandColor = brandData?.brandColor || null;

  return (
    <div className="h-screen bg-[#1E1E1E] flex flex-col overflow-hidden">
      <WorkspaceHeader
        projectTitle={projectTitle}
        setProjectTitle={setProjectTitle}
        newProject={newProject}
        exportCanvas={exportCanvas}
        user={user}
        hasImages={hasImages}
        selectedImageId={selectedImageId}
        deleteSelectedImage={deleteSelectedImage}
        deleteAllImages={deleteAllImages}
        onBrandUpdate={setBrandData}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Upload & Controls */}
        <div className="w-1/3 lg:w-1/4 bg-[#252525] border-r border-[#3A3A3A] p-6 overflow-y-auto overflow-x-hidden">
          {editingBrand ? (
            <BrandEditor
              brandData={brandData}
              onAddBrand={handleAddBrand}
              onClose={() => setEditingBrand(false)}
              existingBrandElement={brandElement}
            />
          ) : (
            <>
              <UploadSection
            fileInputRef={fileInputRef}
            onFileSelect={(files) => {
              const isFirstImage = images.length === 0;
              
              Array.from(files).forEach((file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const img = new Image();
                  img.onload = () => {
                    // Get canvas dimensions for centering
                    const canvas = canvasRef.current;
                    const rect = canvas ? canvas.getBoundingClientRect() : { width: 1200, height: 900 };
                    
                    // Calculate display size (scale down if too large)
                    const maxWidth = rect.width * 0.7;
                    const maxHeight = rect.height * 0.7;
                    
                    let displayWidth = img.naturalWidth;
                    let displayHeight = img.naturalHeight;
                    
                    if (displayWidth > maxWidth || displayHeight > maxHeight) {
                      const ratio = Math.min(maxWidth / displayWidth, maxHeight / displayHeight);
                      displayWidth = img.naturalWidth * ratio;
                      displayHeight = img.naturalHeight * ratio;
                    }
                    
                    // Center the image
                    const centerX = (rect.width - displayWidth) / 2;
                    const centerY = (rect.height - displayHeight) / 2;
                    
                    const newImage = {
                      id: Date.now() + Math.random(),
                      src: e.target?.result as string,
                      element: img,
                      x: centerX,
                      y: centerY,
                      width: displayWidth,
                      height: displayHeight,
                      rotation: 0,
                      scaleX: 1,
                      scaleY: 1,
                      originalWidth: img.naturalWidth,
                      originalHeight: img.naturalHeight,
                      url: e.target?.result as string,
                    };
                    
                    setImages((prev) => [...prev, newImage]);
                    setSelectedImageId(newImage.id);
                    
                    // Set gradient for first image - use brand gradient if available, otherwise random
                    if (isFirstImage) {
                      let selectedGradient;
                      
                      if (brandData?.brandColor) {
                        // Use brand color gradient
                        selectedGradient = getDefaultBrandGradient(brandData.brandColor);
                      } else {
                        // Fallback to random gradient
                        selectedGradient = gradientOptions[
                          Math.floor(Math.random() * gradientOptions.length)
                        ];
                      }
                      
                      setBackground({
                        type: 'gradient',
                        gradient: selectedGradient,
                        color: '#ffffff',
                      });
                    }
                  };
                  img.src = e.target?.result as string;
                };
                reader.readAsDataURL(file);
              });
            }}
            uploading={uploading}
          />

          {hasImages && (
            <EditControls
              hasImages={hasImages}
              borderRadius={borderRadius}
              setBorderRadius={setBorderRadius}
              shadowType={shadowType}
              setShadowType={setShadowType}
              shadowStrength={shadowStrength}
              setShadowStrength={setShadowStrength}
              noiseIntensity={noiseIntensity}
              setNoiseIntensity={setNoiseIntensity}
              cropMode={cropMode}
              setCropMode={setCropMode}
            />
          )}

          {hasImages && (
            <BackgroundControls
              background={background}
              setBackground={setBackground}
              colorOptions={colorOptions}
              hasImages={hasImages}
              brandColor={brandColor}
            />
          )}
            </>
          )}
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 overflow-auto">
          <WorkspaceCanvas
            canvasRef={canvasRef}
            canvasSize={canvasSize}
            images={images}
            selectedImageId={selectedImageId}
            cropMode={cropMode}
            cropArea={cropArea}
            onCropChange={handleCropChange}
            onApplyCrop={imageTransforms.applyCrop}
            onCancelCrop={imageTransforms.cancelCrop}
            showAddBrand={showAddBrand}
            setShowAddBrand={setShowAddBrand}
          />
        </div>
      </div>

      <FeedbackButton pageSource="workspace" />
    </div>
  );
}
