'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LoaderCircle, Plus } from 'lucide-react';
import { useAdmin } from '@/components/admin/AdminProvider';
import type { PostMeta } from '@/lib/posts';
import { formatDate } from '@/lib/utils';
import { unwrap } from '@/lib/action-result';
import { listAllPosts } from './actions';

export default function AdminHome() {
  const { getToken } = useAdmin();
  const [posts, setPosts] = useState<PostMeta[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getToken()
      .then(token => unwrap(listAllPosts(token)))
      .then(setPosts)
      .catch(e => setError((e as Error).message));
  }, [getToken]);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl">Your posts</h1>
        <Link
          href="/admin/new"
          className="flex items-center gap-1.5 rounded-full bg-primary-700 px-4 py-2.5 font-bold text-white hover:bg-primary-800"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New post
        </Link>
      </div>

      {error && <p className="mt-6 text-error-600">{error}</p>}

      {!posts && !error && (
        <LoaderCircle
          className="mt-10 h-6 w-6 animate-spin text-primary-600"
          aria-label="Loading posts"
        />
      )}

      {posts && posts.length === 0 && (
        <p className="mt-8 rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-600">
          Nothing here yet. Start with a new post.
        </p>
      )}

      {posts && posts.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 font-bold">Title</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Last edited</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr
                  key={post.id}
                  className="border-t border-gray-200 hover:bg-balayong-50/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/edit/${post.id}`}
                      className="font-bold text-primary-700 hover:underline"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {post.status === 'published' ? (
                      <span className="rounded-full bg-success-50 px-2.5 py-0.5 font-bold text-success-700">
                        Published
                      </span>
                    ) : (
                      <span className="rounded-full bg-warning-50 px-2.5 py-0.5 font-bold text-warning-800">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {post.updatedAt ? formatDate(post.updatedAt, 'short') : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
