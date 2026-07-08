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
        title:       "Formations Data, Power BI & Excel à Dakar — Entreprises & Particuliers",
        description: "Model Technologie forme vos équipes (Data, Power BI, Excel) et les particuliers via DataMasteryHub (bootcamps Power BI, Python, SQL, Excel Finance) à Dakar.",
        path:        "/",
    },
    bootcamps: {
        title:       "Bootcamps DataMasteryHub — Power BI, Python, SQL, Excel Finance",
        description: "4 bootcamps pour particuliers à Dakar : Power BI (PL-300), Python pour la data, SQL pour la data, Excel pour Financiers & Contrôleurs de gestion.",
        path:        "/bootcamps",
    },
    alumni: {
        title:       "Alumni & Projets — Résultats concrets de nos apprenants",
        description: "Découvrez les alumni de Model Technologie : leurs projets data, leurs entreprises et leur parcours depuis le bootcamp. 90% en poste en 3 mois.",
        path:        "/alumni",
    },
    entreprises: {
        title:       "Formations Data, Power BI & Excel pour Entreprises à Dakar",
        description: "Formation sur mesure en Data, formation sur mesure Power BI et mise à niveau Excel pour vos équipes. Diagnostic gratuit, contenu sur vos données réelles.",
        path:        "/entreprises",
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
    orientation: {
        title:       "Quiz d'orientation — Quel bootcamp data choisir ?",
        description: "Répondez à 5 questions pour découvrir le bootcamp DataMasteryHub le plus adapté à votre profil : Power BI, Python, SQL ou Excel Finance.",
        path:        "/orientation",
    },
} as const;
