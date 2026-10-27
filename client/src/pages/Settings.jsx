import React,{useState} from 'react';
import { api } from '../services/api.js';
import { useApp } from '../App.jsx';
import { Card,Err } from '../components/ui.jsx';
import { inr } from '../utils/calc.js';
const TYPES={saved:'Expense saved',near:'Approaching daily limit (80%)',over:'Daily limit exceeded',large:'Large expense',due:'Upcoming or overdue commitment',low:'Low available balance'};
export default function Settings(){
  const{data,calc,refresh,prefs,setPrefs}=useApp();const s=data.settings;
  const[f,setF]=useState({emergency_reserve:s.emergency_reserve,daily_spending_limit:s.daily_spending_limit});const[err,setErr]=useState('');const[ok,setOk]=useState(false);
  async function save(e){e.preventDefault();setErr('');setOk(false);try{await api('/settings','PUT',{...s,emergency_reserve:+f.emergency_reserve||0,daily_spending_limit:+f.daily_spending_limit||0});await refresh();setOk(true)}catch(x){setErr(x.message)}}
  return<><h1>Settings</h1><div className="grid2">
    <Card title="Emergency reserve and daily limit"><form onSubmit={save} noValidate>
      <label>Emergency reserve (₹)<input type="number" min="0" value={f.emergency_reserve} onChange={e=>setF({...f,emergency_reserve:e.target.value})}/></label>
      <label>Daily spending limit (₹, 0 = use safe daily spending)<input type="number" min="0" value={f.daily_spending_limit} onChange={e=>setF({...f,daily_spending_limit:e.target.value})}/></label>
      <Err msg={err}/>{ok&&<p className="okmsg">Saved.</p>}<button className="btn">Save</button></form>
      <div className="line"><span>Income</span><b>{inr(calc.income)}</b></div><div className="line"><span>Commitments</span><b>− {inr(calc.commitments)}</b></div><div className="line"><span>Emergency reserve</span><b>− {inr(calc.reserve)}</b></div><div className="line"><span><b>Usable budget</b></span><b>{inr(calc.usable)}</b></div></Card>
    <Card title="Alerts"><p className="muted">Alerts appear inside the app. The browser only notifies you while MoneyTrack is open; alerts while the site is closed need a push service or a scheduled backend job.</p>
      {Object.entries(TYPES).map(([k,l])=><label className="chk" key={k}><input type="checkbox" checked={prefs.enabled[k]!==false} onChange={e=>setPrefs({...prefs,enabled:{...prefs.enabled,[k]:e.target.checked}})}/> {l}</label>)}
      <label>Large expense threshold (₹)<input type="number" min="0" value={prefs.largeThreshold} onChange={e=>setPrefs({...prefs,largeThreshold:+e.target.value||0})}/></label>
      <label>Close popups after (seconds)<input type="number" min="2" max="60" value={prefs.toastSeconds} onChange={e=>setPrefs({...prefs,toastSeconds:+e.target.value||6})}/></label>
      <button className="btn ghost" onClick={()=>Notification.requestPermission()}>Allow browser notifications</button></Card></div></>;
}
