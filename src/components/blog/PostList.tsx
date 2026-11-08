import Link from 'next/link';
import type { PostMeta } from '@/lib/posts';
import { slugify } from '@/lib/utils';

// Dated like the main portal's news list: a desk-calendar tile with the
// day large in the display serif, month and year beneath.
function DateTile({ iso }: { iso: string }) {
  const date = new Date(iso);
  const opts = { timeZone: 'Asia/Manila' } as const;
  return (
    <time
      dateTime={iso}
      className="flex flex-col items-center self-start rounded-lg bg-balayong-100 py-2 text-balayong-800"
    >
      <span className="font-display text-3xl leading-none tabular-nums">
        {date.toLocaleDateString('en-PH', { ...opts, day: 'numeric' })}
      </span>
      <span className="mt-1 text-xs font-bold">
        {date.toLocaleDateString('en-PH', {
          ...opts,
          month: 'short',
          year: 'numeric',
        })}
      </span>
    </time>
  );
}

export function TagPill({ name }: { name: string }) {
  return (
    <Link
      href={`/tags/${slugify(name)}`}
      className="relative z-10 rounded-full border border-balayong-200 bg-white px-2.5 py-0.5 text-xs font-bold text-balayong-800 transition-colors hover:border-balayong-400 hover:bg-balayong-50"
    >
      {name}
    </Link>
  );
}

export default function PostList({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-600">
        No posts yet. Check back soon.
      </p>
    );
  }

  return (
    <ul className="border-t border-gray-200">
      {posts.map(post => (
        <li key={post.id} className="border-b border-gray-200">
          <article className="group relative -mx-3 grid grid-cols-[4rem_1fr] gap-4 rounded-lg px-3 py-6 transition-colors hover:bg-balayong-100/50 sm:grid-cols-[5rem_1fr] sm:gap-6">
            {post.publishedAt && <DateTile iso={post.publishedAt} />}
            <div className="min-w-0">
              <h2 className="font-display text-2xl leading-snug text-gray-900">
                <Link
                  href={`/posts/${post.slug}`}
                  className="after:absolute after:inset-0 group-hover:text-primary-700"
                >
                  {post.title}
                </Link>
              </h2>
              {post.excerpt && (
                <p className="mt-2 line-clamp-3 leading-relaxed text-gray-700">
                  {post.excerpt}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                <span>By {post.author}</span>
                <span>{post.readingMinutes} min read</span>
                {post.tags.length > 0 && (
                  <span className="flex flex-wrap gap-1.5 sm:ml-2">
                    {post.tags.map(tag => (
                      <TagPill key={tag} name={tag} />
                    ))}
                  </span>
                )}
              </div>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
