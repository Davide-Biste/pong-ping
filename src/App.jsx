import { userService } from '@/services/userService';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { KeyBindingsProvider } from '@/contexts/KeyBindingsContext';
import Dashboard from './components/Dashboard';
import MatchSetup from './components/MatchSetup/MatchSetup';
import GameScreen from './components/GameScreen/GameScreen';
import HallOfFame from './components/HallOfFame';
import PlayerManagement from './components/PlayerManagement';
import KeyBindingsSettings from './components/KeyBindingsSettings';
import Navbar from './components/Navbar';
import Balatro from './components/react-bits/Balatro';
import LoadingScreen from './components/LoadingScreen';
import { BadgeAlert } from 'lucide-react';

const BALATRO_COLORS = {
  color1: '#9333EA',
  color2: '#4C1D95',
  color3: '#0F0520',
};

function App() {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const minDelay = new Promise((resolve) => setTimeout(resolve, 1800));

    const init = async () => {
      try {
        const isOnline = await userService.checkHealth();
        setBackendStatus(isOnline ? 'online' : 'offline');
      } catch {
        setBackendStatus('offline');
      }
      await minDelay;
      setIsLoading(false);
    };

    init();

    const interval = setInterval(async () => {
      try {
        const isOnline = await userService.checkHealth();
        setBackendStatus(isOnline ? 'online' : 'offline');
      } catch {
        setBackendStatus('offline');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <KeyBindingsProvider>
      <Router>
        {/* Balatro animated background */}
        <div className="fixed inset-0 z-0">
          <Balatro
            spinRotation={-2.0}
            spinSpeed={7.0}
            color1={BALATRO_COLORS.color1}
            color2={BALATRO_COLORS.color2}
            color3={BALATRO_COLORS.color3}
            contrast={3.5}
            lighting={0.4}
            spinAmount={0.25}
            pixelFilter={745.0}
            mouseInteraction={true}
          />
        </div>

        {/* Loading splash */}
        <AnimatePresence>{isLoading && <LoadingScreen />}</AnimatePresence>

        {/* App content */}
        <div
          className="relative z-10 flex flex-col min-h-screen transition-opacity duration-500"
          style={{ opacity: isLoading ? 0 : 1 }}
        >
          {/* Backend Status Indicator */}
          <div className="fixed top-4 right-4 z-50 pointer-events-none">
            {backendStatus === 'offline' && (
              <div className="flex items-center gap-2 bg-red-500/90 text-white px-3 py-1 rounded-full text-sm font-medium border border-red-400 shadow-sm backdrop-blur-sm">
                <BadgeAlert className="w-4 h-4" />
                Backend Offline
              </div>
            )}
          </div>

          <Navbar />

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/hall-of-fame" element={<HallOfFame />} />
            <Route path="/players" element={<PlayerManagement />} />
            <Route path="/setup" element={<MatchSetup />} />
            <Route path="/game/:id" element={<GameScreen />} />
            <Route path="/settings" element={<KeyBindingsSettings />} />
          </Routes>
        </div>
      </Router>
    </KeyBindingsProvider>
  );
}

export default App;
