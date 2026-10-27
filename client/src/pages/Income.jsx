import React,{useState} from 'react';
import { api } from '../services/api.js';
import { useApp } from '../App.jsx';
import { Card,Err,Empty } from '../components/ui.jsx';
import { inr,ymd } from '../utils/calc.js';
export default function Income(){
  const{data,calc,refresh}=useApp();const s=data.settings;
  const[sal,setSal]=useState({monthly_salary:s.monthly_salary||'',salary_day:s.salary_day||1});
  const[o,setO]=useState({source_name:'',amount:'',income_date:ymd(new Date())});const[err,setErr]=useState('');
  async function saveSal(e){e.preventDefault();setErr('');if(!(+sal.monthly_salary>0))return setErr('Enter your monthly salary.');
    try{await api('/settings','PUT',{...s,monthly_salary:+sal.monthly_salary,salary_day:+sal.salary_day});await refresh()}catch(x){setErr(x.message)}}
  async function addO(e){e.preventDefault();setErr('');if(!o.source_name.trim()||!(+o.amount>0))return setErr('Enter a source and an amount above zero.');
    try{await api('/incomes','POST',{...o,amount:+o.amount,income_type:'other'});setO({...o,source_name:'',amount:''});await refresh()}catch(x){setErr(x.message)}}
  return<><h1>Income</h1><div className="grid2">
    <Card title="Monthly salary"><form onSubmit={saveSal} noValidate>
      <label>Monthly salary (₹)<input type="number" min="0" value={sal.monthly_salary} onChange={e=>setSal({...sal,monthly_salary:e.target.value})}/></label>
      <label>Salary date (day of month)<input type="number" min="1" max="31" value={sal.salary_day} onChange={e=>setSal({...sal,salary_day:e.target.value})}/></label>
      <Err msg={err}/><button className="btn">Save salary</button></form>
      <p className="muted">Total income this period: <b>{inr(calc.income)}</b>. Next salary: <b>{ymd(calc.end)}</b> ({calc.daysUntilSalary} days).</p></Card>
    <Card title="Other income"><form onSubmit={addO} noValidate>
      <label>Description<input value={o.source_name} onChange={e=>setO({...o,source_name:e.target.value})} placeholder="Freelance"/></label>
      <label>Amount (₹)<input type="number" min="0" value={o.amount} onChange={e=>setO({...o,amount:e.target.value})}/></label>
      <label>Date received<input type="date" value={o.income_date} onChange={e=>setO({...o,income_date:e.target.value})}/></label>
      <button className="btn">Add income</button></form>
      {data.incomes.filter(i=>i.income_type==='other').map(i=><div className="line" key={i.id}><span>{i.source_name}<small>{i.income_date}</small></span><span><b>{inr(i.amount)}</b> <button className="link danger" onClick={async()=>{await api('/incomes/'+i.id,'DELETE');refresh()}}>Delete</button></span></div>)}
      {!data.incomes.length&&<Empty>No other income recorded.</Empty>}</Card></div></>;
}
