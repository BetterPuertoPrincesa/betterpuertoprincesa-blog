import Link from 'next/link';
import PostForm from '@/components/admin/PostForm';

export default function NewPostPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <Link
        href="/admin"
        className="text-sm font-bold text-primary-700 hover:underline"
      >
        Back to all posts
      </Link>
      <h1 className="mt-3 mb-8 font-display text-4xl">New post</h1>
      <PostForm />
    </div>
  );
}
