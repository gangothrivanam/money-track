import React,{useState} from 'react';
import { api } from '../services/api.js';
import { useApp } from '../App.jsx';
import { Card,Err,Empty } from '../components/ui.jsx';
import { inr,ymd } from '../utils/calc.js';
const blank=()=>({name:'',amount:'',category:'Bills',due_date:ymd(new Date()),recurrence:'monthly',notes:''});
export default function Commitments(){
  const{data,upc,calc,refresh}=useApp();const[f,setF]=useState(blank());const[edit,setEdit]=useState(null);const[err,setErr]=useState('');
  const set=k=>e=>setF({...f,[k]:e.target.value});
  async function save(e){e.preventDefault();setErr('');if(!f.name.trim()||!(+f.amount>=0)||f.amount==='')return setErr('Enter a name and an amount.');
    try{await api(edit?'/commitments/'+edit:'/commitments',edit?'PUT':'POST',{...f,amount:+f.amount});setEdit(null);setF(blank());await refresh()}catch(x){setErr(x.message)}}
  const act=async(fn)=>{await fn();await refresh()};
  return<><h1>Commitments</h1>
    <p className="muted">Total this budget period: <b>{inr(calc.commitments)}</b>. Each commitment is deducted once. Marking one as paid records the payment but does not add an expense.</p>
    <div className="grid2"><Card title={edit?'Edit commitment':'Add commitment'}><form onSubmit={save} noValidate>
      <label>Name<input value={f.name} onChange={set('name')} placeholder="Rent"/></label>
      <label>Amount (₹)<input type="number" min="0" value={f.amount} onChange={set('amount')}/></label>
      <label>Due date<input type="date" value={f.due_date} onChange={set('due_date')}/></label>
      <label>Recurrence<select value={f.recurrence} onChange={set('recurrence')}>{['monthly','weekly','yearly','one-time'].map(r=><option key={r}>{r}</option>)}</select></label>
      <label>Category<input value={f.category} onChange={set('category')}/></label>
      <label>Notes (optional)<input value={f.notes} onChange={set('notes')}/></label>
      <Err msg={err}/><button className="btn">{edit?'Save changes':'Add commitment'}</button></form></Card>
    <Card title="Upcoming, in date order">{upc.filter(u=>!u.paid||u.daysLeft>=0).slice(0,20).map(u=><div className="line" key={u.id+ymd(u.date)}><span>{u.name}<small>{ymd(u.date)} · {u.paid?'paid':u.overdue?'overdue':`due in ${u.daysLeft} days`}</small></span><span><b>{inr(u.amount)}</b> {!u.paid&&<button className="link" onClick={()=>act(()=>api(`/commitments/${u.id}/pay`,'POST',{paid_date:ymd(new Date())}))}>Mark paid</button>}</span></div>)}{!upc.length&&<Empty>No commitments yet. Add rent, EMI, bills or subscriptions.</Empty>}</Card></div>
    <Card title="All commitments">{data.commitments.map(c=><div className="line" key={c.id}><span>{c.name}<small>{c.recurrence} · from {c.due_date} · {c.category}</small></span><span><b>{inr(c.amount)}</b> <button className="link" onClick={()=>{setEdit(c.id);setF({name:c.name,amount:c.amount,category:c.category,due_date:c.due_date,recurrence:c.recurrence,notes:c.notes||''});scrollTo(0,0)}}>Edit</button> <button className="link danger" onClick={()=>confirm('Delete this commitment?')&&act(()=>api('/commitments/'+c.id,'DELETE'))}>Delete</button></span></div>)}{!data.commitments.length&&<Empty>Nothing here yet.</Empty>}</Card></>;
}
