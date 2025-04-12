/* eslint-disable @next/next/no-img-element */
import React from "react";
import { Comic } from "@/types";
import { History, CheckCircle, XCircle } from "lucide-react";

interface HistorySectionProps {
  guessHistory: Array<{ comic: Comic; correct: boolean }>;
}

const HistorySection: React.FC<HistorySectionProps> = ({ guessHistory }) => {
  if (guessHistory.length === 0) return null;

  return (
    <div className="mt-12 mb-10 animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
          <History size={16} className="text-violet-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Recent Comics</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {guessHistory.map((item, index) => (
          <div
            key={`${item.comic.id}-${index}`}
            className="bg-zinc-900/80 rounded-xl border border-zinc-800/60 overflow-hidden hover:border-zinc-700/60 transition-colors"
          >
            <div className="aspect-[3/1] bg-black/40 relative overflow-hidden">
              {item.comic.md_covers && item.comic.md_covers.length > 0 ? (
                <img
                  src={`https://meo.comick.pictures/${item.comic.md_covers[0].b2key}`}
                  alt={item.comic.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-30 blur-[2px]"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 to-zinc-800"></div>
              )}

              <div className="absolute inset-0 flex items-center p-4">
                <div className="flex gap-4 z-10">
                  {item.comic.md_covers && item.comic.md_covers.length > 0 ? (
                    <img
                      src={`https://meo.comick.pictures/${item.comic.md_covers[0].b2key}`}
                      alt={item.comic.title}
                      className="w-16 h-24 object-cover rounded-lg border border-zinc-700/50 shadow-xl"
                    />
                  ) : (
                    <div className="w-16 h-24 bg-zinc-800 rounded-lg border border-zinc-700/50"></div>
                  )}

                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-medium text-white text-lg mb-1 line-clamp-1">
                      {item.comic.title}
                    </h3>
                    <div className="flex items-center gap-1">
                      {item.comic.country && (
                        <div className="px-2 py-0.5 bg-zinc-800/80 rounded text-xs text-zinc-400">
                          {item.comic.country.toUpperCase()}
                        </div>
                      )}

                      {item.correct ? (
                        <div className="px-2 py-0.5 bg-emerald-900/30 rounded text-xs text-emerald-400 flex items-center">
                          <CheckCircle size={10} className="mr-1" />
                          Correct
                        </div>
                      ) : (
                        <div className="px-2 py-0.5 bg-rose-900/30 rounded text-xs text-rose-400 flex items-center">
                          <XCircle size={10} className="mr-1" />
                          Skipped
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3">
              {item.comic.desc && (
                <p className="text-xs text-zinc-400 line-clamp-2">
                  {item.comic.desc}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistorySection;
