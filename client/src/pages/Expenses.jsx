import React,{useState} from 'react';
import { api } from '../services/api.js';
import { useApp } from '../App.jsx';
import { Card,Err,Empty } from '../components/ui.jsx';
import { CATEGORIES,inr,ymd } from '../utils/calc.js';
const blank=()=>({amount:'',category:'Food',expense_date:ymd(new Date()),description:'',payment_method:''});
export default function Expenses(){
  const{data,afterExpense,refresh}=useApp();const[f,setF]=useState(blank());const[edit,setEdit]=useState(null);const[err,setErr]=useState('');
  const set=k=>e=>setF({...f,[k]:e.target.value});
  async function save(e){e.preventDefault();setErr('');const amt=+f.amount;
    if(!(amt>0))return setErr('Enter an amount above zero.');
    try{if(edit){await api('/expenses/'+edit,'PUT',{...f,amount:amt});setEdit(null)}else await api('/expenses','POST',{...f,amount:amt});
      setF(blank());await afterExpense(edit?null:amt);if(edit)await refresh()}catch(x){setErr(x.message)}}
  async function del(id){if(!confirm('Delete this expense?'))return;await api('/expenses/'+id,'DELETE');await afterExpense(null)}
  return<><h1>{edit?'Edit expense':'Add daily expense'}</h1><div className="grid2">
    <Card><form onSubmit={save} noValidate>
      <label>Amount (₹)<input type="number" min="0" step="0.01" inputMode="decimal" value={f.amount} onChange={set('amount')}/></label>
      <label>Category<select value={f.category} onChange={set('category')}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></label>
      <label>Date<input type="date" value={f.expense_date} onChange={set('expense_date')}/></label>
      <label>Note (optional)<input value={f.description} onChange={set('description')} maxLength="200"/></label>
      <label>Payment method (optional)<select value={f.payment_method} onChange={set('payment_method')}><option value="">—</option>{['Cash','UPI','Card','Bank transfer'].map(c=><option key={c}>{c}</option>)}</select></label>
      <Err msg={err}/><button className="btn">{edit?'Save changes':'Save expense'}</button>{edit&&<button type="button" className="btn ghost" onClick={()=>{setEdit(null);setF(blank())}}>Cancel</button>}</form></Card>
    <Card title="All expenses">{data.expenses.length?data.expenses.slice(0,50).map(e=><div className="line" key={e.id}><span>{e.category}<small>{e.expense_date}{e.description?' · '+e.description:''}</small></span><span><b>{inr(e.amount)}</b> <button className="link" onClick={()=>{setEdit(e.id);setF({amount:e.amount,category:e.category,expense_date:e.expense_date,description:e.description||'',payment_method:e.payment_method||''})}}>Edit</button> <button className="link danger" onClick={()=>del(e.id)}>Delete</button></span></div>):<Empty>No expenses yet.</Empty>}</Card></div></>;
}
