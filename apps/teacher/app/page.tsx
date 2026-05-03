'use client';

import { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { MasteryHeatmap } from '../components/MasteryHeatmap';
import { AlertsPanel } from '../components/AlertsPanel';
import { StudentDetail } from '../components/StudentDetail';
import { mockStudents, mockAlerts, mockAttempts, mockErrorFrequency } from '../lib/mock-data';
import type { TeacherAlert } from '../lib/types';

export default function TeacherDashboard(): JSX.Element {
  const [alerts, setAlerts] = useState<TeacherAlert[]>(mockAlerts);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const handleResolveAlert = (id: string): void => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolvedAt: new Date().toISOString() } : a));
  };

  const selectedStudent = selectedStudentId
    ? mockStudents.find(s => s.studentId === selectedStudentId)
    : null;

  return (
    <DashboardLayout unresolvedAlertCount={alerts.filter(a => !a.resolvedAt).length}>
      {selectedStudent ? (
        <StudentDetail
          studentId={selectedStudent.studentId}
          studentName={selectedStudent.studentName}
          attempts={mockAttempts[selectedStudent.studentId] ?? []}
          errorFrequency={mockErrorFrequency[selectedStudent.studentId] ?? []}
          onBack={() => setSelectedStudentId(null)}
        />
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--fg-1)' }}>
              Dominio por alumno
            </h2>
            <div className="bg-white rounded-2xl border p-6" style={{ borderColor: 'var(--border)' }}>
              <MasteryHeatmap
                students={mockStudents}
                onStudentClick={setSelectedStudentId}
              />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--fg-1)' }}>
              Alertas activas
            </h2>
            <AlertsPanel
              alerts={alerts.filter(a => !a.resolvedAt)}
              onResolve={handleResolveAlert}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
