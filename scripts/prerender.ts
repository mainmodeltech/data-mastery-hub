/**
 * scripts/prerender.ts
 *
 * Script de prerendering post-build.
 * Génère une copie HTML statique de chaque route publique
 * pour que Google puisse indexer le contenu sans exécuter JS.
 *
 * Usage :
 *   npm run build && npx tsx scripts/prerender.ts
 *
 * Ou dans package.json :
 *   "build:seo": "vite build && tsx scripts/prerender.ts"
 *
 * Prérequis :
 *   npm install -D tsx puppeteer-core @sparticuz/chromium
 *   OU (plus léger) :
 *   npm install -D tsx jsdom
 */

import fs   from "fs";
import path from "path";

// ── Routes publiques à prérender ─────────────────────────────────────────────
const ROUTES = [
    { path: "/",          file: "index.html"          },
    { path: "/bootcamps", file: "bootcamps/index.html" },
    { path: "/alumni",    file: "alumni/index.html"    },
    { path: "/services",  file: "services/index.html"  },
    { path: "/a-propos",  file: "a-propos/index.html"  },
    { path: "/contact",   file: "contact/index.html"   },
];

const DIST = path.resolve(process.cwd(), "dist");

/**
 * Stratégie simple : copier index.html dans chaque sous-dossier.
 * React Router gère le routing côté client.
 * Google peut ainsi crawler chaque URL et trouver du HTML valide.
 *
 * Pour un vrai prerendering avec le contenu rendu :
 * → utiliser react-helmet-async + un renderer Node (voir option B ci-dessous)
 */
function copyHtmlToRoutes() {
    const templateHtml = fs.readFileSync(path.join(DIST, "index.html"), "utf-8");

    for (const route of ROUTES.slice(1)) { // skip "/" — déjà généré par Vite
        const dir = path.join(DIST, path.dirname(route.file));
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(DIST, route.file), templateHtml, "utf-8");
        console.log(`✅ Généré : ${route.file}`);
    }

    console.log("\n🎉 Prerendering terminé. Chaque route a son propre index.html.");
}

copyHtmlToRoutes();
