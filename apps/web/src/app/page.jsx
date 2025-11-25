import { useState, useEffect } from "react";
import {
  Upload,
  Palette,
  Download,
  Layers,
  RotateCw,
  Crop,
} from "lucide-react";
import useUser from "@/utils/useUser";
import { FeedbackButton } from "@/components/Feedback/FeedbackButton";

export default function HomePage() {
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const { data: user, loading } = useUser();

  // Animate features on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setFeaturesVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      id: "upload",
      icon: Upload,
      title: "Upload Screenshots",
      description:
        "Drag and drop multiple images at once. Support for PNG, JPG, and other formats.",
    },
    {
      id: "edit",
      icon: Layers,
      title: "Smart Editing",
      description:
        "Resize, rotate, crop, and layer your images with intuitive drag-and-drop controls.",
    },
    {
      id: "backgrounds",
      icon: Palette,
      title: "Beautiful Backgrounds",
      description:
        "Choose from gradients, solid colors, or custom patterns to make your designs pop.",
    },
    {
      id: "export",
      icon: Download,
      title: "High-Quality Export",
      description:
        "Download your creations in high-resolution PNG or JPG formats ready for any use.",
    },
  ];

  return (
    <>
      {/* Google Fonts import */}
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;1,400&family=Instrument+Sans:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      <div className="min-h-screen bg-gradient-to-b from-[#F5F4F0] to-[#ECEAE7] dark:from-[#1A1A1A] dark:to-[#0F0F0F]">
        {/* Header */}
        <header className="bg-white/80 dark:bg-[#1E1E1E]/80 backdrop-blur-lg border-b border-[#E0E0E0] dark:border-[#404040]">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img
                src="https://www.create.xyz/images/logoipsum/224"
                alt="Logo"
                className="h-8 w-8"
              />
              <span
                className="text-[#121212] dark:text-white text-xl font-semibold"
                style={{
                  fontFamily: "Instrument Sans, Inter, system-ui, sans-serif",
                }}
              >
                DesignCraft
              </span>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              {!loading && user ? (
                <div className="flex items-center space-x-4">
                  <a
                    href="/workspace"
                    className="px-6 py-2.5 bg-gradient-to-t from-[#8B70F6] to-[#9D7DFF] hover:from-[#7E64F2] hover:to-[#8B70F6] text-white font-medium rounded-2xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#8B70F6] focus:ring-offset-2"
                    style={{
                      fontFamily:
                        "Instrument Sans, Inter, system-ui, sans-serif",
                    }}
                  >
                    Open Workspace
                  </a>
                  <a
                    href="/account/logout"
                    className="px-6 py-2.5 bg-white dark:bg-[#262626] border border-[#E0E0E0] dark:border-[#404040] text-[#121212] dark:text-white font-medium rounded-2xl hover:bg-[#FAF9F7] dark:hover:bg-[#333333] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#8B70F6] focus:ring-offset-2"
                    style={{
                      fontFamily:
                        "Instrument Sans, Inter, system-ui, sans-serif",
                    }}
                  >
                    Sign Out
                  </a>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <a
                    href="/account/signin"
                    className="px-6 py-2.5 bg-white dark:bg-[#262626] border border-[#E0E0E0] dark:border-[#404040] text-[#121212] dark:text-white font-medium rounded-2xl hover:bg-[#FAF9F7] dark:hover:bg-[#333333] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#8B70F6] focus:ring-offset-2"
                    style={{
                      fontFamily:
                        "Instrument Sans, Inter, system-ui, sans-serif",
                    }}
                  >
                    Sign In
                  </a>
                  <a
                    href="/account/signup"
                    className="px-6 py-2.5 bg-gradient-to-t from-[#8B70F6] to-[#9D7DFF] hover:from-[#7E64F2] hover:to-[#8B70F6] text-white font-medium rounded-2xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#8B70F6] focus:ring-offset-2"
                    style={{
                      fontFamily:
                        "Instrument Sans, Inter, system-ui, sans-serif",
                    }}
                  >
                    Start Free
                  </a>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="pt-16 pb-8 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-normal text-[#0D0D0D] dark:text-white mb-6 leading-tight"
              style={{
                fontFamily: "Instrument Serif, serif",
                letterSpacing: "-0.02em",
              }}
            >
              Transform screenshots into{" "}
              <em className="font-normal italic">stunning</em> designs
            </h1>

            <p
              className="text-lg md:text-xl text-[#555555] dark:text-[#C0C0C0] mb-8 max-w-3xl mx-auto leading-relaxed"
              style={{
                fontFamily: "Instrument Sans, Inter, system-ui, sans-serif",
              }}
            >
              Upload your screenshots and create beautiful designs with custom
              backgrounds, professional editing tools, and high-quality exports.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
              {!loading && user ? (
                <a
                  href="/workspace"
                  className="px-8 py-4 bg-gradient-to-t from-[#8B70F6] to-[#9D7DFF] hover:from-[#7E64F2] hover:to-[#8B70F6] text-white font-semibold text-lg rounded-2xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#8B70F6] focus:ring-offset-2"
                  style={{
                    fontFamily: "Instrument Sans, Inter, system-ui, sans-serif",
                  }}
                >
                  Open Workspace
                </a>
              ) : (
                <>
                  <a
                    href="/account/signup"
                    className="px-8 py-4 bg-gradient-to-t from-[#8B70F6] to-[#9D7DFF] hover:from-[#7E64F2] hover:to-[#8B70F6] text-white font-semibold text-lg rounded-2xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#8B70F6] focus:ring-offset-2"
                    style={{
                      fontFamily:
                        "Instrument Sans, Inter, system-ui, sans-serif",
                    }}
                  >
                    Start Creating Free
                  </a>
                  <a
                    href="/account/signin"
                    className="px-8 py-4 bg-white dark:bg-[#262626] border border-[#E0E0E0] dark:border-[#404040] text-[#121212] dark:text-white font-semibold text-lg rounded-2xl hover:bg-[#FAF9F7] dark:hover:bg-[#333333] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#8B70F6] focus:ring-offset-2"
                    style={{
                      fontFamily:
                        "Instrument Sans, Inter, system-ui, sans-serif",
                    }}
                  >
                    Sign In
                  </a>
                </>
              )}
            </div>

            {/* Preview/Demo Image */}
            <div className="relative max-w-4xl mx-auto">
              <div
                className="relative rounded-3xl border-2 border-[#E0E0E0] dark:border-[#404040] overflow-hidden bg-gradient-to-br from-white to-[#F8F8F8] dark:from-[#1E1E1E] dark:to-[#1A1A1A] p-8 shadow-lg"
                style={{ minHeight: "400px" }}
              >
                <div className="relative">
                  {/* Demo canvas area */}
                  <div className="bg-gradient-to-br from-[#8B70F6] to-[#9D7DFF] rounded-2xl p-12 min-h-[300px] flex items-center justify-center">
                    <div className="bg-white rounded-xl p-6 shadow-lg transform rotate-2">
                      <div className="w-40 h-24 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          Screenshot
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Floating callouts */}
                  <div
                    className={`absolute top-4 left-4 transition-all duration-500 ${
                      featuresVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2"
                    }`}
                  >
                    <div className="bg-white dark:bg-[#2A2A2A] px-3 py-2 rounded-xl shadow-lg text-sm font-medium text-[#121212] dark:text-white border border-[#E0E0E0] dark:border-[#404040]">
                      <Crop className="inline w-4 h-4 mr-1" />
                      Crop & Resize
                    </div>
                  </div>

                  <div
                    className={`absolute top-4 right-4 transition-all duration-500 ${
                      featuresVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2"
                    }`}
                    style={{ transitionDelay: "100ms" }}
                  >
                    <div className="bg-white dark:bg-[#2A2A2A] px-3 py-2 rounded-xl shadow-lg text-sm font-medium text-[#121212] dark:text-white border border-[#E0E0E0] dark:border-[#404040]">
                      <RotateCw className="inline w-4 h-4 mr-1" />
                      Rotate
                    </div>
                  </div>

                  <div
                    className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 transition-all duration-500 ${
                      featuresVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2"
                    }`}
                    style={{ transitionDelay: "200ms" }}
                  >
                    <div className="bg-white dark:bg-[#2A2A2A] px-3 py-2 rounded-xl shadow-lg text-sm font-medium text-[#121212] dark:text-white border border-[#E0E0E0] dark:border-[#404040]">
                      <Palette className="inline w-4 h-4 mr-1" />
                      Custom Background
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-normal text-[#0D0D0D] dark:text-white mb-4"
                style={{
                  fontFamily: "Instrument Serif, serif",
                  letterSpacing: "-0.02em",
                }}
              >
                Everything you need to create{" "}
                <em className="font-normal italic">professional</em> designs
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={feature.id}
                    className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 border border-[#E0E0E0] dark:border-[#404040] hover:border-[#8B70F6] dark:hover:border-[#8B70F6] transition-all duration-200 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-t from-[#8B70F6] to-[#9D7DFF] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200">
                      <IconComponent size={24} className="text-white" />
                    </div>

                    <h3
                      className="text-xl font-semibold text-[#121212] dark:text-white mb-2"
                      style={{
                        fontFamily:
                          "Instrument Sans, Inter, system-ui, sans-serif",
                      }}
                    >
                      {feature.title}
                    </h3>

                    <p
                      className="text-[#666666] dark:text-[#AAAAAA] leading-relaxed"
                      style={{
                        fontFamily:
                          "Instrument Sans, Inter, system-ui, sans-serif",
                      }}
                    >
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto text-center bg-white dark:bg-[#1E1E1E] rounded-3xl p-12 border border-[#E0E0E0] dark:border-[#404040]">
            <h2
              className="text-3xl md:text-4xl font-normal text-[#0D0D0D] dark:text-white mb-4"
              style={{
                fontFamily: "Instrument Serif, serif",
                letterSpacing: "-0.02em",
              }}
            >
              Ready to transform your screenshots?
            </h2>

            <p
              className="text-lg text-[#666666] dark:text-[#AAAAAA] mb-8"
              style={{
                fontFamily: "Instrument Sans, Inter, system-ui, sans-serif",
              }}
            >
              Join thousands of creators who use DesignCraft to create stunning
              designs.
            </p>

            {!loading && user ? (
              <a
                href="/workspace"
                className="inline-flex px-8 py-4 bg-gradient-to-t from-[#8B70F6] to-[#9D7DFF] hover:from-[#7E64F2] hover:to-[#8B70F6] text-white font-semibold text-lg rounded-2xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#8B70F6] focus:ring-offset-2"
                style={{
                  fontFamily: "Instrument Sans, Inter, system-ui, sans-serif",
                }}
              >
                Open Workspace
              </a>
            ) : (
              <a
                href="/account/signup"
                className="inline-flex px-8 py-4 bg-gradient-to-t from-[#8B70F6] to-[#9D7DFF] hover:from-[#7E64F2] hover:to-[#8B70F6] text-white font-semibold text-lg rounded-2xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#8B70F6] focus:ring-offset-2"
                style={{
                  fontFamily: "Instrument Sans, Inter, system-ui, sans-serif",
                }}
              >
                Start Creating Free
              </a>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-[#E0E0E0] dark:border-[#404040] bg-white/50 dark:bg-[#1E1E1E]/50">
          <div className="max-w-6xl mx-auto text-center">
            <p
              className="text-sm text-[#666666] dark:text-[#AAAAAA]"
              style={{
                fontFamily: "Instrument Sans, Inter, system-ui, sans-serif",
              }}
            >
              © 2024 DesignCraft. Built with love for creators.
            </p>
          </div>
        </footer>

        {/* Feedback Button */}
        <FeedbackButton pageSource="landing" />
      </div>
    </>
  );
}
