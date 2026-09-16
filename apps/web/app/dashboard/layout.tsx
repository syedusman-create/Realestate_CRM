import BackButton from './back-button'

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <><BackButton />{children}</>
}
