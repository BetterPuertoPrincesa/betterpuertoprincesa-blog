// Site-wide constants. The blog is a satellite of the main portal, so most
// navigation points back to betterpuertoprincesa.org.

export const MAIN_SITE_URL = 'https://betterpuertoprincesa.org';
export const REPO_URL =
  'https://github.com/BetterPuertoPrincesa/betterpuertoprincesa-blog';

function resolveSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  // Preview deployments get their own origin so OG/canonical URLs resolve.
  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'https://blog.betterpuertoprincesa.org';
}

export const site = {
  name: 'BetterPuertoPrincesa.org Blog',
  shortName: 'BPP Blog',
  // Browser tab titles: "Blog | BetterPuertoPrincesa.org" on the home
  // page, "<page or post title> | BetterPuertoPrincesa.org" elsewhere.
  titleSuffix: 'BetterPuertoPrincesa.org',
  description:
    'News, guides and updates from BetterPuertoPrincesa.org, the volunteer-run portal for the people of Puerto Princesa City, Palawan.',
  url: resolveSiteUrl().replace(/\/$/, ''),
  locale: 'en_PH',
  tagline: 'Run by volunteers in Puerto Princesa, Palawan.',
  copyright:
    '© 2026 BetterPuertoPrincesa. All content is public domain unless otherwise specified.',
};

export interface NavLink {
  label: string;
  href: string;
}

export const mainNavigation: NavLink[] = [
  { label: 'Latest', href: '/' },
  { label: 'Topics', href: '/tags' },
  { label: 'Services', href: `${MAIN_SITE_URL}/services` },
  { label: 'Government', href: `${MAIN_SITE_URL}/government/departments` },
  { label: 'Statistics', href: `${MAIN_SITE_URL}/statistics` },
  { label: 'Transparency', href: 'https://budget.betterpuertoprincesa.org/' },
];

export const footerSections: { title: string; links: NavLink[] }[] = [
  {
    title: 'Blog',
    links: [
      { label: 'Latest posts', href: '/' },
      { label: 'Topics', href: '/tags' },
      { label: 'RSS feed', href: '/feed.xml' },
    ],
  },
  {
    title: 'Puerto Princesa',
    links: [
      { label: 'BetterPuertoPrincesa.org', href: MAIN_SITE_URL },
      { label: 'Every service', href: `${MAIN_SITE_URL}/services` },
      { label: 'City hall news', href: `${MAIN_SITE_URL}/news` },
      { label: 'Mining Watch', href: `${MAIN_SITE_URL}/mining-watch` },
      { label: 'City Government Website', href: 'https://puertoprincesa.ph' },
    ],
  },
  {
    title: 'Government',
    links: [
      { label: 'Open Data', href: 'https://data.gov.ph' },
      { label: 'Freedom of Information', href: 'https://www.foi.gov.ph' },
      {
        label: 'Contact Center',
        href: 'https://contactcenterngbayan.gov.ph',
      },
      {
        label: 'Official Gazette',
        href: 'https://www.officialgazette.gov.ph',
      },
    ],
  },
];

export const socialLinks = [
  { label: 'Facebook', href: 'https://www.facebook.com/betterpuertoprincesa' },
  {
    label: 'GitHub',
    href: 'https://github.com/BetterPuertoPrincesa/betterpuertoprincesa',
  },
  { label: 'Discord', href: 'https://discord.gg/DzwTq7MjfS' },
];
