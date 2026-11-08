import { Suspense } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import { TagPill } from '@/components/blog/PostList';
import ShareButtons from '@/components/blog/ShareButtons';
import { getPublishedPost } from '@/lib/posts';
import { site } from '@/lib/site';
import { formatDate } from '@/lib/utils';

export async function generateMetadata({
  params,
}: PageProps<'/posts/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return { title: 'Post not found' };
  return {
    title: post.title,
    description: post.excerpt || undefined,
    authors: [{ name: post.author }],
    alternates: { canonical: `/posts/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt || undefined,
      url: `/posts/${post.slug}`,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.tags,
    },
  };
}

// params are read inside Suspense so the route keeps a static shell and
// new posts work without a redeploy.
export default function PostPage({ params }: PageProps<'/posts/[slug]'>) {
  return (
    <Suspense fallback={<PostSkeleton />}>
      <PostContent params={params} />
    </Suspense>
  );
}

async function PostContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();
  const postUrl = `${site.url}/posts/${post.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: { '@type': 'Person', name: post.author },
    image: post.coverImage,
    mainEntityOfPage: postUrl,
    publisher: { '@type': 'Organization', name: 'BetterPuertoPrincesa' },
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <PageHeader
        title={post.title}
        subtitle={post.excerpt || undefined}
        breadcrumbs={[{ label: 'Blog', href: '/' }, { label: post.title }]}
      >
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-700">
          <span className="font-bold text-gray-900">By {post.author}</span>
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
          )}
          <span>{post.readingMinutes} min read</span>
        </div>
        <ShareButtons url={postUrl} title={post.title} className="mt-5" />
      </PageHeader>

      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="mx-auto max-w-[70ch]">
          {post.coverImage && (
            <figure className="mb-10">
              <Image
                src={post.coverImage}
                alt={post.coverAlt ?? ''}
                width={1400}
                height={788}
                priority
                // Already resized in the browser on upload.
                unoptimized
                sizes="(min-width: 768px) 70ch, 100vw"
                className="aspect-[16/9] w-full rounded-xl object-cover"
              />
              {post.coverAlt && (
                <figcaption className="mt-2 text-sm text-gray-600">
                  {post.coverAlt}
                </figcaption>
              )}
            </figure>
          )}

          {/* Sanitized on save and again on read, see lib/sanitize.ts */}
          <div
            className="prose prose-bpp prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <footer className="mt-12 space-y-5 border-t border-gray-200 pt-6">
            <ShareButtons url={postUrl} title={post.title} />
            {post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-gray-700">Topics</span>
                {post.tags.map(tag => (
                  <TagPill key={tag} name={tag} />
                ))}
              </div>
            )}
            <Link
              href="/"
              className="inline-block font-bold text-primary-700 underline-offset-4 hover:underline"
            >
              More from the blog
            </Link>
          </footer>
        </div>
      </div>
    </article>
  );
}

function PostSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading post">
      <div className="border-b-4 border-primary-800 bg-balayong-100">
        <div className="container mx-auto px-4 pt-6 pb-14">
          <div className="h-4 w-40 rounded bg-balayong-200" />
          <div className="mt-8 h-12 max-w-2xl rounded bg-balayong-200" />
          <div className="mt-4 h-5 max-w-xl rounded bg-balayong-200" />
        </div>
      </div>
      <div className="container mx-auto space-y-3 px-4 py-14">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="mx-auto h-4 max-w-[70ch] rounded bg-gray-100"
          />
        ))}
      </div>
    </div>
  );
}
