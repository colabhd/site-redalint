# Migração WordPress → Astro estático (redalint.org)

**Data:** 2026-05-14
**Repositório:** [colabhd/site-redalint](https://github.com/colabhd/site-redalint)
**Site atual:** https://redalint.org/ (WordPress + Astra + Elementor)
**Destino inicial:** https://colabhd.github.io/site-redalint/
**Domínio final:** redalint.org (via CNAME)
**Referência de stack:** [cpps-unesp/site-cpps](https://github.com/cpps-unesp/site-cpps)

## Objetivo

Migrar o site institucional da REDALINT de WordPress para um site estático em Astro hospedado no GitHub Pages, preservando o conteúdo, a estrutura de URLs (via redirects-stub) e o SEO atual. O visual final deve ficar **muito próximo** do redalint.org atual: mesmas cores institucionais (indigo `#4b0082` + verde `#61ce70`), tipografia (Roboto + Roboto Slab), itens de menu e seções da home.

## Contexto

O scaffolding inicial já está pronto no `main` (commits `b8f69c7` e `8592afe`):

- Astro 6.3 (`output: 'static'`) + MDX, TypeScript strict
- Tailwind 4 (via `@tailwindcss/vite`) + DaisyUI 5 com dois temas (`redalint`/`redalintdark`)
- Pagefind 1.5 (busca cliente, indexada no build)
- BaseLayout central com canonical, hreflang (`pt-BR`/`es-ES` + `x-default`), OG/Twitter, theme inline anti-FOUC
- Sitemap dinâmico (`src/pages/sitemap.xml.ts`), RSS (`@astrojs/rss`)
- Workflows: `deploy.yml` (push em `main` → GitHub Pages) e `ci.yml` (PRs)
- Conversor WordPress → MDX em `scripts/wp-to-mdx.mjs`
- 3 MDX manuais como prova de pipeline

**Conteúdo WP a migrar** (do `redalint.WordPress.2026-05-14.xml`):

- 12 páginas publicadas (`home`, `institucional`, `noticias`, `pesquisas`, `publicacoes`, `equipe`, `equipe-acervo`, `como-pesquisar`, `como-colaborar`, `como-colaborar-espanol`, `sobre-o-acervo`, `julieta-abba`)
- 2 posts publicados (`lancamento-da-revista-redalint`, `texto-001-desafios-da-internacionalizacao-da-educacao`)
- 61 anexos / ~133 URLs únicas de imagens em `wp-content/uploads`
- Sem categorias, tags ou plugin de i18n (a versão em espanhol é uma página irmã com slug `-espanol`)

## Princípios

1. **Aproveitar o scaffolding existente.** Não refazer infraestrutura que já funciona; estender.
2. **Visual fiel ao atual.** Paleta, tipografia e estrutura de seções idênticas ao redalint.org. Pequenas melhorias de UX (cards consistentes, busca, dark mode) são bem-vindas, mas não devem alterar a identidade visual.
3. **Preservar SEO.** Toda URL antiga `/<slug>/` continua respondendo via stub HTML com `<meta refresh>` + `<link rel=canonical>` apontando para a nova rota localizada.
4. **YAGNI.** Trazer do `cpps-unesp` só o que agrega: `Breadcrumbs`, link "Editar no GitHub", JSON-LD básico, `data-pagefind-body`. Não copiar `atividades`/`atendimento`/`editarSite` (não há equivalente no redalint).
5. **i18n simples.** Apenas `pt` e `es`, sem traduzir segmentos de URL (`/pt/noticias/` e `/es/noticias/` — não `/es/noticias/` vs `/en/news/`). Conteúdo em espanhol é opt-in: páginas que não têm versão `es` mostram um aviso e um link para a versão `pt`.

## Arquitetura

### Stack final (mantida)

| Camada | Tecnologia |
|---|---|
| Framework | Astro 6.3 (static) + MDX |
| Estilo | Tailwind 4 + DaisyUI 5 (temas `redalint`/`redalintdark`) |
| Busca | Pagefind 1.5 + `astro-pagefind` |
| Imagens | sharp (responsive built-in) |
| Tipos | TypeScript strict, schemas Zod nas coleções |
| Hospedagem | GitHub Pages (Actions) |

### Estrutura de diretórios (alvo)

```
src/
  content/
    paginas/{pt,es}/<slug>.mdx        # páginas institucionais
    noticias/{pt,es}/<slug>.mdx        # posts
    equipe/<membro>.mdx                # perfis de membros (pt como default)
  layouts/
    BaseLayout.astro                   # SEO + theme + header/footer
  components/
    Header.astro, Footer.astro
    Hero.astro, SectionBand.astro
    NoticiaCard.astro, MembroCard.astro    # (novo)
    Breadcrumbs.astro                       # (novo, inspirado no cpps)
    EditOnGitHub.astro                      # (novo, inspirado no cpps)
    PartnersStrip.astro                     # (novo) faixa de logos de apoiadores
    ThemeToggle.astro
  pages/
    index.astro                         # redirect → /pt/
    [lang]/
      index.astro                       # home
      [...slug].astro                   # páginas
      noticias/{index,[slug]}.astro
      equipe/{index,[slug]}.astro       # (novos)
      busca.astro
    [oldSlug]/index.astro               # (novo) stubs de URL antiga → nova
    sitemap.xml.ts, rss.xml.ts, 404.astro
  i18n/translations.ts
  utils/paths.ts
  styles/global.css
scripts/
  wp-to-mdx.mjs
public/
  imagens/redalint-logo.svg
  imagens/wp/...                        # baixadas pelo conversor
  imagens/parceiros/*.svg               # (novo) logos institucionais
  favicon.svg, robots.txt
docs/
  url-mapping.md                        # tabela de redirects
  superpowers/specs/2026-05-14-redalint-migration-design.md
```

### Modelo de conteúdo

**Coleções** (já em `src/content.config.ts`):

- `paginas` — `{ title, lang, slug?, description?, order, hero?, updated? }`
- `noticias` — `{ title, lang, slug?, date, excerpt?, image?, tags[], author, featured }`
- `equipe` — `{ name, lang='pt', role?, affiliation?, photo?, order, links: { lattes?, orcid?, site?, email? } }`

Mantém o schema atual. Apenas popula `equipe/` com os membros reais (do WP: pelo menos Julieta Abba; mais a partir do conteúdo da página `equipe`).

### Roteamento

| Rota | Origem |
|---|---|
| `/` | `pages/index.astro` (redirect → `/pt/`) |
| `/pt/`, `/es/` | `[lang]/index.astro` (home) |
| `/<lang>/<slug>/` | `[lang]/[...slug].astro` ← `paginas` |
| `/<lang>/noticias/` | lista |
| `/<lang>/noticias/<slug>/` | post |
| `/<lang>/equipe/` | lista |
| `/<lang>/equipe/<slug>/` | perfil |
| `/<lang>/busca/` | Pagefind UI |
| `/<oldSlug>/` | stub HTML → URL nova canonical |
| `/sitemap.xml`, `/rss.xml`, `/404` | dinâmicos |

### Preservação de URLs (SEO)

O WordPress usava `/<slug>/` (estrutura plana). A nova é `/<lang>/<slug>/`. Para não quebrar backlinks:

- `src/pages/[oldSlug]/index.astro` enumera os 14 slugs publicados via `getStaticPaths` e emite uma página com:
  - `<meta http-equiv="refresh" content="0; url=/<lang>/<slug>/">`
  - `<link rel="canonical" href="/<lang>/<slug>/">`
  - `<meta name="robots" content="noindex, follow">`
  - body com link visível (fallback)
- Mapeamento documentado em `docs/url-mapping.md` (tabela slug-antigo → URL-nova)
- `sitemap.xml` lista **só** as URLs novas; os stubs ficam `noindex`

Caso futuro: quando migrar para `redalint.org` como domínio canônico, os stubs viram redirects 301 nativos. Em GitHub Pages, `meta refresh` é a melhor opção (não há `.htaccess`).

### Identidade visual

| Token | Valor |
|---|---|
| `--color-primary` | `#4b0082` (indigo do site atual; já no `global.css`) |
| `--color-accent` | `#61ce70` (verde Elementor; já no `global.css`) |
| `--color-secondary` | `#54595f` |
| `--color-neutral` | `#1d1a25` |
| Fonte corpo | Roboto (400/500/700) |
| Fonte títulos | Roboto Slab (400/600/700) |
| Estilo seção | `SECTION-TITLE` em uppercase, letter-spacing `0.02em`, divisor verde 4×1rem |
| Sections | Faixas alternadas `base-100` / `primary` / `neutral` (já em `SectionBand`) |

Ajustes visuais para fidelizar o atual:

- News cards: data em formato `dd/MM/yyyy` (formato BR atual) em vez do "11 de maio de 2021" — opção via prop `dateFormat: 'short' \| 'long'`, com `short` como padrão na lista e `long` na página do post
- Faixa de **parceiros institucionais** (CAPES, CNPq, FAPESP, FAPERGS, CLACSO, UNESP, UNCo, UFRGS, BDTD) na home e no footer, em `<PartnersStrip>` — logos em SVG/PNG monocromáticos
- Página `equipe` em layout vertical (foto retangular → nome → bio → ícones Lattes/ORCID/site/email) como no site atual, **não** em grid de cards (que é o estilo do cpps). `MembroCard` recebe `layout: 'stacked' \| 'grid'`.
- Hero: manter mapa da América Latina (já presente em `mapa-america-latina02-768x937.png`)

### Performance, SEO e a11y

Já no scaffolding:
- Canonical + hreflang completos no `BaseLayout`
- OG/Twitter com fallback `og-default.png`
- Sitemap dinâmico, RSS
- Theme inline anti-FOUC; preconnect Google Fonts
- `loading="lazy"` + `decoding="async"` nas imagens de cards
- Skip link "Ir para o conteúdo"

A adicionar:
- `data-pagefind-body` no `<main>` e `data-pagefind-ignore` no `<Header>`/`<Footer>` (do cpps)
- JSON-LD `Organization` no `BaseLayout` (autoridade do site)
- JSON-LD `Article` em `[slug].astro` de notícias (date, author)
- `eslint` + `prettier` + `@astrojs/check` no `ci.yml` (atualmente só roda `typecheck` + `build`)
- Lighthouse opcional via `treosh/lighthouse-ci-action` (sem bloqueio)

### Conversão de conteúdo

Pipeline atual em `scripts/wp-to-mdx.mjs` (já implementado):
1. Lê WXR com `fast-xml-parser`
2. Filtra `status=publish` + `post_type ∈ {page, post}`
3. Limpa comentários Elementor / shortcodes
4. Converte HTML → Markdown via Turndown (preserva `<figure>` com legenda)
5. Reescreve URLs `https://redalint.org/wp-content/...` → `/imagens/wp/<arquivo>` e baixa
6. Detecta idioma por slug (`-espanol`/`-es` → `es`)
7. Remap: `como-colaborar-espanol` → `como-colaborar` lang=es

**Pós-processamento manual** previsto:
- Remover resíduos de Elementor que escaparam (divs decorativas, classes vazias)
- Adicionar `description` curta no frontmatter onde a `excerpt` ficou vazia
- Mover `julieta-abba.mdx` de `paginas/pt/` → `equipe/julieta-abba.mdx` ajustando schema
- Definir `featured: true` no post mais relevante para destaque na home
- Validar e otimizar imagens (passar pelas 133 — algumas são duplicatas/crops)

## Trade-offs

| Decisão | Alternativa | Motivo |
|---|---|---|
| Stubs `meta refresh` para URLs antigas | Quebrar URLs antigas | Backlinks externos e SEO preservados a custo de 14 arquivos HTML extras |
| Busca em página dedicada `/busca/` | Modal (estilo cpps) | Página é mais simples, indexável, suficiente para o volume atual (14 itens). Modal é melhoria futura |
| `publicacoes` e `pesquisas` como `paginas` MDX simples | Coleções Zod dedicadas | Volume baixo hoje (uma página cada); promover para coleção quando houver volume |
| Layout vertical na página `equipe` | Grid de cards | Fidelidade ao site atual (vertical stacked com Lattes/ORCID/site) |
| Equipe inicialmente só em `pt` | Bilingual desde já | Conteúdo WP atual só tem `pt`; `lang.default = 'pt'` no schema já cobre |
| GitHub Pages | Cloudflare Pages (como cpps) | Usuário já escolheu GH Pages; workflow já configurado; CNAME para redalint.org possível |

## Plano de execução (resumo, detalhado depois)

**Fase A — Conteúdo**
1. Rodar `npm run convert-wp` → gera 14 MDX + baixa 133 imagens
2. Limpeza manual dos MDX (remover lixo Elementor, ajustar frontmatter)
3. Mover `julieta-abba` para `equipe/`; popular outros membros a partir da página `equipe`

**Fase B — Páginas dinâmicas**
4. `src/pages/[lang]/equipe/index.astro` + `[slug].astro`
5. `MembroCard.astro` com layout stacked
6. `PartnersStrip.astro` + adicionar logos em `public/imagens/parceiros/`

**Fase C — Preservação de URLs**
7. `src/pages/[oldSlug]/index.astro` (stubs)
8. `docs/url-mapping.md`

**Fase D — Polimento**
9. `Breadcrumbs.astro` em `[...slug].astro` e `noticias/[slug].astro`
10. `EditOnGitHub.astro` no footer das páginas MDX
11. JSON-LD (`Organization` + `Article`); `data-pagefind-body`/`ignore`
12. Atualizar `news_card` para formato de data curto (dd/MM/yyyy)
13. CI: adicionar `eslint` + `prettier --check`

**Fase E — Deploy e validação**
14. Validar build local (`npm run build && npm run preview`)
15. Merge em `main` → deploy GH Pages
16. Smoke test: home pt/es, notícias, equipe, busca, sitemap, RSS, 4 URLs antigas
17. Documentar passos para CNAME `redalint.org`

## Critérios de sucesso

- `npm run build` finaliza sem erros, `astro check` passa
- Todas as 14 páginas/posts publicados aparecem em `/pt/` ou `/es/`
- Todas as 14 URLs antigas (`/<slug>/`) redirecionam corretamente
- Lighthouse (desktop): Performance ≥ 90, SEO ≥ 95, Acessibilidade ≥ 95, Best Practices ≥ 95
- `sitemap.xml` e `rss.xml` válidos
- Busca encontra termos em pelo menos uma página
- Comparação visual lado-a-lado com redalint.org mostra: mesmas cores, mesmos itens de menu, mesma ordem de seções na home

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| HTML do Elementor com classes/atributos que vazam para o MDX | `preClean` no script já remove comentários/data-attr/style/script. Pós-processamento manual cobre o resto |
| URLs antigas com query string (ex.: `?p=123`) | GH Pages ignora query em sites estáticos; o `index.html` do slug responde igualmente |
| Diferença visual em casos edge (tabelas, embeds) | Validar contra o atual em cada MDX após conversão; ajustar via `prose` no Tailwind |
| Domínio futuro `redalint.org` apontando antes da migração estar pronta | DNS só muda no final, manter site WP no ar até o switch |

## Fora de escopo

- Comentários (WP tinha, novo site não terá)
- Painel admin / CMS (edição via PR no GitHub)
- Formulário de contato (e-mail estático no footer já cobre)
- Tradução completa do conteúdo (só os MDX já em `es` no WP; outros ficam `pt`-only)
- Acervo (`acervo.redalint.org`) — subdomínio externo, link apenas
