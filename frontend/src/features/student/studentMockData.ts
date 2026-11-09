export interface StudentExamQuestion {
  id: number
  questionOrder: number
  content: string
  questionType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'SHORT_ANSWER'
  options?: Array<{ id: number; content: string }>
  points: number
}

export interface StudentExam {
  id: number
  title: string
  subjectCode: string
  subjectName: string
  durationMinutes: number
  totalQuestions: number
  totalPoints: number
  startTime: string
  endTime: string
  pin: string
  status: 'PUBLISHED' | 'CLOSED'
  isCompleted?: boolean
  score?: number
}

export const STUDENT_AVAILABLE_EXAMS: StudentExam[] = [
  {
    id: 1,
    title: 'Kiểm tra giữa kỳ - Lập trình Web và Spring Boot',
    subjectCode: 'INT1001',
    subjectName: 'Lập trình Web nâng cao',
    durationMinutes: 45,
    totalQuestions: 5,
    totalPoints: 10.0,
    startTime: '2026-11-09 08:00',
    endTime: '2026-11-09 18:00',
    pin: '123456',
    status: 'PUBLISHED',
  },
  {
    id: 2,
    title: 'Khảo sát định kỳ - Kiến trúc CSDL phân tán',
    subjectCode: 'INT1002',
    subjectName: 'Cơ sở dữ liệu phân tán',
    durationMinutes: 30,
    totalQuestions: 15,
    totalPoints: 10.0,
    startTime: '2026-11-12 14:00',
    endTime: '2026-11-12 15:30',
    pin: '654321',
    status: 'PUBLISHED',
  },
  {
    id: 3,
    title: 'Bài tập đánh giá - Kế toán tài chính doanh nghiệp',
    subjectCode: 'FIN2001',
    subjectName: 'Kế toán tài chính',
    durationMinutes: 40,
    totalQuestions: 20,
    totalPoints: 10.0,
    startTime: '2026-11-05 09:00',
    endTime: '2026-11-05 10:30',
    pin: '112233',
    status: 'CLOSED',
    isCompleted: true,
    score: 8.5,
  },
]

export const MOCK_EXAM_QUESTIONS: StudentExamQuestion[] = [
  {
    id: 1,
    questionOrder: 1,
    content: 'Giao thức nào cung cấp kết nối mạng an toàn và được mã hóa giữa trình duyệt và máy chủ web?',
    questionType: 'SINGLE_CHOICE',
    points: 2.0,
    options: [
      { id: 101, content: 'HTTPS (Hypertext Transfer Protocol Secure)' },
      { id: 102, content: 'HTTP (Hypertext Transfer Protocol)' },
      { id: 103, content: 'FTP (File Transfer Protocol)' },
      { id: 104, content: 'SNMP (Simple Network Management Protocol)' },
    ],
  },
  {
    id: 2,
    questionOrder: 2,
    content: 'Những phương thức HTTP nào dưới đây được coi là Idempotent theo chuẩn RFC 7231? (Chọn tất cả các đáp án đúng)',
    questionType: 'MULTIPLE_CHOICE',
    points: 2.0,
    options: [
      { id: 105, content: 'GET' },
      { id: 106, content: 'PUT' },
      { id: 107, content: 'DELETE' },
      { id: 108, content: 'POST' },
    ],
  },
  {
    id: 3,
    questionOrder: 3,
    content: 'Từ khóa nào trong Java dùng để định nghĩa một hằng số hoặc ngăn chặn một lớp bị kế thừa?',
    questionType: 'SHORT_ANSWER',
    points: 2.0,
  },
  {
    id: 4,
    questionOrder: 4,
    content: 'Cơ chế nào trong Spring Boot được dùng để tự động cấu hình các bean dựa trên thư viện trong classpath?',
    questionType: 'SINGLE_CHOICE',
    points: 2.0,
    options: [
      { id: 111, content: '@EnableAutoConfiguration / Spring Boot Autoconfigure' },
      { id: 112, content: '@ManualConfiguration' },
      { id: 113, content: '@StaticInjection' },
      { id: 114, content: '@AutoAutowired' },
    ],
  },
  {
    id: 5,
    questionOrder: 5,
    content: 'Tên viết tắt của chuẩn bảo mật hỗ trợ phân quyền và xác thực không lưu trạng thái (Stateless) dưới dạng JSON?',
    questionType: 'SHORT_ANSWER',
    points: 2.0,
  },
]
