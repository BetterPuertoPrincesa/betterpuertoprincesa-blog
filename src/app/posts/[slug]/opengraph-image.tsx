import { ogContentType, ogSize, renderOgCard } from '@/lib/og';
import { getPublishedPost } from '@/lib/posts';
import { formatDate } from '@/lib/utils';

export const alt = 'BetterPuertoPrincesa blog post';
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);

  if (!post) {
    return renderOgCard({
      eyebrow: 'BetterPuertoPrincesa.org',
      title: 'The BetterPuertoPrincesa Blog',
    });
  }

  return renderOgCard({
    eyebrow: post.tags[0] ?? 'Blog',
    title: post.title,
    details: [
      `By ${post.author}`,
      ...(post.publishedAt ? [formatDate(post.publishedAt)] : []),
    ],
  });
}
