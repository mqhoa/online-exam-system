import { apiDownload, apiRequest, apiUpload } from '../apiClient'

export type StudentApiRow={id:number;code:string;fullName:string;email:string;dateOfBirth:string|null;enabled:boolean;classes:string[]}
export type StudentImportPreview={rowNumber:number;code:string;fullName:string;email:string;classes:string[];dateOfBirth:string|null;valid:boolean;errors:string[]}
export type StudentImportResult={importedCount:number;credentials:Array<{username:string;initialPassword:string}>}
export type StudentProfile={code:string;fullName:string;email:string;dateOfBirth:string;classes:string[]}
export type ManagedUser={id:number;username:string;fullName:string;email:string|null;role:'ADMIN'|'TEACHER'|'STUDENT';enabled:boolean;createdAt:string}
export type SubjectRow={id:number;code:string;name:string;description:string|null}
export type TeacherGroupRow={id:number;name:string;subjectCode:string;subjectName:string;memberCount:number;questionCount:number;examCount:number;enabled:boolean}

export const adminApi={
  students:()=>apiRequest<StudentApiRow[]>('/users/students'),
  createStudent:(profile:StudentProfile)=>apiRequest<{id:number;initialPassword:string}>('/users/students',{method:'POST',body:JSON.stringify(profile)}),
  updateStudent:(id:number,profile:StudentProfile)=>apiRequest<void>(`/users/students/${id}`,{method:'PUT',body:JSON.stringify(profile)}),
  setStudentEnabled:(id:number,enabled:boolean)=>apiRequest<StudentApiRow>(`/users/${id}/status`,{method:'PATCH',body:JSON.stringify({enabled})}),
  previewStudents:(file:File)=>apiUpload<StudentImportPreview[]>('/users/import/students/preview',file),
  importStudents:(file:File)=>apiUpload<StudentImportResult>('/users/import/students',file),
  downloadStudentTemplate:()=>apiDownload('/users/import/students/template','student-import-template.xlsx'),
  users:()=>apiRequest<ManagedUser[]>('/users'),
  createUser:(input:{username:string;password:string;fullName:string;email:string|null;role:'TEACHER'|'STUDENT'})=>apiRequest<ManagedUser>('/users',{method:'POST',body:JSON.stringify(input)}),
  setUserEnabled:(id:number,enabled:boolean)=>apiRequest<ManagedUser>(`/users/${id}/status`,{method:'PATCH',body:JSON.stringify({enabled})}),
  resetPassword:(id:number,password:string)=>apiRequest<void>(`/users/${id}/password`,{method:'PATCH',body:JSON.stringify({password})}),
  subjects:()=>apiRequest<SubjectRow[]>('/subjects'),
  saveSubject:(input:{id?:number;code:string;name:string;description:string})=>{const {id,...body}=input;return apiRequest<SubjectRow>(id?`/subjects/${id}`:'/subjects',{method:id?'PUT':'POST',body:JSON.stringify(body)})},
  groups:()=>apiRequest<TeacherGroupRow[]>('/teacher-groups?all=true'),
  groupTeachers:(id:number)=>apiRequest<number[]>(`/teacher-groups/${id}/teachers`),
  saveGroup:(input:{id?:number;subjectId:number;name:string;description:string})=>{const {id,...body}=input;return apiRequest<TeacherGroupRow>(id?`/teacher-groups/${id}`:'/teacher-groups',{method:id?'PUT':'POST',body:JSON.stringify(body)})},
  setGroupTeachers:(id:number,teacherIds:number[])=>apiRequest<void>(`/teacher-groups/${id}/teachers`,{method:'PUT',body:JSON.stringify({teacherIds})}),
  setGroupEnabled:(id:number,enabled:boolean)=>apiRequest<void>(`/teacher-groups/${id}/status`,{method:'PATCH',body:JSON.stringify({enabled})}),
}
