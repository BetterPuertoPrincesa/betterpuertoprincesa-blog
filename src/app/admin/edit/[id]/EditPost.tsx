'use client';

import { use, useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useAdmin } from '@/components/admin/AdminProvider';
import PostForm from '@/components/admin/PostForm';
import type { Post } from '@/lib/posts';
import { unwrap } from '@/lib/action-result';
import { getPostForEditing } from '../../actions';

export default function EditPost({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getToken } = useAdmin();
  const [post, setPost] = useState<Post | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getToken()
      .then(token => unwrap(getPostForEditing(token, id)))
      .then(setPost)
      .catch(e => setError((e as Error).message));
  }, [getToken, id]);

  if (error) return <p className="text-error-600">{error}</p>;
  if (post === undefined) {
    return (
      <LoaderCircle
        className="h-6 w-6 animate-spin text-primary-600"
        aria-label="Loading post"
      />
    );
  }
  if (post === null) return <p>That post doesn&apos;t exist anymore.</p>;
  // key forces a fresh editor if the route switches to another post.
  return <PostForm key={post.id} post={post} />;
}
