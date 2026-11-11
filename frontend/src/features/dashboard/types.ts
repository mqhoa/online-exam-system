export interface Student {
  id: string
  code: string
  fullName: string
  classes: string[]
  dateOfBirth: string
  email: string
  enabled?: boolean
}

export type DashboardMenuId =
  | 'classes'
  | 'semesters'
  | 'subjects'
  | 'questions'
  | 'exams'
  | 'schedules'
  | 'students'
  | 'users'

export interface MenuItem {
  id: DashboardMenuId
  label: string
  icon: string
}
