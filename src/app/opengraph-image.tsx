import { ogContentType, ogSize, renderOgCard } from '@/lib/og';

export const alt = 'The BetterPuertoPrincesa Blog';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgCard({
    eyebrow: 'BetterPuertoPrincesa.org',
    title: 'The BetterPuertoPrincesa Blog',
    details: ['News, guides and updates from Puerto Princesa'],
  });
}
