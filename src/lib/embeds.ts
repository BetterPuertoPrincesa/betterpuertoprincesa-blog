// Shared by the editor (to build embeds) and the sanitizer (to keep them).
// Only iframes pointing at these hosts survive. Script-based embed codes
// are never accepted, since they would run on our own domain.

export const EMBED_HOSTS = [
  'datawrapper.dwcdn.net',
  'flo.uri.sh',
  'public.flourish.studio',
  'docs.google.com',
  'lookerstudio.google.com',
  'public.tableau.com',
  'observablehq.com',
  'www.canva.com',
  'www.youtube-nocookie.com',
  's3.amazonaws.com',
] as const;

// Shared hosts where anyone can publish pages: only these path prefixes
// (one site's bucket) are allowed, never the whole host.
const EMBED_PATH_PREFIXES: Partial<
  Record<(typeof EMBED_HOSTS)[number], readonly string[]>
> = {
  's3.amazonaws.com': ['/embed.censusreporter.org/'],
};

export const EMBED_SITES =
  'Datawrapper, Flourish, Google Sheets, Looker Studio, Tableau Public, Observable, Canva, Census Reporter and YouTube';

export const DEFAULT_EMBED_HEIGHT = 480;
const MIN_HEIGHT = 150;
const MAX_HEIGHT = 1200;

// Attributes every embed iframe gets, whatever the pasted code said.
export const EMBED_IFRAME_ATTRS = {
  loading: 'lazy',
  sandbox:
    'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox',
  allow: 'fullscreen; encrypted-media; picture-in-picture',
  allowfullscreen: 'true',
  referrerpolicy: 'strict-origin-when-cross-origin',
} as const;

export function clampEmbedHeight(value: unknown) {
  const n = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(n)) return DEFAULT_EMBED_HEIGHT;
  return Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, n));
}

function parseUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function isAllowedEmbedSrc(src: string | null | undefined) {
  if (!src) return false;
  const url = parseUrl(src);
  if (
    url === null ||
    url.protocol !== 'https:' ||
    url.username !== '' ||
    url.password !== '' ||
    !(EMBED_HOSTS as readonly string[]).includes(url.hostname)
  ) {
    return false;
  }
  // pathname is already normalized, so "/../" can't climb out of a prefix.
  const prefixes =
    EMBED_PATH_PREFIXES[url.hostname as (typeof EMBED_HOSTS)[number]];
  return !prefixes || prefixes.some(p => url.pathname.startsWith(p));
}

// Turns the share links people usually copy into their embeddable form.
function toEmbedUrl(url: URL): URL {
  const host = url.hostname.replace(/^m\./, 'www.');

  // YouTube: watch, short and embed links all become privacy-enhanced embeds.
  let videoId: string | null = null;
  if (host === 'youtu.be') videoId = url.pathname.slice(1);
  else if (/^(www\.)?youtube(-nocookie)?\.com$/.test(host)) {
    if (url.pathname === '/watch') videoId = url.searchParams.get('v');
    else
      videoId =
        url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1] ?? null;
  }
  if (videoId && /^[\w-]{6,20}$/.test(videoId)) {
    return new URL(`https://www.youtube-nocookie.com/embed/${videoId}`);
  }

  // Flourish: public page to its embed URL.
  const flourish = url.pathname.match(/^\/(visualisation|story)\/(\d+)/);
  if (
    flourish &&
    (host === 'public.flourish.studio' || host === 'flo.uri.sh')
  ) {
    return new URL(`https://flo.uri.sh/${flourish[1]}/${flourish[2]}/embed`);
  }

  // Looker Studio (and its old Data Studio name): report link to embed link.
  if (host === 'lookerstudio.google.com' || host === 'datastudio.google.com') {
    const out = new URL(url.pathname, 'https://lookerstudio.google.com');
    if (out.pathname.startsWith('/reporting/')) {
      out.pathname = `/embed${out.pathname}`;
    }
    return out;
  }

  // Tableau Public: ask for the bare view without the gallery page around it.
  if (host === 'public.tableau.com' && url.pathname.startsWith('/views/')) {
    const out = new URL(url.pathname, 'https://public.tableau.com');
    out.search = '?:showVizHome=no&:embed=true';
    return out;
  }

  // Observable: notebook page to its embed page (all cells unless one is picked).
  if (host === 'observablehq.com' && url.pathname.startsWith('/@')) {
    const out = new URL(url.pathname, 'https://observablehq.com');
    out.pathname = `/embed${url.pathname}`;
    const cells = url.searchParams.getAll('cell');
    for (const cell of cells.length ? cells : ['*']) {
      out.searchParams.append('cell', cell);
    }
    return out;
  }

  // Canva: design view link needs the ?embed flag.
  if (
    host === 'www.canva.com' &&
    /^\/design\/[^/]+\/[^/]+\/view/.test(url.pathname)
  ) {
    const out = new URL(url.pathname, 'https://www.canva.com');
    out.search = '?embed';
    return out;
  }

  return url;
}

function decodeEntities(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export type EmbedInput = { src: string; height: number; title: string };

// Accepts either a link or a pasted <iframe> embed code.
export function parseEmbedInput(input: string): EmbedInput | null {
  const text = input.trim();
  let raw = text;
  let height = DEFAULT_EMBED_HEIGHT;
  let title = '';

  if (/^<iframe[\s>]/i.test(text)) {
    const attr = (name: string) =>
      text.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'));
    const src = attr('src');
    if (!src) return null;
    raw = decodeEntities(src[1] ?? src[2] ?? '');
    const h = attr('height');
    if (h) height = clampEmbedHeight(h[1] ?? h[2]);
    const t = attr('title');
    if (t) title = decodeEntities(t[1] ?? t[2] ?? '');
  } else if (/^</.test(text)) {
    // Script-based embed codes and other HTML are not supported.
    return null;
  }

  const url = parseUrl(raw);
  if (!url || url.protocol !== 'https:') return null;
  const src = toEmbedUrl(url).toString();
  return isAllowedEmbedSrc(src) ? { src, height, title } : null;
}
