import { apiRequest } from '../apiClient'
export type AiQuestion={content:string;questionType:'SINGLE_CHOICE'|'MULTIPLE_CHOICE'|'SHORT_ANSWER';explanation:string;options:Array<{content:string;correct:boolean}>}
export type AiJob={id:number;teacherGroupId:number;status:'PENDING'|'PROCESSING'|'COMPLETED'|'FAILED';errorMessage:string|null;createdAt:string;questions:AiQuestion[]}
export const aiApi={
  create:async (input:{file:File;teacherGroupId:number;focusTopic:string;questionCount:number;difficulty:string})=>{const body=new FormData();body.append('file',input.file);body.append('teacherGroupId',String(input.teacherGroupId));body.append('focusTopic',input.focusTopic);body.append('questionCount',String(input.questionCount));body.append('difficulty',input.difficulty);return apiRequest<AiJob>('/ai/generations',{method:'POST',body})},
  get:(id:number)=>apiRequest<AiJob>(`/ai/generations/${id}`),
  approve:(id:number,questionIndexes:number[])=>apiRequest<{savedCount:number}>(`/ai/generations/${id}/approve`,{method:'POST',body:JSON.stringify({questionIndexes})}),
}
