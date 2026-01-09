import { useState, useEffect } from 'react';
import { SplashScreen } from '@/components/SplashScreen';
import { Dashboard } from '@/components/Dashboard';

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Check if splash was already shown this session
    const splashShown = sessionStorage.getItem('ai-veritas-splash-shown');
    if (splashShown) {
      setShowSplash(false);
    }
    setIsInitialLoad(false);
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('ai-veritas-splash-shown', 'true');
    setShowSplash(false);
  };

  // Don't render anything during initial load to prevent flash
  if (isInitialLoad) {
    return null;
  }

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <Dashboard />
    </>
  );
};

export default Index;
