import React, { useState } from "react";
import {
  Filter,
  ChevronDown,
  ChevronUp,
  Tag,
  CheckIcon,
  X,
} from "lucide-react";
import { Genre } from "@/types";

interface FilterControlsProps {
  contentRating: string[];
  origin: string[];
  status: number[];
  includedGenres: number[];
  excludedGenres: number[];
  onContentRatingChange: (ratings: string[]) => void;
  onOriginChange: (origins: string[]) => void;
  onStatusChange: (status: number[]) => void;
  onIncludeGenre: (genreId: number) => void;
  onExcludeGenre: (genreId: number) => void;
  onRemoveGenre: (genreId: number) => void;
  onClearGenreFilters: () => void;
  genres: Genre[];
  isLoading: boolean;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  contentRating,
  origin,
  status,
  includedGenres,
  excludedGenres,
  onContentRatingChange,
  onOriginChange,
  onStatusChange,
  onIncludeGenre,
  onExcludeGenre,
  onRemoveGenre,
  onClearGenreFilters,
  genres,
  isLoading,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "origin" | "genres">(
    "content"
  );

  const getGenreById = (id: number) => {
    return genres.find((genre) => genre.id === id);
  };

  const hasActiveFilters = () => {
    if (contentRating.length < 3) return true;
    if (origin.length < 5) return true;
    if (status.length < 4) return true;
    if (includedGenres.length > 0 || excludedGenres.length > 0) return true;
    return false;
  };

  return (
    <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800/60 mb-8 overflow-hidden">
      <div
        className="p-4 flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center mr-3">
            <Filter size={16} className="text-violet-400" />
          </div>
          <div>
            <h3 className="text-white font-medium">Filters</h3>
            {hasActiveFilters() && (
              <p className="text-zinc-400 text-xs mt-0.5">
                Active filters applied
              </p>
            )}
          </div>
        </div>
        <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-zinc-800/60">
          <div className="flex border-b border-zinc-800/60">
            <button
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === "content"
                  ? "text-violet-400 border-b-2 border-violet-500"
                  : "text-zinc-400 hover:text-zinc-300"
              }`}
              onClick={() => setActiveTab("content")}
            >
              Content
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === "origin"
                  ? "text-violet-400 border-b-2 border-violet-500"
                  : "text-zinc-400 hover:text-zinc-300"
              }`}
              onClick={() => setActiveTab("origin")}
            >
              Origin
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === "genres"
                  ? "text-violet-400 border-b-2 border-violet-500"
                  : "text-zinc-400 hover:text-zinc-300"
              }`}
              onClick={() => setActiveTab("genres")}
            >
              Genres
            </button>
          </div>

          <div className="p-5">
            {activeTab === "content" && (
              <div>
                <h4 className="text-sm text-zinc-300 mb-3">Content Rating</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "safe", label: "Safe" },
                    { id: "suggestive", label: "Suggestive" },
                    { id: "erotica", label: "Erotica" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        const updated = contentRating.includes(option.id)
                          ? contentRating.filter((r) => r !== option.id)
                          : [...contentRating, option.id];
                        if (updated.length > 0) {
                          onContentRatingChange(updated);
                        }
                      }}
                      className={`px-3 py-2 rounded-xl text-sm ${
                        contentRating.includes(option.id)
                          ? "bg-violet-600/30 text-violet-300 border border-violet-500/30"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                      }`}
                    >
                      {contentRating.includes(option.id) && (
                        <CheckIcon size={14} className="inline mr-1" />
                      )}
                      {option.label}
                    </button>
                  ))}
                </div>

                <h4 className="text-sm text-zinc-300 mb-3 mt-6">Status</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 1, label: "Ongoing" },
                    { id: 2, label: "Completed" },
                    { id: 3, label: "Cancelled" },
                    { id: 4, label: "Hiatus" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        const updated = status.includes(option.id)
                          ? status.filter((s) => s !== option.id)
                          : [...status, option.id];
                        if (updated.length > 0) {
                          onStatusChange(updated);
                        }
                      }}
                      className={`px-3 py-2 rounded-xl text-sm ${
                        status.includes(option.id)
                          ? "bg-violet-600/30 text-violet-300 border border-violet-500/30"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                      }`}
                    >
                      {status.includes(option.id) && (
                        <CheckIcon size={14} className="inline mr-1" />
                      )}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "origin" && (
              <div>
                <h4 className="text-sm text-zinc-300 mb-3">Comic Origin</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { id: "jp", label: "Japan (Manga)", icon: "🇯🇵" },
                    { id: "kr", label: "Korea (Manhwa)", icon: "🇰🇷" },
                    { id: "cn", label: "China (Manhua)", icon: "🇨🇳" },
                    { id: "hk", label: "Hong Kong", icon: "🇭🇰" },
                    { id: "gb", label: "English", icon: "🇬🇧" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        const updated = origin.includes(option.id)
                          ? origin.filter((o) => o !== option.id)
                          : [...origin, option.id];
                        if (updated.length > 0) {
                          onOriginChange(updated);
                        }
                      }}
                      className={`px-3 py-3 rounded-xl text-sm ${
                        origin.includes(option.id)
                          ? "bg-violet-600/30 text-violet-300 border border-violet-500/30"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                      }`}
                    >
                      <span className="mr-2">{option.icon}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "genres" && (
              <div>
                {(includedGenres.length > 0 || excludedGenres.length > 0) && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm text-zinc-300">
                        Active Genre Filters
                      </h4>
                      <button
                        onClick={onClearGenreFilters}
                        className="text-xs px-2 py-1 bg-rose-900/30 text-rose-300 rounded-md hover:bg-rose-900/50"
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {includedGenres.map((genreId) => {
                        const genre = getGenreById(genreId);
                        if (!genre) return null;

                        return (
                          <div
                            key={genreId}
                            className="px-2 py-1 bg-violet-600/20 text-violet-300 rounded-lg text-xs flex items-center border border-violet-500/30"
                          >
                            <Tag size={10} className="mr-1" />
                            {genre.name}
                            <button
                              onClick={() => onRemoveGenre(genreId)}
                              className="ml-1.5 text-violet-400 hover:text-violet-300"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        );
                      })}

                      {excludedGenres.map((genreId) => {
                        const genre = getGenreById(genreId);
                        if (!genre) return null;

                        return (
                          <div
                            key={genreId}
                            className="px-2 py-1 bg-rose-600/20 text-rose-300 rounded-lg text-xs flex items-center border border-rose-500/30"
                          >
                            <span className="mr-1">-</span>
                            {genre.name}
                            <button
                              onClick={() => onRemoveGenre(genreId)}
                              className="ml-1.5 text-rose-400 hover:text-rose-300"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <h4 className="text-sm text-zinc-300 mb-3">Select Genres</h4>
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-zinc-400 text-sm">Loading genres...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto pr-1">
                    {genres.map((genre) => {
                      const isIncluded = includedGenres.includes(genre.id);
                      const isExcluded = excludedGenres.includes(genre.id);

                      return (
                        <div
                          key={genre.id}
                          className={`p-2 rounded-lg text-sm flex justify-between items-center ${
                            isIncluded
                              ? "bg-violet-600/30 text-violet-300 border border-violet-500/30"
                              : isExcluded
                              ? "bg-rose-600/30 text-rose-300 border border-rose-500/30"
                              : "bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                          }`}
                        >
                          <span className="truncate">{genre.name}</span>
                          <div className="flex">
                            {!isIncluded && (
                              <button
                                onClick={() => onIncludeGenre(genre.id)}
                                className="p-1 text-zinc-400 hover:text-violet-400"
                                title="Include genre"
                              >
                                +
                              </button>
                            )}
                            {!isExcluded && (
                              <button
                                onClick={() => onExcludeGenre(genre.id)}
                                className="p-1 text-zinc-400 hover:text-rose-400"
                                title="Exclude genre"
                              >
                                -
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterControls;
