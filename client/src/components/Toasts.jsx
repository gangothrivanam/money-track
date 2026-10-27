import React,{useEffect} from 'react';
function Toast({t,seconds,onClose}){
  useEffect(()=>{const h=setTimeout(()=>onClose(t.id),seconds*1000);return()=>clearTimeout(h)},[]);
  return<div className={'toast '+t.level} role="alert"><div><b>{t.title}</b><p>{t.message}</p></div><button aria-label="Close notification" onClick={()=>onClose(t.id)}>×</button></div>;
}
export default function Toasts({items,seconds=6,onClose}){return<div className="toasts" aria-live="polite">{items.map(t=><Toast key={t.id} t={t} seconds={seconds} onClose={onClose}/>)}</div>}
