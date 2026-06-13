import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
      />
      <div className="absolute inset-0 bg-black/20 z-1" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto w-full">
          <span className="text-3xl tracking-tight font-display text-foreground">FLOWR</span>
          <Link to="/app">
            <button className="bg-primary text-primary-foreground rounded-full px-6 py-2.5 font-medium hover:bg-primary/90 hover:scale-105 transition-all shadow-lg">
              Begin Journey
            </button>
          </Link>
        </nav>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <h1 className="animate-fade-rise text-5xl sm:text-7xl md:text-8xl leading-tight max-w-6xl font-display font-normal">
            Where <em className="not-italic text-muted-foreground">dreams</em> rise
            <br />
            through <em className="not-italic text-muted-foreground">the silence.</em>
          </h1>
          <p className="animate-fade-rise-delay text-muted-foreground text-base sm:text-lg max-w-2xl mt-8">
            We're designing tools for deep thinkers, bold creators, and quiet rebels.
            Amid the chaos, we build digital spaces for sharp focus and inspired work.
          </p>
          <Link to="/app">
            <button className="animate-fade-rise-delay-2 bg-primary text-primary-foreground rounded-full px-14 py-5 text-base mt-12 font-medium hover:bg-primary/90 hover:scale-105 transition-all shadow-lg shadow-[0_0_15px_rgba(255,176,0,0.3)]">
              Begin Journey
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
