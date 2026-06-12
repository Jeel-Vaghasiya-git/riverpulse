import { useState, useEffect, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, Mail, ArrowRight, Shield, CheckCircle2, AlertCircle, Clock, ChevronDown, ChevronUp, User as UserIcon } from 'lucide-react';
import { SPRING_CONFIG } from '../data/constants';
import type { Complaint, ComplaintStatus } from '../data/constants';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword, type User } from 'firebase/auth';
import { ref, onValue, set } from 'firebase/database';
import { auth, db } from '../lib/firebase';

function AuthForm({ onAuthAction, error, isLoading }: { onAuthAction: (email: string, password: string, isRegister: boolean) => void; error: string | null; isLoading: boolean }) {
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuthAction(email, password, tab === 'register');
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl p-6 sm:p-8 shadow-[var(--shadow-card)] ring-1 ring-black/5 border">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={SPRING_CONFIG}>
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[var(--river)] flex items-center justify-center shadow-md">
            <Shield className="text-white" size={24} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-[var(--river)] mb-1">Municipality Portal</h2>
        <p className="text-center mb-6 text-xs text-muted-foreground">Secure administrative access for river health management</p>

        <div className="flex bg-[var(--slate-soft)] rounded-lg p-1 mb-6 border border-slate-100">
          {(['signin', 'register'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer"
              style={{ background: tab === t ? 'white' : 'transparent', color: tab === t ? 'var(--river)' : '#64748b', boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
              {t === 'signin' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-3 mb-4 rounded bg-rose-50 text-rose-600 text-xs border border-rose-100 flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="municipality@gov.in" required disabled={isLoading}
                className="w-full rounded-lg pl-10 pr-4 py-2.5 text-sm bg-[var(--slate-soft)] border border-input text-[var(--river)] font-medium outline-none focus:ring-2 focus:ring-[var(--aqua)] disabled:opacity-65" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required disabled={isLoading}
                className="w-full rounded-lg pl-10 pr-12 py-2.5 text-sm bg-[var(--slate-soft)] border border-input text-[var(--river)] font-medium outline-none focus:ring-2 focus:ring-[var(--aqua)] disabled:opacity-65" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[var(--river)] cursor-pointer">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {tab === 'signin' && (
            <div className="text-right">
              <button type="button" className="text-xs text-[var(--aqua)] hover:underline cursor-pointer">Forgot Password?</button>
            </div>
          )}
          <button type="submit" disabled={isLoading}
            className="w-full py-3 text-white font-semibold rounded-lg bg-[var(--river)] hover:bg-[var(--aqua)] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-65">
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {tab === 'signin' ? 'Sign In' : 'Create Account'} <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function AdminConsole({ complaints, onResolve, isApproved }: { complaints: Complaint[]; onResolve: (id: string) => void; isApproved: boolean }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredComplaints = complaints.filter((c) => filterStatus === 'all' || c.status === filterStatus);

  const statusConfig: Record<ComplaintStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    active: { label: 'Active', color: 'var(--aqua)', bg: 'rgba(50,140,193,0.1)', icon: Clock },
    escalated: { label: 'Escalated', color: 'var(--critical)', bg: 'oklch(0.58 0.22 27 / 0.15)', icon: AlertCircle },
    resolved: { label: 'Resolved', color: 'var(--good)', bg: 'oklch(0.65 0.17 155 / 0.15)', icon: CheckCircle2 },
  };

  const counts = {
    total: complaints.length,
    active: complaints.filter((c) => c.status === 'active').length,
    escalated: complaints.filter((c) => c.status === 'escalated').length,
    resolved: complaints.filter((c) => c.status === 'resolved').length,
  };

  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={SPRING_CONFIG}>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Grievances', value: counts.total, color: 'var(--river)' },
          { label: 'Active Cases', value: counts.active, color: 'var(--aqua)' },
          { label: 'Escalated Cases', value: counts.escalated, color: 'var(--critical)' },
          { label: 'Resolved Cases', value: counts.resolved, color: 'var(--good)' },
        ].map((card) => (
          <div key={card.label} className="bg-white border rounded-xl p-4 text-center shadow-[var(--shadow-card)] ring-1 ring-black/5">
            <span className="text-3xl font-bold" style={{ color: card.color }}>{card.value}</span>
            <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase tracking-wider">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Options */}
      <div className="flex flex-wrap gap-2 mb-6 bg-white p-2 rounded-lg border w-fit shadow-sm">
        {['all', 'active', 'escalated', 'resolved'].map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className="text-xs font-semibold px-3.5 py-1.5 rounded-md capitalize transition-colors cursor-pointer"
            style={{
              background: filterStatus === s ? 'var(--river)' : 'transparent',
              color: filterStatus === s ? 'white' : '#64748b',
            }}>
            {s}
          </button>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-[var(--shadow-card)] ring-1 ring-black/5 border overflow-hidden">
        {filteredComplaints.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No grievances found matching the filter.
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                {['ID', 'Complainant', 'Location', 'District', 'Date', 'Status', 'Action'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map((complaint) => {
                const sc = statusConfig[complaint.status];
                const StatusIcon = sc.icon;
                const isExpanded = expandedId === complaint.id;
                return (
                  <Fragment key={complaint.id}>
                    <tr
                      onClick={() => setExpandedId(isExpanded ? null : complaint.id)}
                      className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 cursor-pointer"
                    >
                      <td className="px-5 py-4 text-sm font-mono font-bold text-[var(--aqua)]">{complaint.id}</td>
                      <td className="px-5 py-4 text-sm text-[var(--river)] font-semibold">{complaint.name}</td>
                      <td className="px-5 py-4 text-sm max-w-[200px] truncate text-muted-foreground">{complaint.location}</td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{complaint.district}</td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{complaint.date}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.color }}>
                          <StatusIcon size={12} /> {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {complaint.status !== 'resolved' ? (
                          isApproved ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onResolve(complaint.id);
                              }}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--good)]/35 bg-[var(--good)]/10 text-[var(--good)] hover:bg-[var(--good)]/20 transition cursor-pointer"
                            >
                              Resolve
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded">
                              <Lock size={12} className="text-slate-400" /> Read-Only
                            </span>
                          )
                        ) : (
                          <span className="text-xs font-semibold text-muted-foreground">Closed</span>
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50/30">
                        <td colSpan={7} className="px-5 py-4">
                          <div className="flex flex-col md:flex-row gap-6 text-xs text-[var(--river)] bg-[var(--slate-soft)] p-4 rounded-xl border border-slate-100 leading-relaxed shadow-inner">
                            <div className="flex-1">
                              <p className="font-semibold text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Grievance Description</p>
                              <div className="whitespace-pre-wrap">{complaint.description}</div>
                            </div>
                            {complaint.image && (
                              <div className="shrink-0 flex flex-col justify-start">
                                <p className="font-semibold text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Attached Photo</p>
                                <img
                                  src={complaint.image}
                                  className="max-h-48 max-w-[280px] object-contain rounded-lg border bg-white shadow-sm transition hover:scale-102"
                                  alt="Grievance evidence"
                                />
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredComplaints.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center text-sm text-muted-foreground border">
            No grievances found matching the filter.
          </div>
        ) : (
          filteredComplaints.map((complaint) => {
            const sc = statusConfig[complaint.status];
            const StatusIcon = sc.icon;
            const isExpanded = expandedId === complaint.id;
            return (
              <motion.div key={complaint.id} layout className="bg-white rounded-xl p-4 shadow-sm border">
                <button onClick={() => setExpandedId(isExpanded ? null : complaint.id)} className="w-full flex items-center justify-between text-left cursor-pointer">
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-mono font-bold text-[var(--aqua)]">{complaint.id}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.color }}>
                        <StatusIcon size={10} /> {sc.label}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-[var(--river)]">{complaint.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{complaint.location}</p>
                  </div>
                  {isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="pt-3 mt-3 space-y-2 border-t border-slate-100 text-xs">
                        <p className="text-muted-foreground"><span className="font-semibold text-[var(--river)]">District:</span> {complaint.district}</p>
                        <p className="text-muted-foreground"><span className="font-semibold text-[var(--river)]">Date Filed:</span> {complaint.date}</p>
                        <div className="text-[var(--river)] bg-[var(--slate-soft)] p-3 rounded-lg mt-2 leading-relaxed whitespace-pre-wrap">{complaint.description}</div>
                        {complaint.image && (
                          <div className="mt-3">
                            <p className="font-semibold text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Attached Photo</p>
                            <img
                              src={complaint.image}
                              className="max-h-40 w-auto object-contain rounded-lg border bg-white shadow-sm"
                              alt="Grievance evidence"
                            />
                          </div>
                        )}
                        {complaint.status !== 'resolved' && (
                          isApproved ? (
                            <button onClick={() => onResolve(complaint.id)}
                              className="mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--good)]/35 bg-[var(--good)]/10 text-[var(--good)] hover:bg-[var(--good)]/20 transition cursor-pointer">
                              Mark Resolved
                            </button>
                          ) : (
                            <div className="mt-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/50 p-2 rounded flex items-center gap-1 w-fit">
                              <Lock size={12} className="text-slate-400" /> Resolution locked
                            </div>
                          )
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

interface UserProfile {
  uid: string;
  email: string;
  approved: boolean;
  role: 'admin' | 'staff';
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  // Monitor auth status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setUserProfile(null);
        setIsInitializing(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Monitor logged in user profile status in RTDB
  useEffect(() => {
    if (!user) return;

    const profileRef = ref(db, `users/${user.uid}`);
    const unsubscribe = onValue(profileRef, async (snapshot) => {
      const profile = snapshot.val() as UserProfile | null;
      const isHeadAdmin = user.email === 'riverpulseindia@admin.com';

      if (!profile && isHeadAdmin) {
        // Auto-seed Head Admin user profile if it doesn't exist in RTDB
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email!,
          approved: true,
          role: 'admin'
        };
        await set(ref(db, `users/${user.uid}`), newProfile);
        setUserProfile(newProfile);
      } else if (profile) {
        // Auto-fix head admin status in database if someone registered externally
        if (isHeadAdmin && (!profile.approved || profile.role !== 'admin')) {
          const updated: UserProfile = { ...profile, approved: true, role: 'admin' };
          await set(ref(db, `users/${user.uid}`), updated);
          setUserProfile(updated);
        } else {
          setUserProfile(profile);
        }
      } else {
        // Profile doesn't exist in RTDB, create pending staff profile
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email!,
          approved: false,
          role: 'staff'
        };
        await set(ref(db, `users/${user.uid}`), newProfile);
        setUserProfile(newProfile);
      }
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Monitor all users (only for Head Admin)
  useEffect(() => {
    if (!user || user.email !== 'riverpulseindia@admin.com') {
      setAllUsers([]);
      return;
    }

    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setAllUsers(Object.values(val) as UserProfile[]);
      } else {
        setAllUsers([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Listen to complaints in Realtime Database and seed if empty
  useEffect(() => {
    if (!user) {
      setComplaints([]);
      return;
    }

    const complaintsRef = ref(db, 'complaints');
    const unsubscribe = onValue(complaintsRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const rawList = Object.values(val) as Complaint[];
        const processedList = rawList.map(c => {
          // A complaint goes to escalated stage if it's not resolved for more than a month (30 days)
          if (c.status !== 'resolved') {
            const complaintDate = new Date(c.date);
            const diffTime = Date.now() - complaintDate.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            if (diffDays > 30) {
              return { ...c, status: 'escalated' as const };
            }
          }
          return c;
        });

        // Sort: active/escalated first, then resolved, then date desc
        const sorted = processedList.sort((a, b) => {
          if (a.status === 'resolved' && b.status !== 'resolved') return 1;
          if (a.status !== 'resolved' && b.status === 'resolved') return -1;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        setComplaints(sorted);
      } else {
        setComplaints([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleAuthAction = async (email: string, password: string, isRegister: boolean) => {
    setAuthError(null);
    setIsLoadingAuth(true);
    try {
      if (isRegister) {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const isHeadAdmin = email === 'riverpulseindia@admin.com';
        
        // Create user profile record in database
        const newProfile: UserProfile = {
          uid: credential.user.uid,
          email: email,
          approved: isHeadAdmin,
          role: isHeadAdmin ? 'admin' : 'staff'
        };
        await set(ref(db, `users/${credential.user.uid}`), newProfile);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error("Firebase auth action error:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setAuthError("Invalid email or password credentials.");
      } else if (err.code === 'auth/email-already-in-use') {
        setAuthError("This email address is already in use.");
      } else if (err.code === 'auth/weak-password') {
        setAuthError("Password must be at least 6 characters long.");
      } else {
        setAuthError(err.message || "Authentication failed. Please try again.");
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Firebase signout error:", err);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await set(ref(db, `complaints/${id}/status`), 'resolved');
    } catch (err) {
      console.error("Firebase resolve error:", err);
    }
  };

  const handleApproveUser = async (userUid: string) => {
    try {
      await set(ref(db, `users/${userUid}/approved`), true);
    } catch (err) {
      console.error("Firebase approve user error:", err);
    }
  };

  const isApproved = userProfile?.approved || user?.email === 'riverpulseindia@admin.com';
  const isHeadAdmin = user?.email === 'riverpulseindia@admin.com';

  if (isInitializing) {
    return (
      <div className="bg-[var(--slate-soft)] pt-28 pb-20 px-6 min-h-screen flex flex-col items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-[var(--aqua)] animate-spin mb-4" />
        <p className="text-xs text-muted-foreground font-semibold">Initializing security layers...</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--slate-soft)] pt-28 pb-20 px-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div key="auth" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={SPRING_CONFIG}>
              <div className="flex items-center gap-3 mb-8">
                <UserIcon className="text-[var(--aqua)]" size={24} />
                <h1 className="text-3xl sm:text-4xl font-bold text-[var(--river)]">Admin Login</h1>
              </div>
              <AuthForm onAuthAction={handleAuthAction} error={authError} isLoading={isLoadingAuth} />
            </motion.div>
          ) : (
            <motion.div key="admin" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={SPRING_CONFIG}>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-[var(--river)]">Administrative Console</h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Logged in as {user.email} · {isApproved ? 'Resolution access active' : 'Read-Only / Awaiting approval'}
                  </p>
                </div>
                <button onClick={handleSignOut}
                  className="text-xs px-3.5 py-2 rounded-lg border border-input text-muted-foreground hover:bg-slate-100 transition-colors cursor-pointer bg-white font-semibold shadow-sm">
                  Sign Out
                </button>
              </div>

              {/* Awaiting approval banner for staff */}
              {!isApproved && (
                <div className="mb-8 p-4 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-2">
                  <Lock size={14} className="shrink-0" />
                  <span>Your account is currently pending administrator approval. You can browse citizen-reported grievances, but the Resolve option is locked.</span>
                </div>
              )}

              {/* Head Admin Hidden Approval Dashboard */}
              {isHeadAdmin && (
                <div className="mb-8 bg-white rounded-xl shadow-[var(--shadow-card)] ring-1 ring-black/5 border p-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--river)] mb-4 flex items-center gap-2">
                    <Shield className="text-[var(--aqua)]" size={16} /> User Access Controls (Head Admin)
                  </h3>
                  {allUsers.length <= 1 ? (
                    <p className="text-xs text-muted-foreground">No other registered staff accounts found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-widest text-muted-foreground font-bold text-left">
                            <th className="px-4 py-2">Email Address</th>
                            <th className="px-4 py-2">Role</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allUsers.filter(u => u.uid !== user.uid).map(u => (
                            <tr key={u.uid} className="border-b border-slate-50">
                              <td className="px-4 py-3 font-semibold text-[var(--river)]">{u.email}</td>
                              <td className="px-4 py-3 capitalize text-muted-foreground">{u.role}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  u.approved 
                                    ? 'bg-emerald-50 text-emerald-700' 
                                    : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {u.approved ? 'Approved' : 'Pending Action'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                {!u.approved ? (
                                  <button onClick={() => handleApproveUser(u.uid)}
                                    className="text-[10px] font-semibold px-2.5 py-1 rounded bg-[var(--river)] text-white hover:bg-[var(--aqua)] transition cursor-pointer shadow-sm">
                                    Approve Access
                                  </button>
                                ) : (
                                  <span className="text-[10px] font-semibold text-slate-400 font-medium">Authorized</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              <AdminConsole complaints={complaints} onResolve={handleResolve} isApproved={isApproved} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
