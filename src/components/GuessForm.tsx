import React, { useState, useEffect } from "react";
import {
  HelpCircle,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Sparkles,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

interface GuessFormProps {
  correctTitle: string;
  onCorrectGuess: () => void;
  onSkip: () => void;
  streak: number;
  useHint: () => void;
  hintsRemaining: number;
  hint: string | null;
  generateOptions: () => string[];
}

const GuessForm: React.FC<GuessFormProps> = ({
  correctTitle,
  onCorrectGuess,
  onSkip,
  streak,
  useHint,
  hintsRemaining,
  hint,
  generateOptions,
}) => {
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [guessLocked, setGuessLocked] = useState(false);

  useEffect(() => {
    const titleOptions = generateOptions();
    setOptions(titleOptions);
    setSelectedOption(null);
    setMessage(null);
    setGuessLocked(false);
  }, [correctTitle, generateOptions]);

  const handleOptionSelect = (option: string) => {
    if (guessLocked) return;

    setSelectedOption(option);
    setGuessLocked(true);

    if (option === correctTitle) {
      setMessage({
        text: "Correct! Well done!",
        type: "success",
      });
      setTimeout(() => {
        onCorrectGuess();
        setMessage(null);
      }, 1500);
    } else {
      setMessage({
        text: "Incorrect! Better luck next time.",
        type: "error",
      });
      setTimeout(() => {
        onSkip();
        setMessage(null);
      }, 1500);
    }
  };

  const handleSkip = () => {
    setOptions([]);
    onSkip();
  };

  return (
    <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800/60 overflow-hidden">
      <div className="bg-black/40 px-5 py-4 border-b border-zinc-800/60">
        <h2 className="text-xl text-white font-semibold">Guess the Comic</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Select the correct title - you only get one chance!
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
              disabled={hintsRemaining <= 0 || guessLocked}
              className={`ml-3 px-3 py-1.5 rounded-lg text-sm ${
                hintsRemaining > 0 && !guessLocked
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
                <CheckCircle
                  size={18}
                  className="text-emerald-400 mr-2 flex-shrink-0"
                />
              ) : message.type === "error" ? (
                <AlertCircle
                  size={18}
                  className="text-rose-400 mr-2 flex-shrink-0"
                />
              ) : (
                <HelpCircle
                  size={18}
                  className="text-sky-400 mr-2 flex-shrink-0"
                />
              )}
              <span
                className={
                  message.type === "success"
                    ? "text-emerald-300"
                    : message.type === "error"
                    ? "text-rose-300"
                    : "text-sky-300"
                }
              >
                {message.text}
              </span>
            </div>
          </div>
        )}

        {/* Multiple Choice Options */}
        <div className="space-y-3 mb-5">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(option)}
              disabled={guessLocked}
              className={`w-full p-4 rounded-xl text-left transition-colors relative ${
                selectedOption === option
                  ? option === correctTitle
                    ? "bg-emerald-900/30 border border-emerald-800/40 text-emerald-200"
                    : "bg-rose-900/30 border border-rose-800/40 text-rose-200"
                  : guessLocked
                  ? "bg-zinc-800/30 border border-zinc-700/30 text-zinc-500 cursor-not-allowed"
                  : "bg-zinc-800/50 border border-zinc-700/40 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center">
                <span className="flex-1">{option}</span>
                {selectedOption === option && option === correctTitle && (
                  <CheckCircle
                    size={18}
                    className="text-emerald-400 flex-shrink-0"
                  />
                )}
                {!selectedOption && !guessLocked && (
                  <ArrowRight
                    size={16}
                    className="text-zinc-500 opacity-0 group-hover:opacity-100"
                  />
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSkip}
            className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl flex items-center justify-center transition-colors"
          >
            <RefreshCw size={16} className="mr-2" />
            <span>Skip / Next Comic</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuessForm;
