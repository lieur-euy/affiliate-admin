import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import LinkExtension from "@tiptap/extension-link"
import ImageExtension from "@tiptap/extension-image"
import { useState, useCallback, useEffect, useRef } from "react"
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Quote, Undo2, Redo2, Link, Code, Heading1, Heading2, Heading3,
  Image,
} from "lucide-react"
import { MediaPicker } from "@/components/media-picker"

interface RichEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: number
}

function Toolbar({ editor, onImageClick }: { editor: Editor; onImageClick: () => void }) {
  const btn = (active: boolean, onClick: () => void, icon: React.ReactNode, title: string) => (
    <button type="button" onClick={onClick} title={title}
      className={`rounded p-1 transition-colors ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
      {icon}
    </button>
  )

  const addLink = () => { const url = window.prompt("URL:"); if (url) editor.chain().focus().setLink({ href: url }).run() }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5">
      {btn(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), <Bold className="size-4" />, "Bold")}
      {btn(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), <Italic className="size-4" />, "Italic")}
      {btn(editor.isActive("underline"), () => editor.chain().focus().toggleUnderline().run(), <UnderlineIcon className="size-4" />, "Underline")}
      {btn(editor.isActive("strike"), () => editor.chain().focus().toggleStrike().run(), <Strikethrough className="size-4" />, "Strikethrough")}
      {btn(editor.isActive("code"), () => editor.chain().focus().toggleCode().run(), <Code className="size-4" />, "Inline Code")}
      <span className="mx-1 h-5 w-px bg-border" />

      {btn(editor.isActive("heading", { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), <Heading1 className="size-4" />, "H1")}
      {btn(editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), <Heading2 className="size-4" />, "H2")}
      {btn(editor.isActive("heading", { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), <Heading3 className="size-4" />, "H3")}
      <span className="mx-1 h-5 w-px bg-border" />

      {btn(editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), <List className="size-4" />, "Bullet List")}
      {btn(editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), <ListOrdered className="size-4" />, "Ordered List")}
      {btn(editor.isActive("blockquote"), () => editor.chain().focus().toggleBlockquote().run(), <Quote className="size-4" />, "Quote")}
      {btn(editor.isActive("codeBlock"), () => editor.chain().focus().toggleCodeBlock().run(), <Code className="size-4" />, "Code Block")}
      <span className="mx-1 h-5 w-px bg-border" />

      {btn(editor.isActive("link"), addLink, <Link className="size-4" />, "Link")}
      {btn(false, onImageClick, <Image className="size-4" />, "Image")}
      <span className="mx-1 h-5 w-px bg-border" />

      {btn(false, () => editor.chain().focus().undo().run(), <Undo2 className="size-4" />, "Undo")}
      {btn(false, () => editor.chain().focus().redo().run(), <Redo2 className="size-4" />, "Redo")}
    </div>
  )
}

export function RichEditor({ value, onChange, minHeight = 200 }: RichEditorProps) {
  const [mediaOpen, setMediaOpen] = useState(false)
  const prevValueRef = useRef(value)
  const [, setTick] = useState(0)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: {},
        link: false,
      }),
      LinkExtension.configure({ openOnClick: false }),
      ImageExtension.configure({ inline: false }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onSelectionUpdate: () => setTick((t) => t + 1),
    onTransaction: () => setTick((t) => t + 1),
    editorProps: {
      attributes: { class: "shadcn-prose max-w-none focus:outline-none px-3 py-2 min-h-[120px]" },
    },
  })

  useEffect(() => {
    if (!editor) return
    if (prevValueRef.current === value) return
    prevValueRef.current = value
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || "", { emitUpdate: false })
    }
  }, [value, editor])

  const handleImageSelect = useCallback((media: { url: string }) => {
    editor?.chain().focus().setImage({ src: media.url }).run()
    setMediaOpen(false)
  }, [editor])

  if (!editor) return null

  return (
    <>
      <div className="overflow-hidden rounded-lg border" style={{ minHeight }}>
        <Toolbar editor={editor} onImageClick={() => setMediaOpen(true)} />
        <div style={{ minHeight: minHeight - 40 }}>
          <EditorContent editor={editor} />
        </div>
      </div>
      <MediaPicker open={mediaOpen} onOpenChange={setMediaOpen} onSelect={handleImageSelect} />
    </>
  )
}
