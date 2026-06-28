import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0E0C0C]">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0E0C0C]/40 via-[#525151]/15 to-[#0E0C0C]/40 z-1" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,176,0,0.04)_0%,transparent_70%)] z-2" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto w-full">
          <span className="text-3xl tracking-tight font-display text-[#FFB000] font-bold">FLOWR</span>
          <Link to="/auth">
            <button className="bg-[#FFB000] text-[#0E0C0C] rounded-full px-6 py-2.5 text-sm font-bold hover:bg-[#FFB000]/90 hover:scale-105 transition-all shadow-lg active:scale-[0.98]">
              Begin Journey
            </button>
          </Link>
        </nav>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#525151]/40 bg-[#525151]/10 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FFB000] animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#525151]">Cognitive Context Shield</span>
          </div>
          <h1 className="animate-fade-rise text-5xl sm:text-7xl md:text-8xl leading-tight max-w-6xl font-display font-normal text-white">
            Where <em className="not-italic text-[#FFB000]">dreams</em> rise
            <br />
            through <em className="not-italic text-[#FFB000]">the silence.</em>
          </h1>
          <p className="animate-fade-rise-delay text-[#525151] text-base sm:text-lg max-w-2xl mt-8 leading-relaxed">
            We&apos;re designing tools for deep thinkers, bold creators, and quiet rebels.
            Amid the chaos, we build digital spaces for sharp focus and inspired work.
          </p>
          <Link to="/auth">
            <button className="animate-fade-rise-delay-2 bg-[#FFB000] text-[#0E0C0C] rounded-full px-14 py-5 text-base mt-12 font-bold hover:bg-[#FFB000]/90 hover:scale-105 transition-all shadow-lg shadow-[0_0_30px_rgba(255,176,0,0.25)] active:scale-[0.98]">
              Begin Journey
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
