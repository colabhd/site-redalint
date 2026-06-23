#!/usr/bin/env node
/**
 * Baixa os logos das universidades da rede (fontes livres: Wikimedia
 * Commons / Wikipédia) e os normaliza para public/imagens/parceiros/.
 * Roda no CI (rede aberta). Cada item falha de forma isolada.
 *
 * Uso: node scripts/fetch-uni-logos.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'imagens', 'parceiros');
const HEADERS = { 'User-Agent': 'REDALINT-site/1.0 (logos da rede; contato: revista.redalint@gmail.com)' };

async function buf(url) {
  const r = await fetch(url, { headers: HEADERS, redirect: 'follow' });
  if (!r.ok) throw new Error(`HTTP ${r.status} — ${url}`);
  return Buffer.from(await r.arrayBuffer());
}

// descobre a imagem principal (logo/brasão) de um artigo da Wikipédia
async function wikiPageImage(wiki, title) {
  const api = `https://${wiki}/w/api.php?action=query&format=json&prop=pageimages&piprop=original&titles=${encodeURIComponent(title)}`;
  const j = JSON.parse((await buf(api)).toString());
  const page = Object.values(j.query.pages)[0];
  if (!page?.original?.source) throw new Error('sem imagem principal');
  return page.original.source;
}

const fp = (wiki, file) => `https://${wiki}/wiki/Special:FilePath/${encodeURIComponent(file)}`;

const ITEMS = [
  { out: 'ufsc.png', svg: true, url: fp('commons.wikimedia.org', 'Brasao UFSC vertical extenso.svg') },
  { out: 'udp.png', url: fp('es.wikipedia.org', 'Logo Universidad Diego Portales.png') },
  { out: 'unsam.png', url: fp('commons.wikimedia.org', 'Logo UNSAM.png') },
  { out: 'uepa.png', resolve: () => wikiPageImage('pt.wikipedia.org', 'Universidade do Estado do Pará') },
];

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  let fail = 0;
  for (const it of ITEMS) {
    try {
      const url = it.resolve ? await it.resolve() : it.url;
      const data = await buf(url);
      const src = it.svg || /\.svg(\?|$)/i.test(url) ? sharp(data, { density: 300 }) : sharp(data);
      await src
        .trim()
        .resize({ height: 220, fit: 'inside', withoutEnlargement: false })
        .png()
        .toFile(path.join(OUT, it.out));
      console.log(`✓ ${it.out}  ←  ${url}`);
    } catch (e) {
      fail++;
      console.warn(`! ${it.out}: ${e.message}`);
    }
  }
  if (fail) console.warn(`\n! ${fail} logo(s) não obtido(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
