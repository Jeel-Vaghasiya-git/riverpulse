import { Waves } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-[var(--river)] py-8 text-center text-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Waves className="h-5 w-5 text-[var(--aqua)]" />
          <span className="text-base font-bold text-white">
            <span className="text-white">River</span><span className="text-[var(--aqua)]">Pulse</span><span className="text-white">India</span>
          </span>
        </div>
        <p className="text-xs text-white/80 mb-1">
          Copyright @2026. Created By Biswajit Majumder. All Rights Reserved.
        </p>
        <p className="text-[11px] text-white/60">
          BE in Civil Engineering, DSCE Bangalore.
        </p>
      </div>
    </footer>
  );
}
