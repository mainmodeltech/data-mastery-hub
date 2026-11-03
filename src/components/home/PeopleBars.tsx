/**
 * PeopleBars — le motif de la page : les barres montantes d'un tableau de bord. Ici, chaque barre est un diplômé réel ; la plus haute porte le chiffre
 * des alumni. Posées sur le bas de l'écran, elles montent l'une après l'autre (« Toujours plus haut »).
 * Les photos sont recadrées par scripts/make-home-photos.py à partir des photos de la promotion.
 */
import people1 from "@/assets/home/people-1.webp";
import people2 from "@/assets/home/people-2.webp";
import people3 from "@/assets/home/people-3.webp";
import people4 from "@/assets/home/people-4.webp";

const PHOTOS = [
  { src: people1, height: 52 },
  { src: people2, height: 66 },
  { src: people3, height: 80 },
  { src: people4, height: 92 },
] as const;

interface Props {
  stat: { value: string; label: string };
  alt: string;
}

/** Même rayon de sommet pour toutes les barres de la page : c'est ce qui fait le motif. */
export const BAR_TOP = "rounded-t-[72px]";

export function PeopleBars({ stat, alt }: Props) {
  return (
    <div className="flex h-[46svh] min-h-[300px] items-end gap-2 sm:gap-3 lg:h-[76svh] lg:max-h-[720px]" role="group" aria-label={alt}>
      {PHOTOS.map((p, i) => (
        <div
          key={p.src}
          className={`home-bar relative min-w-0 flex-1 overflow-hidden bg-navy-medium ${BAR_TOP}`}
          style={{ height: `${p.height}%`, ["--i" as string]: i }}
        >
          <img
            src={p.src}
            alt=""
            width={480}
            height={800}
            // le héros est la première chose vue : pas de chargement différé
            loading="eager"
            decoding="async"
            className="h-full w-full object-cover object-[50%_28%]"
          />
        </div>
      ))}
      <div
        className={`home-bar flex min-w-0 flex-1 flex-col justify-end gap-1 bg-cta p-3 pb-6 text-white sm:p-5 sm:pb-8 ${BAR_TOP}`}
        style={{ height: "100%", ["--i" as string]: PHOTOS.length }}
      >
        <span className="font-heading text-[clamp(30px,3.4vw,48px)] font-extrabold leading-none">{stat.value}</span>
        <span className="text-[13px] leading-snug sm:text-base">{stat.label}</span>
      </div>
    </div>
  );
}
