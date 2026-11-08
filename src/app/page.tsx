import PageHeader from '@/components/ui/PageHeader';
import PostList from '@/components/blog/PostList';
import { getPublishedPosts } from '@/lib/posts';

export default async function HomePage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <PageHeader
        title="Notes from the bay"
        subtitle="What we're building at BetterPuertoPrincesa.org, why it matters, and plain-language explainers on how the city works."
        breadcrumbs={[
          {
            label: 'BetterPuertoPrincesa.org',
            href: 'https://betterpuertoprincesa.org',
          },
          { label: 'Blog' },
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
