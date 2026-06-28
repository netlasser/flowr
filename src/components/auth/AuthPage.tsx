import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu } from '@phosphor-icons/react';
import { useFlowrStore } from '../../store';
import { api } from '../../services/api';

export default function AuthPage() {
  const navigate = useNavigate();
  const setAuth = useFlowrStore((s) => s.setAuth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGuestSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Please enter your name and email');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const payload = await api.guestSession(name.trim(), email.trim());
      setAuth(payload.user, payload.token);
      navigate('/app', { replace: true });
    } catch {
      // If server is unavailable, create a local guest session
      const localUser = {
        id: `guest-${Date.now()}`,
        email: email.trim(),
        name: name.trim(),
        createdAt: new Date().toISOString(),
      };
      const localToken = `local-${Date.now()}`;
      setAuth(localUser, localToken);
      useFlowrStore.getState().hydrateFromBackend({
        user: localUser,
        token: localToken,
        zones: useFlowrStore.getState().zones,
        tasks: useFlowrStore.getState().tasks,
        switches: [],
        badges: [],
      });
      navigate('/app', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0E0C0C]">
      {/* ── Left: Brand Panel ── */}
      <div className="relative hidden w-1/2 flex-col overflow-hidden md:flex">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0E0C0C]/50 via-[#525151]/10 to-[#0E0C0C]/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,176,0,0.05)_0%,transparent_70%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <div>
            <div className="inline-flex items-center gap-3">
              <div className="rounded-2xl border border-[#FFB000]/20 bg-[#FFB000]/10 p-3">
                <Cpu size={28} className="text-[#FFB000]" />
              </div>
              <span className="text-4xl tracking-tight font-display text-[#FFB000] font-bold">FLOWR</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#525151]/40 bg-[#525151]/10 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FFB000] animate-pulse" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#525151]">Cognitive Context Shield</span>
            </div>
            <h1 className="text-5xl font-display font-bold text-white leading-tight max-w-lg">
              Where <span className="text-[#FFB000]">dreams</span> rise
              <br />
              through <span className="text-[#FFB000]">the silence.</span>
            </h1>
            <p className="text-sm text-[#525151] leading-relaxed max-w-sm">
              We&apos;re designing tools for deep thinkers, bold creators, and quiet rebels.
              Amid the chaos, we build digital spaces for sharp focus and inspired work.
            </p>
          </div>

          <p className="text-[10px] text-[#525151]">FLOWR &copy; 2026</p>
        </div>
      </div>

      {/* ── Right: Auth Form ── */}
      <div className="flex w-full items-center justify-center px-6 md:w-1/2">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-10 flex items-center justify-center gap-3 md:hidden">
            <div className="rounded-2xl border border-[#FFB000]/20 bg-[#FFB000]/10 p-2">
              <Cpu size={24} className="text-[#FFB000]" />
            </div>
            <span className="text-3xl tracking-tight font-display text-[#FFB000] font-bold">FLOWR</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-display font-bold text-white">Begin your journey</h2>
            <p className="text-sm text-[#525151] mt-2">Enter your details to start protecting your focus.</p>
          </div>

          <form onSubmit={handleGuestSignIn} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#525151] mb-2">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border border-[#525151]/30 bg-transparent px-4 py-3 text-sm text-white placeholder-[#525151] outline-none focus:border-[#FFB000] focus:ring-1 focus:ring-[#FFB000]/30 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#525151] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-xl border border-[#525151]/30 bg-transparent px-4 py-3 text-sm text-white placeholder-[#525151] outline-none focus:border-[#FFB000] focus:ring-1 focus:ring-[#FFB000]/30 transition-colors"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FFB000] text-[#0E0C0C] rounded-full px-6 py-3 text-sm font-bold hover:bg-[#FFB000]/90 hover:scale-[1.02] transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? 'Starting...' : 'Continue to FLOWR'}
            </button>
          </form>

          <p className="text-[10px] text-[#525151] text-center mt-8 leading-relaxed">
            By continuing, you agree to the FLOWR terms.
            <br />
            Your data stays local and private.
          </p>
        </div>
      </div>
    </div>
  );
}
