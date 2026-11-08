import { Fragment } from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'flex flex-wrap items-center gap-1 text-sm text-gray-600',
        className
      )}
    >
      {items.map((item, index) => (
        <Fragment key={`${item.label}-${index}`}>
          {index === 0 && (
            <Home className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
          )}
          {index > 0 && (
            <ChevronRight
              className="h-4 w-4 text-gray-400"
              strokeWidth={2.5}
              aria-hidden="true"
            />
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="transition-colors duration-200 hover:text-primary-600"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className="line-clamp-1 font-medium text-gray-900"
              aria-current="page"
            >
              {item.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
