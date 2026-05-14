export const LANGUAGES = ['pt', 'es'] as const;
export type Lang = (typeof LANGUAGES)[number];
export const DEFAULT_LANG: Lang = 'pt';

export const LOCALE_MAP: Record<Lang, string> = {
  pt: 'pt-BR',
  es: 'es-ES',
};

type Dict = Record<string, string>;

const pt: Dict = {
  'site.title': 'REDALINT',
  'site.tagline':
    'Rede de Pesquisadores e Gestores em Internacionalização da Educação Superior da América Latina',
  'nav.home': 'Início',
  'nav.institucional': 'Institucional',
  'nav.noticias': 'Notícias',
  'nav.publicacoes': 'Publicações',
  'nav.pesquisas': 'Pesquisas',
  'nav.equipe': 'Equipe',
  'nav.acervo': 'Consultar Acervo',
  'nav.search': 'Buscar',
  'nav.toggle_theme': 'Alternar tema',
  'nav.language': 'Idioma',
  'footer.rights': 'Todos os direitos reservados.',
  'footer.source': 'Código-fonte no GitHub',
  'news.title': 'Notícias',
  'news.read_more': 'Ler mais',
  'news.published_on': 'Publicado em',
  'news.empty': 'Ainda não há notícias publicadas.',
  'common.back': 'Voltar',
};

const es: Dict = {
  'site.title': 'REDALINT',
  'site.tagline':
    'Red de Investigadores y Gestores en Internacionalización de la Educación Superior de América Latina',
  'nav.home': 'Inicio',
  'nav.institucional': 'Institucional',
  'nav.noticias': 'Noticias',
  'nav.publicacoes': 'Publicaciones',
  'nav.pesquisas': 'Investigaciones',
  'nav.equipe': 'Equipo',
  'nav.acervo': 'Consultar Acervo',
  'nav.search': 'Buscar',
  'nav.toggle_theme': 'Cambiar tema',
  'nav.language': 'Idioma',
  'footer.rights': 'Todos los derechos reservados.',
  'footer.source': 'Código fuente en GitHub',
  'news.title': 'Noticias',
  'news.read_more': 'Leer más',
  'news.published_on': 'Publicado el',
  'news.empty': 'Aún no hay noticias publicadas.',
  'common.back': 'Volver',
};

const DICTS: Record<Lang, Dict> = { pt, es };

export function t(lang: Lang, key: string): string {
  return DICTS[lang]?.[key] ?? DICTS[DEFAULT_LANG][key] ?? key;
}

export function isLang(value: string): value is Lang {
  return (LANGUAGES as readonly string[]).includes(value);
}
