'use client';

import { useState, useSyncExternalStore } from 'react';
import { Check, Link2, Mail, Share2 } from 'lucide-react';
import { SocialIcon } from '@/components/ui/SocialIcon';
import { cn } from '@/lib/utils';

const noop = () => () => {};

const button =
  'flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition-colors hover:border-balayong-300 hover:bg-balayong-50 hover:text-balayong-800';

export default function ShareButtons({
  url,
  title,
  className,
}: {
  url: string;
  title: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  // The phone share sheet (Messenger, Viber, WhatsApp...) only exists in
  // some browsers, so its button appears after mount when supported.
  const canNativeShare = useSyncExternalStore(
    noop,
    () => typeof navigator.share === 'function',
    () => false
  );

  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  const links = [
    {
      label: 'Share on Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      icon: <SocialIcon name="Facebook" className="h-4 w-4" />,
    },
    {
      label: 'Share on X',
      href: `https://x.com/intent/post?url=${u}&text=${t}`,
      icon: <SocialIcon name="X" className="h-4 w-4" />,
    },
    {
      label: 'Share on LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
      icon: <SocialIcon name="LinkedIn" className="h-4 w-4" />,
    },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link', url);
    }
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="mr-1 text-sm font-bold text-gray-700">Share</span>
      {canNativeShare && (
        <button
          type="button"
          className={button}
          aria-label="Share using your device"
          title="Share using your device"
          onClick={() => navigator.share({ title, url }).catch(() => {})}
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
      {links.map(link => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={button}
          aria-label={link.label}
          title={link.label}
        >
          {link.icon}
        </a>
      ))}
      <a
        href={`mailto:?subject=${t}&body=${encodeURIComponent(`${title}\n\n${url}`)}`}
        className={button}
        aria-label="Share by email"
        title="Share by email"
      >
        <Mail className="h-4 w-4" aria-hidden="true" />
      </a>
      <button
        type="button"
        onClick={copy}
        className={cn(button, copied && 'border-success-300 text-success-700')}
        aria-label={copied ? 'Link copied' : 'Copy link'}
        title={copied ? 'Link copied' : 'Copy link'}
      >
        {copied ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Link2 className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? 'Link copied to clipboard' : ''}
      </span>
    </div>
  );
}
