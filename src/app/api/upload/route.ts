import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { requireEditor } from '@/lib/editors';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// Issues short-lived Vercel Blob upload tokens. The browser uploads the
// file straight to Blob storage; this route only decides who may do it.
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const { idToken } = JSON.parse(clientPayload ?? '{}') as {
          idToken?: string;
        };
        if (!idToken) throw new Error('Sign in first.');
        const { uid } = await requireEditor(idToken);
        if (!pathname.startsWith(`blog-images/${uid}/`)) {
          throw new Error('Uploads must go in your own folder.');
        }
        return {
          allowedContentTypes: ['image/webp', 'image/jpeg', 'image/gif'],
          maximumSizeInBytes: MAX_IMAGE_BYTES,
          addRandomSuffix: true,
          cacheControlMaxAge: 60 * 60 * 24 * 365,
        };
      },
    });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
