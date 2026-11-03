/**
 * make-hero-video.mjs — génère la boucle vidéo de l'accueil (fond « data ») et son image d'attente.
 *
 * Rien à installer : le script ouvre Chrome (ou Edge) en mode sans fenêtre, dessine l'animation sur un canvas, l'enregistre
 * en WebM avec MediaRecorder, puis écrit deux fichiers :
 *   public/media/hero-data.webm          boucle de 8 s, 1280×720, sans son, ~1 Mo
 *   public/media/hero-data-poster.jpg    image affichée avant la lecture (et si la vidéo ne peut pas démarrer)
 *
 * L'animation est PÉRIODIQUE (chaque mouvement revient exactement à son point de départ au bout de 8 s) : la boucle est invisible.
 * Palette = jetons de la marque (navy, navy-dark, navy-medium, cta, cta-on-navy). Formes pleines uniquement.
 *
 *   node scripts/make-hero-video.mjs
 *
 * Pour remplacer la vidéo par un autre fichier : déposez simplement un .webm/.mp4 du même nom dans public/media/.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "media");
const PORT = 9341;
const BROWSERS = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];

const browser = BROWSERS.find((p) => existsSync(p));
if (!browser) throw new Error("Chrome, Edge ou Chromium introuvable");
mkdirSync(OUT, { recursive: true });

/** Exécuté DANS la page : dessine, enregistre, renvoie la vidéo et le poster en base64. */
const IN_PAGE = `(async () => {
  const W = 1280, H = 720, T = 8, FPS = 30;
  const c = document.createElement('canvas'); c.width = W; c.height = H; document.body.appendChild(c);
  const g = c.getContext('2d');
  const C = { ground: '#10263C', bar: '#1A3A5B', barHi: '#234A70', barTop: '#2F5E8C', cta: '#C73A08', ctaSoft: '#FFB08A' };
  const TAU = Math.PI * 2;
  const N = 56;                                   // colonnes de l'histogramme
  const bw = W / N;
  const seed = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  // chaque colonne : une hauteur de base (qui monte vers la droite : « toujours plus haut »), un nombre entier de cycles, une phase
  const smooth = (a, b, x) => { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
  const cols = Array.from({ length: N }, (_, i) => {
    const x = i / (N - 1);
    return { base: 0.05 + 0.66 * smooth(0.28, 1, x), swing: 0.025 + 0.09 * smooth(0.2, 1, x) * seed(i), cycles: 1 + Math.floor(seed(i + 9) * 2), phase: seed(i + 31) * TAU };
  });
  const heightAt = (i, t) => { const k = cols[i]; return (k.base + k.swing * Math.sin(TAU * k.cycles * t / T + k.phase)) * H; };

  function draw(t) {
    g.fillStyle = C.ground; g.fillRect(0, 0, W, H);
    const sweep = N * 0.42 + (t / T) * (N * 0.62);   // la colonne mise en avant traverse la moitié droite une fois par boucle
    for (let i = 0; i < N; i++) {
      const h = heightAt(i, t), x = i * bw, y = H - h;
      const d = Math.abs(i - sweep);
      g.fillStyle = (d < 0.6 && i > N * 0.4) ? C.cta : (d < 2.2 && i > N * 0.4) ? C.barTop : (i % 7 === 3 ? C.barHi : C.bar);
      g.beginPath(); g.roundRect(x + 3, y, bw - 6, h + 20, [bw / 2 - 3, bw / 2 - 3, 0, 0]); g.fill();
    }
    // courbe de tendance : une vague douce qui avance, épaisse, bouts ronds
    g.lineWidth = 5; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = C.ctaSoft; g.beginPath();
    const yLine = (x) => { const u = x / W; return H * (0.93 - 0.66 * smooth(0.3, 1, u)) - 14 * smooth(0.2, 1, u) * Math.sin(TAU * (u * 1.5 - t / T)) - 6 * Math.sin(TAU * (u * 3 + t / T)); };
    for (let x = 0; x <= W; x += 8) { const y = yLine(x); x === 0 ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.stroke();
    const mx = ((t / T) * 1.0 % 1) * W, my = yLine(mx);
    g.fillStyle = C.ctaSoft; g.beginPath(); g.arc(mx, my, 11, 0, TAU); g.fill();
    g.fillStyle = C.cta; g.beginPath(); g.arc(mx, my, 5, 0, TAU); g.fill();
  }

  // image d'attente : un instant où la courbe et la colonne orange sont lisibles
  draw(3.4);
  const poster = c.toDataURL('image/jpeg', 0.82).split(',')[1];

  const stream = c.captureStream(FPS);
  const mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((m) => MediaRecorder.isTypeSupported(m));
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 1000000 });
  const chunks = [];
  rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
  const done = new Promise((r) => { rec.onstop = r; });
  const t0 = performance.now();
  const timer = setInterval(() => draw(((performance.now() - t0) / 1000) % T), 1000 / 60);
  rec.start(250);
  await new Promise((r) => setTimeout(r, T * 1000));
  rec.stop(); await done; clearInterval(timer);
  const blob = new Blob(chunks, { type: mime });
  const b64 = await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(',')[1]); fr.readAsDataURL(blob); });
  return { video: b64, poster, mime, bytes: blob.size };
})()`;

const profile = mkdtempSync(join(tmpdir(), "mt-hero-"));
const proc = spawn(browser, [
  "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--hide-scrollbars",
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
try {
  let targets = null;
  for (let i = 0; i < 50 && !targets; i++) {
    try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); } catch { await sleep(200); }
  }
  const page = targets?.find((t) => t.type === "page");
  if (!page) throw new Error("Aucun onglet Chrome disponible");

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  const result = await new Promise((resolve, reject) => {
    ws.onmessage = (m) => {
      const msg = JSON.parse(m.data);
      if (msg.id !== 1) return;
      if (msg.error || msg.result?.exceptionDetails) reject(new Error(JSON.stringify(msg.error ?? msg.result.exceptionDetails)));
      else resolve(msg.result.result.value);
    };
    ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: IN_PAGE, awaitPromise: true, returnByValue: true, timeout: 60000 } }));
  });
  ws.close();

  const ext = result.mime.includes("webm") ? "webm" : "mp4";
  writeFileSync(join(OUT, `hero-data.${ext}`), Buffer.from(result.video, "base64"));
  writeFileSync(join(OUT, "hero-data-poster.jpg"), Buffer.from(result.poster, "base64"));
  console.log(`OK : hero-data.${ext} (${(result.bytes / 1024).toFixed(0)} Ko, ${result.mime}) et hero-data-poster.jpg dans public/media/`);
} finally {
  proc.kill();
}
