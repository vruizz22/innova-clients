import { JoinClassroomForm } from '@/components/student/JoinClassroomForm';

// Student lands here from a teacher's invite link (/join?code=…) or types a code.
export const dynamic = 'force-dynamic';

interface PageProps {
  readonly searchParams: { readonly code?: string };
}

export default function JoinPage({ searchParams }: PageProps): JSX.Element {
  return (
    <div className="mx-auto max-w-[480px]">
      <JoinClassroomForm initialCode={searchParams.code ?? ''} />
    </div>
  );
}
