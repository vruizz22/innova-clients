'use client'

import { AuthGuard } from '@shared/auth-guard'

const TEACHER_ROLES = ['teacher', 'admin'] as const

export default function TeacherLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <AuthGuard allowedRoles={TEACHER_ROLES} loginPath="/login">
      {children}
    </AuthGuard>
  )
}
