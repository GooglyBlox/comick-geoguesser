/* eslint-disable @next/next/no-img-element */
import React from "react";
import { Trophy } from "lucide-react";

interface HeaderProps {
  bestStreak: number;
  currentStreak: number;
}

const Header: React.FC<HeaderProps> = ({ bestStreak, currentStreak }) => {
  return (
    <header className="relative z-10">
      <div className="backdrop-blur-lg bg-black/40 fixed top-0 left-0 right-0 border-b border-zinc-800/60">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <img
                src="/unicorn-512.png"
                alt="Streak icon"
                width={32}
                height={32}
                className="mr-2"
              />
            </div>
            <h1 className="font-bold text-xl text-white">Comic Guesser</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 bg-zinc-800/80 rounded-md border border-zinc-700/50 flex items-center">
                <span className="text-zinc-400 text-sm mr-2">Current</span>
                <span className="text-white font-semibold">
                  {currentStreak}
                </span>
              </div>

              <div className="px-3 py-1.5 bg-zinc-800/80 rounded-md border border-zinc-700/50 flex items-center">
                <Trophy size={14} className="text-amber-400 mr-1.5" />
                <span className="text-white font-semibold">{bestStreak}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-16"></div>
    </header>
  );
};

export default Header;
