'use client';

import { DashboardLayout } from '@components/DashboardLayout';
import { StudentDetail } from '@components/StudentDetail';
import { mockStudents, mockAttempts, mockErrorFrequency } from '@lib/mock-data';

interface PageProps {
  params: { studentId: string };
}

export default function StudentDetailPage({ params }: PageProps): JSX.Element {
  const student = mockStudents.find((s) => s.studentId === params.studentId);

  if (!student) {
    return (
      <DashboardLayout unresolvedAlertCount={0}>
        <div className="card" style={{ padding: 'var(--sp-10)', textAlign: 'center' }}>
          <p style={{ color: 'var(--fg-2)' }}>Alumno no encontrado.</p>
          <a
            href="/dashboard/students"
            className="btn btn-ghost"
            style={{ marginTop: 'var(--sp-4)', textDecoration: 'none' }}
          >
            ← Volver a alumnos
          </a>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout unresolvedAlertCount={0}>
      <StudentDetail
        studentId={student.studentId}
        studentName={student.studentName}
        attempts={mockAttempts[student.studentId] ?? []}
        errorFrequency={mockErrorFrequency[student.studentId] ?? []}
        onBack={() => {
          window.location.href = '/dashboard/students';
        }}
      />
    </DashboardLayout>
  );
}
