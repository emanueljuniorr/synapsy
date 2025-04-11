import StudySession from './StudySession.client';

type Props = {
  params: Promise<{ subjectId: string }>;
};

export default async function StudySessionPage({ params }: Props) {
  const { subjectId } = await params;
  
  return <StudySession subjectId={subjectId} />;
} 