import PageHeader from '@/components/ui/PageHeader';
import PostList from '@/components/blog/PostList';
import { getPublishedPosts } from '@/lib/posts';

export default async function HomePage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <PageHeader
        eyebrow="BetterPuertoPrincesa.org"
        title="The BetterPuertoPrincesa Blog"
        subtitle="News, guides and updates from the volunteers building a better portal for Puerto Princesa. Learn what's new on the site, how to get things done at City Hall, and where your city's money goes."
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
