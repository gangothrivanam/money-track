const BASE=import.meta.env.VITE_API_URL||'http://localhost:4000/api';
export const getToken=()=>localStorage.getItem('mt_token');
export async function api(path,method='GET',body){
  const res=await fetch(BASE+path,{method,headers:{'Content-Type':'application/json',...(getToken()?{Authorization:'Bearer '+getToken()}:{})},body:body?JSON.stringify(body):undefined});
  const data=await res.json().catch(()=>({}));
  if(res.status===401&&getToken()){localStorage.removeItem('mt_token');location.reload()}
  if(!res.ok)throw new Error(data.error||'Request failed');
  return data;
}
