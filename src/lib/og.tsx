import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import BalayongBranch from '@/components/ui/BalayongBranch';

// Link preview cards (Open Graph / X), drawn in the portal's style: the
// balayong pink ground and branch from the page headers, a bay-blue rule
// along the bottom, and the same fonts as the site.

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = 'image/png';

async function loadAssets() {
  // Literal paths keep the deployment from bundling the whole project.
  const [serif, sansBold, sansRegular, logo] = await Promise.all([
    readFile(path.join(process.cwd(), 'assets/fonts/YoungSerif-Regular.ttf')),
    readFile(
      path.join(process.cwd(), 'assets/fonts/AtkinsonHyperlegibleNext-Bold.ttf')
    ),
    readFile(
      path.join(
        process.cwd(),
        'assets/fonts/AtkinsonHyperlegibleNext-Regular.ttf'
      )
    ),
    readFile(path.join(process.cwd(), 'public/logos/logo.svg'), 'utf8'),
  ]);
  return {
    fonts: [
      { name: 'Young Serif', data: serif, weight: 400 as const },
      { name: 'Atkinson', data: sansBold, weight: 700 as const },
      { name: 'Atkinson', data: sansRegular, weight: 400 as const },
    ],
    logo: `data:image/svg+xml;base64,${Buffer.from(logo).toString('base64')}`,
  };
}

// Long titles step down in size so they stay within three or four lines.
function titleSize(title: string) {
  if (title.length <= 40) return 76;
  if (title.length <= 70) return 64;
  if (title.length <= 110) return 52;
  return 44;
}

export async function renderOgCard({
  eyebrow,
  title,
  details,
}: {
  eyebrow: string;
  title: string;
  details?: string[];
}) {
  const { fonts, logo } = await loadAssets();
  const shownTitle = title.length > 160 ? `${title.slice(0, 157)}...` : title;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        background: '#fbe3ec',
        borderBottom: '14px solid #0e3755',
        fontFamily: 'Atkinson',
        color: '#17212b',
      }}
    >
      <div
        style={{ display: 'flex', position: 'absolute', top: -40, right: -60 }}
      >
        <BalayongBranch width={560} height={420} />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          padding: '56px 72px 52px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} width={163} height={80} alt="" />
          <div
            style={{
              display: 'flex',
              background: '#d94b7f',
              color: 'white',
              borderRadius: 999,
              padding: '6px 18px',
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            BLOG
          </div>
        </div>

        <div
          style={{ display: 'flex', flexDirection: 'column', maxWidth: 900 }}
        >
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: '#9c2652',
              textTransform: 'uppercase',
              letterSpacing: 2,
              marginBottom: 16,
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              fontFamily: 'Young Serif',
              fontSize: titleSize(shownTitle),
              lineHeight: 1.1,
              letterSpacing: -0.5,
            }}
          >
            {shownTitle}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: 26,
            color: '#45505b',
          }}
        >
          <div style={{ display: 'flex', gap: 28 }}>
            {(details ?? []).map(d => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <span style={{ fontWeight: 700, color: '#134a71' }}>
            blog.betterpuertoprincesa.org
          </span>
        </div>
      </div>
    </div>,
    { ...ogSize, fonts }
  );
}
