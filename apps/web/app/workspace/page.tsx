'use client';

import { useState, useRef, useEffect } from 'react';
import useUser from '@/utils/useUser';
import useUpload from '@/utils/useUpload';
import { useWorkspaceCanvas } from '@/hooks/useWorkspaceCanvas';
import { useCanvasInteraction } from '@/hooks/useCanvasInteraction';
import { useProjectManagement } from '@/hooks/useProjectManagement';
import { useImageTransforms } from '@/hooks/useImageTransforms';
import { WorkspaceHeader } from '@/components/Workspace/WorkspaceHeader';
import { UploadSection } from '@/components/Workspace/UploadSection';
import { EditControls } from '@/components/Workspace/EditControls';
import { BackgroundControls } from '@/components/Workspace/BackgroundControls';
import { WorkspaceCanvas } from '@/components/Workspace/WorkspaceCanvas';
import { BrandEditor } from '@/components/Workspace/BrandEditor';
import { FeedbackButton } from '@/components/Feedback/FeedbackButton';
import { gradientOptions, colorOptions, getDefaultBrandGradient } from '@/utils/backgroundOptions';

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
  const workspaceCanvas = useWorkspaceCanvas({
    canvasRef,
    images,
    background,
    borderRadius,
    shadowType,
    shadowStrength,
    noiseIntensity,
    brandElement,
    brandData,
    brandRenderKey,
  });

  const canvasInteraction = useCanvasInteraction({
    canvasRef,
    images,
    setImages,
    selectedImageId,
    setSelectedImageId,
    cropMode,
    cropArea,
    setCropArea,
    brandElement,
    setBrandElement,
    setEditingBrand,
  });

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

  return (
    <div className="min-h-screen bg-gray-50">
      <WorkspaceHeader
        projectTitle={projectTitle}
        setProjectTitle={setProjectTitle}
        onSave={projectManagement.saveProject}
        onLoad={() => setShowProjectBrowser(true)}
        onExport={workspaceCanvas.exportCanvas}
        user={user}
      />

      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Sidebar - Upload & Controls */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <UploadSection
            fileInputRef={fileInputRef}
            onFileSelect={(files) => {
              Array.from(files).forEach((file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const img = new Image();
                  img.onload = () => {
                    const newImage = {
                      id: Date.now() + Math.random(),
                      src: e.target?.result as string,
                      x: 100,
                      y: 100,
                      width: img.width,
                      height: img.height,
                      rotation: 0,
                      originalWidth: img.width,
                      originalHeight: img.height,
                    };
                    setImages((prev) => [...prev, newImage]);
                  };
                  img.src = e.target?.result as string;
                };
                reader.readAsDataURL(file);
              });
            }}
            uploading={uploading}
          />

          <EditControls
            selectedImage={images.find((img) => img.id === selectedImageId)}
            onRotate={imageTransforms.rotateImage}
            onFlip={imageTransforms.flipImage}
            onResize={imageTransforms.resizeImage}
            onDelete={imageTransforms.deleteImage}
            cropMode={cropMode}
            onCropToggle={() => setCropMode(!cropMode)}
            onCropApply={imageTransforms.applyCrop}
            borderRadius={borderRadius}
            onBorderRadiusChange={setBorderRadius}
            shadowType={shadowType}
            onShadowTypeChange={setShadowType}
            shadowStrength={shadowStrength}
            onShadowStrengthChange={setShadowStrength}
            noiseIntensity={noiseIntensity}
            onNoiseIntensityChange={setNoiseIntensity}
          />

          <BackgroundControls
            background={background}
            onBackgroundChange={setBackground}
            gradientOptions={gradientOptions}
            colorOptions={colorOptions}
          />

          <BrandEditor
            brandData={brandData}
            setBrandData={setBrandData}
            showAddBrand={showAddBrand}
            setShowAddBrand={setShowAddBrand}
            brandElement={brandElement}
            setBrandElement={setBrandElement}
            editingBrand={editingBrand}
            setEditingBrand={setEditingBrand}
            onBrandUpdate={() => setBrandRenderKey((prev) => prev + 1)}
          />
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 overflow-auto p-8">
          <WorkspaceCanvas
            canvasRef={canvasRef}
            canvasSize={canvasSize}
            images={images}
            selectedImageId={selectedImageId}
            cropMode={cropMode}
            cropArea={cropArea}
            onCanvasClick={canvasInteraction.handleCanvasClick}
            onCanvasMouseDown={canvasInteraction.handleCanvasMouseDown}
            onCanvasMouseMove={canvasInteraction.handleCanvasMouseMove}
            onCanvasMouseUp={canvasInteraction.handleCanvasMouseUp}
          />
        </div>
      </div>

      <FeedbackButton pageSource="workspace" />
    </div>
  );
}
