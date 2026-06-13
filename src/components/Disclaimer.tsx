import { AlertTriangle } from 'lucide-react';

export default function Disclaimer() {
  return (
    <section className="bg-[var(--slate-soft)] border-t border-[var(--border)] py-10 px-6" id="disclaimer">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-xl border border-[var(--critical)]/20 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="flex-shrink-0 mt-0.5 text-[var(--critical)]" size={20} />
            <h3 className="text-lg font-bold text-[var(--critical)]">Academic Disclaimer</h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            This website has been developed solely for academic and demonstration purposes as part of a
            college project. It is an independent platform and is not affiliated with, endorsed by, authorized
            by, or associated with any government agency, organization, or third-party authority. The
            website does not impersonate, manipulate, alter, steal, or unlawfully access any government
            portal, database, or information system. Any data displayed is either collected through the
            project's own monitoring system, publicly available sources, or simulated data for educational
            purposes. This project is intended exclusively for research, learning, and innovation and should
            not be considered an official source of information.
          </p>
        </div>
        <div className="mt-4 text-center text-xs font-bold text-[var(--river)] opacity-60">
          <span><span className="text-black dark:text-white">River</span><span className="text-[var(--aqua)]">Pulse</span><span className="text-black dark:text-white">India</span></span>
        </div>
      </div>
    </section>
  );
}
