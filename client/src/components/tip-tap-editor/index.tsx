import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  BoldIcon,
  EraserIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  UnderlineIcon,
} from '@/components/icons';

const FONT_SIZES = [
  { label: 'Small', value: '14px' },
  { label: 'Medium', value: '16px' },
  { label: 'Large', value: '20px' },
  { label: 'Extra Large', value: '24px' },
];

const extensions = [TextStyleKit, StarterKit];

type Props = {
  value?: string;
  onChange?: (html: string) => void;
  readOnly?: boolean;
};

export function TipTapEditor({ value, onChange, readOnly }: Props) {
  const editor = useEditor({
    extensions,
    content: value ?? '',
    editable: !readOnly,
    onUpdate({ editor }) {
      const html = editor.getHTML();
      // console.log(html);
      onChange?.(html === '<p></p>' ? '' : html);
    },
  });

  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isBold: ctx.editor.isActive('bold') ?? false,
        isItalic: ctx.editor.isActive('italic') ?? false,
        isBulletList: ctx.editor.isActive('bulletList') ?? false,
        isOrderedList: ctx.editor.isActive('orderedList') ?? false,
        isUnderline: ctx.editor.isActive('underline') ?? false,
        isLink: ctx.editor.isActive('link') ?? false,
      };
    },
  });

  if (!editor) return null;

  return (
    <div className="rounded-md border">
      {!readOnly && (
        <div className="flex flex-wrap gap-1 border-b p-1">
          <Button
            type="button"
            size="icon-sm"
            variant={editorState.isBold ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <BoldIcon />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant={editorState.isItalic ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <ItalicIcon />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant={editorState.isUnderline ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant={editorState.isBulletList ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <ListIcon />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant={editorState.isOrderedList ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrderedIcon />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant={editorState.isLink ? 'default' : 'ghost'}
            onClick={() => {
              if (editorState.isLink) {
                editor.chain().focus().unsetLink().run();
                return;
              }

              const previousUrl = editor.getAttributes('link').href;
              const url = window.prompt('Enter URL', previousUrl);

              if (url === null) return; // user cancelled

              if (url === '') {
                editor.chain().focus().unsetLink().run();
                return;
              }

              editor.chain().focus().setLink({ href: url }).run();
            }}
          >
            <LinkIcon />
          </Button>
          <Select
            name="font-size"
            value={editor.getAttributes('textStyle').fontSize}
            onValueChange={(value) => {
              editor
                .chain()
                .focus()
                .setMark('textStyle', { fontSize: value })
                .run();
            }}
          >
            <SelectTrigger className="h-8!">
              <SelectValue placeholder="Font size" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                {FONT_SIZES.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              editor.chain().focus().clearNodes().unsetAllMarks().run()
            }
          >
            <EraserIcon />
          </Button>
        </div>
      )}

      <EditorContent className="min-h-24 p-3" editor={editor} />
    </div>
  );
}
