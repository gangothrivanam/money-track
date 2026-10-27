import React,{useState} from 'react';
export default function Bell({notifications,onRead}){
  const[open,setOpen]=useState(false);const unread=notifications.filter(n=>!n.is_read).length;
  return<div className="bell"><button aria-label={`Notifications, ${unread} unread`} onClick={()=>{setOpen(!open);if(!open&&unread)onRead()}}>🔔{unread>0&&<span className="badge">{unread}</span>}</button>
    {open&&<div className="panel"><h4>Notification history</h4>{notifications.length?notifications.map(n=><div key={n.id} className="nrow"><b>{n.title}</b><p>{n.message}</p><small>{n.created_at}</small></div>):<p className="muted">No alerts yet.</p>}</div>}</div>;
}
