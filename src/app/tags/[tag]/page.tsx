import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import PostList from '@/components/blog/PostList';
import { getAllTags, getPostsByTag } from '@/lib/posts';

// Same caching as post pages; see posts/[slug]/page.tsx.
export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.length
    ? tags.map(tag => ({ tag: tag.slug }))
    : [{ tag: 'no-topics-yet' }];
}

async function findTag(slug: string) {
  return (await getAllTags()).find(t => t.slug === slug);
}

export async function generateMetadata({
  params,
}: PageProps<'/tags/[tag]'>): Promise<Metadata> {
  const tag = await findTag((await params).tag);
  if (!tag) return { title: 'Topic not found' };
  return {
    title: tag.name,
    description: `Blog posts about ${tag.name}.`,
    alternates: { canonical: `/tags/${tag.slug}` },
  };
}

export default function TagPage({ params }: PageProps<'/tags/[tag]'>) {
  return (
    <Suspense>
      <TagContent params={params} />
    </Suspense>
  );
}

async function TagContent({ params }: { params: Promise<{ tag: string }> }) {
  const tag = await findTag((await params).tag);
  if (!tag) notFound();
  const posts = await getPostsByTag(tag.slug);

  return (
    <>
      <PageHeader
        eyebrow="Topic"
        title={tag.name}
        subtitle={`${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`}
        breadcrumbs={[
          { label: 'Blog', href: '/' },
          { label: 'Topics', href: '/tags' },
          { label: tag.name },
        ]}
      />
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl">
          <PostList posts={posts} />
        </div>
      </section>
    </>
  );
}
