'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ArrowLeft, ExternalLink, Menu, X } from 'lucide-react';
import { MAIN_SITE_URL, mainNavigation, type NavLink } from '@/lib/site';
import { cn, isExternal } from '@/lib/utils';

function isActive(href: string, pathname: string) {
  if (isExternal(href)) return false;
  if (href === '/') return pathname === '/' || pathname.startsWith('/posts');
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavItem({
  item,
  className,
  onClick,
}: {
  item: NavLink;
  className: string;
  onClick?: () => void;
}) {
  if (!isExternal(item.href)) {
    return (
      <Link href={item.href} className={className} onClick={onClick}>
        {item.label}
      </Link>
    );
  }
  return (
    <a
      href={item.href}
      className={className}
      onClick={onClick}
      target="_blank"
      rel="noopener noreferrer"
    >
      {item.label}
      <ExternalLink className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
    </a>
  );
}

// The active-link highlight needs the URL, which is only known at request
// time. The layout renders <Navbar /> as a Suspense fallback (no highlight)
// and swaps in <NavbarWithPath /> once the pathname streams in.
export function NavbarWithPath() {
  return <Navbar pathname={usePathname()} />;
}

export default function Navbar({ pathname = '' }: { pathname?: string }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-white">
      {/* Top bar: way back to the main portal + official site link */}
      <div className="bg-primary-800 text-primary-100">
        <div className="container mx-auto flex h-11 items-center justify-between gap-4 px-4">
          <a
            href={MAIN_SITE_URL}
            className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-balayong-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            BetterPuertoPrincesa.org
          </a>
          <div className="flex items-center gap-5">
            <a
              href="/feed.xml"
              className="hidden text-xs hover:text-white sm:inline"
            >
              RSS
            </a>
            <a
              href="https://puertoprincesa.ph"
              className="text-xs hover:text-white"
              target="_blank"
              rel="noreferrer"
            >
              Official city website
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="-mb-3 flex shrink-0 items-end gap-3 self-end"
            onClick={close}
          >
            <Image
              src="/logos/logo.svg"
              alt="BetterPuertoPrincesa"
              width={851}
              height={418}
              priority
              className="block h-16 w-auto md:h-20"
            />
            <span className="mb-4 rounded-full bg-balayong-500 px-2.5 py-0.5 text-xs font-bold tracking-wide text-white uppercase md:mb-5">
              Blog
            </span>
          </Link>

          <div className="hidden shrink-0 items-center gap-1 lg:flex">
            {mainNavigation.map(item => (
              <NavItem
                key={item.label}
                item={item}
                className={cn(
                  'flex items-center rounded-full px-3 py-2 text-sm font-bold text-gray-800 transition-colors hover:bg-balayong-50 hover:text-balayong-800',
                  isActive(item.href, pathname) &&
                    'bg-balayong-100 text-balayong-800'
                )}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="inline-flex items-center justify-center rounded-full p-2 text-gray-800 hover:bg-balayong-50 lg:hidden"
          >
            <span className="sr-only">
              {open ? 'Close main menu' : 'Open main menu'}
            </span>
            {open ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={cn(
          'max-h-[calc(100vh-7rem)] overflow-y-auto border-b border-gray-200 bg-white lg:hidden',
          open ? 'block' : 'hidden'
        )}
      >
        <div className="container mx-auto space-y-1 px-4 py-3">
          {mainNavigation.map(item => (
            <NavItem
              key={item.label}
              item={item}
              onClick={close}
              className={cn(
                'flex items-center rounded-lg px-3 py-2.5 font-bold text-gray-800 hover:bg-balayong-50',
                isActive(item.href, pathname) &&
                  'bg-balayong-100 text-balayong-800'
              )}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
