/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef, useEffect } from "react";
import { ChapterImage } from "@/types";
import { ZoomIn, ZoomOut, Maximize, Minimize, X, Image } from "lucide-react";

interface ComicPanelProps {
  images: ChapterImage[];
  isLoading: boolean;
}

const ComicPanel: React.FC<ComicPanelProps> = ({ images, isLoading }) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesContainerRef = useRef<HTMLDivElement>(null);

  const increaseZoom = () => {
    if (zoomLevel < 200) {
      setZoomLevel(zoomLevel + 20);
    }
  };

  const decreaseZoom = () => {
    if (zoomLevel > 60) {
      setZoomLevel(zoomLevel - 20);
    }
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && fullscreen) {
      setFullscreen(false);
    }
    if (e.key === "+" || e.key === "=") {
      increaseZoom();
    }
    if (e.key === "-") {
      decreaseZoom();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [fullscreen, zoomLevel]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] glass rounded-xl p-6 animate-fadeIn">
        <div className="spinner mb-4"></div>
        <p className="text-slate-400">Loading comic panels...</p>
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[500px] glass rounded-xl p-6 animate-fadeIn">
        <div className="text-center">
          <Image size={48} className="mx-auto mb-4 text-slate-500" />
          <p className="text-slate-400">
            No images available for this chapter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative transition-all duration-300 ${
        fullscreen ? "fixed inset-0 z-50 p-4 bg-slate-950/95" : ""
      }`}
    >
      <div className="w-full glass rounded-t-xl p-3 mb-1 flex justify-between items-center">
        <div className="text-sm text-slate-400 flex items-center">
          <span className="bg-sky-900/40 text-sky-100 px-2 py-1 rounded-md mr-2 border border-sky-800/30 flex items-center">
            <Image size={14} className="mr-1.5" />
            {images.length} Panels
          </span>
          <span className="hidden sm:inline">Longstrip View</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={decreaseZoom}
            className="p-1.5 bg-slate-800 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            title="Zoom out"
          >
            <ZoomOut size={18} />
          </button>
          <div className="px-3 py-1 bg-slate-800 rounded-md text-xs text-slate-300 flex items-center">
            {zoomLevel}%
          </div>
          <button
            onClick={increaseZoom}
            className="p-1.5 bg-slate-800 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            title="Zoom in"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 bg-slate-800 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            title={fullscreen ? "Exit fullscreen" : "View fullscreen"}
          >
            {fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>

      <div
        ref={imagesContainerRef}
        className="glass rounded-xl overflow-y-auto transition-all"
        style={{
          height: fullscreen ? "calc(100vh - 100px)" : "calc(85vh - 100px)",
          maxHeight: fullscreen ? "calc(100vh - 100px)" : "calc(100vh - 280px)",
          minHeight: "400px",
          scrollbarWidth: "thin",
          scrollbarColor: "#64748b #1e293b",
        }}
      >
        <div className="flex flex-col items-center p-4 space-y-2">
          {images.map((image, index) => (
            <div key={index} className="w-full flex justify-center">
              <img
                src={`https://meo.comick.pictures/${image.b2key}`}
                alt={`Comic panel ${index + 1}`}
                className="max-w-full object-contain transition-all rounded shadow-md"
                style={{
                  width: `${zoomLevel}%`,
                  maxWidth: "1000px",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {fullscreen && (
        <button
          onClick={() => setFullscreen(false)}
          className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      )}
    </div>
  );
};

export default ComicPanel;
