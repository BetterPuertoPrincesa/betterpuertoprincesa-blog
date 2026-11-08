import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="container mx-auto px-4 py-24 text-center">
      <p className="text-sm font-bold tracking-wide text-balayong-700 uppercase">
        Page not found
      </p>
      <h1 className="mt-3 font-display text-4xl md:text-5xl">
        We couldn&apos;t find that page
      </h1>
      <p className="mx-auto mt-4 max-w-md text-gray-700">
        It may have been moved or unpublished. Try the latest posts instead.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-primary-700 px-5 py-2.5 font-bold text-white hover:bg-primary-800"
      >
        Go to the blog
      </Link>
    </section>
  );
}
