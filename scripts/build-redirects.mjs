#!/usr/bin/env node
/**
 * Emite stubs HTML em public/<old-slug>/index.html que redirecionam para
 * a URL canônica nova. Gerados em build time (pre-astro-build) para
 * preservar URLs do WordPress antigo.
 *
 * Fonte de verdade: o array REDIRECTS abaixo (espelha docs/url-mapping.md).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');

// Base é injetado pela config do Astro. Em prod usamos o mesmo valor
// declarado em astro.config.mjs (base: '/site-redalint').
const BASE = process.env.PUBLIC_BASE_URL ?? '/site-redalint';

/** [oldPath, newPathInBase] */
const REDIRECTS = [
  ['institucional', 'pt/institucional'],
  ['pesquisas', 'pt/pesquisas'],
  ['publicacoes', 'pt/publicacoes'],
  ['equipe', 'pt/equipe'],
  ['equipe-acervo', 'pt/equipe-acervo'],
  ['noticias', 'pt/noticias'],
  ['como-pesquisar', 'pt/como-pesquisar'],
  ['como-colaborar', 'pt/como-colaborar'],
  ['como-colaborar-espanol', 'es/como-colaborar'],
  ['sobre-o-acervo', 'pt/sobre-o-acervo'],
  ['julieta-abba', 'pt/equipe/julieta-abba'],
  ['lancamento-da-revista-redalint', 'pt/noticias/lancamento-da-revista-redalint'],
  [
    'texto-001-desafios-da-internacionalizacao-da-educacao',
    'pt/noticias/texto-001-desafios-da-internacionalizacao-da-educacao',
  ],
];

function stubHtml(targetUrl) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Redirecionando…</title>
<link rel="canonical" href="${targetUrl}">
<meta name="robots" content="noindex,follow">
<meta http-equiv="refresh" content="0;url=${targetUrl}">
<script>window.location.replace(${JSON.stringify(targetUrl)});</script>
</head>
<body>
<p>Esta página foi movida. Se você não for redirecionado automaticamente,
<a href="${targetUrl}">clique aqui</a>.</p>
</body>
</html>
`;
}

async function main() {
  let written = 0;
  for (const [oldPath, newPathInBase] of REDIRECTS) {
    const targetUrl = `${BASE.replace(/\/+$/, '')}/${newPathInBase}/`.replace(/\/+/g, '/');
    const dir = path.join(PUBLIC, oldPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, 'index.html'), stubHtml(targetUrl));
    written++;
  }
  console.log(`> build-redirects: emitiu ${written} stubs em public/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
