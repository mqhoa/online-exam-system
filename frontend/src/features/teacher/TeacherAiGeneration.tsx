import { useEffect, useState } from 'react'
import { examApi, type TeacherGroup } from '../exam/examApi'
import { aiApi, type AiJob } from './aiApi'

export function TeacherAiGeneration() {
  const [groups,setGroups]=useState<TeacherGroup[]>([])
  const [groupId,setGroupId]=useState(0)
  const [selectedFile,setSelectedFile]=useState<File|null>(null)
  const [questionCount,setQuestionCount]=useState(5)
  const [difficulty,setDifficulty]=useState('MEDIUM')
  const [focusTopic,setFocusTopic]=useState('')
  const [job,setJob]=useState<AiJob|null>(null)
  const [selected,setSelected]=useState<number[]>([])
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const [message,setMessage]=useState('')

  useEffect(()=>{void examApi.groups().then((items)=>{setGroups(items);if(items[0])setGroupId(items[0].id)}).catch((e:unknown)=>setError(e instanceof Error?e.message:'Không tải được nhóm giảng viên'))},[])
  useEffect(()=>{
    if(!job||!['PENDING','PROCESSING'].includes(job.status))return
    const timer=window.setTimeout(()=>{void aiApi.get(job.id).then((current)=>{setJob(current);if(current.status==='COMPLETED')setSelected(current.questions.map((_,index)=>index))}).catch((e:unknown)=>setError(e instanceof Error?e.message:'Không thể kiểm tra tiến trình AI'))},1800)
    return ()=>window.clearTimeout(timer)
  },[job])

  async function startGeneration(){
    setError('');setMessage('')
    if(!selectedFile||!groupId||!focusTopic.trim()){setError('Chọn nhóm, tệp PDF và nhập chủ đề trước khi tạo câu hỏi.');return}
    setBusy(true)
    try{const created=await aiApi.create({file:selectedFile,teacherGroupId:groupId,focusTopic:focusTopic.trim(),questionCount,difficulty});setJob(created);setSelected([]);setMessage('Tài liệu đã được gửi để phân tích.')}catch(e){setError(e instanceof Error?e.message:'Không thể bắt đầu sinh câu hỏi')}finally{setBusy(false)}
  }

  async function approve(){if(!job||!selected.length)return;setBusy(true);setError('');try{const result=await aiApi.approve(job.id,selected);setMessage(`Đã lưu ${result.savedCount} câu hỏi vào ngân hàng câu hỏi.`);setJob(null);setSelected([])}catch(e){setError(e instanceof Error?e.message:'Không thể lưu câu hỏi')}finally{setBusy(false)}}

  function toggle(index:number){setSelected((items)=>items.includes(index)?items.filter((i)=>i!==index):[...items,index])}
  const statusText=job?.status==='PENDING'?'Đang chờ xử lý…':job?.status==='PROCESSING'?'Đang trích xuất PDF và gọi Gemini…':job?.status==='COMPLETED'?'Hoàn tất, hãy xem lại và chọn câu hỏi muốn lưu.':''

  return <div className="teacher-module-page">
    <div className="content-top-bar"><div><h2>Sinh câu hỏi từ PDF bằng AI</h2><p>Gemini phân tích nội dung PDF dạng văn bản; câu hỏi chỉ được lưu sau khi giảng viên duyệt.</p></div></div>
    {error&&<div className="modal-alert" role="alert">{error}</div>}{message&&<div className="import-hint-box" role="status">{message}</div>}
    <div className="table-card" style={{padding:20}}>
      <div className="modal-form">
        <label>Nhóm giảng viên<select className="form-control" value={groupId} onChange={(e)=>setGroupId(Number(e.target.value))}><option value={0}>Chọn nhóm</option>{groups.map((g)=><option key={g.id} value={g.id}>{g.subjectCode} · {g.name}</option>)}</select></label>
        <label>Tệp PDF<input className="form-control" type="file" accept="application/pdf,.pdf" onChange={(e)=>setSelectedFile(e.target.files?.[0]??null)}/></label>
        <label>Chủ đề trọng tâm<input className="form-control" maxLength={300} value={focusTopic} onChange={(e)=>setFocusTopic(e.target.value)} placeholder="Ví dụ: Cấu trúc dữ liệu cây"/></label>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <label>Số câu hỏi<select className="form-control" value={questionCount} onChange={(e)=>setQuestionCount(Number(e.target.value))}><option value={5}>5</option><option value={10}>10</option><option value={15}>15</option><option value={20}>20</option></select></label>
          <label>Độ khó<select className="form-control" value={difficulty} onChange={(e)=>setDifficulty(e.target.value)}><option value="EASY">Dễ</option><option value="MEDIUM">Trung bình</option><option value="HARD">Khó</option></select></label>
        </div>
        <button type="button" className="btn btn-teal" disabled={busy||!groups.length} onClick={()=>void startGeneration()}>{busy?'Đang xử lý…':'Phân tích PDF và sinh câu hỏi'}</button>
      </div>
    </div>
    {job&&<div className="table-card" style={{padding:20,marginTop:20}}>
      <h3>Tiến trình #{job.id}</h3><p>{statusText}</p>
      {job.status==='FAILED'&&<div className="modal-alert" role="alert">{job.errorMessage??'AI không xử lý được tài liệu.'}</div>}
      {job.status==='COMPLETED'&&<>
        {job.questions.map((question,index)=><article key={index} style={{padding:14,marginBottom:12,border:'1px solid #dbe4ea',borderRadius:8}}>
          <label style={{display:'flex',gap:8,fontWeight:700}}><input type="checkbox" checked={selected.includes(index)} onChange={()=>toggle(index)}/><span>{index+1}. {question.content}</span></label>
          <p style={{fontSize:12,color:'#52606d'}}>{question.questionType} · {question.explanation}</p>
          <ul>{question.options.map((option,oi)=><li key={oi} style={{fontWeight:option.correct?700:400}}>{option.content}{option.correct?' ✓':''}</li>)}</ul>
        </article>)}
        <button type="button" className="btn btn-green" disabled={busy||selected.length===0} onClick={()=>void approve()}>Duyệt và lưu {selected.length} câu hỏi</button>
      </>}
    </div>}
  </div>
}
