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
        <div className="bg-white rounded-2xl border border-[#E5E9F0] p-8 text-center">
          <p className="text-[#4F5868]">Alumno no encontrado.</p>
          <a href="/dashboard/students" className="mt-4 inline-block text-sm text-[#3FA7D6] font-semibold">
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
