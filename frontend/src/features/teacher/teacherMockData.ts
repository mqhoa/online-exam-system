export interface QuestionOption {
  id: number
  content: string
  correct: boolean
  position: number
}

export interface Question {
  id: number
  teacherGroupId: number
  teacherGroupName: string
  content: string
  questionType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'SHORT_ANSWER'
  options: QuestionOption[]
  createdAt: string
  difficulty: 'Dễ' | 'Trung bình' | 'Khó'
  points: number
}

export interface Exam {
  id: number
  teacherGroupId: number
  subjectName: string
  title: string
  description: string
  durationMinutes: number
  pin: string
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED'
  totalQuestions: number
  totalPoints: number
  startTime: string
  endTime: string
}

export interface ExamResultRecord {
  id: number
  examId: number
  studentCode: string
  studentName: string
  className: string
  score: number
  totalScore: number
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'AUTO_SUBMITTED'
  submittedAt: string
  correctCount: number
  totalQuestions: number
}

export interface TeacherGroup {
  id: number
  subjectCode: string
  subjectName: string
  name: string
  description: string
  memberCount: number
  questionCount: number
  examCount: number
}

export const INITIAL_TEACHER_GROUPS: TeacherGroup[] = [
  {
    id: 1,
    subjectCode: 'INT1001',
    subjectName: 'Lập trình Web nâng cao',
    name: 'Nhóm Lập trình Web - K15',
    description: 'Bộ môn Hệ thống thông tin - Phụ trách học kỳ 1 2026-2027',
    memberCount: 3,
    questionCount: 35,
    examCount: 2,
  },
  {
    id: 2,
    subjectCode: 'INT1002',
    subjectName: 'Cơ sở dữ liệu phân tán',
    name: 'Nhóm Cơ sở dữ liệu - K12',
    description: 'Bộ môn Khoa học máy tính - Phụ trách kiểm tra định kỳ',
    memberCount: 2,
    questionCount: 28,
    examCount: 1,
  },
  {
    id: 3,
    subjectCode: 'FIN2001',
    subjectName: 'Kế toán tài chính',
    name: 'Nhóm Kế toán doanh nghiệp',
    description: 'Bộ môn Tài chính kế toán',
    memberCount: 4,
    questionCount: 40,
    examCount: 2,
  },
]

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 1,
    teacherGroupId: 1,
    teacherGroupName: 'Lập trình Web - K15',
    content: 'Giao thức nào cung cấp kết nối mạng an toàn và được mã hóa giữa trình duyệt và máy chủ web?',
    questionType: 'SINGLE_CHOICE',
    difficulty: 'Dễ',
    points: 0.25,
    createdAt: '2026-10-21T03:00:00Z',
    options: [
      { id: 101, content: 'HTTPS (Hypertext Transfer Protocol Secure)', correct: true, position: 1 },
      { id: 102, content: 'HTTP (Hypertext Transfer Protocol)', correct: false, position: 2 },
      { id: 103, content: 'FTP (File Transfer Protocol)', correct: false, position: 3 },
      { id: 104, content: 'SNMP (Simple Network Management Protocol)', correct: false, position: 4 },
    ],
  },
  {
    id: 2,
    teacherGroupId: 1,
    teacherGroupName: 'Lập trình Web - K15',
    content: 'Những phương thức HTTP nào dưới đây được coi là Idempotent theo chuẩn RFC 7231?',
    questionType: 'MULTIPLE_CHOICE',
    difficulty: 'Trung bình',
    points: 0.5,
    createdAt: '2026-10-22T04:15:00Z',
    options: [
      { id: 105, content: 'GET', correct: true, position: 1 },
      { id: 106, content: 'PUT', correct: true, position: 2 },
      { id: 107, content: 'DELETE', correct: true, position: 3 },
      { id: 108, content: 'POST', correct: false, position: 4 },
    ],
  },
  {
    id: 3,
    teacherGroupId: 1,
    teacherGroupName: 'Lập trình Web - K15',
    content: 'Từ khóa nào trong Java dùng để định nghĩa một hằng số hoặc ngăn chặn một lớp bị kế thừa?',
    questionType: 'SHORT_ANSWER',
    difficulty: 'Dễ',
    points: 0.5,
    createdAt: '2026-10-23T05:30:00Z',
    options: [
      { id: 109, content: 'final', correct: true, position: 1 },
      { id: 110, content: 'FINAL', correct: true, position: 2 },
    ],
  },
  {
    id: 4,
    teacherGroupId: 1,
    teacherGroupName: 'Lập trình Web - K15',
    content: 'Cơ chế nào trong Spring Boot được dùng để tự động cấu hình các bean dựa trên thư viện trong classpath?',
    questionType: 'SINGLE_CHOICE',
    difficulty: 'Trung bình',
    points: 0.25,
    createdAt: '2026-10-24T06:00:00Z',
    options: [
      { id: 111, content: '@EnableAutoConfiguration / Spring Boot Autoconfigure', correct: true, position: 1 },
      { id: 112, content: '@ManualConfiguration', correct: false, position: 2 },
      { id: 113, content: '@StaticInjection', correct: false, position: 3 },
      { id: 114, content: '@AutoAutowired', correct: false, position: 4 },
    ],
  },
  {
    id: 5,
    teacherGroupId: 2,
    teacherGroupName: 'Cơ sở dữ liệu - K12',
    content: 'Trong hệ quản trị CSDL quan hệ, 4 đặc tính cơ bản của một Transaction (ACID) viết tắt của những từ nào?',
    questionType: 'MULTIPLE_CHOICE',
    difficulty: 'Trung bình',
    points: 0.5,
    createdAt: '2026-10-25T07:20:00Z',
    options: [
      { id: 115, content: 'Atomicity (Tính nguyên tử)', correct: true, position: 1 },
      { id: 116, content: 'Consistency (Tính nhất quán)', correct: true, position: 2 },
      { id: 117, content: 'Isolation (Tính độc lập)', correct: true, position: 3 },
      { id: 118, content: 'Durability (Tính bền vững)', correct: true, position: 4 },
    ],
  },
]

export const INITIAL_EXAMS: Exam[] = [
  {
    id: 1,
    teacherGroupId: 1,
    subjectName: 'Lập trình Web nâng cao (INT1001)',
    title: 'Kiểm tra giữa kỳ - Lập trình Web và Spring Boot',
    description: 'Đề thi trắc nghiệm và câu hỏi ngắn bao quát kiến thức từ Chương 1 đến Chương 4',
    durationMinutes: 45,
    pin: '123456',
    status: 'PUBLISHED',
    totalQuestions: 20,
    totalPoints: 10.0,
    startTime: '2026-11-10 08:00',
    endTime: '2026-11-10 11:30',
  },
  {
    id: 2,
    teacherGroupId: 1,
    subjectName: 'Lập trình Web nâng cao (INT1001)',
    title: 'Thi cuối kỳ - Lập trình ứng dụng phân tán',
    description: 'Bài thi kết thúc học phần Lập trình Web nâng cao',
    durationMinutes: 60,
    pin: '987654',
    status: 'DRAFT',
    totalQuestions: 40,
    totalPoints: 10.0,
    startTime: '2026-11-25 09:00',
    endTime: '2026-11-25 10:30',
  },
  {
    id: 3,
    teacherGroupId: 2,
    subjectName: 'Cơ sở dữ liệu phân tán (INT1002)',
    title: 'Khảo sát định kỳ - Kiến trúc CSDL phân tán',
    description: 'Kiểm tra kiến thức phân mảnh, phân tán và tối ưu truy vấn',
    durationMinutes: 30,
    pin: '445566',
    status: 'CLOSED',
    totalQuestions: 15,
    totalPoints: 10.0,
    startTime: '2026-11-01 14:00',
    endTime: '2026-11-01 15:00',
  },
]

export const INITIAL_EXAM_RESULTS: ExamResultRecord[] = [
  {
    id: 1,
    examId: 1,
    studentCode: '1651227671',
    studentName: 'Nguyễn Anh Long',
    className: 'THH1525',
    score: 8.5,
    totalScore: 10.0,
    status: 'SUBMITTED',
    submittedAt: '2026-11-09 09:14:22',
    correctCount: 17,
    totalQuestions: 20,
  },
  {
    id: 2,
    examId: 1,
    studentCode: '1651221159',
    studentName: 'Đặng Đức Long',
    className: 'KTTC125',
    score: 9.0,
    totalScore: 10.0,
    status: 'SUBMITTED',
    submittedAt: '2026-11-09 09:18:05',
    correctCount: 18,
    totalQuestions: 20,
  },
  {
    id: 3,
    examId: 1,
    studentCode: '1651220980',
    studentName: 'Dương Hữu An',
    className: 'THH1525',
    score: 7.0,
    totalScore: 10.0,
    status: 'SUBMITTED',
    submittedAt: '2026-11-09 09:22:40',
    correctCount: 14,
    totalQuestions: 20,
  },
  {
    id: 4,
    examId: 1,
    studentCode: '1651224900',
    studentName: 'Lê Hồng Lan',
    className: 'THH1525',
    score: 6.5,
    totalScore: 10.0,
    status: 'AUTO_SUBMITTED',
    submittedAt: '2026-11-09 09:30:00',
    correctCount: 13,
    totalQuestions: 20,
  },
  {
    id: 5,
    examId: 1,
    studentCode: '1651228115',
    studentName: 'Hồ Anh Lan',
    className: 'KTTC125',
    score: 8.0,
    totalScore: 10.0,
    status: 'SUBMITTED',
    submittedAt: '2026-11-09 09:20:11',
    correctCount: 16,
    totalQuestions: 20,
  },
]
