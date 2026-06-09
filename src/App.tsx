import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navigation from './components/Navigation';
import Disclaimer from './components/Disclaimer';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import STPsMonitoring from './pages/STPsMonitoring';
import RiverBasinsMonitoring from './pages/RiverBasinsMonitoring';
import WaterBodiesMonitoring from './pages/WaterBodiesMonitoring';
import ComplaintsPage from './pages/ComplaintsPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-white text-[var(--river)]">
      <Navigation />

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/stps" element={<STPsMonitoring />} />
            <Route path="/river-basins" element={<RiverBasinsMonitoring />} />
            <Route path="/water-bodies" element={<WaterBodiesMonitoring />} />
            <Route path="/complaints" element={<ComplaintsPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>

      <Disclaimer />
      <Footer />
    </div>
  );
}
