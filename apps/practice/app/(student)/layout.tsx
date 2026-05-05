'use client'

import { AuthGuard } from '@shared/auth-guard'

const STUDENT_ROLES = ['student'] as const

export default function StudentLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <AuthGuard allowedRoles={STUDENT_ROLES} loginPath="/login">
      {children}
    </AuthGuard>
  )
}
