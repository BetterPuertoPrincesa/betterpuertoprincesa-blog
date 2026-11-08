'use client';

import { useRef, useState } from 'react';
import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function ToolButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={e => e.preventDefault()}
      onClick={onClick}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-md text-gray-700 transition-colors hover:bg-balayong-50 hover:text-balayong-800 disabled:opacity-40',
        active && 'bg-balayong-100 text-balayong-800'
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({
  editor,
  onPickImage,
}: {
  editor: Editor;
  onPickImage: () => void;
}) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      underline: e.isActive('underline'),
      strike: e.isActive('strike'),
      h2: e.isActive('heading', { level: 2 }),
      h3: e.isActive('heading', { level: 3 }),
      bullet: e.isActive('bulletList'),
      ordered: e.isActive('orderedList'),
      quote: e.isActive('blockquote'),
      code: e.isActive('codeBlock'),
      link: e.isActive('link'),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const setLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt(
      'Link address (leave empty to remove)',
      previous ?? 'https://'
    );
    if (url === null) return;
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url.trim() })
      .run();
  };

  const chain = () => editor.chain().focus();
  const icon = 'h-4 w-4';
  const divider = (
    <span className="mx-1 h-6 w-px bg-gray-200" aria-hidden="true" />
  );

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-white p-1.5"
    >
      <ToolButton
        label="Bold"
        active={s.bold}
        onClick={() => chain().toggleBold().run()}
      >
        <Bold className={icon} />
      </ToolButton>
      <ToolButton
        label="Italic"
        active={s.italic}
        onClick={() => chain().toggleItalic().run()}
      >
        <Italic className={icon} />
      </ToolButton>
      <ToolButton
        label="Underline"
        active={s.underline}
        onClick={() => chain().toggleUnderline().run()}
      >
        <Underline className={icon} />
      </ToolButton>
      <ToolButton
        label="Strikethrough"
        active={s.strike}
        onClick={() => chain().toggleStrike().run()}
      >
        <Strikethrough className={icon} />
      </ToolButton>
      {divider}
      <ToolButton
        label="Heading"
        active={s.h2}
        onClick={() => chain().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className={icon} />
      </ToolButton>
      <ToolButton
        label="Subheading"
        active={s.h3}
        onClick={() => chain().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className={icon} />
      </ToolButton>
      {divider}
      <ToolButton
        label="Bulleted list"
        active={s.bullet}
        onClick={() => chain().toggleBulletList().run()}
      >
        <List className={icon} />
      </ToolButton>
      <ToolButton
        label="Numbered list"
        active={s.ordered}
        onClick={() => chain().toggleOrderedList().run()}
      >
        <ListOrdered className={icon} />
      </ToolButton>
      <ToolButton
        label="Quote"
        active={s.quote}
        onClick={() => chain().toggleBlockquote().run()}
      >
        <Quote className={icon} />
      </ToolButton>
      <ToolButton
        label="Code block"
        active={s.code}
        onClick={() => chain().toggleCodeBlock().run()}
      >
        <Code className={icon} />
      </ToolButton>
      <ToolButton
        label="Divider line"
        onClick={() => chain().setHorizontalRule().run()}
      >
        <Minus className={icon} />
      </ToolButton>
      {divider}
      <ToolButton label="Link" active={s.link} onClick={setLink}>
        <Link2 className={icon} />
      </ToolButton>
      <ToolButton label="Insert image" onClick={onPickImage}>
        <ImagePlus className={icon} />
      </ToolButton>
      {divider}
      <ToolButton
        label="Undo"
        disabled={!s.canUndo}
        onClick={() => chain().undo().run()}
      >
        <Undo2 className={icon} />
      </ToolButton>
      <ToolButton
        label="Redo"
        disabled={!s.canRedo}
        onClick={() => chain().redo().run()}
      >
        <Redo2 className={icon} />
      </ToolButton>
    </div>
  );
}

export default function RichTextEditor({
  initialContent,
  onChange,
  onUploadImage,
}: {
  initialContent: string;
  onChange: (html: string) => void;
  onUploadImage: (
    file: File,
    onProgress: (percent: number) => void
  ) => Promise<string>;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const editor = useEditor({
    // Avoid a hydration mismatch: the editor only exists in the browser.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      }),
      Image,
      Placeholder.configure({ placeholder: 'Start writing your story...' }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          'prose prose-bpp max-w-none min-h-[24rem] px-5 py-4 focus:outline-none',
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  const insertImage = async (file: File) => {
    if (!editor) return;
    setProgress(0);
    try {
      const src = await onUploadImage(file, setProgress);
      const alt =
        window.prompt(
          'Describe the image for people using screen readers',
          ''
        ) ?? '';
      editor.chain().focus().setImage({ src, alt }).run();
    } catch (e) {
      window.alert((e as Error).message);
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white focus-within:border-primary-400">
      {editor ? (
        <Toolbar
          editor={editor}
          onPickImage={() => {
            if (progress === null) fileInput.current?.click();
          }}
        />
      ) : (
        <div className="h-12 border-b border-gray-200" />
      )}
      {progress !== null && (
        <div className="flex items-center gap-3 border-b border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700">
          <span className="shrink-0">Uploading image {progress}%</span>
          <div
            role="progressbar"
            aria-label="Image upload progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="h-2 w-full overflow-hidden rounded-full bg-gray-200"
          >
            <div
              className="h-full rounded-full bg-primary-600 transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      <EditorContent editor={editor} />
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) insertImage(file);
        }}
      />
    </div>
  );
}
