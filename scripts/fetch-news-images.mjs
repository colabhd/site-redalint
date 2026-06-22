#!/usr/bin/env node
/**
 * Baixa as imagens das notícias (de fontes externas) e gera as versões
 * usadas no site em `public/imagens/noticias/`:
 *
 *  - prosul-pepe-mujica.jpg : imagem do MCTI, otimizada (crédito: Divulgação/MCTI)
 *  - revista-n7.jpg         : adaptação da capa do nº 7 da Revista REDALINT,
 *                             centralizada sobre o gradiente roxo da marca (16:9)
 *
 * Roda no CI (rede aberta). Uso: node scripts/fetch-news-images.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'imagens', 'noticias');

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  Accept: 'image/avif,image/webp,image/png,image/jpeg,*/*',
};

async function download(url) {
  const res = await fetch(url, { headers: HEADERS, redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

const PROSUL_URL =
  'https://www.gov.br/mcti/pt-br/acompanhe-o-mcti/noticias/2026/01/prosul-pepe-mujica-vai-financiar-projetos-para-fortalecer-a-infraestrutura-cientifica-da-america-latina/copy6_of_WhatsAppImage20260130at15.22.48.jpeg/@@images/c19a5245-25e1-4833-acc1-0b8adc4fc8a1.jpeg';
const COVER_URL = 'https://revele.uncoma.edu.ar/public/journals/30/cover_issue_570_es.png';

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  let fail = 0;

  // 1) PROSUL — otimiza para largura máxima de 1200px
  try {
    const buf = await download(PROSUL_URL);
    await sharp(buf)
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toFile(path.join(OUT, 'prosul-pepe-mujica.jpg'));
    console.log('✓ prosul-pepe-mujica.jpg');
  } catch (err) {
    fail++;
    console.warn(`! PROSUL: ${err.message}`);
  }

  // 2) Capa do nº — salva o original no repositório (fonte para a arte do banner)
  try {
    const buf = await download(COVER_URL);
    const srcDir = path.join(ROOT, 'scripts', 'assets');
    await fs.mkdir(srcDir, { recursive: true });
    await sharp(buf).png().toFile(path.join(srcDir, 'revista-cover.png'));
    console.log('✓ scripts/assets/revista-cover.png (capa original)');
  } catch (err) {
    fail++;
    console.warn(`! Capa: ${err.message}`);
  }

  if (fail > 0) {
    // não falha o job: o que foi gerado deve ser commitado mesmo assim
    console.warn(`\n! ${fail} imagem(ns) não baixada(s) — seguindo com o que foi gerado.`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
