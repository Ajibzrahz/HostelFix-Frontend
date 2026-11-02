export type UserRole = 'student' | 'staff' | 'admin'

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
}

export const USER_STORAGE_KEY = 'hostelfix_user'

export function readStoredUser(): User | null {
  if (typeof window === 'undefined') return null

  try {
    const value = window.localStorage.getItem(USER_STORAGE_KEY)
    return value ? (JSON.parse(value) as User) : null
  } catch {
    return null
  }
}

export function saveStoredUser(user: User) {
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

export function clearStoredUser() {
  window.localStorage.removeItem(USER_STORAGE_KEY)
}
