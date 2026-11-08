'use client';

import { upload } from '@vercel/blob/client';
import { slugify } from './utils';

// Images are resized in the browser before upload, so Blob only stores
// web-ready files and pages can serve them as-is without Vercel's image
// optimization (which has a monthly cap on the Hobby plan).
const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 0.82;
const MAX_INPUT_BYTES = 25 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 5 * 1024 * 1024;

// GIFs are uploaded untouched so animations survive. SVGs are refused
// because they can carry scripts.
const RESIZABLE = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const PASS_THROUGH = ['image/gif'];

async function resize(file: File): Promise<Blob> {
  // createImageBitmap applies the photo's EXIF rotation, and drawing to a
  // canvas drops the EXIF data itself (including GPS location).
  const bitmap = await createImageBitmap(file, {
    imageOrientation: 'from-image',
  });
  const scale = Math.min(
    1,
    MAX_DIMENSION / Math.max(bitmap.width, bitmap.height)
  );
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('This browser cannot process images.');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>(resolve =>
    canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY)
  );
  // Older Safari can't encode WebP and silently returns PNG; use JPEG then.
  if (blob && blob.type === 'image/webp') return blob;
  const jpeg = await new Promise<Blob | null>(resolve =>
    canvas.toBlob(resolve, 'image/jpeg', WEBP_QUALITY)
  );
  if (!jpeg) throw new Error('Could not process that image.');
  return jpeg;
}

export interface UploadOptions {
  uid: string;
  idToken: string;
  /** Used as the file name, e.g. the post title. A random ending is added
   *  by the server so uploads never overwrite each other. */
  name: string;
  /** Called with 0 to 100 as the file uploads. */
  onProgress?: (percent: number) => void;
}

/** Resizes (when needed) and uploads an image to Vercel Blob, returning
 *  its public URL. The upload route checks the editor's ID token first. */
export async function uploadImage(file: File, options: UploadOptions) {
  const { uid, idToken, name, onProgress } = options;
  const resizable = RESIZABLE.includes(file.type);
  if (!resizable && !PASS_THROUGH.includes(file.type)) {
    throw new Error('Use a JPG, PNG, WebP or GIF image.');
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error('That image is over 25 MB. Try a smaller one.');
  }

  onProgress?.(0);
  const body = resizable ? await resize(file) : file;
  if (body.size > MAX_OUTPUT_BYTES) {
    throw new Error('That image is still over 5 MB after resizing.');
  }

  const ext =
    body.type === 'image/webp'
      ? 'webp'
      : body.type === 'image/gif'
        ? 'gif'
        : 'jpg';
  const base = slugify(name).slice(0, 80).replace(/-+$/, '') || 'untitled';

  const blob = await upload(`blog-images/${uid}/${base}.${ext}`, body, {
    access: 'public',
    handleUploadUrl: '/api/upload',
    clientPayload: JSON.stringify({ idToken }),
    contentType: body.type,
    onUploadProgress: ({ percentage }) =>
      onProgress?.(Math.min(100, Math.round(percentage))),
  });
  onProgress?.(100);
  return blob.url;
}
