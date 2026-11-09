import sanitizeHtml from 'sanitize-html';
import {
  clampEmbedHeight,
  EMBED_HOSTS,
  EMBED_IFRAME_ATTRS,
  isAllowedEmbedSrc,
} from './embeds';

// Allowlist matching what the editor toolbar can produce. Anything else
// (scripts, inline styles, event handlers, iframes from other sites) is
// stripped. Embeds are limited to the hosts in lib/embeds.ts.
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
    'iframe',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'loading', 'decoding'],
    ol: ['start'],
    iframe: ['src', 'title', 'height', ...Object.keys(EMBED_IFRAME_ATTRS)],
  },
  allowedSchemes: ['https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['https'], iframe: ['https'] },
  allowedIframeHostnames: [...EMBED_HOSTS],
  allowProtocolRelative: false,
  // Drop an iframe entirely if its src was not on the allowlist.
  exclusiveFilter: frame =>
    frame.tag === 'iframe' && !isAllowedEmbedSrc(frame.attribs.src),
  transformTags: {
    // Fixed sandbox and loading rules, whatever the stored HTML says.
    iframe: (tagName, attribs) => ({
      tagName,
      attribs: {
        src: attribs.src ?? '',
        title: attribs.title ?? 'Embedded content',
        height: String(clampEmbedHeight(attribs.height)),
        ...EMBED_IFRAME_ATTRS,
      },
    }),
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
