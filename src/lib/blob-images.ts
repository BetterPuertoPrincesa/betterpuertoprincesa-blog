import 'server-only';
import { del } from '@vercel/blob';

// Cleanup for images uploaded through the editor. Only files in this
// blog's Blob store under blog-images/ are ever deleted; anything else
// (external links, other stores) is left alone.

const IMG_SRC = /<img\b[^>]*\bsrc="([^"]+)"/gi;

export function isBlogImage(url: string, uid?: string) {
  try {
    const u = new URL(url);
    const prefix = uid ? `/blog-images/${uid}/` : '/blog-images/';
    return (
      u.protocol === 'https:' &&
      u.hostname.endsWith('.public.blob.vercel-storage.com') &&
      u.pathname.startsWith(prefix)
    );
  } catch {
    return false;
  }
}

/** Every blog image a post uses: its cover plus images in the body. */
export function imagesInPost(cover: unknown, html: unknown) {
  const urls = new Set<string>();
  if (typeof cover === 'string' && isBlogImage(cover)) urls.add(cover);
  if (typeof html === 'string') {
    for (const [, src] of html.matchAll(IMG_SRC)) {
      const url = src.replace(/&amp;/g, '&');
      if (isBlogImage(url)) urls.add(url);
    }
  }
  return urls;
}

/** Deletes images, logging failures instead of failing the save. */
export async function deleteImages(urls: Iterable<string>) {
  const list = [...urls].filter(url => isBlogImage(url));
  if (list.length === 0) return;
  try {
    await del(list);
  } catch (error) {
    console.error('Could not delete images from Blob:', list, error);
  }
}
