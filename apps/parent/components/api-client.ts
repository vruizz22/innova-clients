// Re-export from shared api-client with parent-specific extensions
export type {
  UserRole,
  AuthSession,
  AuthUser,
  MasteryState,
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ConfirmForgotPasswordInput,
} from '../../../components/api-client'

export { createApiClient } from '../../../components/api-client'

export interface StudentMasteryView {
  studentId: string
  skillKey: string
  skillLabel?: string
  pKnown: number
}
