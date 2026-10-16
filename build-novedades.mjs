// Genera novedades.html a partir de CHANGELOG.md (fuente única). Uso: node build-novedades.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const BASE = 'https://alejodm.github.io/lepusmint-gestionfinanzas/';
const md = readFileSync(new URL('./CHANGELOG.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

let html = '';
let inList = false;
let paragraph = [];
const flushParagraph = () => { if (paragraph.length) { html += `<p>${inline(paragraph.join(' '))}</p>\n`; paragraph = []; } };
const closeList = () => { if (inList) { html += '</ul>\n'; inList = false; } };

for (const line of md.split('\n')) {
  if (line.startsWith('# ')) continue; // el título va en el encabezado de la página
  const h2 = line.match(/^## (.+)/);
  const h3 = line.match(/^### (.+)/);
  const li = line.match(/^- (.+)/);
  if (h2) { flushParagraph(); closeList(); html += `<h2 id="${slug(h2[1])}">${inline(h2[1])}</h2>\n`; }
  else if (h3) { flushParagraph(); closeList(); html += `<h3 id="${slug(h3[1])}">${inline(h3[1])}</h3>\n`; }
  else if (li) { flushParagraph(); if (!inList) { html += '<ul>\n'; inList = true; } html += `  <li>${inline(li[1])}</li>\n`; }
  else if (line.trim() === '') { flushParagraph(); closeList(); }
  else paragraph.push(line.trim());
}
flushParagraph(); closeList();

const title = 'Novedades de LepusMint: qué cambió en cada versión';
const desc = 'Historial de novedades de LepusMint, la app gratuita de finanzas personales para Android: qué se agregó y qué se arregló en cada versión, con su fecha.';
const page = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <meta name="author" content="Alejo José De Miguel">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#6366f1">
  <link rel="canonical" href="${BASE}novedades.html">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="LepusMint">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:url" content="${BASE}novedades.html">
  <meta property="og:image" content="${BASE}og-image.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="lepusmint-logo.png">
  <link rel="stylesheet" href="style.css">
  <style>
    main h2 { margin-top: 32px; padding-bottom: 6px; border-bottom: 2px solid var(--border); }
    main h3 { margin-top: 24px; color: var(--primary); }
    main ul { margin-top: 8px; }
  </style>
</head>
<body>
  <header>
    <div class="wrap">
      <a class="brand" href="./"><img src="lepusmint-logo.png" alt="LepusMint"><span>LepusMint</span></a>
      <h1>Novedades</h1>
      <p>Qué se agregó y qué se arregló en cada versión.</p>
    </div>
  </header>

  <main class="wrap">
    <section class="card">
${html}    </section>
  </main>

  <footer>
    <div class="wrap">
      <a href="./">Inicio</a>
      <a href="manual.html">Manual</a>
      <a href="privacy.html">Política de privacidad</a>
      <a href="terms.html">Condiciones</a>
      <div style="margin-top:8px;">© 2026 Alejo José De Miguel · LepusMint</div>
    </div>
  </footer>
</body>
</html>
`;
writeFileSync(new URL('./novedades.html', import.meta.url), page);
console.log('novedades.html generado');
