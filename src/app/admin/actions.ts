'use server';

import { FieldValue } from 'firebase-admin/firestore';
import { updateTag } from 'next/cache';
import type { ActionResult } from '@/lib/action-result';
import { deleteImages, imagesInPost, isBlogImage } from '@/lib/blob-images';
import { NotEditorError, requireEditor } from '@/lib/editors';
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

// Runs an action body and reports failures as a readable message. Errors
// are also logged so they appear in Vercel's runtime logs.
async function run<T>(
  name: string,
  fn: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    console.error(`${name} failed:`, error);
    return { ok: false, error: (error as Error).message || 'Unknown error' };
  }
}

export async function checkEditor(idToken: string) {
  try {
    await requireEditor(idToken);
    return { status: 'editor' as const };
  } catch (error) {
    if (error instanceof NotEditorError) return { status: 'pending' as const };
    // Shows up in Vercel's runtime logs, which helps when an editor reports
    // being stuck or refused.
    console.error('checkEditor failed:', error);
    return { status: 'error' as const, message: (error as Error).message };
  }
}

export async function listAllPosts(
  idToken: string
): Promise<ActionResult<PostMeta[]>> {
  return run('listAllPosts', () => listAllPostsImpl(idToken));
}

async function listAllPostsImpl(idToken: string): Promise<PostMeta[]> {
  const { db } = await requireEditor(idToken);
  const snap = await db.collection(POSTS_COLLECTION).get();
  return snap.docs
    .map(doc => withoutContent(toPost(doc)))
    .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
}

export async function getPostForEditing(
  idToken: string,
  id: string
): Promise<ActionResult<Post | null>> {
  return run('getPostForEditing', () => getPostForEditingImpl(idToken, id));
}

async function getPostForEditingImpl(
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
  /** Images uploaded while editing, so ones removed before saving get
   *  cleaned up too. */
  uploads: string[];
}

export async function savePost(
  idToken: string,
  id: string | null,
  input: PostInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  return run('savePost', () => savePostImpl(idToken, id, input));
}

async function savePostImpl(
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

  const content = sanitizePostHtml(input.content);

  const data: Record<string, unknown> = {
    title,
    slug,
    excerpt: input.excerpt.trim(),
    author: input.author.trim() || 'BetterPuertoPrincesa volunteers',
    tags: [...new Set(input.tags.map(t => t.trim()).filter(Boolean))],
    coverImage,
    coverAlt: input.coverAlt.trim(),
    content,
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

  // Delete images this post no longer uses: ones it had before this save,
  // plus anything uploaded while editing (only from the editor's own
  // folder) that didn't end up in the post.
  const inUse = imagesInPost(coverImage, content);
  const before = existing
    ? imagesInPost(existing.get('coverImage'), existing.get('content'))
    : new Set<string>();
  const uploaded = input.uploads.filter(url => isBlogImage(url, uid));
  await deleteImages([...before, ...uploaded].filter(url => !inUse.has(url)));

  return { id: ref.id, slug };
}

export async function deletePost(
  idToken: string,
  id: string
): Promise<ActionResult<null>> {
  return run('deletePost', () => deletePostImpl(idToken, id));
}

async function deletePostImpl(idToken: string, id: string) {
  const { db } = await requireEditor(idToken);
  const ref = db.collection(POSTS_COLLECTION).doc(id);
  const doc = await ref.get();
  await ref.delete();
  updateTag(POSTS_TAG);
  if (doc.exists) {
    await deleteImages(imagesInPost(doc.get('coverImage'), doc.get('content')));
  }
  return null;
}
