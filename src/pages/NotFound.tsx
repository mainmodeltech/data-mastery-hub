/**
 * NotFoundPage.tsx
 *
 * Page 404 — design dark editorial aligné avec MasterclassPage
 * Annonce le lancement du site le 16 mars 2026 avec countdown
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logoHorizontal from "@/assets/logo-black-horizontal.png";
import { ArrowRight, Sparkles } from "lucide-react";

// ─── Countdown vers le 16 mars ────────────────────────────────────────────────

const LAUNCH_DATE = new Date("2026-03-16T00:00:00+00:00");

function useCountdown(target: Date) {
  const calc = () => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000)  / 60000),
      seconds: Math.floor((diff % 60000)    / 1000),
    };
  };

  const [time, setTime] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}

// ─── Bloc countdown ───────────────────────────────────────────────────────────

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          {/* Reflet */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          <div className="w-20 h-20 md:w-24 md:h-24 bg-white/[0.04] border border-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <span className="text-3xl md:text-4xl font-black text-white tabular-nums leading-none">
                        {String(value).padStart(2, "0")}
                    </span>
          </div>
        </div>
        <span className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-semibold">
                {label}
            </span>
      </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotFoundPage() {
  const countdown = useCountdown(LAUNCH_DATE);

  return (
      <div className="min-h-screen bg-[#0d0f1a] text-white flex flex-col">

        {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
        <nav className="border-b border-white/5 bg-[#0d0f1a]/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 lg:px-8 h-14 flex items-center">
            <img
                src={logoHorizontal}
                alt="Model Technologie"
                className="h-7 w-auto invert"
            />
          </div>
        </nav>

        {/* ── CONTENU PRINCIPAL ──────────────────────────────────────────── */}
        <main className="flex-1 flex items-center justify-center relative overflow-hidden px-4">

          {/* Fonds décoratifs */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Halo amber centré */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-400/4 rounded-full blur-[160px]" />
            {/* Halo bleu coin bas droit */}
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
            {/* Grille subtile */}
            <div
                className="absolute inset-0 opacity-[0.025]"
                style={{
                  backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
            />
          </div>

          <div className="relative z-10 text-center max-w-2xl mx-auto py-16">

            {/* Code 404 — grand, typographique */}
            <div className="relative inline-block mb-6">
                        <span
                            className="text-[clamp(6rem,20vw,11rem)] font-black leading-none tracking-tighter select-none"
                            style={{
                              background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}
                        >
                            404
                        </span>
              {/* Ligne amber qui traverse */}
              <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent -translate-y-1/2" />
            </div>

            {/* Message principal */}
            <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-1.5 mb-5">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
              <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">
                            Page non disponible
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black leading-tight mb-4 tracking-tight">
              <span className="text-amber-400">Le site arrive très bientôt.</span>
            </h1>

            <p className="text-slate-400 text-lg leading-relaxed mb-12 max-w-lg mx-auto">
              Nous préparons quelque chose de grand. Le site complet de{" "}
              <span className="text-white font-semibold">Model Technologie</span>{" "}
              sera accessible le <span className="text-amber-400 font-semibold">16 mars</span> avec de grosses surprises.
            </p>

            {/* Countdown */}
            <div className="mb-12">
              <p className="text-xs text-slate-600 uppercase tracking-[0.2em] font-semibold mb-5">
                Lancement dans
              </p>
              <div className="flex items-end justify-center gap-3 md:gap-4">
                <CountdownBlock value={countdown.days}    label="jours" />
                <span className="text-white/20 text-3xl font-black mb-8 leading-none">:</span>
                <CountdownBlock value={countdown.hours}   label="heures" />
                <span className="text-white/20 text-3xl font-black mb-8 leading-none">:</span>
                <CountdownBlock value={countdown.minutes} label="minutes" />
                <span className="text-white/20 text-3xl font-black mb-8 leading-none">:</span>
                <CountdownBlock value={countdown.seconds} label="secondes" />
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-white/5" />
              <Sparkles className="h-4 w-4 text-amber-400/40" />
              <div className="h-px flex-1 bg-white/5" />
            </div>

            {/* CTA masterclass */}
            <p className="text-slate-500 text-sm mb-4">
              En attendant, ne ratez pas notre masterclass gratuite Power BI
            </p>
            <Link
                to="/masterclass/power-bi-dashboard"
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-sm px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-[0_0_24px_rgba(251,191,36,0.35)]"
            >
              Voir la masterclass du 24 mars
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </main>

        {/* ── FOOTER ─────────────────────────────────────────────────────── */}
        <footer className="border-t border-white/5 py-6">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <p className="text-xs text-slate-700">© 2026 Model Technologie · Dakar, Sénégal</p>
          </div>
        </footer>
      </div>
  );
}
