import React from 'react';
import { Accomplishment } from '../types';

interface AccomplishmentListProps {
  items: Accomplishment[];
}

const AccomplishmentList: React.FC<AccomplishmentListProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-pi-secondary font-sans font-light">
        <p>No accomplishments recorded yet.</p>
        <p className="text-sm mt-2">Start by typing above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20">
      <h2 className="text-pi-secondary font-sans text-xs uppercase tracking-widest mb-8 text-center border-b border-pi-hover pb-4">
        Journal History
      </h2>
      
      {items.map((item) => (
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
          
          <p className="text-lg md:text-xl font-serif text-pi-text leading-relaxed mb-4">
            {item.text}
          </p>
          
          {item.aiInsight && (
            <div className="mt-4 pt-4 border-t border-pi-bg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-pi-accent/10 flex items-center justify-center mt-0.5">
                  <svg className="w-3 h-3 text-pi-accent" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </div>
                <p className="text-sm font-sans text-pi-accent/80 italic">
                  "{item.aiInsight}"
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AccomplishmentList;