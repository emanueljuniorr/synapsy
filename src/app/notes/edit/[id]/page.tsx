"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getNoteById, updateNote } from '@/services/notes';
import { Note } from '@/types/notes';

export default function EditNotePage() {
  const router = useRouter();
  const { id } = router.query;
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (id) {
      getNoteById(id).then((fetchedNote) => {
        setNote(fetchedNote);
        setTitle(fetchedNote.title);
        setContent(fetchedNote.content);
      });
    }
  }, [id]);

  const handleSave = async () => {
    if (note) {
      await updateNote(id, { title, content });
      router.push('/notes');
    }
  };

  if (!note) return <p>Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Note</h1>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
        placeholder="Title"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-64 p-2 border rounded"
        placeholder="Content"
      />
      <button onClick={handleSave} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Save
      </button>
    </div>
  );
} 