/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import { ChapterImage } from "@/types";
import { ZoomIn, ZoomOut, ImageIcon, Loader } from "lucide-react";

interface ComicViewerProps {
  images: ChapterImage[];
  isLoading: boolean;
}

const ComicViewer: React.FC<ComicViewerProps> = ({ images, isLoading }) => {
  const [zoomLevel, setZoomLevel] = useState(100);

  const increaseZoom = () => {
    if (zoomLevel < 150) setZoomLevel(zoomLevel + 10);
  };

  const decreaseZoom = () => {
    if (zoomLevel > 70) setZoomLevel(zoomLevel - 10);
  };

  if (isLoading) {
    return (
      <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800/60 h-[600px] flex items-center justify-center">
        <div className="text-center">
          <Loader
            size={40}
            className="mx-auto mb-4 text-violet-500 animate-spin"
          />
          <p className="text-zinc-400">Loading comic panels...</p>
        </div>
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800/60 h-[600px] flex items-center justify-center">
        <div className="text-center">
          <ImageIcon size={48} className="mx-auto mb-4 text-zinc-700" />
          <p className="text-zinc-400">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800/60 overflow-hidden">
      <div className="bg-black/30 px-4 py-3 border-b border-zinc-800/60 flex justify-between items-center">
        <div className="text-sm text-zinc-400 flex items-center gap-2">
          <div className="px-2 py-1 bg-violet-500/20 border border-violet-500/30 rounded text-violet-300 text-xs font-medium">
            {images.length} Panels
          </div>
          <span className="hidden sm:inline">Longstrip View</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={decreaseZoom}
            className="p-1.5 bg-zinc-800 rounded text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
            title="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <div className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-400 flex items-center">
            {zoomLevel}%
          </div>
          <button
            onClick={increaseZoom}
            className="p-1.5 bg-zinc-800 rounded text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
            title="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>

      <div className="h-[550px] overflow-y-auto">
        <div className="flex flex-col items-center p-4">
          {images.map((image, index) => (
            <div key={index} className="w-full flex justify-center">
              <img
                src={`https://meo.comick.pictures/${image.b2key}`}
                alt={`Panel ${index + 1}`}
                className="max-w-full object-contain transition-all rounded shadow-md"
                style={{ width: `${zoomLevel}%`, maxWidth: "1000px" }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComicViewer;
