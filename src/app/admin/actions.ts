'use server';

import { FieldValue } from 'firebase-admin/firestore';
import { updateTag } from 'next/cache';
import { requireEditor } from '@/lib/editors';
import {
  POSTS_COLLECTION,
  POSTS_TAG,
  toPost,
  withoutContent,
  type Post,
  type PostMeta,
  type PostStatus,
} from '@/lib/posts';
import { sanitizePostHtml } from '@/lib/sanitize';
import { slugify } from '@/lib/utils';

// Every action takes the caller's Firebase ID token; requireEditor checks
// it against the `editors` collection before doing anything.

export async function checkEditor(idToken: string) {
  try {
    await requireEditor(idToken);
    return { ok: true as const };
  } catch (error) {
    // Shows up in Vercel's runtime logs, which helps when an editor reports
    // being stuck or refused.
    console.error('checkEditor failed:', error);
    return { ok: false as const, message: (error as Error).message };
  }
}

export async function listAllPosts(idToken: string): Promise<PostMeta[]> {
  const { db } = await requireEditor(idToken);
  const snap = await db.collection(POSTS_COLLECTION).get();
  return snap.docs
    .map(doc => withoutContent(toPost(doc)))
    .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
}

export async function getPostForEditing(
  idToken: string,
  id: string
): Promise<Post | null> {
  const { db } = await requireEditor(idToken);
  const doc = await db.collection(POSTS_COLLECTION).doc(id).get();
  return doc.exists ? toPost(doc) : null;
}

export interface PostInput {
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  tags: string[];
  coverImage: string;
  coverAlt: string;
  content: string;
  status: PostStatus;
}

export async function savePost(
  idToken: string,
  id: string | null,
  input: PostInput
): Promise<{ id: string; slug: string }> {
  const { db, uid } = await requireEditor(idToken);

  const title = input.title.trim();
  if (!title) throw new Error('Give the post a title.');
  const slug = slugify(input.slug || title);
  if (!slug)
    throw new Error('The URL slug needs at least one letter or number.');

  const clash = await db
    .collection(POSTS_COLLECTION)
    .where('slug', '==', slug)
    .limit(2)
    .get();
  if (clash.docs.some(doc => doc.id !== id)) {
    throw new Error(`Another post already uses the address /posts/${slug}.`);
  }

  const coverImage = input.coverImage.trim();
  if (coverImage && !coverImage.startsWith('https://')) {
    throw new Error('Cover image must be an https link.');
  }

  const ref = id
    ? db.collection(POSTS_COLLECTION).doc(id)
    : db.collection(POSTS_COLLECTION).doc();
  const existing = id ? await ref.get() : null;
  if (id && !existing?.exists) throw new Error('That post no longer exists.');

  const data: Record<string, unknown> = {
    title,
    slug,
    excerpt: input.excerpt.trim(),
    author: input.author.trim() || 'BetterPuertoPrincesa volunteers',
    tags: [...new Set(input.tags.map(t => t.trim()).filter(Boolean))],
    coverImage,
    coverAlt: input.coverAlt.trim(),
    content: sanitizePostHtml(input.content),
    status: input.status,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: uid,
  };

  // Keep the original publish date when a post is edited later.
  if (input.status === 'published' && !existing?.get('publishedAt')) {
    data.publishedAt = FieldValue.serverTimestamp();
  }
  if (!existing) {
    data.createdAt = FieldValue.serverTimestamp();
    data.createdBy = uid;
  }

  await ref.set(data, { merge: true });
  updateTag(POSTS_TAG);
  return { id: ref.id, slug };
}

export async function deletePost(idToken: string, id: string) {
  const { db } = await requireEditor(idToken);
  await db.collection(POSTS_COLLECTION).doc(id).delete();
  updateTag(POSTS_TAG);
}
