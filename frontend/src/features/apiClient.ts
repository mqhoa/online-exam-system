const apiBase = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

function csrfHeaders(): Record<string,string> {
  const token=document.cookie.split('; ').find((item)=>item.startsWith('XSRF-TOKEN='))?.slice('XSRF-TOKEN='.length)
  return token?{'X-XSRF-TOKEN':decodeURIComponent(token)}:{}
}

export async function apiRequest<T>(path:string,init:RequestInit={}):Promise<T>{
  const method=(init.method??'GET').toUpperCase();const form=init.body instanceof FormData
  const response=await fetch(`${apiBase}/api${path}`,{...init,credentials:'include',headers:{Accept:'application/json',...(!['GET','HEAD','OPTIONS'].includes(method)?csrfHeaders():{}),...(init.body&&!form?{'Content-Type':'application/json'}:{}),...init.headers}})
  if(!response.ok){const body=await response.json().catch(()=>null) as {error?:string;message?:string;detail?:string}|null;throw new Error(body?.detail??body?.message??body?.error??`Yêu cầu thất bại (${response.status})`)}
  if(response.status===204)return undefined as T
  return response.json() as Promise<T>
}

export async function apiUpload<T>(path:string,file:File):Promise<T>{const data=new FormData();data.append('file',file);return apiRequest<T>(path,{method:'POST',body:data})}

export async function apiDownload(path:string,filename:string):Promise<void>{
  const response=await fetch(`${apiBase}/api${path}`,{credentials:'include',headers:{Accept:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}})
  if(!response.ok){const body=await response.json().catch(()=>null) as {error?:string}|null;throw new Error(body?.error??`Tải tệp thất bại (${response.status})`)}
  const url=URL.createObjectURL(await response.blob());const link=document.createElement('a');link.href=url;link.download=filename;link.click();URL.revokeObjectURL(url)
}
