"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function RichTextEditor({
  content,
  onChange,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      ImageExtension,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  function addLink() {
    const url = window.prompt("URLを入力してください");
    if (url) {
      editor!.chain().focus().setLink({ href: url }).run();
    }
  }

  function addImage() {
    const url = window.prompt("画像URLを入力してください");
    if (url) {
      editor!.chain().focus().setImage({ src: url }).run();
    }
  }

  return (
    <div className="rounded-md border border-gray-300">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200 p-2">
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        >
          B
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        >
          I
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          &#8226; List
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        >
          1. List
        </ToolbarButton>
        <ToolbarButton onClick={addLink} active={editor.isActive("link")}>
          Link
        </ToolbarButton>
        <ToolbarButton onClick={addImage} active={false}>
          Image
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().setTextAlign("left").run()
          }
          active={editor.isActive({ textAlign: "left" })}
        >
          Left
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().setTextAlign("center").run()
          }
          active={editor.isActive({ textAlign: "center" })}
        >
          Center
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="prose max-w-none p-4 focus:outline-none [&_.ProseMirror]:min-h-[200px] [&_.ProseMirror]:focus:outline-none"
      />
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-2 py-1 text-xs font-medium ${
        active
          ? "bg-primary text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
}
