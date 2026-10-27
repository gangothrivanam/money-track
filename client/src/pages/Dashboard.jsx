import React from 'react';
import { Link } from 'react-router-dom';
import { PieChart,Pie,Cell,Tooltip,ResponsiveContainer,BarChart,Bar,XAxis,YAxis } from 'recharts';
import { useApp } from '../App.jsx';
import { Card,Stat,Progress,StatusPill,Empty } from '../components/ui.jsx';
import { inr,ymd,daysBetween } from '../utils/calc.js';
import { COLORS } from './Analytics.jsx';
export default function Dashboard(){
  const{data,calc:c,upc}=useApp();
  const pie=Object.entries(c.byCategory).map(([name,value])=>({name,value}));
  const days=[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);const k=ymd(d);return{day:k.slice(8),amount:data.expenses.filter(e=>e.expense_date===k).reduce((a,e)=>a+e.amount,0)}});
  const next=upc.filter(u=>!u.paid&&u.daysLeft<=Math.max(c.daysUntilSalary,1)).slice(0,5);
  return<>
    <div className="row between"><h1>Dashboard</h1><StatusPill status={c.status}/></div>
    <div className="grid4">
      <Stat tone="g" label="Available money" value={inr(c.available)} sub={`of ${inr(c.usable)} usable`}/>
      <Stat tone={c.todaySpent>c.dailyLimit?'r':'b'} label="Today's spending" value={inr(c.todaySpent)} sub={c.overBy>0?`Over budget by ${inr(c.overBy)}`:`Limit ${inr(c.dailyLimit)}`}/>
      <Stat tone="p" label="Remaining daily budget" value={inr(c.remainingDaily)} sub={`Safe daily spend ${inr(c.safeDaily)}`}/>
      <Stat tone="y" label="Days until salary" value={c.daysUntilSalary} sub={`Next: ${ymd(c.end)}`}/>
      <Stat label="Monthly spending" value={inr(c.monthSpent)}/>
      <Stat label="Emergency reserve" value={inr(c.reserve)} sub="Kept separate"/>
      <Stat label="Commitments this period" value={inr(c.commitments)} sub={`${inr(c.totalPaidCommitments)} paid`}/>
      <Stat label="Upcoming bills" value={next.length} sub={next[0]?`${next[0].name} in ${next[0].daysLeft}d`:'None due'}/>
    </div>
    <div className="grid2">
      <Card title="Progress"><Progress label="Today vs daily limit" value={c.todaySpent} max={c.dailyLimit}/><br/><Progress label="Period spending vs usable budget" value={c.spent} max={c.usable}/></Card>
      <Card title="Upcoming commitments">{next.length?next.map(u=><div className="line" key={u.id+ymd(u.date)}><span>{u.name}<small>{ymd(u.date)} · {u.overdue?'overdue':`in ${u.daysLeft} days`}</small></span><b>{inr(u.amount)}</b></div>):<Empty>Nothing due before your next salary.</Empty>}<Link to="/commitments">Manage commitments</Link></Card>
      <Card title="Spending by category">{pie.length?<ResponsiveContainer width="100%" height={220}><PieChart><Pie data={pie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85}>{pie.map((p,i)=><Cell key={p.name} fill={COLORS[p.name]}/>)}</Pie><Tooltip formatter={v=>inr(v)}/></PieChart></ResponsiveContainer>:<Empty>No expenses yet. <Link to="/expenses">Add your first expense</Link>.</Empty>}</Card>
      <Card title="Last 7 days"><ResponsiveContainer width="100%" height={220}><BarChart data={days}><XAxis dataKey="day"/><YAxis width={40}/><Tooltip formatter={v=>inr(v)}/><Bar dataKey="amount" fill="#0b8f68" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></Card>
      <Card title="Recent transactions">{data.expenses.slice(0,6).map(e=><div className="line" key={e.id}><span>{e.category}<small>{e.expense_date}{e.description?' · '+e.description:''}</small></span><b>{inr(e.amount)}</b></div>)}{!data.expenses.length&&<Empty>No transactions yet.</Empty>}</Card>
      <Card title="Latest alerts">{data.notifications.slice(0,4).map(n=><div className="line" key={n.id}><span>{n.title}<small>{n.message}</small></span></div>)}{!data.notifications.length&&<Empty>No alerts. You are on track.</Empty>}</Card>
    </div></>;
}
