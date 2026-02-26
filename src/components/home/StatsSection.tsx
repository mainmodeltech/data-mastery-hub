import { useRef, useEffect, useState } from "react";
import { Users, Briefcase, GraduationCap, Building } from "lucide-react";

const stats = [
    {
        icon: Users,
        value: 150,
        suffix: "+",
        label: "Alumni formés",
        sublabel: "depuis 2022",
        color: "text-accent",
        bg: "bg-accent/10",
    },
    {
        icon: GraduationCap,
        value: 94,
        suffix: "%",
        label: "Taux de placement",
        sublabel: "en poste en < 6 mois",
        color: "text-primary",
        bg: "bg-primary/10",
    },
    {
        icon: Briefcase,
        value: 2,
        suffix: "",
        label: "Bootcamps spécialisés",
        sublabel: "Power BI · SQL & Python",
        color: "text-accent",
        bg: "bg-accent/10",
    },
    {
        icon: Building,
        value: 20,
        suffix: "+",
        label: "Entreprises partenaires",
        sublabel: "recrutent nos alumni",
        color: "text-primary",
        bg: "bg-primary/10",
    },
];

function useCountUp(target: number, duration: number = 1800, start: boolean = false) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!start) return;
        let startTime: number;
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, duration, start]);

    return count;
}

function StatCard({ stat, index, visible }: { stat: typeof stats[0]; index: number; visible: boolean }) {
    const count = useCountUp(stat.value, 1600, visible);

    return (
        <div
            className="relative flex flex-col items-center text-center p-8 group opacity-0 animate-fade-in"
            style={{ animationDelay: `${0.1 + index * 0.1}s` }}
        >
            {/* Separator except last */}
            {index < stats.length - 1 && (
                <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-16 bg-border" />
            )}

            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>

            <div className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-1">
                <span className={stat.color}>{visible ? count : 0}</span>
                <span className={`${stat.color} text-3xl`}>{stat.suffix}</span>
            </div>

            <div className="font-semibold text-foreground text-base mb-1">{stat.label}</div>
            <div className="text-muted-foreground text-sm">{stat.sublabel}</div>
        </div>
    );
}

export function StatsSection() {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section ref={ref} className="py-16 bg-background border-b border-border">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0 divide-y-2 lg:divide-y-0 divide-border">
                    {stats.map((stat, i) => (
                        <StatCard key={stat.label} stat={stat} index={i} visible={visible} />
                    ))}
                </div>
            </div>
        </section>
    );
}
