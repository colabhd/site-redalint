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
    equipe/<membro>.mdx            # perfis (futuro)
  layouts/BaseLayout.astro          # SEO, hreflang, theme, header/footer
  components/                       # Header, Footer, Hero, NoticiaCard, ThemeToggle…
  pages/
    index.astro                    # redirect → /pt/
    [lang]/
      index.astro                  # home por idioma
      [...slug].astro              # páginas
      noticias/{index,[slug]}.astro
      busca.astro                  # Pagefind UI
    sitemap.xml.ts
    rss.xml.ts
    404.astro
  i18n/translations.ts             # textos de UI (pt/es)
  styles/global.css
  utils/paths.ts                   # withBase, localizedPath
scripts/
  wp-to-mdx.mjs                    # conversor WXR → MDX
public/
  favicon.svg, robots.txt
  imagens/wp/                      # imagens baixadas do WP (gerado)
```

## Comandos

```bash
npm install
npm run dev          # http://localhost:4321/site-redalint/pt/
npm run build        # gera ./dist com Pagefind
npm run preview
npm run typecheck
npm run convert-wp   # roda scripts/wp-to-mdx.mjs (gera src/content/* + baixa imagens)
```

## Migração de conteúdo

O export do WordPress está em `redalint.WordPress.2026-05-14.xml`.

```bash
npm run convert-wp                     # converte tudo + baixa imagens
node scripts/wp-to-mdx.mjs --no-images # pula download (offline / dev)
```

O script:

1. Lê o WXR (`fast-xml-parser`).
2. Filtra `wp:post_type` ∈ {`page`, `post`} com `status=publish`.
3. Limpa comentários do Elementor/shortcodes do WP.
4. Converte HTML → Markdown via Turndown (preserva `<figure>` com legenda).
5. Reescreve URLs `https://redalint.org/wp-content/...` para `/imagens/wp/<arquivo>` e baixa o original em `public/imagens/wp/`.
6. Detecta idioma por slug (`*-espanol`/`*-es` → `es`, default `pt`) e remapa slugs (`como-colaborar-espanol` → `como-colaborar` lang=es).
7. Escreve MDX com front-matter validado pelos schemas Zod em `src/content.config.ts`.

Conteúdo de exemplo já convertido (manualmente, para validar o pipeline):

- `src/content/paginas/pt/institucional.mdx`
- `src/content/paginas/es/como-colaborar.mdx`
- `src/content/noticias/pt/lancamento-da-revista-redalint.mdx`

## Deploy

GitHub Pages a partir de `main` via `.github/workflows/deploy.yml`. Para ativar:

1. Em **Settings → Pages**, selecionar **Source: GitHub Actions**.
2. Fazer merge para `main` — o workflow faz build (`npm run build`) e publica `./dist`.
3. URL: `https://colabhd.github.io/site-redalint/`.

Para usar `redalint.org` futuramente: criar `public/CNAME` com `redalint.org`, ajustar `site`/`base` em `astro.config.mjs`, e apontar DNS (`ALIAS`/`A` records do GitHub Pages).

## SEO e preservação de URLs

URLs do WordPress eram `/<slug>/`. A nova estrutura é `/<lang>/<slug>/`, então URLs antigas mudam. Para preservar links externos, podemos adicionar páginas-stub em `/<slug>/` com `<meta http-equiv="refresh">` + canonical para a rota nova (não criadas neste commit).

O `BaseLayout` já emite: canonical, `<link rel="alternate" hreflang>` para todos os idiomas, OG/Twitter, sitemap em `/sitemap.xml`, RSS em `/rss.xml`, e dark/light com script inline (sem FOUC).
