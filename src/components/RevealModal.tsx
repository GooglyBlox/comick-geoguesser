/* eslint-disable @next/next/no-img-element */
import React from "react";
import { Comic, Genre } from "@/types";
import {
  X,
  ExternalLink,
  Award,
  Check,
  Info,
  Tag,
  Globe,
  BookOpen,
} from "lucide-react";

interface RevealModalProps {
  comic: Comic | null;
  onClose: () => void;
  correct: boolean;
  genreMap: Map<number, Genre>;
}

const RevealModal: React.FC<RevealModalProps> = ({
  comic,
  onClose,
  correct,
  genreMap,
}) => {
  if (!comic) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="glass border border-slate-700/50 rounded-xl max-w-lg w-full mx-4 max-h-[85vh] overflow-auto">
        <div className="p-4 border-b border-slate-700/40 flex justify-between items-center">
          <h3
            className={`text-xl font-bold flex items-center ${
              correct ? "text-emerald-400" : "text-sky-400"
            }`}
          >
            {correct ? (
              <>
                <Award size={22} className="mr-2 text-yellow-400" />
                Correct!
              </>
            ) : (
              <>
                <Info size={22} className="mr-2 text-sky-400" />
                Comic Revealed
              </>
            )}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800/80 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          {correct && (
            <div className="mb-4 p-3 bg-emerald-900/30 border border-emerald-800/40 rounded-lg text-emerald-100 flex items-start">
              <Check
                size={20}
                className="text-emerald-400 mr-2 mt-0.5 flex-shrink-0"
              />
              <p>
                Great job! You correctly identified this comic. Your streak has
                been increased!
              </p>
            </div>
          )}

          <div className="flex gap-4 mb-6">
            {comic.md_covers && comic.md_covers.length > 0 ? (
              <img
                src={`https://meo.comick.pictures/${comic.md_covers[0].b2key}`}
                alt={comic.title}
                className="w-32 h-auto object-cover rounded-lg border border-slate-700/50 shadow-md"
              />
            ) : (
              <div className="w-32 h-48 bg-slate-800 rounded-lg border border-slate-700/50 flex items-center justify-center text-slate-600">
                No Cover
              </div>
            )}

            <div>
              <h4 className="text-xl font-bold mb-2 text-white">
                {comic.title}
              </h4>

              {comic.md_titles && comic.md_titles.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-sm text-slate-400 mb-1">
                    Also known as:
                  </h5>
                  <ul className="text-sm text-slate-300 space-y-1">
                    {comic.md_titles
                      .filter(
                        (title) =>
                          title.title !== comic.title &&
                          title.title.trim() !== ""
                      )
                      .slice(0, 5)
                      .map((title, index) => (
                        <li key={index} className="text-slate-300">
                          {title.title}
                        </li>
                      ))}
                    {comic.md_titles.length > 6 && (
                      <li className="text-slate-500 italic">
                        ...and {comic.md_titles.length - 5} more
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                {comic.content_rating && (
                  <span className="badge badge-secondary">
                    {comic.content_rating.charAt(0).toUpperCase() +
                      comic.content_rating.slice(1)}
                  </span>
                )}
                {comic.country && (
                  <span className="badge badge-secondary">
                    {comic.country.toUpperCase()}
                  </span>
                )}
                {comic.status !== undefined && (
                  <span
                    className={`badge ${
                      comic.status === 1
                        ? "bg-sky-900/50 text-sky-100 border border-sky-800/30"
                        : comic.status === 2
                        ? "bg-emerald-900/50 text-emerald-100 border border-emerald-800/30"
                        : comic.status === 3
                        ? "bg-red-900/50 text-red-100 border border-red-800/30"
                        : "bg-amber-900/50 text-amber-100 border border-amber-800/30"
                    }`}
                  >
                    {comic.status === 1
                      ? "Ongoing"
                      : comic.status === 2
                      ? "Completed"
                      : comic.status === 3
                      ? "Cancelled"
                      : "Hiatus"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {comic.desc && (
            <div className="mb-5 p-4 bg-slate-800/50 rounded-lg border border-slate-700/40">
              <h5 className="text-sm font-medium text-slate-300 mb-2 flex items-center">
                <Info size={16} className="mr-2 text-slate-400" />
                Description
              </h5>
              <p className="text-sm text-slate-300 leading-relaxed">
                {comic.desc}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
            {comic.genres && comic.genres.length > 0 && (
              <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/30">
                <h5 className="text-xs font-medium text-slate-400 mb-2 flex items-center">
                  <Tag size={14} className="mr-1.5 text-slate-500" />
                  Genres
                </h5>
                <div className="flex flex-wrap gap-1">
                  {comic.genres.slice(0, 5).map((genreId) => {
                    const genre = genreMap.get(genreId);
                    return (
                      <span
                        key={genreId}
                        className="badge badge-secondary text-xs"
                      >
                        {genre ? genre.name : genreId}
                      </span>
                    );
                  })}
                  {comic.genres.length > 5 && (
                    <span className="text-xs text-slate-500">
                      +{comic.genres.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/30">
              <h5 className="text-xs font-medium text-slate-400 mb-2 flex items-center">
                <Globe size={14} className="mr-1.5 text-slate-500" />
                Country
              </h5>
              <p className="text-sm">
                {comic.country === "jp"
                  ? "Japan (Manga)"
                  : comic.country === "kr"
                  ? "Korea (Manhwa)"
                  : comic.country === "cn"
                  ? "China (Manhua)"
                  : comic.country === "hk"
                  ? "Hong Kong"
                  : "English"}
              </p>
            </div>

            <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/30">
              <h5 className="text-xs font-medium text-slate-400 mb-2 flex items-center">
                <BookOpen size={14} className="mr-1.5 text-slate-500" />
                Chapters
              </h5>
              <p className="text-sm">
                {comic.last_chapter
                  ? `${comic.last_chapter} chapters`
                  : "Unknown"}
              </p>
            </div>
          </div>

          <div className="mt-5 flex space-x-3">
            <a
              href={`https://comick.io/comic/${comic.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 rounded-lg text-white font-medium transition-colors"
            >
              Read on ComicK.io
              <ExternalLink size={16} />
            </a>

            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-colors"
            >
              Next Comic
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevealModal;
