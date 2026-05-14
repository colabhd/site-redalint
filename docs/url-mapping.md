# Mapa de URLs (WordPress antigo → Astro novo)

Cada URL listada à esquerda continuará respondendo no novo site via stub
HTML com `<meta http-equiv="refresh">` apontando para a URL canônica à
direita. Os stubs ficam `noindex,follow` e são gerados em build time por
`scripts/build-redirects.mjs`.

| URL antiga | URL nova canonical |
|---|---|
| `/` | `/pt/` |
| `/institucional/` | `/pt/institucional/` |
| `/pesquisas/` | `/pt/pesquisas/` |
| `/publicacoes/` | `/pt/publicacoes/` |
| `/equipe/` | `/pt/equipe/` |
| `/equipe-acervo/` | `/pt/equipe-acervo/` |
| `/noticias/` | `/pt/noticias/` |
| `/como-pesquisar/` | `/pt/como-pesquisar/` |
| `/como-colaborar/` | `/pt/como-colaborar/` |
| `/como-colaborar-espanol/` | `/es/como-colaborar/` |
| `/sobre-o-acervo/` | `/pt/sobre-o-acervo/` |
| `/julieta-abba/` | `/pt/equipe/julieta-abba/` |
| `/lancamento-da-revista-redalint/` | `/pt/noticias/lancamento-da-revista-redalint/` |
| `/texto-001-desafios-da-internacionalizacao-da-educacao/` | `/pt/noticias/texto-001-desafios-da-internacionalizacao-da-educacao/` |

## Como manter

Edite o array `REDIRECTS` em `scripts/build-redirects.mjs` quando adicionar
ou remover páginas. Em GitHub Pages estático não existe `.htaccess`; o
`meta refresh` é a alternativa portável. Quando migrarmos para um host com
suporte a redirects HTTP nativos (Cloudflare, Netlify), trocar por 301s.
