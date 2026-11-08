import Link from 'next/link';
import Image from 'next/image';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { REPO_URL, footerSections, site, socialLinks } from '@/lib/site';
import { isExternal } from '@/lib/utils';

function FooterLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  // Route handlers like /feed.xml aren't pages, so plain <a> for them too.
  if (isExternal(href) || href.endsWith('.xml')) {
    return (
      <a
        href={href}
        className={className}
        {...(isExternal(href) && {
          target: '_blank',
          rel: 'noopener noreferrer',
        })}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-white">
      <div className="container mx-auto px-4 pt-14 pb-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Image
              src="/logos/logo-white.svg"
              alt="BetterPuertoPrincesa"
              width={851}
              height={418}
              className="mb-4 h-16 w-auto"
            />
            <p className="mb-5 max-w-xs text-primary-100">{site.tagline}</p>
            <div className="flex gap-2.5">
              {socialLinks.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/10 text-primary-100 transition-colors hover:bg-balayong-300 hover:text-gray-900"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                >
                  <SocialIcon name={link.label} className="h-[18px] w-[18px]" />
                </a>
              ))}
              <a
                href="https://bettergov.ph"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="BetterGov.ph"
                className="ml-1 flex h-10 items-center opacity-90 transition-opacity hover:opacity-100"
              >
                <Image
                  src="/logos/bettergov-white.svg"
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12"
                />
              </a>
            </div>
          </div>

          {footerSections.map(section => (
            <div key={section.title}>
              <h2 className="mb-4 font-display text-xl">{section.title}</h2>
              <ul className="space-y-2.5">
                {section.links.map(link => (
                  <li key={link.label}>
                    <FooterLink
                      href={link.href}
                      className="text-primary-100 underline-offset-4 hover:text-balayong-200 hover:underline"
                    >
                      {link.label}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-primary-700 pt-6 text-sm text-primary-200 md:flex-row md:items-center md:justify-between">
          <p>{site.copyright}</p>
          <a
            href={REPO_URL}
            className="text-primary-100 underline underline-offset-4 hover:text-balayong-200"
            target="_blank"
            rel="noopener noreferrer"
          >
            Suggest a fix on GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
