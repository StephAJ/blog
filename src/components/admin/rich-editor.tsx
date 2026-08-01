"use client";

import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { cn } from "@/lib/utils";

function ToolbarButton({
  onClick,
  active,
  label,
  children,
  disabled,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "grid size-8 place-items-center rounded-md transition disabled:opacity-40",
        active
          ? "bg-brand-600 text-white"
          : "text-body hover:surface-subtle hover:text-accent",
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 h-5 w-px bg-[var(--border-subtle)]" />;
}

function Toolbar({
  editor,
  onUploadClick,
  uploading,
}: {
  editor: Editor;
  onUploadClick: () => void;
  uploading: boolean;
}) {
  const setLink = useCallback(() => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b hairline bg-[var(--surface-card)] px-2 py-2">
      <ToolbarButton
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Strikethrough"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough size={15} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 size={15} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Quote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Code block"
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Divider"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus size={15} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton label="Add link" active={editor.isActive("link")} onClick={setLink}>
        <Link2 size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Remove link"
        disabled={!editor.isActive("link")}
        onClick={() => editor.chain().focus().unsetLink().run()}
      >
        <Link2Off size={15} />
      </ToolbarButton>
      <ToolbarButton label="Insert image" onClick={onUploadClick} disabled={uploading}>
        {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Align left"
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <AlignLeft size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Align centre"
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenter size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Align right"
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <AlignRight size={15} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Undo"
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Redo"
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 size={15} />
      </ToolbarButton>
    </div>
  );
}

export function RichEditor({
  name,
  defaultValue = "",
  placeholder = "Start writing…",
  onChange,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: (html: string, text: string) => void;
}) {
  const [html, setHtml] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        },
      }),
      Image.configure({ HTMLAttributes: { loading: "lazy", decoding: "async" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class: "tiptap prose-article prose max-w-none dark:prose-invert px-5 py-6",
      },
    },
    onUpdate({ editor }) {
      const next = editor.getHTML();
      setHtml(next);
      onChange?.(next, editor.getText());
    },
  });

  async function upload(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await response.json();

      if (!response.ok) {
        window.alert(data.error ?? "Upload failed.");
        return;
      }
      editor?.chain().focus().setImage({ src: data.url, alt: "" }).run();
    } catch {
      window.alert("Upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  if (!editor) {
    return (
      <div className="grid h-96 place-items-center rounded-xl border hairline surface text-sm text-faint">
        Loading editor…
      </div>
    );
  }

  const words = editor.storage.characterCount?.words?.() ?? 0;
  const characters = editor.storage.characterCount?.characters?.() ?? 0;

  return (
    <div className="overflow-hidden rounded-xl border hairline surface">
      <Toolbar
        editor={editor}
        uploading={uploading}
        onUploadClick={() => fileInput.current?.click()}
      />

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) upload(file);
          event.target.value = "";
        }}
      />

      <EditorContent editor={editor} />

      <div className="flex items-center justify-between border-t hairline surface-subtle px-5 py-2.5 text-xs text-faint">
        <span>
          {words} words · {characters} characters
        </span>
        <span>~{Math.max(1, Math.round(words / 220))} min read</span>
      </div>

      <input type="hidden" name={name} value={html} />
    </div>
  );
}
