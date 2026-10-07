/**
 * SeoHead.tsx
 * Composant de méta-tags SEO dynamiques via react-helmet-async.
 *
 * Installation :
 *   npm install react-helmet-async
 *
 * Setup dans main.tsx :
 *   import { HelmetProvider } from "react-helmet-async";
 *   createRoot(document.getElementById("root")!).render(
 *     <HelmetProvider>
 *       <App />
 *     </HelmetProvider>
 *   );
 *
 * Usage sur chaque page :
 *   <SeoHead
 *     title="Formation Power BI Dakar"
 *     description="Apprenez Power BI à Dakar en 8 semaines..."
 *     path="/bootcamps"
 *   />
 */

import { Helmet } from "react-helmet-async";

const SITE_NAME    = "Model Technologie";
const SITE_URL     = "https://model-technologie.com";
const DEFAULT_IMG  = `${SITE_URL}/og-image.png`;

interface SeoHeadProps {
    /** Affiché dans l'onglet et les résultats Google (max 60 caractères) */
    title: string;
    /** Affiché sous le titre dans Google (max 155 caractères) */
    description: string;
    /** Chemin de la page ex: "/bootcamps" */
    path: string;
    /** Image Open Graph (Facebook, LinkedIn, WhatsApp) */
    ogImage?: string;
    /** Type de contenu Schema.org */
    type?: "website" | "article";
}

export function SeoHead({
                            title,
                            description,
                            path,
                            ogImage = DEFAULT_IMG,
                            type    = "website",
                        }: SeoHeadProps) {
    const fullTitle   = `${title} | ${SITE_NAME}`;
    const canonicalUrl = `${SITE_URL}${path}`;

    return (
        <Helmet>
            {/* ── Basiques ─────────────────────────────────────────────────────── */}
            <title>{fullTitle}</title>
            <meta name="description"    content={description} />
            <meta name="robots"         content="index, follow" />
            <link rel="canonical"       href={canonicalUrl} />

            {/* ── Open Graph (LinkedIn, Facebook, WhatsApp) ────────────────────── */}
            <meta property="og:title"       content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url"         content={canonicalUrl} />
            <meta property="og:image"       content={ogImage} />
            <meta property="og:type"        content={type} />
            <meta property="og:locale"      content="fr_SN" />
            <meta property="og:site_name"   content={SITE_NAME} />

            {/* ── Twitter Card ─────────────────────────────────────────────────── */}
            <meta name="twitter:card"        content="summary_large_image" />
            <meta name="twitter:title"       content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image"       content={ogImage} />
        </Helmet>
    );
}

// ── Config SEO par page ───────────────────────────────────────────────────────
// Copier-coller ces blocs dans chaque fichier de page :

export const PAGE_SEO = {
    home: {
        title:       "Bootcamp Data Analyst & Power BI à Dakar",
        description: "Formation intensive Data Analyst et Power BI à Dakar. Sessions soir & week-end. Python, SQL, Power BI. 90% d'alumni en poste en 3 mois.",
        path:        "/",
    },
    bootcamps: {
        title:       "Nos Bootcamps Data — Python, SQL, Power BI à Dakar",
        description: "Bootcamp Data Analyst (Python, SQL) et Power BI à Dakar. Formation pratique le soir et week-end. Places limitées — prochaine session bientôt.",
        path:        "/bootcamps",
    },
    masterclass: {
        title:       "Masterclass gratuite Power BI — Construire son premier tableau de bord",
        description: "Masterclass live et gratuite : construisez votre premier dashboard Power BI en 2 heures avec un expert de la data bancaire.",
        path:        "/masterclass/power-bi-dashboard",
    },
    orientation: {
        title:       "Quiz d'orientation — Trouvez la formation data faite pour vous",
        description: "5 questions pour trouver la formation Model Technologie qui correspond à votre profil : Power BI, Data Analyst, parcours complet ou formation entreprise.",
        path:        "/orientation",
    },
    alumni: {
        title:       "Alumni & Projets — Résultats concrets de nos apprenants",
        description: "Découvrez les alumni de Model Technologie : leurs projets data, leurs entreprises et leur parcours depuis le bootcamp. 90% en poste en 3 mois.",
        path:        "/alumni",
    },
    services: {
        title:       "Services Data pour Entreprises à Dakar",
        description: "Formations data sur-mesure, consulting BI et mise à disposition de talents data pour les entreprises à Dakar. Power BI, SQL, Python.",
        path:        "/services",
    },
    about: {
        title:       "À Propos — Model Technologie, École Data à Dakar",
        description: "Model Technologie forme les data analysts de demain à Dakar depuis 2023. Notre pédagogie : 100% pratique, projets réels, réseau alumni actif.",
        path:        "/a-propos",
    },
    contact: {
        title:       "Contact — Rejoindre Model Technologie",
        description: "Contactez Model Technologie pour rejoindre un bootcamp, former vos équipes ou en savoir plus sur nos formations data à Dakar.",
        path:        "/contact",
    },
    coaching: {
        title:       "Coaching individuel Excel & Power BI à Dakar",
        description: "Coaching 1:1 sur vos propres fichiers Excel et Power BI. Appel diagnostic offert, séances en visio ou à Dakar.",
        path:        "/coaching",
    },
    entreprises: {
        title:       "Formations Data pour Entreprises à Dakar",
        description: "Formations Excel, Power BI et data sur-mesure pour vos équipes. Diagnostic gratuit, facturation entreprise.",
        path:        "/entreprises",
    },
    ressources: {
        title:       "Ressources Data — Blog, modèles et quiz d'orientation",
        description: "Articles, modèles téléchargeables et quiz d'orientation pour progresser en Excel, Power BI, Python et SQL.",
        path:        "/ressources",
    },
    partenaires: {
        title:       "Devenir partenaire formateur — Model Technologie",
        description: "Proposez vos formations sur la plateforme Model Technologie : nous gérons la plateforme, le paiement et l'audience.",
        path:        "/partenaires",
    },
} as const;
