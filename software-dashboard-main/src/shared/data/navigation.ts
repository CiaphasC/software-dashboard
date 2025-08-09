import { Home, AlertTriangle, FileText, BarChart3, Users, Settings } from 'lucide-react'

export interface NavItem {
  name: string
  href: string
  icon: typeof Home
  roles: Array<'admin' | 'technician' | 'requester'>
}

export const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin', 'technician', 'requester'] },
  { name: 'Incidencias', href: '/incidents', icon: AlertTriangle, roles: ['admin', 'technician', 'requester'] },
  { name: 'Requerimientos', href: '/requirements', icon: FileText, roles: ['admin', 'technician', 'requester'] },
  { name: 'Reportes', href: '/reportes', icon: BarChart3, roles: ['admin'] },
  { name: 'Usuarios', href: '/usuarios', icon: Users, roles: ['admin'] },
  { name: 'Configuración', href: '/configuracion', icon: Settings, roles: ['admin'] },
]

export default navigation