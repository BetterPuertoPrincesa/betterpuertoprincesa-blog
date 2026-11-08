'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink, LoaderCircle, Trash } from 'lucide-react';
import { deletePost, savePost, type PostInput } from '@/app/admin/actions';
import { unwrap } from '@/lib/action-result';
import type { Post, PostStatus } from '@/lib/posts';
import { uploadImage } from '@/lib/upload';
import { slugify } from '@/lib/utils';
import RichTextEditor from './RichTextEditor';
import { useAdmin } from './AdminProvider';

const field =
  'mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-primary-400 focus:outline-none';
const label = 'block text-sm font-bold text-gray-800';

export default function PostForm({ post }: { post?: Post }) {
  const { user, getToken } = useAdmin();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [slugEdited, setSlugEdited] = useState(Boolean(post));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '');
  const [author, setAuthor] = useState(post?.author ?? user.displayName ?? '');
  const [tags, setTags] = useState(post?.tags.join(', ') ?? '');
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? '');
  const [coverAlt, setCoverAlt] = useState(post?.coverAlt ?? '');
  const [content, setContent] = useState(post?.content ?? '');
  const status: PostStatus = post?.status ?? 'draft';

  const upload = async (file: File) =>
    uploadImage(file, user.uid, await getToken());

  const submit = (nextStatus: PostStatus) => {
    setError(null);
    setNotice(null);
    const input: PostInput = {
      title,
      slug: slug || slugify(title),
      excerpt,
      author,
      tags: tags.split(','),
      coverImage,
      coverAlt,
      content,
      status: nextStatus,
    };
    startTransition(async () => {
      try {
        const saved = await unwrap(
          savePost(await getToken(), post?.id ?? null, input)
        );
        setSlug(saved.slug);
        if (!post) {
          router.replace(`/admin/edit/${saved.id}`);
        } else {
          setNotice(
            nextStatus === 'published' ? 'Published.' : 'Saved as draft.'
          );
          router.refresh();
        }
      } catch (e) {
        setError((e as Error).message);
      }
    });
  };

  const remove = () => {
    if (!post) return;
    if (!window.confirm(`Delete "${post.title}"? This can't be undone.`))
      return;
    startTransition(async () => {
      try {
        await unwrap(deletePost(await getToken(), post.id));
        router.replace('/admin');
      } catch (e) {
        setError((e as Error).message);
      }
    });
  };

  return (
    <form
      onSubmit={e => e.preventDefault()}
      className="grid gap-8 lg:grid-cols-[1fr_20rem]"
    >
      <div className="min-w-0 space-y-5">
        <div>
          <label htmlFor="title" className={label}>
            Title
          </label>
          <input
            id="title"
            value={title}
            onChange={e => {
              setTitle(e.target.value);
              if (!slugEdited) setSlug(slugify(e.target.value));
            }}
            className={`${field} font-display text-2xl`}
            placeholder="What's this post about?"
            required
          />
        </div>
        <div>
          <span className={label}>Story</span>
          <div className="mt-1.5">
            <RichTextEditor
              initialContent={content}
              onChange={setContent}
              onUploadImage={upload}
            />
          </div>
        </div>
      </div>

      <aside className="space-y-5">
        <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-700">
            Status:{' '}
            <strong
              className={
                status === 'published' ? 'text-success-700' : 'text-warning-800'
              }
            >
              {status === 'published' ? 'Published' : 'Draft'}
            </strong>
          </p>
          <button
            type="button"
            disabled={pending}
            onClick={() => submit('published')}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-700 px-4 py-2.5 font-bold text-white hover:bg-primary-800 disabled:opacity-60"
          >
            {pending && (
              <LoaderCircle
                className="h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            )}
            {status === 'published' ? 'Update post' : 'Publish'}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => submit('draft')}
            className="w-full rounded-full border border-gray-300 bg-white px-4 py-2.5 font-bold text-gray-800 hover:bg-gray-100 disabled:opacity-60"
          >
            {status === 'published'
              ? 'Unpublish (move to drafts)'
              : 'Save draft'}
          </button>
          {status === 'published' && post && (
            <Link
              href={`/posts/${post.slug}`}
              target="_blank"
              className="flex items-center justify-center gap-1 text-sm font-bold text-primary-700 hover:underline"
            >
              View live post
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          )}
          {notice && <p className="text-sm text-success-700">{notice}</p>}
          {error && <p className="text-sm text-error-600">{error}</p>}
        </div>

        <div>
          <label htmlFor="slug" className={label}>
            Web address
          </label>
          <div className="mt-1.5 flex items-center rounded-lg border border-gray-300 bg-white pl-3 text-sm text-gray-500 focus-within:border-primary-400">
            /posts/
            <input
              id="slug"
              value={slug}
              onChange={e => {
                setSlugEdited(true);
                setSlug(e.target.value);
              }}
              onBlur={() => setSlug(slugify(slug))}
              className="w-full bg-transparent py-2 pr-3 text-gray-900 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="excerpt" className={label}>
            Short summary
          </label>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            rows={3}
            className={field}
            placeholder="One or two sentences shown in the post list and when shared."
          />
        </div>

        <div>
          <label htmlFor="author" className={label}>
            Byline
          </label>
          <input
            id="author"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            className={field}
          />
        </div>

        <div>
          <label htmlFor="tags" className={label}>
            Topics
          </label>
          <input
            id="tags"
            value={tags}
            onChange={e => setTags(e.target.value)}
            className={field}
            placeholder="Environment, City Hall"
          />
          <p className="mt-1 text-xs text-gray-600">
            Separate topics with commas.
          </p>
        </div>

        <div>
          <span className={label}>Cover photo</span>
          {coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImage}
              alt=""
              className="mt-1.5 aspect-[16/9] w-full rounded-lg border border-gray-200 object-cover"
            />
          )}
          <div className="mt-2 flex items-center gap-3">
            <label className="cursor-pointer rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm font-bold text-gray-800 hover:bg-gray-100">
              {uploadingCover
                ? 'Uploading...'
                : coverImage
                  ? 'Replace'
                  : 'Upload'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                className="hidden"
                disabled={uploadingCover}
                onChange={async e => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (!file) return;
                  setUploadingCover(true);
                  try {
                    setCoverImage(await upload(file));
                  } catch (err) {
                    setError((err as Error).message);
                  } finally {
                    setUploadingCover(false);
                  }
                }}
              />
            </label>
            {coverImage && (
              <button
                type="button"
                onClick={() => setCoverImage('')}
                className="text-sm font-bold text-gray-600 hover:text-error-600"
              >
                Remove
              </button>
            )}
          </div>
          {coverImage && (
            <input
              value={coverAlt}
              onChange={e => setCoverAlt(e.target.value)}
              className={field}
              placeholder="Describe the photo"
              aria-label="Cover photo description"
            />
          )}
        </div>

        {post && (
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="flex items-center gap-1.5 text-sm font-bold text-error-600 hover:text-error-800"
          >
            <Trash className="h-4 w-4" aria-hidden="true" />
            Delete this post
          </button>
        )}
      </aside>
    </form>
  );
}
