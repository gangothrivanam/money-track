import React,{useState,useMemo} from 'react';
import { PieChart,Pie,Cell,Tooltip,Legend,ResponsiveContainer,BarChart,Bar,XAxis,YAxis,CartesianGrid } from 'recharts';
import { useApp } from '../App.jsx';
import { Card,Empty } from '../components/ui.jsx';
import { inr,ymd,parse } from '../utils/calc.js';
export const COLORS={Food:'#ff8a2a',Travel:'#2d8cf0',Shopping:'#8b5cf6',Bills:'#16a37f',Entertainment:'#ec4899',Health:'#e5484d',Education:'#f5a524',['Personal Care']:'#14b8a6',Other:'#8b97a3'};
function range(k,from,to){const t=new Date(),d=n=>{const x=new Date(t);x.setDate(x.getDate()-n);return x};
  if(k==='today')return[ymd(t),ymd(t)];
  if(k==='week'){const x=d((t.getDay()+6)%7);return[ymd(x),ymd(t)]}
  if(k==='month')return[ymd(new Date(t.getFullYear(),t.getMonth(),1)),ymd(t)];
  if(k==='last')return[ymd(new Date(t.getFullYear(),t.getMonth()-1,1)),ymd(new Date(t.getFullYear(),t.getMonth(),0))];
  return[from,to];}
export default function Analytics(){
  const{data}=useApp();const[k,setK]=useState('month');const[from,setFrom]=useState(ymd(new Date()));const[to,setTo]=useState(ymd(new Date()));
  const[a,b]=range(k,from,to);
  const list=useMemo(()=>data.expenses.filter(e=>e.expense_date>=a&&e.expense_date<=b),[data,a,b]);
  const total=list.reduce((x,e)=>x+e.amount,0);
  const cat=Object.entries(list.reduce((m,e)=>(m[e.category]=(m[e.category]||0)+e.amount,m),{})).map(([name,value])=>({name,value}));
  const daily=Object.entries(list.reduce((m,e)=>(m[e.expense_date]=(m[e.expense_date]||0)+e.amount,m),{})).sort().map(([day,amount])=>({day:day.slice(5),amount}));
  const months=Object.entries(data.expenses.reduce((m,e)=>{const x=e.expense_date.slice(0,7);m[x]=(m[x]||0)+e.amount;return m},{})).sort().slice(-6).map(([month,spent])=>({month,spent}));
  const other=data.incomes.filter(i=>i.income_type==='other').reduce((m,i)=>{const x=i.income_date.slice(0,7);m[x]=(m[x]||0)+i.amount;return m},{});
  const ive=months.map(m=>({month:m.month,Income:(+data.settings.monthly_salary||0)+(other[m.month]||0),Expenses:m.spent}));
  const Chart=({children,has})=>has?<ResponsiveContainer width="100%" height={260}>{children}</ResponsiveContainer>:<Empty>No data for this range.</Empty>;
  return<><div className="row between"><h1>Analytics</h1><div className="seg" role="group" aria-label="Date range">{[['today','Today'],['week','This week'],['month','This month'],['last','Last month'],['custom','Custom']].map(([v,l])=><button key={v} className={k===v?'on':''} onClick={()=>setK(v)}>{l}</button>)}</div></div>
    {k==='custom'&&<div className="row"><label>From<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label><label>To<input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label></div>}
    <p className="muted">{a} to {b}: <b>{inr(total)}</b> across {list.length} expenses.</p>
    <div className="grid2">
      <Card title="Spending by category"><Chart has={cat.length}><PieChart><Pie data={cat} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} label={({percent})=>Math.round(percent*100)+'%'}>{cat.map(c=><Cell key={c.name} fill={COLORS[c.name]}/>)}</Pie><Tooltip formatter={v=>inr(v)}/><Legend/></PieChart></Chart></Card>
      <Card title="Daily spending"><Chart has={daily.length}><BarChart data={daily}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="day"/><YAxis width={45}/><Tooltip formatter={v=>inr(v)}/><Bar dataKey="amount" fill="#0b8f68" radius={[4,4,0,0]}/></BarChart></Chart></Card>
      <Card title="Monthly spending"><Chart has={months.length}><BarChart data={months}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="month"/><YAxis width={45}/><Tooltip formatter={v=>inr(v)}/><Bar dataKey="spent" fill="#2d8cf0" radius={[4,4,0,0]}/></BarChart></Chart></Card>
      <Card title="Income vs expenses"><Chart has={ive.length}><BarChart data={ive}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="month"/><YAxis width={45}/><Tooltip formatter={v=>inr(v)}/><Legend/><Bar dataKey="Income" fill="#0b8f68" radius={[4,4,0,0]}/><Bar dataKey="Expenses" fill="#e5484d" radius={[4,4,0,0]}/></BarChart></Chart></Card></div></>;
}
