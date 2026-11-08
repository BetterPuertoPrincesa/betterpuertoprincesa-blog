import Breadcrumbs, { type BreadcrumbItem } from './Breadcrumbs';
import BalayongBranch from './BalayongBranch';

// Same header as the main portal's interior pages: balayong ground, a
// branch reaching in from the right and a bay-blue rule underneath.
export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  eyebrow,
  children,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  eyebrow?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b-4 border-primary-800 bg-balayong-100">
      <BalayongBranch className="pointer-events-none absolute -top-10 -right-24 w-[20rem] opacity-50 md:-right-10 md:w-[26rem] md:opacity-100" />
      <div className="relative container mx-auto px-4 pt-6 pb-10 md:pb-14">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        {eyebrow && (
          <div className="mt-8 text-sm font-bold tracking-wide text-balayong-800 uppercase">
            {eyebrow}
          </div>
        )}
        <h1
          className={
            eyebrow
              ? 'mt-3 max-w-3xl font-display text-4xl leading-[1.08] text-gray-900 md:text-6xl'
              : 'mt-8 max-w-3xl font-display text-4xl leading-[1.08] text-gray-900 md:text-6xl'
          }
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-700">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </header>
  );
}
