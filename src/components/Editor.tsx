"use client";

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { useEffect } from 'react';

type EditorProps = {
  content?: string;
  onChange?: (content: string) => void;
  editable?: boolean;
};

export default function Editor({ content = "", onChange, editable = true }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 border border-gray-300 rounded-md',
      },
    },
  });

  // Update editor content if props value changes (e.g. initial load)
  useEffect(() => {
    if (editor && content) {
      if (editor.getHTML() !== content) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full">
      {editable && (
        <div className="flex flex-wrap gap-2 mb-4 border-b pb-4 sticky top-0 bg-white z-10">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-3 py-1 border rounded ${editor.isActive('bold') ? 'bg-black text-white' : 'bg-white'}`}
            type="button"
          >
            B
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-3 py-1 border rounded ${editor.isActive('italic') ? 'bg-black text-white' : 'bg-white'}`}
            type="button"
          >
            I
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-3 py-1 border rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-black text-white' : 'bg-white'}`}
            type="button"
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-3 py-1 border rounded ${editor.isActive('bulletList') ? 'bg-black text-white' : 'bg-white'}`}
            type="button"
          >
            List
          </button>
          <button
            onClick={() => {
              const url = window.prompt('URL')
              if (url) {
                editor.chain().focus().setLink({ href: url }).run()
              }
            }}
            className={`px-3 py-1 border rounded ${editor.isActive('link') ? 'bg-black text-white' : 'bg-white'}`}
            type="button"
          >
            Link
          </button>
        </div>
      )}
      <EditorContent editor={editor} className="border p-2 rounded-md min-h-[200px]" />
    </div>
  )
}
