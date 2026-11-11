import { useEffect, useState } from 'react'
import { adminApi, type ManagedUser } from './adminApi'

export function AccountManagement(){
  const [users,setUsers]=useState<ManagedUser[]>([]);const [username,setUsername]=useState('');const [fullName,setFullName]=useState('');const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [role,setRole]=useState<'TEACHER'|'STUDENT'>('TEACHER');const [error,setError]=useState('');const [message,setMessage]=useState('');const [busy,setBusy]=useState(false)
  async function refresh(){setUsers(await adminApi.users())}
  useEffect(()=>{void refresh().catch((e:unknown)=>setError(e instanceof Error?e.message:'Không tải được tài khoản'))},[])
  async function create(){setError('');setMessage('');setBusy(true);try{await adminApi.createUser({username,password,fullName,email:email||null,role});setUsername('');setPassword('');setFullName('');setEmail('');await refresh();setMessage('Đã tạo tài khoản. Hãy bàn giao mật khẩu ban đầu an toàn cho người dùng.')}catch(e){setError(e instanceof Error?e.message:'Không thể tạo tài khoản')}finally{setBusy(false)}}
  async function toggle(user:ManagedUser){setBusy(true);setError('');try{await adminApi.setUserEnabled(user.id,!user.enabled);await refresh()}catch(e){setError(e instanceof Error?e.message:'Không cập nhật được trạng thái')}finally{setBusy(false)}}
  async function reset(user:ManagedUser){const next=window.prompt(`Nhập mật khẩu mới (ít nhất 8 ký tự) cho ${user.username}`);if(!next)return;setBusy(true);try{await adminApi.resetPassword(user.id,next);setMessage(`Đã đặt lại mật khẩu cho ${user.username}.`)}catch(e){setError(e instanceof Error?e.message:'Không đặt lại được mật khẩu')}finally{setBusy(false)}}
  return <section className="student-management-page"><div className="content-top-bar"><div><h2>Quản lý tài khoản</h2><p>Admin cấp tài khoản và quản lý trạng thái đăng nhập cho giảng viên, sinh viên.</p></div></div>
    {error&&<div className="modal-alert" role="alert">{error}</div>}{message&&<div className="import-hint-box" role="status">{message}</div>}
    <div className="table-card" style={{padding:20,marginBottom:18}}><h3>Tạo tài khoản</h3><div className="modal-form" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12}}>
      <label>Vai trò<select className="form-control" value={role} onChange={(e)=>setRole(e.target.value as 'TEACHER'|'STUDENT')}><option value="TEACHER">Giảng viên</option><option value="STUDENT">Sinh viên</option></select></label>
      <label>Tên đăng nhập<input className="form-control" value={username} onChange={(e)=>setUsername(e.target.value)} /></label>
      <label>Họ và tên<input className="form-control" value={fullName} onChange={(e)=>setFullName(e.target.value)} /></label>
      <label>Email<input className="form-control" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} /></label>
      <label>Mật khẩu ban đầu<input className="form-control" type="password" minLength={8} value={password} onChange={(e)=>setPassword(e.target.value)} /></label>
      <button className="btn btn-teal" type="button" disabled={busy||!username||!fullName||password.length<8} onClick={()=>void create()}>Tạo tài khoản</button>
    </div></div>
    <div className="table-card"><div className="table-responsive"><table className="student-table"><thead><tr><th>Tài khoản</th><th>Họ tên</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>
      {users.map((user)=><tr key={user.id}><td>{user.username}</td><td>{user.fullName}</td><td>{user.email??'—'}</td><td>{user.role}</td><td>{user.enabled?'Đang hoạt động':'Đã khóa'}</td><td>{user.role!=='ADMIN'&&<><button className="btn btn-secondary btn-sm" disabled={busy} onClick={()=>void reset(user)}>Đặt lại mật khẩu</button> <button className="btn btn-secondary btn-sm" disabled={busy} onClick={()=>void toggle(user)}>{user.enabled?'Khóa':'Mở khóa'}</button></>}</td></tr>)}
      {!users.length&&<tr><td colSpan={6}>Chưa có tài khoản.</td></tr>}
    </tbody></table></div></div>
  </section>
}
