import type { MetadataRoute } from 'next';
import { getAllTags, getPublishedPosts } from '@/lib/posts';
import { site } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, tags] = await Promise.all([getPublishedPosts(), getAllTags()]);
  return [
    { url: site.url, changeFrequency: 'weekly', priority: 1 },
    { url: `${site.url}/tags`, changeFrequency: 'weekly', priority: 0.5 },
    ...posts.map(post => ({
      url: `${site.url}/posts/${post.slug}`,
      lastModified: post.updatedAt ?? post.publishedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...tags.map(tag => ({
      url: `${site.url}/tags/${tag.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.4,
    })),
  ];
}
