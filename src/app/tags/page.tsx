import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import { getAllTags } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Topics',
  description: 'Browse blog posts by topic.',
  alternates: { canonical: '/tags' },
};

export default async function TagsPage() {
  const tags = await getAllTags();

  return (
    <>
      <PageHeader
        title="Topics"
        subtitle="Pick a topic to see every post filed under it."
        breadcrumbs={[{ label: 'Blog', href: '/' }, { label: 'Topics' }]}
      />
      <section className="container mx-auto px-4 py-12 md:py-16">
        {tags.length === 0 ? (
          <p className="text-gray-600">No topics yet.</p>
        ) : (
          <ul className="flex flex-wrap gap-3">
            {tags.map(tag => (
              <li key={tag.slug}>
                <Link
                  href={`/tags/${tag.slug}`}
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 font-bold text-gray-800 transition-colors hover:border-balayong-300 hover:bg-balayong-50 hover:text-balayong-800"
                >
                  {tag.name}
                  <span className="rounded-full bg-balayong-100 px-2 text-xs text-balayong-800 tabular-nums">
                    {tag.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
