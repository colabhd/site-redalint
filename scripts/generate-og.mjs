#!/usr/bin/env node
/**
 * Gera `public/og-default.png` (1200×630), a imagem Open Graph padrão
 * usada pelo BaseLayout quando a página não define imagem própria.
 *
 * Uso: node scripts/generate-og.mjs
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#4b0082"/>
  <rect x="0" y="582" width="1200" height="48" fill="#61ce70"/>
  <text x="90" y="300" font-family="Georgia, 'DejaVu Serif', serif" font-size="120" font-weight="bold" fill="#ffffff" letter-spacing="4">REDALINT</text>
  <circle cx="852" cy="262" r="18" fill="#61ce70"/>
  <text x="92" y="380" font-family="'DejaVu Sans', Helvetica, sans-serif" font-size="30" fill="#e8e2f2">Rede de Pesquisadores e Gestores em Internacionalização</text>
  <text x="92" y="424" font-family="'DejaVu Sans', Helvetica, sans-serif" font-size="30" fill="#e8e2f2">da Educação Superior da América Latina</text>
  <text x="92" y="520" font-family="'DejaVu Sans', Helvetica, sans-serif" font-size="24" fill="#b9a6d6">redalint.org</text>
</svg>`;

const out = path.join(ROOT, 'public', 'og-default.png');
await sharp(Buffer.from(svg)).png().toFile(out);
console.log(`✓ ${path.relative(ROOT, out)}`);
