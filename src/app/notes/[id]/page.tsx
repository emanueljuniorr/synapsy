import NoteEditor from '@/components/notes/NoteEditor';

interface NoteEditorPageProps {
  params: {
    id: string;
  };
}

export default async function NoteEditorPage({ params }: NoteEditorPageProps) {
  // Usando await para garantir que os parâmetros dinâmicos sejam processados corretamente
  const id = params?.id;
  
  return <NoteEditor id={id} />;
} 