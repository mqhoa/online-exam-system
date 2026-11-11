import { useEffect, useState } from 'react'
import { examApi, type TeacherGroup } from '../exam/examApi'

type TeacherGroupsProps={onSelectGroupForQuestions:()=>void}
export function TeacherGroups({onSelectGroupForQuestions}:TeacherGroupsProps){
  const [groups,setGroups]=useState<TeacherGroup[]>([]);const [error,setError]=useState('');const [loading,setLoading]=useState(true)
  useEffect(()=>{void examApi.groups().then(setGroups).catch((e:unknown)=>setError(e instanceof Error?e.message:'Không tải được nhóm giảng viên')).finally(()=>setLoading(false))},[])
  return <div className="teacher-module-page">
    <div className="content-top-bar"><div><h2>Nhóm môn học phụ trách</h2><p>Danh sách nhóm được phân công cho tài khoản giảng viên hiện tại.</p></div></div>
    {error&&<div className="modal-alert" role="alert">{error}</div>}
    <div className="table-card"><div className="card-header-bar"><h3 className="card-title">Nhóm giảng viên</h3></div>
      <div className="table-responsive"><table className="student-table"><thead><tr><th>STT</th><th>Mã môn</th><th>Môn học</th><th>Nhóm</th><th>Giảng viên</th><th>Câu hỏi</th><th>Kỳ thi</th><th>Thao tác</th></tr></thead>
        <tbody>{loading?<tr><td colSpan={8}>Đang tải…</td></tr>:groups.map((g,index)=><tr key={g.id}><td>{index+1}</td><td><strong>{g.subjectCode}</strong></td><td>{g.subjectName}</td><td><span className="class-badge-pill">{g.name}</span></td><td>{g.memberCount} giảng viên</td><td>{g.questionCount}</td><td>{g.examCount}</td><td><button type="button" className="btn btn-teal btn-sm" onClick={onSelectGroupForQuestions}>Mở ngân hàng câu hỏi →</button></td></tr>)}
          {!loading&&groups.length===0&&<tr><td colSpan={8}>Chưa có nhóm nào được phân công.</td></tr>}</tbody>
      </table></div>
    </div>
  </div>
}
