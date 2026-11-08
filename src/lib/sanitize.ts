import sanitizeHtml from 'sanitize-html';

// Allowlist matching what the editor toolbar can produce. Anything else
// (scripts, inline styles, iframes, event handlers) is stripped.
const options: sanitizeHtml.IOptions = {
  allowedTags: [
    'p',
    'br',
    'h2',
    'h3',
    'h4',
    'strong',
    'em',
    'u',
    's',
    'code',
    'pre',
    'blockquote',
    'ul',
    'ol',
    'li',
    'a',
    'img',
    'hr',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'loading', 'decoding'],
    ol: ['start'],
  },
  allowedSchemes: ['https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['https'] },
  allowProtocolRelative: false,
  transformTags: {
    // Images in a post load only as the reader scrolls near them.
    img: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, loading: 'lazy', decoding: 'async' },
    }),
    a: (tagName, attribs) => {
      const href = attribs.href ?? '';
      const attrs: sanitizeHtml.Attributes = { href };
      if (/^https?:\/\//.test(href)) {
        attrs.target = '_blank';
        attrs.rel = 'noopener noreferrer';
      }
      return { tagName, attribs: attrs };
    },
  },
};

export function sanitizePostHtml(html: string) {
  return sanitizeHtml(html, options);
}

export function htmlToText(html: string) {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, ' ')
    .trim();
}
