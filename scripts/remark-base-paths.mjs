/**
 * Remark plugin that rewrites root-relative URLs (starting with `/`) in
 * markdown image/link nodes to include the configured Astro base path.
 *
 * Skips:
 *   - Absolute URLs (http://, https://, mailto:, tel:)
 *   - Protocol-relative URLs (//foo)
 *   - Anchors (#section)
 *   - Already-prefixed URLs (when base is set and URL already starts with it)
 */
export function remarkBasePaths({ base = '' } = {}) {
  const normalized = base.replace(/\/+$/, '');
  if (!normalized) return () => {};

  function rewrite(url) {
    if (!url || typeof url !== 'string') return url;
    if (/^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url)) return url;
    if (!url.startsWith('/')) return url;
    if (url.startsWith(normalized + '/') || url === normalized) return url;
    return normalized + url;
  }

  return (tree) => {
    const visit = (node) => {
      if (!node || typeof node !== 'object') return;
      if (node.type === 'image' || node.type === 'link') {
        node.url = rewrite(node.url);
      }
      if (node.type === 'html' && typeof node.value === 'string') {
        // crude rewrite for inline <img src="/..."> and <a href="/...">
        node.value = node.value.replace(/(\s(?:src|href)=)"(\/[^"]*)"/g, (_, attr, val) => `${attr}"${rewrite(val)}"`);
        node.value = node.value.replace(/(\s(?:src|href)=)'(\/[^']*)'/g, (_, attr, val) => `${attr}'${rewrite(val)}'`);
      }
      if (Array.isArray(node.children)) node.children.forEach(visit);
    };
    visit(tree);
  };
}

export default remarkBasePaths;
