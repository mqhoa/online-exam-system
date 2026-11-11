import { apiDownload, apiUpload } from '../apiClient'
export const questionExcelApi={
  import:(groupId:number,file:File)=>apiUpload<{importedCount:number}>(`/questions/import?teacherGroupId=${groupId}`,file),
  export:(groupId:number)=>apiDownload(`/questions/export?teacherGroupId=${groupId}`,`questions-group-${groupId}.xlsx`),
  template:()=>apiDownload('/questions/template','question-import-template.xlsx'),
}
