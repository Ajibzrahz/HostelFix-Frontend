export type UserRole = 'student' | 'staff' | 'admin'

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
}