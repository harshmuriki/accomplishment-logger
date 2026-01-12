import React, { useState, useEffect } from 'react';
import InputForm from './components/InputForm';
import AccomplishmentList from './components/AccomplishmentList';
import AuthButton from './components/AuthButton';
import { saveAccomplishment, getAccomplishments, onAuthStateChange, getCurrentUser } from './services/firebase';
import { Accomplishment, LoadingState } from './types';
import { User } from 'firebase/auth';

const App: React.FC = () => {
  const [items, setItems] = useState<Accomplishment[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [initLoaded, setInitLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChange((currentUser) => {
      setUser(currentUser);
      // Reload data when auth state changes
      loadData();
    });
    return () => unsubscribe();
  }, []);

  // Load initial data
  const loadData = async () => {
    const data = await getAccomplishments();
    setItems(data);
    setInitLoaded(true);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSave = async (text: string, rating: number) => {
    try {
      setLoadingState('saving');
      const savedItem = await saveAccomplishment(text, rating, user?.uid);
      
      // Update local state
      setItems(prev => [savedItem, ...prev]);
      setLoadingState('success');
      
      // Reset idle after a moment
      setTimeout(() => setLoadingState('idle'), 1000);

    } catch (error) {
      console.error("Failed to save", error);
      setLoadingState('error');
      setTimeout(() => setLoadingState('idle'), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-pi-bg selection:bg-pi-accent/20 selection:text-pi-text">
      
      {/* Header / Nav */}
      <header className="py-8 px-6 md:px-12 flex justify-between items-center">
        <h1 className="font-serif text-2xl font-bold text-pi-text tracking-tight">
          Accomplish.
        </h1>
        <div className="flex items-center space-x-4">
          <div className="text-xs font-sans text-pi-secondary uppercase tracking-widest border border-pi-hover px-3 py-1 rounded-full">
            {items.length} Entries
          </div>
          <AuthButton user={user} onAuthChange={() => loadData()} />
        </div>
      </header>

      <main className="container mx-auto px-6 md:px-12 pt-10">
        
        {/* Input Section - Sticky-ish or Prominent */}
        <section className="mb-20">
          <InputForm onSave={handleSave} loadingState={loadingState} />
        </section>

        {/* List Section */}
        <section className={`transition-opacity duration-700 ${initLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <AccomplishmentList items={items} />
        </section>

      </main>

      {/* Footer Info */}
      <footer className="text-center py-8 text-pi-secondary/40 text-xs font-sans">
        <p>Inspired by Pi.website aesthetics.</p>
      </footer>
    </div>
  );
};

export default App;