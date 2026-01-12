import React, { useState, useEffect } from "react";
import { LoadingState } from "../types";

interface InputFormProps {
  onSave: (text: string, rating: number) => void;
  loadingState: LoadingState;
}

const InputForm: React.FC<InputFormProps> = ({ onSave, loadingState }) => {
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);

  // Auto-resize textarea
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSave(text, rating);
    }
  };

  // Reset form on success
  useEffect(() => {
    if (loadingState === "success") {
      setText("");
      setRating(5);
    }
  }, [loadingState]);

  return (
    <div className="w-full max-w-2xl mx-auto mb-12 animate-fade-in-up">
      <form onSubmit={handleSubmit} className="relative">
        {/* Main Text Input */}
        <div className="mb-8">
          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder="What have you accomplished today?"
            className="w-full bg-transparent border-none text-2xl md:text-4xl font-serif text-pi-text placeholder-pi-secondary/50 focus:ring-0 focus:outline-none resize-none overflow-hidden leading-tight text-center md:text-left transition-all duration-300"
            rows={1}
            disabled={loadingState === "saving"}
            autoFocus
          />
        </div>

        {/* Controls Container */}
        <div
          className={`transition-opacity duration-500 ${
            text
              ? "opacity-100"
              : "opacity-50 blur-sm hover:opacity-100 hover:blur-0"
          }`}
        >
          {/* Rating Slider */}
          <div className="mb-8">
            <div className="flex justify-between items-end mb-2">
              <label className="text-sm font-sans font-medium text-pi-accent uppercase tracking-wider">
                Impact Level
              </label>
              <span className="font-serif text-2xl text-pi-accent">
                {rating}
                <span className="text-sm text-pi-secondary">/10</span>
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
              className="w-full h-2 bg-pi-hover rounded-lg appearance-none cursor-pointer"
              disabled={loadingState === "saving"}
            />
            <div className="flex justify-between mt-2 text-xs text-pi-secondary font-sans">
              <span>Small win</span>
              <span>Life changing</span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={!text.trim() || loadingState === "saving"}
              className={`
                px-8 py-3 rounded-full font-sans font-medium transition-all duration-300 transform
                ${
                  !text.trim()
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-pi-accent text-white hover:bg-[#08422D] hover:scale-105 shadow-lg"
                }
                ${loadingState === "saving" ? "animate-pulse" : ""}
              `}
            >
              {loadingState === "saving" ? "Saving..." : "Log Accomplishment"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InputForm;
