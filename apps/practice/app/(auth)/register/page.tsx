import { AuthPage } from '@components/AuthPage'

export default function RegisterPage(): JSX.Element {
  return <AuthPage mode="register" title="Crear cuenta · Estudiante" defaultRole="student" />
}
