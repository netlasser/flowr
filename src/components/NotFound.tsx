import { Link } from 'react-router-dom';
import { Compass } from '@phosphor-icons/react';

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-6 text-center">
      <div className="rounded-2xl border border-border bg-muted/60 p-4 text-muted-foreground mb-6">
        <Compass size={32} />
      </div>
      <h1 className="text-4xl font-black tracking-tight mb-2">404</h1>
      <p className="text-sm text-muted-foreground max-w-sm mb-8 leading-relaxed">
        This page doesn't exist in your cognitive context zones.
      </p>
      <Link
        to="/"
        className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground hover:scale-105 transition"
      >
        Return Home
      </Link>
    </div>
  );
}
