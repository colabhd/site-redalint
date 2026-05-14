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
  'common.back': 'Voltar',
  'common.know_more': 'Saiba mais',
  'home.welcome': 'Seja Bem Vindo!',
  'home.about_title': 'A REDALINT',
  'home.about_body':
    'A REDALINT foi criada em 2015 a partir de um edital da Secretaria de Políticas Universitárias do Ministério de Educação da Argentina. Hoje reúne pesquisadores e gestores de universidades da Argentina e do Brasil em torno do estudo crítico da internacionalização da educação superior latino-americana.',
  'home.research_title': 'Projetos & Pesquisas',
  'home.research_body': 'Conheça os projetos e pesquisas desenvolvidos pela REDALINT.',
  'home.publications_title': 'Publicações',
  'home.publications_body':
    'Conheça a produção científica realizada pelos membros da REDALINT.',
  'home.initiatives_title': 'Iniciativas REDALINT',
  'home.initiative_journal': 'Revista REDALINT',
  'home.initiative_journal_body':
    'Publique seus trabalhos sobre a internacionalização da educação superior na nossa revista de acesso aberto.',
  'home.initiative_archive': 'Acervo REDALINT',
  'home.initiative_archive_body':
    'Pesquise e contribua com o nosso acervo bibliográfico sobre internacionalização e integração regional.',
  'home.news_title': 'Notícias & Eventos',
  'home.news_body': 'Fique por dentro das nossas últimas notícias e eventos.',
  'home.news_more': 'Mais notícias',
  'home.team_title': 'Nossa Equipe',
  'home.team_body': 'Conheça os membros da REDALINT.',
  'home.partners_title': 'Apoio institucional',
  'news.title': 'Notícias',
  'news.read_more': 'Ler mais',
  'news.published_on': 'Publicado em',
  'news.empty': 'Ainda não há notícias publicadas.',
  'team.personal_site': 'Página pessoal',
  'team.email': 'E-mail',
  'team.empty': 'Ainda não há membros cadastrados.',
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
  'common.back': 'Volver',
  'common.know_more': 'Saber más',
  'home.welcome': '¡Bienvenido!',
  'home.about_title': 'La REDALINT',
  'home.about_body':
    'La REDALINT fue creada en 2015 a partir de una convocatoria de la Secretaría de Políticas Universitarias del Ministerio de Educación de Argentina. Hoy reúne a investigadores y gestores de universidades de Argentina y Brasil en torno al estudio crítico de la internacionalización de la educación superior latinoamericana.',
  'home.research_title': 'Proyectos e Investigaciones',
  'home.research_body': 'Conozca los proyectos e investigaciones desarrollados por REDALINT.',
  'home.publications_title': 'Publicaciones',
  'home.publications_body': 'Conozca la producción científica de los miembros de REDALINT.',
  'home.initiatives_title': 'Iniciativas REDALINT',
  'home.initiative_journal': 'Revista REDALINT',
  'home.initiative_journal_body':
    'Publique sus trabajos sobre internacionalización de la educación superior en nuestra revista de acceso abierto.',
  'home.initiative_archive': 'Acervo REDALINT',
  'home.initiative_archive_body':
    'Investigue y contribuya con nuestro acervo bibliográfico sobre internacionalización e integración regional.',
  'home.news_title': 'Noticias y Eventos',
  'home.news_body': 'Manténgase al día con nuestras últimas noticias y eventos.',
  'home.news_more': 'Más noticias',
  'home.team_title': 'Nuestro Equipo',
  'home.team_body': 'Conozca a los miembros de REDALINT.',
  'home.partners_title': 'Apoyo institucional',
  'news.title': 'Noticias',
  'news.read_more': 'Leer más',
  'news.published_on': 'Publicado el',
  'news.empty': 'Aún no hay noticias publicadas.',
  'team.personal_site': 'Página personal',
  'team.email': 'Correo',
  'team.empty': 'Aún no hay miembros registrados.',
};

const DICTS: Record<Lang, Dict> = { pt, es };

export function t(lang: Lang, key: string): string {
  return DICTS[lang]?.[key] ?? DICTS[DEFAULT_LANG][key] ?? key;
}

export function isLang(value: string): value is Lang {
  return (LANGUAGES as readonly string[]).includes(value);
}
