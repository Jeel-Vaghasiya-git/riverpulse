import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves, ExternalLink, Sun, Moon } from 'lucide-react';

type NavItem = {
  key: string;
  label: string;
  hint: string;
  path?: string;
  external?: string;
};

const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: 'Home Page', hint: 'Story, gallery & SDG 6', path: '/' },
  { key: 'manual', label: 'Manual Testing', hint: 'Government laboratory portal', external: 'https://ejalshakti.gov.in/WQMIS/Main/location_lab' },
  { key: 'stps', label: 'STPs Live Monitoring', hint: 'Sewage Treatment Plant telemetry', path: '/stps' },
  { key: 'rivers', label: 'River Basins Live Monitoring', hint: 'CPCB river basin dashboard', path: '/river-basins' },
  { key: 'water', label: 'Water Bodies Live Monitoring', hint: 'IoT-connected lake monitoring', path: '/water-bodies' },
  { key: 'complaints', label: 'Complaints', hint: 'Citizen reporting channel', path: '/complaints' },
  { key: 'admin', label: 'Admin Login', hint: 'Municipality dashboard', path: '/admin' },
];

function Hamburger({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Toggle navigation"
      id="nav-hamburger"
      className="relative z-[9999] flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full bg-white/90 dark:bg-slate-800/95 backdrop-blur shadow-md ring-1 ring-black/5 transition hover:scale-105 cursor-pointer"
    >
      <motion.span
        animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        className="block h-0.5 w-5 rounded-full bg-[var(--river)] dark:bg-white"
      />
      <motion.span
        animate={open ? { opacity: 0 } : { opacity: 1 }}
        className="block h-0.5 w-5 rounded-full bg-[var(--river)] dark:bg-white"
      />
      <motion.span
        animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        className="block h-0.5 w-5 rounded-full bg-[var(--river)] dark:bg-white"
      />
    </button>
  );
}

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleNav = (item: NavItem) => {
    if (item.external) {
      window.open(item.external, '_blank', 'noopener,noreferrer');
    } else if (item.path) {
      navigate(item.path);
    }
    setMenuOpen(false);
  };

  const currentKey = NAV_ITEMS.find(n => n.path === location.pathname)?.key ?? 'home';

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[9990]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate('/')}
            id="nav-logo"
            className="flex items-center gap-2 rounded-full bg-white/90 dark:bg-slate-800/95 px-3 py-2 text-sm font-bold shadow-md ring-1 ring-black/5 backdrop-blur cursor-pointer text-[var(--river)] dark:text-white"
          >
            <Waves className="h-4 w-4 text-[var(--aqua)]" />
            <span><span className="text-black dark:text-white">River</span><span className="text-[var(--aqua)]">Pulse</span><span className="text-black dark:text-white">India</span></span>
          </button>
          
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDark(d => !d)}
              aria-label="Toggle theme"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 dark:bg-slate-800/95 shadow-md ring-1 ring-black/5 backdrop-blur transition hover:scale-105 cursor-pointer text-[var(--river)] dark:text-amber-400"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5 text-slate-700" />}
            </button>

            <Hamburger open={menuOpen} onClick={() => setMenuOpen(v => !v)} />
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ clipPath: 'circle(0% at calc(100% - 38px) 38px)' }}
            animate={{ clipPath: 'circle(160% at calc(100% - 38px) 38px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 38px) 38px)' }}
            transition={{ type: 'spring', stiffness: 90, damping: 20 }}
            className="fixed inset-0 z-[9995] bg-[var(--river)] text-white overflow-y-auto"
          >
            <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-8 py-20">
              <div className="mb-8 flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-white/70">
                <Waves className="h-4 w-4" /> RiverPulseIndia · Navigation
              </div>
              <ul className="space-y-4">
                {NAV_ITEMS.map((it, i) => (
                  <motion.li
                    key={it.key}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05, type: 'spring', stiffness: 200, damping: 22 }}
                  >
                    <button
                      onClick={() => handleNav(it)}
                      className="group block w-full text-left cursor-pointer"
                      id={`nav-item-${it.key}`}
                    >
                      <div className="flex items-baseline gap-4">
                        <span className="text-xs text-white/40">0{i + 1}</span>
                        <span
                          className={`text-2xl font-bold tracking-tight transition md:text-4xl ${
                            currentKey === it.key ? 'text-[var(--aqua)]' : 'text-white group-hover:translate-x-2 group-hover:text-[var(--aqua)]'
                          }`}
                        >
                          {it.label}
                          {it.external && <ExternalLink className="inline-block ml-2 h-4 w-4 opacity-40" />}
                        </span>
                      </div>
                      <div className="ml-10 mt-1 text-xs text-white/60">{it.hint}</div>
                    </button>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-12 ml-10 text-xs text-white/50">
                Press Esc to close · Indian river telemetry network
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
