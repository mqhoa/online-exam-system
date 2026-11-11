export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'SHORT_ANSWER'
export type ExamQuestion = { id: number; position: number; content: string; questionType: QuestionType; score: number; options: { id: number; content: string; position: number }[] }
export type ExamView = { id: number; teacherGroupId: number; title: string; description: string | null; startTime: string; endTime: string; durationMinutes: number; status: 'DRAFT' | 'PUBLISHED' | 'CLOSED'; pin: string | null; totalQuestionCount: number; totalPoints: number; questions: ExamQuestion[] }
export type SavedAnswer = { questionId: number; optionIds: number[]; answerText: string | null }
export type AttemptView = { id: number; examId: number; deadline: string; status: 'IN_PROGRESS' | 'SUBMITTED' | 'AUTO_SUBMITTED'; exam: ExamView; answers: SavedAnswer[] }
export type ResultView = { attemptId: number; examId: number; examTitle: string; studentId: number; studentUsername: string; studentName: string; status: string; submittedAt: string | null; score: number; totalScore: number }
export type TeacherGroup = { id: number; name: string; subjectCode: string; subjectName: string; memberCount:number; questionCount:number; examCount:number; enabled:boolean }

const base = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
export function csrfHeaders(): Record<string, string> {
  const token = document.cookie.split('; ').find((cookie) => cookie.startsWith('XSRF-TOKEN='))?.slice('XSRF-TOKEN='.length)
  return token ? { 'X-XSRF-TOKEN': decodeURIComponent(token) } : {}
}
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase()
  const response = await fetch(`${base}/api${path}`, {
    ...init,
    credentials: 'include',
    headers: { Accept: 'application/json', ...(['GET', 'HEAD', 'OPTIONS'].includes(method) ? {} : csrfHeaders()), ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { detail?: string; message?: string; error?: string } | null
    throw new Error(body?.detail ?? body?.message ?? body?.error ?? `Request failed (${response.status})`)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const examApi = {
  list: () => request<ExamView[]>('/exams'),
  create: (body: unknown) => request<ExamView>('/exams', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: unknown) => request<ExamView>(`/exams/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  publish: (id: number) => request<ExamView>(`/exams/${id}/publish`, { method: 'POST' }),
  close: (id: number) => request<ExamView>(`/exams/${id}/close`, { method: 'POST' }),
  start: (id: number, pin: string) => request<AttemptView>(`/exams/${id}/attempts`, { method: 'POST', body: JSON.stringify({ pin }) }),
  attempt: (id: number) => request<AttemptView>(`/attempts/${id}`),
  saveAnswer: (attemptId: number, questionId: number, answer: { optionIds: number[]; answerText: string | null }) => request<void>(`/attempts/${attemptId}/answers/${questionId}`, { method: 'PUT', body: JSON.stringify(answer) }),
  submit: (attemptId: number) => request<ResultView>(`/attempts/${attemptId}/submit`, { method: 'POST' }),
  result: (attemptId: number) => request<ResultView>(`/attempts/${attemptId}/result`),
  myResults: () => request<ResultView[]>('/attempts/mine'),
  groups: () => request<TeacherGroup[]>('/teacher-groups'),
  results: (examId: number) => request<ResultView[]>(`/exams/${examId}/results`),
}
