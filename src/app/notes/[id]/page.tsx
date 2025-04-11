import NoteEditor from '@/components/notes/NoteEditor';

export default function Page({ params }: { params: any }) {
  return <NoteEditor id={params.id} />;
} 