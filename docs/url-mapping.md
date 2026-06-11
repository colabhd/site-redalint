# Mapa de URLs (WordPress antigo → Astro novo)

Cada URL antiga do WordPress continua respondendo no novo site via stub HTML
com `<meta http-equiv="refresh">` + canonical + `noindex`, apontando para a
URL canônica nova. Os stubs são gerados em build time pela rota
`src/pages/[wpSlug].astro`, a partir do campo `wpSlug` no front-matter do
conteúdo (mais os casos especiais `home`, `noticias` e `equipe`).

| URL antiga | URL nova canônica |
|---|---|
| `/home/` | `/pt/` |
| `/institucional/` | `/pt/institucional/` |
| `/noticias/` | `/pt/noticias/` |
| `/publicacoes/` | `/pt/publicacoes/` |
| `/pesquisas/` | `/pt/pesquisas/` |
| `/equipe/` | `/pt/equipe/` |
| `/equipe-acervo/` | `/pt/equipe-acervo/` |
| `/sobre-o-acervo/` | `/pt/sobre-o-acervo/` |
| `/como-pesquisar/` | `/pt/como-pesquisar/` |
| `/como-colaborar/` | `/pt/como-colaborar/` |
| `/como-colaborar-espanol/` | `/es/como-colaborar/` |
| `/julieta-abba/` | `/pt/julieta-abba/` |
| `/lancamento-da-revista-redalint/` | `/pt/noticias/lancamento-da-revista-redalint/` |
| `/texto-001-desafios-da-internacionalizacao-da-educacao/` | `/pt/noticias/texto-001-desafios-da-internacionalizacao-da-educacao/` |

## Como manter

- Conteúdo migrado do WP carrega `wpSlug` no front-matter — o stub é gerado
  automaticamente; nada a fazer.
- Conteúdo novo (sem URL antiga) não deve ter `wpSlug`.
- Casos sem entrada em collection (ex.: rotas dinâmicas) entram no `Map`
  manual em `src/pages/[wpSlug].astro`.

Em GitHub Pages estático não existe redirect HTTP nativo; o `meta refresh`
é a alternativa portável. Se o site migrar para um host com suporte a
redirects (Cloudflare, Netlify), trocar por 301s.
