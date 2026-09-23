import { LoginForm } from '@/components/auth/login-form'
import { LoginShell } from '@/components/auth/login-shell'

export default function LoginPage() {
  return (
    <LoginShell>
      <LoginForm />
    </LoginShell>
  )
}