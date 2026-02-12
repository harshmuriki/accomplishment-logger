import React, { useState } from 'react';
import { Insight } from '../types';

interface InsightCardProps {
  insight: Insight | null;
  loading: boolean;
  onGenerate: () => void;
  onRegenerate: () => void;
  isStale: boolean;
  hasAccomplishments: boolean;
}

// Helper function to format markdown to HTML
function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}

// Helper function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  loading,
  onGenerate,
  onRegenerate,
  isStale,
  hasAccomplishments,
}) => {
  const [expanded, setExpanded] = useState(false);

  // Loading state
  if (loading) {
    return (
      <div className="bg-white bg-opacity-60 backdrop-blur-sm p-6 rounded-2xl border border-pi-hover mb-8">
        <div className="flex items-center space-x-2 text-pi-secondary">
          <svg
            className="w-5 h-5 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="text-sm font-sans">Generating AI insights...</span>
        </div>
      </div>
    );
  }

  // Empty state - no insight yet
  if (!insight) {
    // Don't show generate button if no accomplishments
    if (!hasAccomplishments) {
      return null;
    }

    return (
      <div className="bg-gradient-to-br from-pi-accent/5 to-transparent p-6 rounded-2xl border border-pi-hover mb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-sans font-semibold text-pi-accent uppercase tracking-wider mb-2">
              AI Insights Available
            </h3>
            <p className="text-sm text-pi-secondary font-sans">
              Get AI-powered analysis of your accomplishments, including patterns, themes, and suggestions.
            </p>
          </div>
          <button
            onClick={onGenerate}
            className="ml-4 px-4 py-2 bg-pi-accent text-white rounded-full text-xs font-sans font-medium hover:bg-[#08422D] transition-colors whitespace-nowrap"
          >
            Generate Insight
          </button>
        </div>
      </div>
    );
  }

  // Populated state - showing insight
  return (
    <div className="bg-white bg-opacity-80 backdrop-blur-sm p-6 rounded-2xl border border-pi-accent/20 mb-8 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <svg
            className="w-5 h-5 text-pi-accent"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <h3 className="text-sm font-sans font-semibold text-pi-accent uppercase tracking-wider">
            AI Insights
          </h3>
          {isStale && (
            <span className="text-xs text-pi-secondary/60 font-sans italic">
              (new accomplishments added)
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-pi-secondary hover:text-pi-accent transition-colors font-sans"
          >
            {expanded ? 'Collapse' : 'Expand'}
          </button>
          <button
            onClick={onRegenerate}
            className="text-xs text-pi-secondary hover:text-pi-accent transition-colors font-sans"
            title="Regenerate insight"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        className={`prose prose-sm max-w-none text-pi-text font-sans ${
          expanded ? '' : 'line-clamp-3'
        }`}
      >
        <div dangerouslySetInnerHTML={{ __html: formatMarkdown(insight.content) }} />
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-pi-hover flex justify-between items-center">
        <span className="text-xs text-pi-secondary/60 font-sans">
          Generated {formatRelativeTime(insight.generatedAt)}
        </span>
        <span className="text-xs text-pi-secondary/60 font-sans">
          Based on {insight.accomplishmentCount}{' '}
          {insight.accomplishmentCount === 1 ? 'entry' : 'entries'}
        </span>
      </div>
    </div>
  );
};

export default InsightCard;
