import { useState } from "react";
import {
  CheckIcon,
  XIcon,
  Search,
  ChevronDown,
  ChevronUp,
  Filter,
  Plus,
  Minus,
  RotateCcw,
  SlidersHorizontal,
  Tag,
} from "lucide-react";
import type { Genre } from "@/types";

interface FilterPanelProps {
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
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
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
  isExpanded,
  onToggleExpand,
}) => {
  const [activeSection, setActiveSection] = useState<"basic" | "genres">(
    "basic"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"genre" | "format" | "theme">(
    "genre"
  );

  const handleContentRatingToggle = (rating: string) => {
    const updatedRatings = contentRating.includes(rating)
      ? contentRating.filter((r) => r !== rating)
      : [...contentRating, rating];

    if (updatedRatings.length > 0) {
      onContentRatingChange(updatedRatings);
    }
  };

  const handleOriginToggle = (country: string) => {
    const updatedOrigins = origin.includes(country)
      ? origin.filter((o) => o !== country)
      : [...origin, country];

    if (updatedOrigins.length > 0) {
      onOriginChange(updatedOrigins);
    }
  };

  const handleStatusToggle = (statusCode: number) => {
    const updatedStatus = status.includes(statusCode)
      ? status.filter((s) => s !== statusCode)
      : [...status, statusCode];

    if (updatedStatus.length > 0) {
      onStatusChange(updatedStatus);
    }
  };

  const getStatusLabel = (statusCode: number) => {
    const statusMap: Record<number, string> = {
      1: "Ongoing",
      2: "Completed",
      3: "Cancelled",
      4: "Hiatus",
    };

    return statusMap[statusCode] || "Unknown";
  };

  const filteredGenres = genres
    .filter((genre) => {
      if (searchQuery) {
        return genre.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return genre.group.toLowerCase() === activeTab.toLowerCase();
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const getGenreById = (id: number) => {
    return genres.find((genre) => genre.id === id);
  };

  const displayActiveGenres =
    includedGenres.length > 0 || excludedGenres.length > 0;

  return (
    <div className="w-full mb-6 rounded-xl overflow-hidden glass animate-fadeIn">
      <div className="border-b border-slate-700/50 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium flex items-center">
            <Filter size={18} className="mr-2 text-sky-400" />
            Search Filters
          </h2>
          <div className="flex space-x-2">
            {displayActiveGenres && (
              <button
                onClick={onClearGenreFilters}
                className="text-sm px-3 py-1.5 text-red-400 hover:text-red-300 border border-red-900/30 rounded-lg hover:bg-red-900/20 transition-colors flex items-center gap-1"
              >
                <RotateCcw size={14} />
                Clear genres
              </button>
            )}
            {isExpanded && (
              <button
                onClick={() =>
                  setActiveSection(
                    activeSection === "basic" ? "genres" : "basic"
                  )
                }
                className="text-sm px-3 py-1.5 bg-sky-600/50 hover:bg-sky-600/70 text-white rounded-lg transition-colors flex items-center gap-1"
              >
                {activeSection === "basic" ? (
                  <>
                    Genre Filters
                    <Tag size={14} className="ml-1" />
                  </>
                ) : (
                  <>
                    Basic Filters
                    <SlidersHorizontal size={14} className="ml-1" />
                  </>
                )}
              </button>
            )}
            <button
              onClick={onToggleExpand}
              className="text-sm px-3 py-1.5 bg-slate-700/80 hover:bg-slate-600/80 text-white rounded-lg transition-colors flex items-center gap-1"
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={14} />
                  Hide Filters
                </>
              ) : (
                <>
                  <ChevronDown size={14} />
                  Show Filters
                </>
              )}
            </button>
          </div>
        </div>

        {!isExpanded && (
          <div className="mt-3 text-sm text-slate-400">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <div>
                <span className="text-slate-500 mr-2">Content:</span>
                {contentRating.length === 3 ? (
                  <span>All ratings</span>
                ) : (
                  contentRating.map((r) => (
                    <span key={r} className="capitalize mr-1">
                      {r}
                    </span>
                  ))
                )}
              </div>
              <div>
                <span className="text-slate-500 mr-2">Origin:</span>
                {origin.length === 5 ? (
                  <span>All origins</span>
                ) : (
                  origin.map((o) => (
                    <span key={o} className="uppercase mr-1">
                      {o}
                    </span>
                  ))
                )}
              </div>
              <div>
                <span className="text-slate-500 mr-2">Status:</span>
                {status.length === 4 ? (
                  <span>All statuses</span>
                ) : (
                  status.map((s) => (
                    <span key={s} className="mr-1">
                      {getStatusLabel(s)}
                    </span>
                  ))
                )}
              </div>
              {displayActiveGenres && (
                <div>
                  <span className="text-slate-500 mr-2">Genres:</span>
                  <span>
                    {includedGenres.length + excludedGenres.length} filters
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isExpanded && (
        <>
          <div
            className={`p-5 space-y-6 ${
              activeSection === "basic" ? "block" : "hidden"
            }`}
          >
            <div>
              <h3 className="font-medium mb-3 text-sm text-sky-200 uppercase tracking-wider flex items-center">
                <span className="w-6 h-6 rounded-full bg-sky-900/40 flex items-center justify-center mr-2 text-xs">
                  1
                </span>
                Content Rating
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "safe", label: "Safe" },
                  { id: "suggestive", label: "Suggestive" },
                  { id: "erotica", label: "Erotica" },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleContentRatingToggle(option.id)}
                    className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1.5 transition-all ${
                      contentRating.includes(option.id)
                        ? "bg-sky-600/70 text-white"
                        : "bg-slate-800/70 text-slate-300 hover:bg-slate-700/70"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        contentRating.includes(option.id)
                          ? "bg-sky-400"
                          : "bg-slate-700"
                      }`}
                    >
                      {contentRating.includes(option.id) ? (
                        <CheckIcon size={10} />
                      ) : (
                        <XIcon size={10} />
                      )}
                    </span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3 text-sm text-sky-200 uppercase tracking-wider flex items-center">
                <span className="w-6 h-6 rounded-full bg-sky-900/40 flex items-center justify-center mr-2 text-xs">
                  2
                </span>
                Origin
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "jp", label: "Manga (JP)" },
                  { id: "kr", label: "Manhwa (KR)" },
                  { id: "cn", label: "Manhua (CN)" },
                  { id: "hk", label: "Manhua (HK)" },
                  { id: "gb", label: "English" },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleOriginToggle(option.id)}
                    className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1.5 transition-all ${
                      origin.includes(option.id)
                        ? "bg-sky-600/70 text-white"
                        : "bg-slate-800/70 text-slate-300 hover:bg-slate-700/70"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        origin.includes(option.id)
                          ? "bg-sky-400"
                          : "bg-slate-700"
                      }`}
                    >
                      {origin.includes(option.id) ? (
                        <CheckIcon size={10} />
                      ) : (
                        <XIcon size={10} />
                      )}
                    </span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3 text-sm text-sky-200 uppercase tracking-wider flex items-center">
                <span className="w-6 h-6 rounded-full bg-sky-900/40 flex items-center justify-center mr-2 text-xs">
                  3
                </span>
                Status
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 1, label: "Ongoing" },
                  { id: 2, label: "Completed" },
                  { id: 3, label: "Cancelled" },
                  { id: 4, label: "Hiatus" },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleStatusToggle(option.id)}
                    className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1.5 transition-all ${
                      status.includes(option.id)
                        ? "bg-sky-600/70 text-white"
                        : "bg-slate-800/70 text-slate-300 hover:bg-slate-700/70"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        status.includes(option.id)
                          ? "bg-sky-400"
                          : "bg-slate-700"
                      }`}
                    >
                      {status.includes(option.id) ? (
                        <CheckIcon size={10} />
                      ) : (
                        <XIcon size={10} />
                      )}
                    </span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div
            className={`p-5 ${activeSection === "genres" ? "block" : "hidden"}`}
          >
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="spinner mx-auto mb-3"></div>
                <p>Loading genres...</p>
              </div>
            ) : (
              <>
                {displayActiveGenres && (
                  <div className="mb-6">
                    <h4 className="text-sm text-sky-200 mb-3 font-medium">
                      Active genre filters:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {includedGenres.map((genreId) => {
                        const genre = getGenreById(genreId);
                        if (!genre) return null;

                        return (
                          <span
                            key={`include-${genreId}`}
                            className="inline-flex items-center gap-1 px-2 py-1.5 bg-sky-900/30 border border-sky-800/30 text-sky-100 rounded-lg text-xs"
                          >
                            <Plus size={12} className="text-sky-400" />
                            {genre.name}
                            <button
                              onClick={() => onRemoveGenre(genreId)}
                              className="ml-1 text-sky-300 hover:text-sky-100"
                            >
                              <XIcon size={12} />
                            </button>
                          </span>
                        );
                      })}

                      {excludedGenres.map((genreId) => {
                        const genre = getGenreById(genreId);
                        if (!genre) return null;

                        return (
                          <span
                            key={`exclude-${genreId}`}
                            className="inline-flex items-center gap-1 px-2 py-1.5 bg-red-900/30 border border-red-800/30 text-red-100 rounded-lg text-xs"
                          >
                            <Minus size={12} className="text-red-400" />
                            {genre.name}
                            <button
                              onClick={() => onRemoveGenre(genreId)}
                              className="ml-1 text-red-300 hover:text-red-100"
                            >
                              <XIcon size={12} />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <div className="relative mb-4">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Search genres..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-800/80 border border-slate-700/50 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>

                  {!searchQuery && (
                    <div className="flex mb-4 border-b border-slate-700/50">
                      <button
                        className={`px-4 py-2 text-sm font-medium ${
                          activeTab === "genre"
                            ? "text-sky-400 border-b-2 border-sky-500"
                            : "text-slate-400 hover:text-slate-300"
                        }`}
                        onClick={() => setActiveTab("genre")}
                      >
                        Genres
                      </button>
                      <button
                        className={`px-4 py-2 text-sm font-medium ${
                          activeTab === "format"
                            ? "text-sky-400 border-b-2 border-sky-500"
                            : "text-slate-400 hover:text-slate-300"
                        }`}
                        onClick={() => setActiveTab("format")}
                      >
                        Formats
                      </button>
                      <button
                        className={`px-4 py-2 text-sm font-medium ${
                          activeTab === "theme"
                            ? "text-sky-400 border-b-2 border-sky-500"
                            : "text-slate-400 hover:text-slate-300"
                        }`}
                        onClick={() => setActiveTab("theme")}
                      >
                        Themes
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {filteredGenres.map((genre) => {
                    const isIncluded = includedGenres.includes(genre.id);
                    const isExcluded = excludedGenres.includes(genre.id);

                    return (
                      <div
                        key={genre.id}
                        className={`p-2.5 border rounded-lg text-sm cursor-pointer transition-colors ${
                          isIncluded
                            ? "bg-sky-900/50 border-sky-700/50 text-sky-100"
                            : isExcluded
                            ? "bg-red-900/50 border-red-700/50 text-red-100"
                            : "bg-slate-800/80 border-slate-700/50 text-slate-300 hover:bg-slate-700/80"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="truncate">{genre.name}</span>
                          <div className="flex space-x-1 ml-2">
                            {!isIncluded && (
                              <button
                                onClick={() => onIncludeGenre(genre.id)}
                                className={`p-0.5 rounded-full ${
                                  isExcluded
                                    ? "text-red-200 hover:text-white"
                                    : "text-slate-400 hover:text-sky-400"
                                }`}
                                title="Include this genre"
                              >
                                <Plus size={14} />
                              </button>
                            )}

                            {!isExcluded && (
                              <button
                                onClick={() => onExcludeGenre(genre.id)}
                                className={`p-0.5 rounded-full ${
                                  isIncluded
                                    ? "text-sky-200 hover:text-white"
                                    : "text-slate-400 hover:text-red-400"
                                }`}
                                title="Exclude this genre"
                              >
                                <Minus size={14} />
                              </button>
                            )}

                            {(isIncluded || isExcluded) && (
                              <button
                                onClick={() => onRemoveGenre(genre.id)}
                                className="p-0.5 rounded-full text-slate-400 hover:text-slate-200"
                                title="Remove filter"
                              >
                                <XIcon size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredGenres.length === 0 && (
                  <div className="p-6 text-center text-slate-400">
                    <p>No genres found matching your criteria.</p>
                    <p className="mt-2 text-sm">
                      Try adjusting your search or select a different category.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FilterPanel;
