import 'server-only';
import type { DocumentSnapshot, Timestamp } from 'firebase-admin/firestore';
import { cacheLife, cacheTag } from 'next/cache';
import readingTime from 'reading-time';
import { getAdminDb } from './firebase/admin';
import { htmlToText, sanitizePostHtml } from './sanitize';
import { slugify } from './utils';

export const POSTS_COLLECTION = 'posts';
export const POSTS_TAG = 'posts';

export type PostStatus = 'draft' | 'published';

export interface PostMeta {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  tags: string[];
  coverImage?: string;
  coverAlt?: string;
  status: PostStatus;
  publishedAt?: string;
  updatedAt?: string;
  readingMinutes: number;
}

export interface Post extends PostMeta {
  content: string;
}

export interface Tag {
  name: string;
  slug: string;
  count: number;
}

const iso = (value: unknown) =>
  value && typeof (value as Timestamp).toDate === 'function'
    ? (value as Timestamp).toDate().toISOString()
    : undefined;

export function toPost(doc: DocumentSnapshot): Post {
  const data = doc.data() ?? {};
  const content = String(data.content ?? '');
  return {
    id: doc.id,
    slug: String(data.slug ?? doc.id),
    title: String(data.title ?? 'Untitled'),
    excerpt: String(data.excerpt ?? ''),
    author: String(data.author ?? 'BetterPuertoPrincesa volunteers'),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    coverImage: data.coverImage || undefined,
    coverAlt: data.coverAlt || undefined,
    status: data.status === 'published' ? 'published' : 'draft',
    publishedAt: iso(data.publishedAt),
    updatedAt: iso(data.updatedAt),
    readingMinutes: Math.max(
      1,
      Math.round(readingTime(htmlToText(content)).minutes)
    ),
    content,
  };
}

export function withoutContent(post: Post): PostMeta {
  const meta: Partial<Post> = { ...post };
  delete meta.content;
  return meta as PostMeta;
}

/** Published posts, newest first. Small blog, so filtering happens here
 *  instead of needing composite Firestore indexes. */
export async function getPublishedPosts(): Promise<PostMeta[]> {
  'use cache';
  cacheTag(POSTS_TAG);
  cacheLife('hours');

  const db = getAdminDb();
  if (!db) return [];
  const snap = await db
    .collection(POSTS_COLLECTION)
    .where('status', '==', 'published')
    .get();
  return snap.docs
    .map(doc => withoutContent(toPost(doc)))
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
}

export async function getPublishedPost(slug: string): Promise<Post | null> {
  'use cache';
  cacheTag(POSTS_TAG);
  cacheLife('hours');

  const db = getAdminDb();
  if (!db || !/^[a-z0-9-]+$/.test(slug)) return null;
  const snap = await db
    .collection(POSTS_COLLECTION)
    .where('slug', '==', slug)
    .where('status', '==', 'published')
    .limit(1)
    .get();
  if (snap.empty) return null;
  const post = toPost(snap.docs[0]);
  // Content is cleaned on save; cleaning again here protects against
  // anything written to Firestore by other means.
  return { ...post, content: sanitizePostHtml(post.content) };
}

export async function getAllTags(): Promise<Tag[]> {
  const tags = new Map<string, Tag>();
  for (const post of await getPublishedPosts()) {
    for (const name of post.tags) {
      const slug = slugify(name);
      const tag = tags.get(slug) ?? { name, slug, count: 0 };
      tag.count += 1;
      tags.set(slug, tag);
    }
  }
  return [...tags.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name)
  );
}

export async function getPostsByTag(tagSlug: string) {
  const posts = await getPublishedPosts();
  return posts.filter(p => p.tags.some(t => slugify(t) === tagSlug));
}
