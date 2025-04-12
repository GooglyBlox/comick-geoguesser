import React from "react";
import { ChapterImage, Comic } from "@/types";
import GuessForm from "./GuessForm";
import ComicViewer from "./ComicViewer";

interface GameInterfaceProps {
  images: ChapterImage[];
  isLoading: boolean;
  correctTitle: string;
  generateOptions: () => string[];
  onCorrectGuess: () => void;
  onIncorrectGuess: () => void;
  onSkip: () => void;
  streak: number;
  useHint: () => void;
  hintsRemaining: number;
  hint: string | null;
  comic: Comic | null;
}

const GameInterface: React.FC<GameInterfaceProps> = ({
  images,
  isLoading,
  correctTitle,
  generateOptions,
  onCorrectGuess,
  onIncorrectGuess,
  onSkip,
  streak,
  useHint,
  hintsRemaining,
  hint,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
      <div className="lg:col-span-3 order-2 lg:order-1">
        <ComicViewer images={images} isLoading={isLoading} />
      </div>
      <div className="lg:col-span-2 order-1 lg:order-2">
        <GuessForm
          correctTitle={correctTitle}
          generateOptions={generateOptions}
          onCorrectGuess={onCorrectGuess}
          onIncorrectGuess={onIncorrectGuess}
          onSkip={onSkip}
          streak={streak}
          useHint={useHint}
          hintsRemaining={hintsRemaining}
          hint={hint}
        />
      </div>
    </div>
  );
};

export default GameInterface;
