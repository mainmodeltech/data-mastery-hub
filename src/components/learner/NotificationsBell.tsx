/**
 * NotificationsBell — centre de notifications de l'espace apprenant.
 * Les notifications sont dérivées des données réelles du tableau de bord (échéances à régler, projet à
 * corriger, quiz à passer, lives des 7 prochains jours, certificat prêt). Le « lu / non lu » est mémorisé dans
 * ce navigateur ; une notification réapparaît si sa situation change (nouvel identifiant).
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Award, Bell, CalendarDays, CircleCheck } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLearnerDashboard } from "@/hooks/useCourse";
import { todoHref } from "@/lib/learnerLinks";

interface Notice {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  tone: "warning" | "info" | "success";
}

const STORAGE_KEY = "mt-notifications-seen";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function readSeen(): Set<string> {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

function writeSeen(ids: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids).slice(-200)));
  } catch {
    /* stockage indisponible : les notifications restent simplement « non lues » */
  }
}

export function NotificationsBell() {
  const { data: result } = useLearnerDashboard();
  const dash = result?.data;
  const [seen, setSeen] = useState<Set<string>>(readSeen);
  const [open, setOpen] = useState(false);

  const notices = useMemo<Notice[]>(() => {
    if (!dash) return [];
    const list: Notice[] = [];
    for (const t of dash.todos) {
      list.push({ id: `todo-${t.id}`, title: t.title, subtitle: `${t.subtitle} · ${t.badge}`, href: todoHref(t.id), tone: t.tone === "warning" ? "warning" : "info" });
    }
    const now = Date.now();
    for (const live of dash.lives) {
      const at = new Date(live.startsAt).getTime();
      if (Number.isFinite(at) && at >= now - 3600_000 && at - now <= WEEK_MS) {
        list.push({ id: `live-${live.id}`, title: live.title, subtitle: `Live · ${live.timeLabel}`, href: "/espace/calendrier", tone: "info" });
      }
    }
    if (dash.certificateReady) {
      list.push({ id: `cert-${dash.certificateReady.title}`, title: `Votre certificat ${dash.certificateReady.title} est prêt`, subtitle: "À télécharger ou partager", href: "/espace/certificats", tone: "success" });
    }
    return list;
  }, [dash]);

  const unread = notices.filter((n) => !seen.has(n.id)).length;

  // Ouvrir le panneau marque les notifications actuelles comme lues.
  useEffect(() => {
    if (!open || notices.length === 0) return;
    const next = new Set(seen);
    notices.forEach((n) => next.add(n.id));
    writeSeen(next);
    // on garde l'affichage « non lu » jusqu'à la fermeture pour que l'utilisateur voie ce qui est nouveau
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) setSeen(readSeen());
  };

  const Icon = (tone: Notice["tone"]) => (tone === "success" ? Award : tone === "warning" ? CircleCheck : CalendarDays);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative flex h-11 w-11 items-center justify-center rounded-card border border-[#E7E0D4] text-navy"
          aria-label={unread > 0 ? `Notifications : ${unread} nouvelle${unread > 1 ? "s" : ""}` : "Notifications"}
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-pill bg-cta px-1 text-[0.6875rem] font-bold text-white">{unread}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 rounded-card p-0">
        <div className="border-b border-[#E7E0D4] px-4 py-3 font-heading text-sm font-bold text-navy">Notifications</div>
        {notices.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-ink-secondary">Rien de nouveau pour le moment.</p>
        ) : (
          <ul className="max-h-80 overflow-y-auto">
            {notices.map((n) => {
              const NoticeIcon = Icon(n.tone);
              return (
                <li key={n.id} className="border-b border-[#E7E0D4] last:border-b-0">
                  <Link to={n.href} onClick={() => setOpen(false)} className="flex items-start gap-3 px-4 py-3 hover:bg-app-bg">
                    <NoticeIcon className={n.tone === "warning" ? "mt-0.5 h-4 w-4 shrink-0 text-warning" : n.tone === "success" ? "mt-0.5 h-4 w-4 shrink-0 text-success" : "mt-0.5 h-4 w-4 shrink-0 text-navy"} aria-hidden="true" />
                    <span className="flex min-w-0 flex-col">
                      <span className="text-sm font-semibold text-ink">{n.title}</span>
                      <span className="text-xs text-ink-secondary">{n.subtitle}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
