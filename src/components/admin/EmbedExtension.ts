import { mergeAttributes, Node } from '@tiptap/react';
import {
  clampEmbedHeight,
  DEFAULT_EMBED_HEIGHT,
  EMBED_IFRAME_ATTRS,
  isAllowedEmbedSrc,
  type EmbedInput,
} from '@/lib/embeds';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    embed: {
      setEmbed: (attrs: EmbedInput) => ReturnType;
    };
  }
}

// An iframe from an allowlisted chart, map or video site. Stored as a plain
// <iframe>; lib/sanitize.ts enforces the same allowlist on save and read.
export const Embed = Node.create({
  name: 'embed',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      title: { default: '' },
      height: {
        default: DEFAULT_EMBED_HEIGHT,
        parseHTML: el => clampEmbedHeight(el.getAttribute('height')),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'iframe[src]',
        getAttrs: el =>
          isAllowedEmbedSrc((el as HTMLElement).getAttribute('src'))
            ? null
            : false,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['iframe', mergeAttributes(HTMLAttributes, EMBED_IFRAME_ATTRS)];
  },

  addCommands() {
    return {
      setEmbed:
        attrs =>
        ({ commands }) =>
          isAllowedEmbedSrc(attrs.src) &&
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});
