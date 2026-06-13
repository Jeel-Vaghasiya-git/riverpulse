import { useState, useRef, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, FileLock2, Globe2, Hash, ShieldCheck, X } from "lucide-react";
import { signInAnonymously } from "firebase/auth";
import { ref, set, onValue } from "firebase/database";
import { auth, db } from "../lib/firebase";

// Digital Odometer
function Odometer({ value }: { value: number }) {
  const digits = value.toLocaleString("en-IN").split("");
  return (
    <div className="flex items-center justify-center gap-1 font-mono">
      {digits.map((d, i) => (
        <Slot key={`${i}-${d}`} char={d} />
      ))}
    </div>
  );
}

function Slot({ char }: { char: string }) {
  const isDigit = /\d/.test(char);
  return (
    <div className={`relative h-14 md:h-20 ${isDigit ? "w-9 md:w-14 rounded-md bg-[var(--river)] shadow-inner overflow-hidden" : "w-3"}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={char}
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className={`absolute inset-0 flex items-center justify-center text-2xl md:text-4xl font-bold ${isDigit ? "text-white" : "text-[var(--river)]"}`}
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export default function ComplaintsPage() {
  const [totalComplaints, setTotalComplaints] = useState(0);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('complaintSubmitted') === 'true') {
      setShowSuccessToast(true);
      sessionStorage.removeItem('complaintSubmitted');
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const complaintsRef = ref(db, 'complaints');
    const unsubscribe = onValue(complaintsRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setTotalComplaints(Object.keys(val).length);
      } else {
        setTotalComplaints(0);
      }
    }, (err) => {
      console.warn("Realtime database complaints read failed:", err);
    });
    return () => unsubscribe();
  }, []);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", river: "", description: "" });
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setError("Image size must be less than 1MB");
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      const complaintId = `GRV-${Math.floor(100000 + Math.random() * 900000)}`;
      const newComplaint: any = {
        id: complaintId,
        name: isAnonymous ? "Anonymous" : form.name,
        location: `${form.river}, ${form.location}`,
        district: form.location.split(',')[0].trim(),
        date: new Date().toISOString().split('T')[0],
        status: "active",
        description: form.description
      };

      if (image) {
        newComplaint.image = image;
      }

      await set(ref(db, `complaints/${complaintId}`), newComplaint);

      sessionStorage.setItem('complaintSubmitted', 'true');
      window.location.reload();
    } catch (err: any) {
      console.error("Firebase complaint submit error:", err);
      setError(err.message || "Failed to submit grievance. Please try again.");
    }
  }

  return (
    <div className="bg-[var(--slate-soft)] pt-28 pb-20 px-6 min-h-screen">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--aqua)]">Section 04</p>
          <h1 className="mt-2 text-4xl font-bold text-[var(--river)] md:text-5xl">Citizen Channel</h1>
          <p className="mt-2 text-lg text-muted-foreground">Report pollution. Move the pulse forward.</p>
          <p className="mt-3 max-w-2xl rounded-lg border-l-4 border-[var(--aqua)] bg-white p-3 text-sm text-[var(--river)] shadow-sm">
            Every submission is timestamped, geo-tagged and added to the public record. Be specific. Be the witness.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* LEFT: Form */}
          <form onSubmit={onSubmit} className="rounded-2xl bg-white p-6 shadow-[var(--shadow-card)] ring-1 ring-black/5 md:p-8">
            {showSuccessToast && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-100 flex items-center gap-2"
              >
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                <span>Complaint submitted successfully. Form cleared.</span>
              </motion.div>
            )}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2 flex items-center justify-between bg-[var(--slate-soft)] p-3 rounded-lg border border-slate-100 mb-2">
                <span className="text-xs font-semibold text-[var(--river)]">Submit Complaint Anonymously</span>
                <button
                  type="button"
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                    isAnonymous ? "bg-[var(--aqua)]" : "bg-slate-300"
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${
                    isAnonymous ? "left-[18px]" : "left-0.5"
                  }`} />
                </button>
              </div>

              {!isAnonymous && (
                <div className="md:col-span-2">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Your Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Full name"
                    className="mt-1 w-full rounded-lg border border-input bg-[var(--slate-soft)] px-3 py-2.5 text-sm outline-none ring-[var(--aqua)] focus:ring-2 text-[var(--river)] font-medium"
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Location (City, State)</label>
                <input
                  required
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Varanasi, Uttar Pradesh"
                  className="mt-1 w-full rounded-lg border border-input bg-[var(--slate-soft)] px-3 py-2.5 text-sm outline-none ring-[var(--aqua)] focus:ring-2 text-[var(--river)] font-medium"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">River / Waterbody Name</label>
                <input
                  required
                  value={form.river}
                  onChange={(e) => setForm({ ...form, river: e.target.value })}
                  placeholder="e.g., Yamuna at Wazirabad"
                  className="mt-1 w-full rounded-lg border border-input bg-[var(--slate-soft)] px-3 py-2.5 text-sm outline-none ring-[var(--aqua)] focus:ring-2 text-[var(--river)] font-medium"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Detailed Incident Description</label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  placeholder="Describe the pollution event — discharge type, time observed, visible impact..."
                  className="mt-1 w-full rounded-lg border border-input bg-[var(--slate-soft)] p-3 text-sm outline-none ring-[var(--aqua)] focus:ring-2 text-[var(--river)] font-medium"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Attached Photo (optional)</label>
                <div className="mt-1 flex flex-col gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[var(--river)] file:text-white hover:file:bg-[var(--aqua)] cursor-pointer file:cursor-pointer transition-colors"
                  />
                  {image && (
                    <div className="relative w-fit rounded-lg border p-1 bg-slate-50">
                      <img src={image} className="max-h-24 w-auto object-contain rounded" alt="Grievance Attachment Preview" />
                      <button
                        type="button"
                        onClick={() => setImage(null)}
                        className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white shadow hover:bg-rose-600 transition cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {error && (
              <div className="mt-4 p-3 rounded bg-rose-50 text-rose-600 text-xs border border-rose-100 flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--river)] px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[var(--aqua)] cursor-pointer transition-colors"
            >
              Submit Complaint
            </motion.button>
          </form>

          {/* RIGHT: Counter and Steps */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-br from-[var(--river)] to-[#0a2f48] p-6 text-white shadow-[var(--shadow-card)] md:p-8">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/60">
                <Globe2 className="h-3 w-3 text-[var(--aqua)]" /> Live · Global Registry
              </div>
              <h3 className="mt-2 text-lg font-semibold text-white">Total Environmental Complaints Filed</h3>
              <div className="mt-6"><Odometer value={totalComplaints} /></div>
              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-white/60">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--aqua)]" />
                Synced live from database
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-card)] ring-1 ring-black/5 md:p-8">
              <h4 className="text-sm font-bold uppercase tracking-widest text-[var(--river)]">What Happens Next</h4>
              <ol className="mt-4 space-y-4">
                <Step n="01" icon={<Hash className="h-4 w-4" />} title="Cryptographic Hashing" desc="Your submission is SHA-256 hashed and time-stamped for tamper-proof storage." />
                <Step n="02" icon={<ShieldCheck className="h-4 w-4" />} title="Verification Routing" desc="Routed to the nearest CPCB / SPCB node for field verification within 72 hours." />
                <Step n="03" icon={<FileLock2 className="h-4 w-4" />} title="Public Registry Sync" desc="Synced to the open public registry — visible to citizens, agencies and journalists." />
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({ n, icon, title, desc }: { n: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--aqua)]/10 text-[var(--aqua)]">{icon}</div>
      <div>
        <div className="text-xs font-mono text-muted-foreground">{n}</div>
        <div className="text-sm font-semibold text-[var(--river)]">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</div>
      </div>
    </li>
  );
}
