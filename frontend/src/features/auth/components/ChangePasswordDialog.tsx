import { useState, type FormEvent } from 'react'
import { authApi, AuthApiError } from '../api/authApi'
import { useI18n } from '../../../i18n'

export function ChangePasswordDialog({ onClose }: { onClose: () => void }) {
  const { t } = useI18n()
  const [currentPassword,setCurrentPassword]=useState('')
  const [newPassword,setNewPassword]=useState('')
  const [confirmPassword,setConfirmPassword]=useState('')
  const [error,setError]=useState('')
  const [busy,setBusy]=useState(false)
  const [done,setDone]=useState(false)

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setError('')
    if(newPassword!==confirmPassword){setError(t('passwordMismatch'));return}
    setBusy(true)
    try{await authApi.changePassword(currentPassword,newPassword);setDone(true);setCurrentPassword('');setNewPassword('');setConfirmPassword('')}
    catch(e){setError(e instanceof AuthApiError?t('passwordChangeFailed'):e instanceof Error?e.message:t('passwordChangeFailed'))}
    finally{setBusy(false)}
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event)=>{if(event.target===event.currentTarget)onClose()}}>
    <section className="modal-content modal-content-small" role="dialog" aria-modal="true" aria-labelledby="change-password-title">
      <header className="modal-header"><h2 className="modal-title" id="change-password-title">{t('changePassword')}</h2><button className="modal-close-btn" type="button" onClick={onClose} aria-label={t('close')}>×</button></header>
      {done?<div className="modal-form"><div className="import-hint-box" role="status">{t('passwordUpdated')}</div><button className="btn btn-teal" type="button" onClick={onClose}>{t('close')}</button></div>:<form className="modal-form" onSubmit={(event)=>void submit(event)}>
        {error&&<div className="modal-alert" role="alert">{error}</div>}
        <label>{t('currentPassword')}<input className="form-control" type="password" autoComplete="current-password" minLength={8} required value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)}/></label>
        <label>{t('newPassword')}<input className="form-control" type="password" autoComplete="new-password" minLength={8} required value={newPassword} onChange={(e)=>setNewPassword(e.target.value)}/></label>
        <label>{t('confirmNewPassword')}<input className="form-control" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)}/></label>
        <div style={{display:'flex',justifyContent:'flex-end',gap:8}}><button className="btn btn-secondary" type="button" onClick={onClose}>{t('cancel')}</button><button className="btn btn-teal" type="submit" disabled={busy}>{busy?t('updatingPassword'):t('updatePassword')}</button></div>
      </form>}
    </section>
  </div>
}
