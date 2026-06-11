/**
 * Plugin rehype que prefixa a `base` do Astro em URLs root-relative
 * (`/imagens/…`, `/pt/equipe/`) dentro do conteúdo markdown/MDX.
 *
 * O conteúdo é escrito com caminhos a partir da raiz para não acoplar os
 * arquivos MDX ao deploy em subdiretório do GitHub Pages.
 */
export default function rehypeBaseUrl({ base = '/' } = {}) {
  const prefix = base.replace(/\/$/, '');
  if (!prefix) return () => {};

  const rewrite = (value) => {
    if (typeof value !== 'string') return value;
    if (!value.startsWith('/') || value.startsWith('//')) return value;
    if (value === prefix || value.startsWith(`${prefix}/`)) return value;
    return prefix + value;
  };

  const visit = (node) => {
    if (node.type === 'element' && node.properties) {
      if (node.properties.href) node.properties.href = rewrite(node.properties.href);
      if (node.properties.src) node.properties.src = rewrite(node.properties.src);
    }
    for (const child of node.children ?? []) visit(child);
  };

  return (tree) => visit(tree);
}
