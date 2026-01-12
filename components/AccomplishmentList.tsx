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
          
          <p className="text-lg md:text-xl font-serif text-pi-text leading-relaxed">
            {item.text}
          </p>
        </div>
      ))}
    </div>
  );
};

export default AccomplishmentList;