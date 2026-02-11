import React, { useState, useEffect, useMemo } from 'react';
import { Accomplishment } from '../types';
import { getMonthKey, formatMonthLabel } from '../utils/dateUtils';

interface MonthViewProps {
  items: Accomplishment[];
}

const MonthView: React.FC<MonthViewProps> = ({ items }) => {
  const [currentMonthKey, setCurrentMonthKey] = useState<string>('');

  // Build a sorted list of unique month keys (newest first)
  const monthKeys = useMemo(() => {
    const keys = new Set<string>();
    items.forEach(item => keys.add(getMonthKey(item.timestamp)));
    return Array.from(keys).sort().reverse();
  }, [items]);

  // Default to newest month if current key is unset or no longer valid
  useEffect(() => {
    if (monthKeys.length > 0 && !monthKeys.includes(currentMonthKey)) {
      setCurrentMonthKey(monthKeys[0]);
    }
  }, [monthKeys, currentMonthKey]);

  // Filter and sort items for the selected month
  const currentItems = useMemo(() => {
    return items
      .filter(item => getMonthKey(item.timestamp) === currentMonthKey)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [items, currentMonthKey]);

  // Navigation
  const currentIndex = monthKeys.indexOf(currentMonthKey);
  const hasPrev = currentIndex < monthKeys.length - 1;
  const hasNext = currentIndex > 0;

  const goToPrev = () => {
    if (hasPrev) setCurrentMonthKey(monthKeys[currentIndex + 1]);
  };
  const goToNext = () => {
    if (hasNext) setCurrentMonthKey(monthKeys[currentIndex - 1]);
  };

  // Summary stats
  const averageRating = currentItems.length > 0
    ? currentItems.reduce((sum, item) => sum + item.rating, 0) / currentItems.length
    : 0;

  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-pi-secondary font-sans font-light">
        <p>No accomplishments recorded yet.</p>
        <p className="text-sm mt-2">Start by typing above.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20">

      {/* Month Navigation Header */}
      <div className="flex items-center justify-between mb-8 border-b border-pi-hover pb-4">
        <button
          disabled={!hasPrev}
          onClick={goToPrev}
          className="text-pi-secondary hover:text-pi-accent disabled:opacity-30 disabled:cursor-default transition-colors p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-center">
          <h2 className="text-pi-secondary font-sans text-xs uppercase tracking-widest">
            {formatMonthLabel(currentMonthKey)}
          </h2>
          <span className="text-[10px] text-pi-secondary/60 font-sans">
            {currentItems.length} {currentItems.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        <button
          disabled={!hasNext}
          onClick={goToNext}
          className="text-pi-secondary hover:text-pi-accent disabled:opacity-30 disabled:cursor-default transition-colors p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Monthly Summary */}
      <div className="flex justify-center space-x-6 mb-8 text-center">
        <div>
          <span className="text-lg font-serif text-pi-accent">{averageRating.toFixed(1)}</span>
          <span className="block text-[10px] text-pi-secondary font-sans uppercase tracking-wider">Avg Impact</span>
        </div>
        <div>
          <span className="text-lg font-serif text-pi-accent">{currentItems.length}</span>
          <span className="block text-[10px] text-pi-secondary font-sans uppercase tracking-wider">Accomplishments</span>
        </div>
      </div>

      {/* Accomplishment Cards */}
      <div className="space-y-6">
        {currentItems.map((item) => (
          <div
            key={item.id}
            className="group relative bg-white bg-opacity-60 backdrop-blur-sm p-6 rounded-2xl border border-transparent hover:border-pi-hover transition-all duration-300 hover:shadow-sm"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-sans text-pi-secondary font-medium uppercase tracking-wide">
                {item.timestamp.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
              <div className="flex items-center space-x-1 bg-pi-bg px-3 py-1 rounded-full">
                <span className="text-xs font-bold text-pi-accent font-sans">{item.rating}</span>
                <span className="text-[10px] text-pi-secondary uppercase">/ 10</span>
              </div>
            </div>

            <p className="text-lg md:text-xl font-serif text-pi-text leading-relaxed">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthView;
