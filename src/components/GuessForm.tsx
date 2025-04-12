/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { 
  HelpCircle, 
  Send, 
  X, 
  Lightbulb, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  RefreshCw
} from "lucide-react";

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
    <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800/60 overflow-hidden">
      <div className="bg-black/40 px-5 py-4 border-b border-zinc-800/60">
        <h2 className="text-xl text-white font-semibold">Guess the Comic</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Identify the comic based on the panels shown
        </p>
      </div>

      <div className="p-5">
        {/* Game Stats */}
        <div className="flex flex-wrap justify-between mb-5 gap-3">
          <div className="bg-violet-900/20 border border-violet-800/30 px-4 py-2 rounded-xl text-sm font-medium flex items-center">
            <Sparkles size={16} className="mr-2 text-amber-400" />
            <span className="text-violet-200 mr-1">Streak:</span>
            <span className="text-white text-lg font-bold">{streak}</span>
          </div>
          
          <div className="flex items-center">
            <span className="text-zinc-400 mr-3 text-sm">Hints:</span>
            <div className="flex space-x-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div 
                  key={i}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    i < hintsRemaining 
                      ? "bg-violet-500/20 text-violet-400 border border-violet-500/30" 
                      : "bg-zinc-800/50 text-zinc-600 border border-zinc-700/30"
                  }`}
                >
                  <Lightbulb size={14} />
                </div>
              ))}
            </div>
            <button
              onClick={useHint}
              disabled={hintsRemaining <= 0}
              className={`ml-3 px-3 py-1.5 rounded-lg text-sm ${
                hintsRemaining > 0
                  ? "bg-violet-600 text-white hover:bg-violet-700"
                  : "bg-zinc-800/50 text-zinc-600 cursor-not-allowed"
              }`}
            >
              Use Hint
            </button>
          </div>
        </div>

        {/* Hint display */}
        {hint && (
          <div className="mb-5 p-4 bg-violet-950/30 border border-violet-800/30 rounded-xl text-zinc-200 animate-fadeIn">
            <div className="flex">
              <div className="mr-3 mt-1">
                <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <Lightbulb size={16} className="text-violet-400" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-violet-300 mb-1">Hint:</h3>
                <p className="text-zinc-300">{hint}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error message */}
        {message && (
          <div
            className={`mb-5 p-4 rounded-xl animate-fadeIn ${
              message.type === "success"
                ? "bg-emerald-950/30 border border-emerald-800/30"
                : message.type === "error"
                ? "bg-rose-950/30 border border-rose-800/30"
                : "bg-sky-950/30 border border-sky-800/30"
            }`}
          >
            <div className="flex items-center">
              {message.type === "success" ? (
                <CheckCircle size={18} className="text-emerald-400 mr-2 flex-shrink-0" />
              ) : message.type === "error" ? (
                <AlertCircle size={18} className="text-rose-400 mr-2 flex-shrink-0" />
              ) : (
                <HelpCircle size={18} className="text-sky-400 mr-2 flex-shrink-0" />
              )}
              <span className={message.type === "success" ? "text-emerald-300" : message.type === "error" ? "text-rose-300" : "text-sky-300"}>
                {message.text}
              </span>
            </div>
          </div>
        )}

        {/* Guess Input Form */}
        <form onSubmit={checkGuess} className="space-y-5">
          <div className={isShaking ? "animate-shake" : ""}>
            <label htmlFor="guess" className="text-zinc-400 text-sm block mb-2">
              What&apos;s the name of this comic?
            </label>
            <div className="relative">
              <input
                type="text"
                id="guess"
                ref={inputRef}
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Enter your guess..."
                className="w-full px-4 py-3 bg-black/30 border border-zinc-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              {guess.trim() && (
                <button
                  type="button"
                  onClick={() => setGuess("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center transition-colors"
            >
              <span>Submit Guess</span>
              <Send size={16} className="ml-2" />
            </button>
            
            <button
              type="button"
              onClick={handleSkip}
              className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl flex items-center justify-center transition-colors"
            >
              <RefreshCw size={16} className="mr-2" />
              <span>Skip</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GuessForm;