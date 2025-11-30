import { useState, useRef, useEffect } from "react";
import useUser from "@/src/utils/useUser";
import useUpload from "@/src/utils/useUpload";
import { useWorkspaceCanvas } from "@/src/hooks/useWorkspaceCanvas";
import { useCanvasInteraction } from "@/src/hooks/useCanvasInteraction";
import { useProjectManagement } from "@/src/hooks/useProjectManagement";
import { useImageTransforms } from "@/src/hooks/useImageTransforms";
import { WorkspaceHeader } from "@/src/components/Workspace/WorkspaceHeader";
import { UploadSection } from "@/src/components/Workspace/UploadSection";
import { EditControls } from "@/src/components/Workspace/EditControls";
import { BackgroundControls } from "@/src/components/Workspace/BackgroundControls";
import { WorkspaceCanvas } from "@/src/components/Workspace/WorkspaceCanvas";
import { BrandEditor } from "@/src/components/Workspace/BrandEditor";
import { FeedbackButton } from "@/src/components/Feedback/FeedbackButton";
import { gradientOptions, colorOptions, getDefaultBrandGradient } from "@/src/utils/backgroundOptions";

export default function WorkspacePage() {
  const { data: user, loading } = useUser();
  const [upload, { loading: uploading }] = useUpload();

  // Canvas and image state
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [images, setImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 900 });

  // Project state
  const [projectTitle, setProjectTitle] = useState("Untitled Project");
  const [showProjectBrowser, setShowProjectBrowser] = useState(false);

  // Background state
  const [background, setBackground] = useState({
    type: "gradient",
    gradient: "linear-gradient(135deg, #8B70F6 0%, #9D7DFF 100%)",
    color: "#ffffff",
  });

  // Border radius state
  const [borderRadius, setBorderRadius] = useState(15);

  // Shadow state
  const [shadowType, setShadowType] = useState("soft");
  const [shadowStrength, setShadowStrength] = useState(100);
  
  // Noise state
  const [noiseIntensity, setNoiseIntensity] = useState(0);

  // Crop state
  const [cropMode, setCropMode] = useState(false);
  const [cropArea, setCropArea] = useState(null);

  // Brand state
  const [brandData, setBrandData] = useState(null);
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [brandElement, setBrandElement] = useState(null);
  const [editingBrand, setEditingBrand] = useState(false);
  const [brandRenderKey, setBrandRenderKey] = useState(0); // Force canvas re-render

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
      // Calculate initial position based on current image - ALWAYS set a position
      let initialPosition = { x: 400, y: 350 }; // Default center position
      
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
        type: "name",
        data: `@${brandData.brandName}`,
        style: {
          bold: true,
          italic: false,
          size: 16,
          color: "#ffffff"
        },
        color: "#ffffff",
        position: initialPosition // ALWAYS has a position
      };
      setBrandElement(defaultBrandElement);
      setEditingBrand(true); // Open editor immediately
    }
  }, [showAddBrand, brandElement, brandData, images]);

  // Handle adding/updating brand element (auto-save from editor)
  const handleAddBrand = (newBrandElement) => {
    // Preserve the existing position if it exists
    const updatedElement = {
      ...newBrandElement,
      position: brandElement?.position || newBrandElement.position
    };
    setBrandElement(updatedElement);
    setShowAddBrand(true);
  };

  // Handle brand element click for editing
  const handleBrandElementClick = () => {
    setEditingBrand(true);
  };

  // Handle brand element position update
  const handleBrandPositionUpdate = (newPosition) => {
    if (brandElement) {
      setBrandElement(prev => ({
        ...prev,
        position: newPosition
      }));
      // Force canvas re-render
      setBrandRenderKey(prev => prev + 1);
    }
  };

  // Reset brand when checkbox is unchecked
  useEffect(() => {
    if (!showAddBrand) {
      setBrandElement(null);
      setEditingBrand(false);
    }
  }, [showAddBrand]);

  // Handle crop changes
  const handleCropChange = (newCropArea) => {
    setCropArea(newCropArea);
  };

  // Apply crop to selected image
  const applyCrop = () => {
    if (!selectedImageId || !cropArea) return;

    setImages(prev => prev.map(img => {
      if (img.id === selectedImageId) {
        // Calculate crop relative to original image
        const relativeX = (cropArea.x - img.x) / img.width;
        const relativeY = (cropArea.y - img.y) / img.height;
        const relativeWidth = cropArea.width / img.width;
        const relativeHeight = cropArea.height / img.height;

        // Get canvas dimensions for centering
        const canvas = canvasRef.current;
        const rect = canvas ? canvas.getBoundingClientRect() : { width: 1200, height: 900 };
        
        // Calculate center position
        const centerX = (rect.width - cropArea.width) / 2;
        const centerY = (rect.height - cropArea.height) / 2;

        return {
          ...img,
          // Update display dimensions to match crop area
          width: cropArea.width,
          height: cropArea.height,
          // Center the cropped image on canvas
          x: centerX,
          y: centerY,
          cropData: {
            x: relativeX,
            y: relativeY,
            width: relativeWidth,
            height: relativeHeight
          }
        };
      }
      return img;
    }));

    setCropMode(false);
    setCropArea(null);
  };

  // Cancel crop mode
  const cancelCrop = () => {
    setCropMode(false);
    setCropArea(null);
  };

  // Exit crop mode without applying
  useEffect(() => {
    if (!cropMode) {
      setCropArea(null);
    }
  }, [cropMode]);

  // Custom hooks
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
    brandElement, // Always use brandElement (no more preview)
    handleBrandElementClick,
    brandRenderKey, // Force re-render when this changes
  );

  useCanvasInteraction(
    canvasRef,
    images,
    setImages,
    selectedImageId,
    setSelectedImageId,
    getCanvasCoordinates,
    brandElement, // Always use brandElement (no more preview)
    handleBrandElementClick,
    handleBrandPositionUpdate,
  );

  const {
    currentProject,
    projects,
    saving,
    lastSaved,
    saveProject: saveProjectFn,
    loadProject,
    newProject,
  } = useProjectManagement(
    user,
    loading,
    setImages,
    setCanvasSize,
    setBackground,
    setSelectedImageId,
    setProjectTitle,
    setBorderRadius,
    setShadowType,
    setShadowStrength,
    setNoiseIntensity,
  );

  const { rotateImage, flipHorizontal, flipVertical, scaleImage, deleteImage } =
    useImageTransforms(selectedImageId, setImages);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/account/signin?callbackUrl=/workspace";
    }
  }, [user, loading]);

  // File upload handler - using local file URLs for immediate display
  const handleFileUpload = async (files) => {
    const fileArray = Array.from(files);
    const isFirstImage = images.length === 0; // Check if this is the first image

    for (const file of fileArray) {
      try {
        // Create a local URL for the file (no server upload needed)
        const localUrl = URL.createObjectURL(file);
        console.log("Loading image:", file.name);
        
        const img = new Image();
        img.onload = () => {
          console.log("Image loaded successfully");
          console.log("Original dimensions:", img.naturalWidth, "x", img.naturalHeight);
          
          // Get actual canvas display dimensions for proper positioning
          const canvas = canvasRef.current;
          const rect = canvas ? canvas.getBoundingClientRect() : { width: 1200, height: 900 };
          
          // Use actual canvas display size for consistent positioning
          const maxWidth = rect.width * 0.7;
          const maxHeight = rect.height * 0.7;
          
          let displayWidth = img.naturalWidth;
          let displayHeight = img.naturalHeight;
          
          // Scale down ONLY if image is larger than max dimensions
          if (displayWidth > maxWidth || displayHeight > maxHeight) {
            const ratio = Math.min(maxWidth / displayWidth, maxHeight / displayHeight);
            displayWidth = img.naturalWidth * ratio;
            displayHeight = img.naturalHeight * ratio;
          }
          
          console.log("Display dimensions:", displayWidth, "x", displayHeight);
          console.log("Canvas display size:", rect.width, "x", rect.height);
          
          // Center the image on the actual canvas display area
          const centerX = (rect.width - displayWidth) / 2;
          const centerY = (rect.height - displayHeight) / 2;
          
          const newImage = {
            id: Date.now() + Math.random(),
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
            url: localUrl,
          };
          setImages((prev) => [...prev, newImage]);
          setSelectedImageId(newImage.id);

          // Auto-select brand gradient or random gradient when the first image is uploaded
          if (isFirstImage) {
            let selectedGradient;
            
            // Use brand gradient if brand exists, otherwise use random gradient
            if (brandData?.brandColor) {
              selectedGradient = getDefaultBrandGradient(brandData.brandColor);
            } else {
              selectedGradient = gradientOptions[
                Math.floor(Math.random() * gradientOptions.length)
              ];
            }
            
            setBackground({
              type: "gradient",
              gradient: selectedGradient,
              color: "#ffffff",
            });
          }
        };
        img.onerror = (e) => {
          console.error("Image failed to load:", e);
          alert("Failed to load image. Please try a different file.");
        };
        img.src = localUrl;
      } catch (error) {
        console.error("Failed to process file:", error);
        alert(`Failed to process file: ${error.message}`);
      }
    }
  };

  // Get selected image
  const selectedImage = images.find((img) => img.id === selectedImageId);

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  // Wrapper for saveProject to pass current state
  const handleSaveProject = () => {
    saveProjectFn(projectTitle, canvasSize, background, images);
  };

  // Delete all images and reset background
  const handleDeleteAllImages = () => {
    setImages([]);
    setSelectedImageId(null);
    // Reset background to dark theme color
    setBackground({
      type: "color",
      gradient: "linear-gradient(135deg, #8B70F6 0%, #9D7DFF 100%)",
      color: "#2A2A2A",
    });
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <>
      {/* Google Fonts import */}
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <div
        className="h-screen bg-[#1E1E1E] flex flex-col overflow-hidden"
        style={{ fontFamily: "Instrument Sans, Inter, system-ui, sans-serif" }}
      >
        <WorkspaceHeader
          projectTitle={projectTitle}
          setProjectTitle={setProjectTitle}
          newProject={newProject}
          exportCanvas={exportCanvas}
          user={user}
          hasImages={images.length > 0}
          selectedImageId={selectedImageId}
          deleteSelectedImage={deleteImage}
          deleteAllImages={handleDeleteAllImages}
          onBrandUpdate={setBrandData}
        />

        {/* Main workspace */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Controls */}
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
                <UploadSection handleFileUpload={handleFileUpload} fileInputRef={fileInputRef} />

                <EditControls
                  hasImages={images.length > 0}
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

                <BackgroundControls
                  background={background}
                  setBackground={setBackground}
                  gradientOptions={gradientOptions}
                  colorOptions={colorOptions}
                  hasImages={images.length > 0}
                  brandColor={brandData?.brandColor}
                />
              </>
            )}
          </div>

          {/* Right Panel - Canvas */}
          <WorkspaceCanvas
            canvasRef={canvasRef}
            images={images}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            cropMode={cropMode}
            selectedImageId={selectedImageId}
            onCropChange={handleCropChange}
            onApplyCrop={applyCrop}
            onCancelCrop={cancelCrop}
            showAddBrand={showAddBrand}
            setShowAddBrand={setShowAddBrand}
          />
        </div>

        {/* Feedback Button */}
        <FeedbackButton pageSource="workspace" />
      </div>
    </>
  );
}
