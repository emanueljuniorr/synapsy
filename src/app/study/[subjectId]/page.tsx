import SubjectDetails from './SubjectDetails.client';

type Props = {
  params: Promise<{ subjectId: string }>;
};

export default async function SubjectDetailsPage({ params }: Props) {
  const { subjectId } = await params;
  
  return <SubjectDetails subjectId={subjectId} />;
} 