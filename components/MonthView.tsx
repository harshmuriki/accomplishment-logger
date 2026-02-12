import React, { useState, useEffect, useMemo } from 'react';
import { Accomplishment, TimeframeType, Insight } from '../types';
import {
  getMonthKey,
  formatMonthLabel,
  getYearKey,
  formatYearLabel,
  getTimeframeKey,
  formatTimeframeLabel,
} from '../utils/dateUtils';
import { getInsight, saveInsight } from '../services/firebase';
import InsightCard from './InsightCard';

interface MonthViewProps {
  items: Accomplishment[];
}

const MonthView: React.FC<MonthViewProps> = ({ items }) => {
  const [timeframeType, setTimeframeType] = useState<TimeframeType>('month');
  const [currentTimeframeKey, setCurrentTimeframeKey] = useState<string>('');
  const [insight, setInsight] = useState<Insight | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  // Build a sorted list of unique timeframe keys (newest first)
  const timeframeKeys = useMemo(() => {
    const keys = new Set<string>();
    items.forEach((item) => keys.add(getTimeframeKey(item.timestamp, timeframeType)));
    return Array.from(keys).sort().reverse();
  }, [items, timeframeType]);

  // Default to newest timeframe if current key is unset or no longer valid
  useEffect(() => {
    if (timeframeKeys.length > 0 && !timeframeKeys.includes(currentTimeframeKey)) {
      setCurrentTimeframeKey(timeframeKeys[0]);
    }
  }, [timeframeKeys, currentTimeframeKey]);

  // Filter and sort items for the selected timeframe
  const currentItems = useMemo(() => {
    return items
      .filter((item) => getTimeframeKey(item.timestamp, timeframeType) === currentTimeframeKey)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [items, currentTimeframeKey, timeframeType]);

  // Navigation
  const currentIndex = timeframeKeys.indexOf(currentTimeframeKey);
  const hasPrev = currentIndex < timeframeKeys.length - 1;
  const hasNext = currentIndex > 0;

  const goToPrev = () => {
    if (hasPrev) setCurrentTimeframeKey(timeframeKeys[currentIndex + 1]);
  };
  const goToNext = () => {
    if (hasNext) setCurrentTimeframeKey(timeframeKeys[currentIndex - 1]);
  };

  // Load insight when timeframe changes
  useEffect(() => {
    if (currentTimeframeKey) {
      loadInsight(currentTimeframeKey, timeframeType);
    }
  }, [currentTimeframeKey, timeframeType]);

  // Load cached insight
  const loadInsight = async (key: string, type: TimeframeType) => {
    const cachedInsight = await getInsight(key, type);
    setInsight(cachedInsight);
  };

  // Generate new insight
  const generateInsight = async () => {
    setInsightLoading(true);
    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accomplishments: currentItems,
          timeframeType,
          timeframeKey: currentTimeframeKey,
        }),
      });

      if (!response.ok) {
        let message = 'Failed to generate insight';
        try {
          const errorData = await response.json();
          message = errorData.error || message;
        } catch {
          if (response.status === 404) {
            message = 'API not available. Run with "vercel dev" for local API.';
          }
        }
        throw new Error(message);
      }

      const data = await response.json();
      const savedInsight = await saveInsight(
        currentTimeframeKey,
        timeframeType,
        data.insight,
        data.accomplishmentIds
      );
      setInsight(savedInsight);
    } catch (error) {
      console.error('Failed to generate insight:', error);
      alert('Failed to generate insight. Please try again.');
    } finally {
      setInsightLoading(false);
    }
  };

  // Check if insight is stale
  const isInsightStale = useMemo(() => {
    if (!insight) return false;
    const currentIds = new Set(currentItems.map((i) => i.id));
    const cachedIds = new Set(insight.accomplishmentIds);
    return (
      currentIds.size !== cachedIds.size ||
      !Array.from(currentIds).every((id) => cachedIds.has(id))
    );
  }, [insight, currentItems]);

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
      {/* Timeframe Toggle */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-full border border-pi-hover bg-white bg-opacity-40 p-1">
          <button
            onClick={() => setTimeframeType('month')}
            className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium transition-all ${
              timeframeType === 'month'
                ? 'bg-pi-accent text-white shadow-sm'
                : 'text-pi-secondary hover:text-pi-accent'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeframeType('year')}
            className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium transition-all ${
              timeframeType === 'year'
                ? 'bg-pi-accent text-white shadow-sm'
                : 'text-pi-secondary hover:text-pi-accent'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Timeframe Navigation Header */}
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
            {formatTimeframeLabel(currentTimeframeKey, timeframeType)}
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

      {/* Summary */}
      <div className="flex justify-center space-x-6 mb-8 text-center">
        <div>
          <span className="text-lg font-serif text-pi-accent">{averageRating.toFixed(1)}</span>
          <span className="block text-[10px] text-pi-secondary font-sans uppercase tracking-wider">
            Avg Impact
          </span>
        </div>
        <div>
          <span className="text-lg font-serif text-pi-accent">{currentItems.length}</span>
          <span className="block text-[10px] text-pi-secondary font-sans uppercase tracking-wider">
            Accomplishments
          </span>
        </div>
      </div>

      {/* AI Insights Card */}
      <InsightCard
        insight={insight}
        loading={insightLoading}
        onGenerate={generateInsight}
        onRegenerate={generateInsight}
        isStale={isInsightStale}
        hasAccomplishments={currentItems.length > 0}
      />

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
