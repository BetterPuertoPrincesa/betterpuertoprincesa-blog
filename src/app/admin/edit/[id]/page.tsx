import { Suspense } from 'react';
import Link from 'next/link';
import EditPost from './EditPost';

export default function EditPostPage({
  params,
}: PageProps<'/admin/edit/[id]'>) {
  return (
    <div className="container mx-auto px-4 py-10">
      <Link
        href="/admin"
        className="text-sm font-bold text-primary-700 hover:underline"
      >
        Back to all posts
      </Link>
      <h1 className="mt-3 mb-8 font-display text-4xl">Edit post</h1>
      <Suspense>
        <EditPost params={params} />
      </Suspense>
    </div>
  );
}
