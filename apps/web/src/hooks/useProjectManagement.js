'use client';

import { useState, useCallback, useEffect } from "react";

export function useProjectManagement(
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
) {
  const [currentProject, setCurrentProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const loadProjects = useCallback(async () => {
    try {
      const response = await fetch("/api/projects");
      if (!response.ok) throw new Error("Failed to load projects");
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  }, []);

  const saveProject = useCallback(
    async (projectTitle, canvasSize, background, images) => {
      if (saving) return;

      setSaving(true);
      try {
        let projectId = currentProject?.id;

        // Create or update project
        const projectData = {
          title: projectTitle,
          canvas_width: canvasSize.width,
          canvas_height: canvasSize.height,
          background_type: background.type,
          background_gradient: background.gradient,
          background_color: background.color,
        };

        if (projectId) {
          // Update existing project
          const response = await fetch(`/api/projects/${projectId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(projectData),
          });
          if (!response.ok) throw new Error("Failed to update project");
        } else {
          // Create new project
          const response = await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(projectData),
          });
          if (!response.ok) throw new Error("Failed to create project");
          const data = await response.json();
          projectId = data.project.id;
          setCurrentProject(data.project);
        }

        // Save images to project
        for (const image of images) {
          const imageData = {
            image_url: image.url,
            x_position: image.x,
            y_position: image.y,
            width_size: image.width,
            height_size: image.height,
            rotation_angle: image.rotation,
            scale_x: image.scaleX,
            scale_y: image.scaleY,
            z_index: images.indexOf(image),
          };

          await fetch(`/api/projects/${projectId}/images`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(imageData),
          });
        }

        setLastSaved(new Date());
      } catch (error) {
        console.error("Error saving project:", error);
      } finally {
        setSaving(false);
      }
    },
    [currentProject, saving],
  );

  const loadProject = useCallback(
    async (project) => {
      try {
        const response = await fetch(`/api/projects/${project.id}`);
        if (!response.ok) throw new Error("Failed to load project");

        const data = await response.json();
        const loadedProject = data.project;

        // Set project data
        setCurrentProject(loadedProject);
        setProjectTitle(loadedProject.title);
        setCanvasSize({
          width: loadedProject.canvas_width,
          height: loadedProject.canvas_height,
        });
        setBackground({
          type: loadedProject.background_type,
          gradient: loadedProject.background_gradient,
          color: loadedProject.background_color,
        });

        // Load images
        const loadedImages = [];
        for (const imageData of loadedProject.images || []) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const loadedImage = {
              id: imageData.id,
              element: img,
              x: imageData.x_position,
              y: imageData.y_position,
              width: imageData.width_size,
              height: imageData.height_size,
              rotation: imageData.rotation_angle,
              scaleX: imageData.scale_x,
              scaleY: imageData.scale_y,
              url: imageData.image_url,
            };
            loadedImages.push(loadedImage);

            if (loadedImages.length === loadedProject.images.length) {
              setImages(
                loadedImages.sort(
                  (a, b) => imageData.z_index - imageData.z_index,
                ),
              );
            }
          };
          img.src = imageData.image_url;
        }

        if (loadedProject.images?.length === 0) {
          setImages([]);
        }

        setSelectedImageId(null);
      } catch (error) {
        console.error("Error loading project:", error);
      }
    },
    [
      setImages,
      setCanvasSize,
      setBackground,
      setSelectedImageId,
      setProjectTitle,
    ],
  );

  const newProject = useCallback(() => {
    setCurrentProject(null);
    setProjectTitle("Untitled Project");
    setImages([]);
    setSelectedImageId(null);
    setCanvasSize({ width: 1200, height: 900 });
    setBackground({
      type: "color",
      gradient: "linear-gradient(135deg, #8B70F6 0%, #9D7DFF 100%)",
      color: "#2A2A2A",
    });
    // Reset all effects to default values
    setBorderRadius(15);
    setShadowType("soft");
    setShadowStrength(100);
    setNoiseIntensity(0);
    setLastSaved(null);
  }, [
    setImages,
    setSelectedImageId,
    setCanvasSize,
    setBackground,
    setProjectTitle,
    setBorderRadius,
    setShadowType,
    setShadowStrength,
    setNoiseIntensity,
  ]);

  // Load projects when component mounts
  useEffect(() => {
    if (user && !loading) {
      loadProjects();
    }
  }, [user, loading, loadProjects]);

  return {
    currentProject,
    projects,
    saving,
    lastSaved,
    saveProject,
    loadProject,
    newProject,
  };
}
