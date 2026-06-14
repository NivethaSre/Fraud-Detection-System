import { useState } from 'react';
import IntegratedAnalysis from './components/IntegratedAnalysis';
import Dashboard from './components/Dashboard';
import TopNav from './components/TopNav';
import Background from './components/Background';
import AIBackground from './components/AIBackground';
import FloatingParticles from './components/FloatingParticles';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './components/ThemeContext';
import './index.css';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      color: 'var(--color-text)',
      position: 'relative'
    }}>
      <Background />
      <AIBackground />
      <FloatingParticles />

      <TopNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{
        flex: 1,
        padding: '2rem 3rem',
        maxWidth: '1800px',
        width: '100%',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'analysis' && <IntegratedAnalysis />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
