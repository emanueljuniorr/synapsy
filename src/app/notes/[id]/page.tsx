import NoteEditor from '@/components/notes/NoteEditor';

interface NoteEditorPageProps {
  params: {
    id: string;
  };
}

export default function NoteEditorPage({ params }: NoteEditorPageProps) {
  return <NoteEditor id={params.id} />;
} 