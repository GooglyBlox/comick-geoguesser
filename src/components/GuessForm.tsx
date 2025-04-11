/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { HelpCircle, X, Send, Sparkles, PenLine } from "lucide-react";

interface GuessFormProps {
  validTitles: string[];
  onCorrectGuess: () => void;
  onSkip: () => void;
  streak: number;
  useHint: () => void;
  hintsRemaining: number;
  hint: string | null;
}

const GuessForm: React.FC<GuessFormProps> = ({
  validTitles,
  onCorrectGuess,
  onSkip,
  streak,
  useHint,
  hintsRemaining,
  hint,
}) => {
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [lastGuesses, setLastGuesses] = useState<string[]>([]);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const normalizeTitle = (title: string): string => {
    let normalized = title.toLowerCase();
    normalized = normalized.replace(/[^\w\s]/gi, " ");
    normalized = normalized.replace(/\s+/g, " ");
    normalized = normalized.trim();
    return normalized;
  };

  const checkGuess = (e: React.FormEvent) => {
    e.preventDefault();

    if (!guess.trim()) {
      setMessage({
        text: "Please enter a guess",
        type: "error",
      });
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
      return;
    }

    setLastGuesses((prev) => [...prev, guess]);

    const normalizedGuess = normalizeTitle(guess);

    if (normalizedGuess.length < 4) {
      setMessage({
        text: "Your guess is too short. Try again!",
        type: "error",
      });
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
      return;
    }

    // List of common generic words that shouldn't count on their own
    const commonWords = [
      "comic",
      "manga",
      "manhwa",
      "manhua",
      "chapter",
      "volume",
      "season",
      "part",
      "the",
    ];

    if (commonWords.includes(normalizedGuess) || normalizedGuess.length < 5) {
      setMessage({
        text: "Be more specific with your guess!",
        type: "error",
      });
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
      return;
    }

    const isCorrect = validTitles.some((title) => {
      const normalizedTitle = normalizeTitle(title);

      if (normalizedTitle === normalizedGuess) {
        return true;
      }

      if (normalizedTitle.length < 15) {
        return (
          (normalizedTitle.includes(normalizedGuess) &&
            normalizedGuess.length >= normalizedTitle.length * 0.7) ||
          (normalizedGuess.includes(normalizedTitle) &&
            normalizedTitle.length >= normalizedGuess.length * 0.7)
        );
      }

      const titleWords = normalizedTitle.split(" ").filter((w) => w.length > 1);
      const guessWords = normalizedGuess.split(" ").filter((w) => w.length > 1);

      const minRequiredLength = Math.max(
        5,
        Math.floor(normalizedTitle.length * 0.3)
      );
      if (normalizedGuess.length < minRequiredLength) {
        return false;
      }

      if (guessWords.length === 1 && guessWords[0].length < 8) {
        const significantTitleWords = titleWords.filter(
          (word) => !commonWords.includes(word) && word.length >= 5
        );

        return significantTitleWords.some(
          (word) =>
            word === guessWords[0] ||
            (word.length > 6 &&
              word.includes(guessWords[0]) &&
              guessWords[0].length >= word.length * 0.8)
        );
      }

      if (guessWords.length > 1) {
        const guessPhrase = guessWords.join(" ");
        if (normalizedTitle.includes(guessPhrase) && guessPhrase.length >= 8) {
          return true;
        }

        let sequenceMatches = 0;
        let longestSequence = 0;
        let currentSequence = 0;

        for (let i = 0; i < titleWords.length - 1; i++) {
          for (let j = 0; j < guessWords.length - 1; j++) {
            if (
              titleWords[i] === guessWords[j] &&
              titleWords[i + 1] === guessWords[j + 1]
            ) {
              sequenceMatches += 1;
              currentSequence += 1;
              longestSequence = Math.max(longestSequence, currentSequence);
            } else {
              currentSequence = 0;
            }
          }
        }

        if (
          longestSequence >= guessWords.length * 0.7 &&
          guessWords.length >= 3
        ) {
          return true;
        }
      }

      const matchingWords = titleWords
        .filter((word) => !commonWords.includes(word) && word.length > 3)
        .filter((word) =>
          guessWords.some(
            (guessWord) =>
              !commonWords.includes(guessWord) &&
              guessWord.length > 3 &&
              (word === guessWord ||
                (word.includes(guessWord) &&
                  guessWord.length >= word.length * 0.8) ||
                (guessWord.includes(word) &&
                  word.length >= guessWord.length * 0.8))
          )
        );

      const significantTitleWords = titleWords.filter(
        (word) => !commonWords.includes(word) && word.length > 3
      );

      if (significantTitleWords.length === 0) {
        return (
          normalizedTitle.includes(normalizedGuess) &&
          normalizedGuess.length >= Math.max(5, normalizedTitle.length * 0.4)
        );
      }

      const wordMatchRatio =
        matchingWords.length / significantTitleWords.length;

      return (
        // At least 50% of significant words match AND guess is substantial
        (wordMatchRatio >= 0.5 &&
          normalizedGuess.length >=
            Math.max(8, normalizedTitle.length * 0.3)) ||
        // OR very high word match
        (wordMatchRatio >= 0.8 && guessWords.length >= 2) ||
        // OR the guess contains a very large portion of the title
        (normalizedTitle.includes(normalizedGuess) &&
          normalizedGuess.length >= normalizedTitle.length * 0.6)
      );
    });

    if (isCorrect) {
      setMessage({
        text: "Correct! Well done!",
        type: "success",
      });
      setGuess("");
      setTimeout(() => {
        onCorrectGuess();
        setMessage(null);
        setLastGuesses([]);
      }, 1500);
    } else {
      setMessage({
        text: "Incorrect, try again!",
        type: "error",
      });
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
    }
  };

  const handleSkip = () => {
    setGuess("");
    setLastGuesses([]);
    onSkip();
  };

  return (
    <div className="glass rounded-xl p-6 mb-6 animate-fadeIn">
      <div className="flex justify-between mb-6 items-center">
        <div className="flex gap-4 items-center">
          <div className="bg-sky-600 bg-opacity-40 text-sky-100 px-4 py-1.5 rounded-lg text-sm font-medium flex items-center border border-sky-600/30">
            <Sparkles size={16} className="mr-2 text-yellow-300" />
            <span className="mr-1">Streak:</span>
            <span className="text-lg font-bold">{streak}</span>
          </div>
          <div className="text-slate-300 text-sm flex items-center">
            <span className="mr-2">Hints:</span>
            <div className="flex space-x-1">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index < hintsRemaining
                      ? "bg-sky-500 animate-pulse-soft"
                      : "bg-slate-700"
                  }`}
                />
              ))}
            </div>
            <span className="ml-2">{hintsRemaining} remaining</span>
          </div>
        </div>
        <button
          onClick={useHint}
          disabled={hintsRemaining <= 0}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all ${
            hintsRemaining > 0
              ? "bg-sky-600 bg-opacity-60 text-white hover:bg-opacity-80 border border-sky-500/30"
              : "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700/30"
          }`}
        >
          <HelpCircle size={16} />
          Use Hint
        </button>
      </div>

      {hint && (
        <div className="mb-5 p-4 bg-sky-900/20 border border-sky-800/30 rounded-lg text-sky-100 animate-fadeIn">
          <div className="font-medium mb-1 flex items-center">
            <HelpCircle size={16} className="mr-2 text-sky-400" />
            Hint:
          </div>
          <div className="text-sm ml-6">{hint}</div>
        </div>
      )}

      {message && (
        <div
          className={`mb-5 p-4 rounded-lg animate-fadeIn ${
            message.type === "success"
              ? "bg-green-900/20 border border-green-800/30 text-green-100"
              : message.type === "error"
              ? "bg-red-900/20 border border-red-800/30 text-red-100"
              : "bg-sky-900/20 border border-sky-800/30 text-sky-100"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={checkGuess} className="space-y-5">
        <div>
          <label
            htmlFor="guess"
            className="block text-sm font-medium text-slate-300 mb-2 flex items-center"
          >
            <PenLine size={16} className="mr-2 text-sky-400" />
            What&apos;s the name of this comic?
          </label>
          <div className={`relative ${isShaking ? "animate-shake" : ""}`}>
            <input
              type="text"
              id="guess"
              ref={inputRef}
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Enter your guess..."
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent"
            />
            {guess.trim() && (
              <button
                type="button"
                onClick={() => setGuess("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="px-4 py-3 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors flex-1 flex items-center justify-center focus:ring-2 focus:ring-sky-500/50 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            <span>Submit Guess</span>
            <Send size={16} className="ml-2" />
          </button>
          <button
            type="button"
            onClick={handleSkip}
            className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-1 focus:ring-2 focus:ring-slate-500/50 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            <X size={16} />
            <span>Skip</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default GuessForm;
