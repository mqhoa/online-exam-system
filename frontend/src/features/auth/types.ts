export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT'

export type AuthenticatedUser = {
  id: number
  username: string
  fullName: string
  role: UserRole
}

export type LoginCredentials = {
  username: string
  password: string
}
