# site-redalint

Site da **REDALINT** — Rede de Pesquisadores e Gestores em Internacionalização da Educação Superior da América Latina.

Migração do site WordPress (https://redalint.org/) para uma stack estática moderna baseada em **Astro**, hospedada no **GitHub Pages**.

> Inspirado em [cpps-unesp/site-cpps](https://github.com/cpps-unesp/site-cpps).

## Stack

- [Astro](https://astro.build) (`output: 'static'`) + MDX
- TypeScript em modo `strict`
- [Tailwind CSS 4](https://tailwindcss.com) via `@tailwindcss/vite` + [DaisyUI](https://daisyui.com)
- [Pagefind](https://pagefind.app) (busca estática no cliente)
- `theme-change` + `data-theme` para dark/light sem FOUC
- RSS via `@astrojs/rss`

## Estrutura

```
src/
  content/
    paginas/{pt,es}/<slug>.mdx     # páginas institucionais
    noticias/{pt,es}/<slug>.mdx    # posts/notícias
    equipe/<membro>.mdx            # perfis da equipe (cards em /[lang]/equipe/)
  layouts/BaseLayout.astro          # SEO, hreflang (só de traduções existentes), theme
  components/                       # Header, Footer, Hero, NoticiaCard, ThemeToggle…
  pages/
    index.astro                    # redirect → /pt/
    [wpSlug].astro                 # stubs de redirect das URLs antigas do WP
    [lang]/
      index.astro                  # home por idioma
      [...slug].astro              # páginas
      equipe.astro                 # cards da equipe (collection equipe)
      noticias/{index,[slug]}.astro
      busca.astro                  # Pagefind UI
    sitemap.xml.ts
    rss.xml.ts
    404.astro
  i18n/translations.ts             # textos de UI (pt/es)
  plugins/rehype-base-url.mjs      # prefixa a base nos links/imagens do markdown
  styles/global.css                # temas DaisyUI + fontes self-hosted (Fontsource)
  utils/paths.ts                   # withBase, localizedPath, assetPath
scripts/
  wp-to-mdx.mjs                    # conversor WXR → MDX
  download-wp-images.mjs           # baixa imagens do manifest wp-images.json
  generate-og.mjs                  # gera public/og-default.png
public/
  favicon.svg, robots.txt, og-default.png
  imagens/redalint-wordmark.png    # logo oficial (wordmark colorido, header)
  imagens/redalint-logo-completo.svg # logo oficial completo com mapa (footer/JSON-LD/favicon)
  imagens/wp/                      # imagens baixadas do WP (gerado)
```

Conteúdo sem tradução: o seletor de idiomas leva à home do outro idioma, o
`hreflang` só é emitido para as traduções que existem, e `/es/noticias/`
mostra as notícias em português com um aviso, até que sejam traduzidas.

## Comandos

```bash
npm install
npm run dev          # http://localhost:4321/site-redalint/pt/
npm run build        # gera ./dist com Pagefind
npm run preview
npm run typecheck
npm run convert-wp        # roda scripts/wp-to-mdx.mjs (gera src/content/* + baixa imagens)
npm run download-images   # baixa as imagens do manifest scripts/wp-images.json
```

## Migração de conteúdo

O export do WordPress está em `redalint.WordPress.2026-05-14.xml`. **Todo o conteúdo
publicado (10 páginas + 2 notícias, pt/es) já está convertido em `src/content/`.**

```bash
npm run convert-wp                     # reconverte tudo + baixa imagens
node scripts/wp-to-mdx.mjs --no-images # pula download (offline / dev)
npm run download-images                # baixa só as imagens (scripts/wp-images.json)
```

O conversor (`scripts/wp-to-mdx.mjs`):

1. Lê o WXR (`fast-xml-parser`) e filtra `wp:post_type` ∈ {`page`, `post`} com `status=publish`.
2. Pula `home` e `noticias` (geradas dinamicamente por `[lang]/index.astro` e `[lang]/noticias/`).
3. Limpa comentários/cabeçalho vazado do Elementor, shortcodes do WP e aspas corrompidas do export (`?...?` → `“...”`).
4. Converte HTML → Markdown via Turndown (preserva `<figure>` com legenda e link envolvente, ex.: badges Lattes/ORCID).
5. Reescreve links internos `https://redalint.org/<slug>` para as rotas novas `/<lang>/<slug>/` (o subdomínio `acervo.redalint.org` permanece externo).
6. Reescreve URLs `https://redalint.org/wp-content/...` para `/imagens/wp/<arquivo>`, gera o manifest `scripts/wp-images.json` e baixa os originais em `public/imagens/wp/`.
7. Detecta idioma por slug (`*-espanol`/`*-es` → `es`, default `pt`) e remapa slugs (`como-colaborar-espanol` → `como-colaborar` lang=es).
8. Escreve MDX com front-matter validado pelos schemas Zod em `src/content.config.ts` (inclui `wpSlug` com o slug original, usado nos redirects).

As imagens do WordPress **estão commitadas** em `public/imagens/wp/` — o site não
depende mais do WP antigo estar no ar. Se novas imagens entrarem no manifest
(`scripts/wp-images.json`), o workflow **Actions → "Fixar imagens do WordPress"**
baixa e commita as faltantes (roda manualmente ou em push de branches `claude/**`
que alterem o manifest); localmente, `npm run download-images`.

> Nota: `npm run convert-wp` regenera os MDX a partir do XML e **sobrescreve a
> curadoria manual** feita em `src/content/` (headings, traduções, correções).
> O conteúdo versionado no repositório é a fonte de verdade; só reconverta se
> souber o que está fazendo.

## Deploy

GitHub Pages a partir de `main` via `.github/workflows/deploy.yml`. Para ativar:

1. Em **Settings → Pages**, selecionar **Source: GitHub Actions**.
2. Fazer merge para `main` — o workflow faz build (`npm run build`) e publica `./dist`.
3. URL: `https://colabhd.github.io/site-redalint/`.

Para usar `redalint.org` futuramente: criar `public/CNAME` com `redalint.org`, ajustar `site`/`base` em `astro.config.mjs`, e apontar DNS (`ALIAS`/`A` records do GitHub Pages).

## SEO e preservação de URLs

URLs do WordPress eram `/<slug>/`. A nova estrutura é `/<lang>/<slug>/`. Para preservar
links externos e resultados de busca, `src/pages/[wpSlug].astro` gera stubs em `/<slug>/`
com `<meta http-equiv="refresh">` + canonical + `noindex` apontando para a rota nova
(ex.: `/equipe/` → `/pt/equipe/`, `/como-colaborar-espanol/` → `/es/como-colaborar/`).

O `BaseLayout` já emite: canonical, `<link rel="alternate" hreflang>` para todos os idiomas, OG/Twitter, sitemap em `/sitemap.xml`, RSS em `/rss.xml`, e dark/light com script inline (sem FOUC).
