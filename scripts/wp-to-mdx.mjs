#!/usr/bin/env node
/**
 * Conversor WordPress (WXR XML) → MDX para o site REDALINT.
 *
 * Lê o export do WP em `redalint.WordPress.*.xml`, gera arquivos MDX em:
 *   - src/content/paginas/<lang>/<slug>.mdx
 *   - src/content/noticias/<lang>/<slug>.mdx
 *
 * Faz download das imagens referenciadas para `public/imagens/wp/` e
 * reescreve URLs no conteúdo. Limpa comentários do Elementor e shortcodes
 * simples antes de converter HTML→Markdown via Turndown.
 *
 * Uso:
 *   node scripts/wp-to-mdx.mjs [caminho-do-xml]
 *   node scripts/wp-to-mdx.mjs --no-images   # pula download
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';
import TurndownService from 'turndown';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const noImages = args.includes('--no-images');
const xmlPath = args.find((a) => !a.startsWith('--')) ?? findDefaultXml();

function findDefaultXml() {
  return path.join(ROOT, 'redalint.WordPress.2026-05-14.xml');
}

const SPANISH_SLUGS = new Set([
  // páginas que sabemos ser em espanhol
  'como-colaborar-espanol',
]);

// classifica como "noticia" (post) tudo que vier como wp:post_type=post;
// páginas com slug deste set viram noticia também (ex.: posts fora da árvore)
const NEWS_PAGE_SLUGS = new Set();

const slugRemap = {
  'como-colaborar-espanol': { slug: 'como-colaborar', lang: 'es' },
};

const td = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '_',
});

// Preserva figuras com legenda
td.addRule('figure', {
  filter: 'figure',
  replacement(content, node) {
    const img = node.querySelector?.('img');
    const cap = node.querySelector?.('figcaption');
    if (!img) return content;
    const src = img.getAttribute('src') ?? '';
    const alt = (img.getAttribute('alt') ?? '').replace(/[\[\]]/g, '');
    const caption = cap ? cap.textContent.trim() : '';
    return `\n\n![${alt || caption}](${src})${caption ? `\n\n*${caption}*` : ''}\n\n`;
  },
});

async function main() {
  console.log(`> Lendo ${path.relative(ROOT, xmlPath)}`);
  const xml = await fs.readFile(xmlPath, 'utf8');

  const parser = new XMLParser({
    ignoreAttributes: false,
    cdataPropName: '__cdata',
    trimValues: true,
  });
  const doc = parser.parse(xml);
  const items = toArray(doc?.rss?.channel?.item);

  const imageJobs = new Map(); // url -> localPath
  const stats = { paginas: 0, noticias: 0, skipped: 0 };

  for (const item of items) {
    const postType = cdata(item['wp:post_type']);
    const status = cdata(item['wp:status']);
    if (status !== 'publish') continue;
    if (postType !== 'page' && postType !== 'post') continue;

    const title = cdata(item.title);
    let slug = (cdata(item['wp:post_name']) || slugify(title)).toLowerCase();
    const link = item.link ?? '';
    const html = cdata(item['content:encoded']) ?? '';
    const excerpt = (cdata(item['excerpt:encoded']) ?? '').trim();
    const dateStr = cdata(item['wp:post_date_gmt']) || cdata(item['wp:post_date']);
    const date = dateStr ? new Date(dateStr.replace(' ', 'T') + 'Z') : new Date();

    if (!slug || slug === '') {
      stats.skipped++;
      continue;
    }

    // idioma + slug remap
    let lang = 'pt';
    if (SPANISH_SLUGS.has(slug) || slug.endsWith('-espanol') || slug.endsWith('-es')) {
      lang = 'es';
    }
    if (slugRemap[slug]) {
      lang = slugRemap[slug].lang;
      slug = slugRemap[slug].slug;
    }

    // resolve destino
    const isNews = postType === 'post' || NEWS_PAGE_SLUGS.has(slug);
    const folder = isNews ? 'noticias' : 'paginas';

    if (slug === 'home' && !isNews) {
      // home é gerada pelo [lang]/index.astro, não como página standalone
      stats.skipped++;
      continue;
    }

    const cleaned = preClean(html);
    const md = td.turndown(cleaned).trim();
    const { md: mdRewritten, images } = rewriteImageUrls(md);
    for (const [url, localUrl] of images) imageJobs.set(url, localUrl);

    const fm = buildFrontMatter({
      title,
      slug,
      lang,
      date,
      excerpt: excerpt || extractExcerpt(mdRewritten),
      isNews,
      originalUrl: link,
    });

    const outDir = path.join(ROOT, 'src', 'content', folder, lang);
    await fs.mkdir(outDir, { recursive: true });
    const outFile = path.join(outDir, `${slug}.mdx`);
    await fs.writeFile(outFile, fm + '\n' + mdRewritten + '\n');
    stats[isNews ? 'noticias' : 'paginas']++;
    console.log(`  ✓ ${path.relative(ROOT, outFile)}`);
  }

  if (!noImages && imageJobs.size > 0) {
    console.log(`\n> Baixando ${imageJobs.size} imagens…`);
    await downloadAll(imageJobs);
  } else if (noImages) {
    console.log(`\n> --no-images: pulando download de ${imageJobs.size} imagens`);
  }

  console.log(`\n✓ Concluído: ${stats.paginas} páginas, ${stats.noticias} notícias, ${stats.skipped} ignoradas`);
}

function toArray(v) {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function cdata(v) {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object' && '__cdata' in v) return v.__cdata ?? '';
  if (typeof v === 'object' && '#text' in v) return v['#text'];
  return String(v);
}

function preClean(html) {
  return html
    // remove comentários do Elementor / WP
    .replace(/<!--[\s\S]*?-->/g, '')
    // limpa shortcodes mais comuns
    .replace(/\[\/?(?:caption|gallery|embed|vc_[^\]]+)[^\]]*\]/g, '')
    // remove atributos data-*
    .replace(/\s+data-[a-z0-9_-]+="[^"]*"/gi, '')
    // tira <style>/<script> embutidos
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '');
}

function rewriteImageUrls(md) {
  const images = new Map();
  const re = /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;
  const out = md.replace(re, (m, alt, url) => {
    if (!/redalint\.org/i.test(url)) return m; // mantém externos
    const file = path.basename(new URL(url).pathname);
    const localUrl = `/imagens/wp/${file}`;
    images.set(url, localUrl);
    return `![${alt}](${localUrl})`;
  });
  return { md: out, images };
}

async function downloadAll(jobs) {
  const dest = path.join(ROOT, 'public', 'imagens', 'wp');
  await fs.mkdir(dest, { recursive: true });
  let ok = 0;
  let fail = 0;
  await Promise.all(
    [...jobs].map(async ([url, localUrl]) => {
      const out = path.join(ROOT, 'public', localUrl);
      try {
        await fs.access(out);
        ok++;
        return; // já existe
      } catch {}
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());
        await fs.writeFile(out, buf);
        ok++;
      } catch (err) {
        fail++;
        console.warn(`  ! falhou ${url}: ${err.message}`);
      }
    }),
  );
  console.log(`  ${ok} baixadas, ${fail} falhas`);
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractExcerpt(md, max = 200) {
  const plain = md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= max) return plain;
  return plain.slice(0, max).replace(/\s\S*$/, '') + '…';
}

function buildFrontMatter({ title, slug, lang, date, excerpt, isNews, originalUrl }) {
  const lines = [
    '---',
    `title: ${yamlString(title)}`,
    `slug: ${slug}`,
    `lang: ${lang}`,
  ];
  if (isNews) {
    lines.push(`date: ${date.toISOString()}`);
    if (excerpt) lines.push(`excerpt: ${yamlString(excerpt)}`);
    lines.push('tags: []');
  } else {
    if (excerpt) lines.push(`description: ${yamlString(excerpt)}`);
    lines.push(`updated: ${date.toISOString()}`);
  }
  if (originalUrl) lines.push(`# original: ${originalUrl}`);
  lines.push('---');
  return lines.join('\n');
}

function yamlString(s) {
  const safe = String(s).replace(/"/g, '\\"');
  return `"${safe}"`;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
