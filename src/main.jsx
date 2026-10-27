import React,{useEffect,useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {AreaChart,Area,XAxis,YAxis,Tooltip,ResponsiveContainer,PieChart,Pie,Cell,BarChart,Bar,CartesianGrid} from 'recharts';
import {LayoutDashboard,WalletCards,Receipt,CalendarClock,ChartNoAxesCombined,Settings as SettingsIcon,Plus,ArrowUpRight,ArrowDownRight,ShieldCheck,Target,Clock3,Trash2,CheckCircle2,AlertTriangle,Lightbulb,ChevronRight,IndianRupee,Menu,X,LogOut,RefreshCcw,ShoppingBag,Utensils,Bus,House,HeartPulse,GraduationCap,Gamepad2,MoreHorizontal,Bell,Eye,EyeOff,LockKeyhole,UserPlus} from 'lucide-react';
import './styles.css';

const CATS=['Food','Travel','Shopping','Bills','Entertainment','Health','Education','Home','Other'];
const CAT_ICON={Food:Utensils,Travel:Bus,Shopping:ShoppingBag,Bills:Receipt,Entertainment:Gamepad2,Health:HeartPulse,Education:GraduationCap,Home:House,Other:MoreHorizontal};
const COLORS=['#10b981','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#06b6d4','#ec4899','#64748b','#94a3b8'];
const money=n=>`₹${Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:0})}`;
const uid=()=>globalThis.crypto?.randomUUID?.()||Date.now()+Math.random();
const todayISO=()=>{const d=new Date();const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`};
function daysInMonth(y,m){return new Date(y,m+1,0).getDate()}
function nextSalary(day){const now=new Date();let y=now.getFullYear(),m=now.getMonth();let d=new Date(y,m,Math.min(day,daysInMonth(y,m)),23,59,59);if(d<=now){m++;if(m>11){m=0;y++}d=new Date(y,m,Math.min(day,daysInMonth(y,m)),23,59,59)}return d}
function daysLeft(day){return Math.max(1,Math.ceil((nextSalary(day)-new Date())/86400000))}
function seed(){return {profile:{name:'',income:30000,salaryDay:1,reserve:3000},commitments:[{id:uid(),name:'Rent',amount:8000,due:5,cat:'Home'},{id:uid(),name:'EMI',amount:4000,due:10,cat:'Bills'},{id:uid(),name:'Electricity',amount:1500,due:15,cat:'Bills'}],expenses:[]}}
function load(){try{return JSON.parse(localStorage.getItem('money-track-v2'))||seed()}catch{return seed()}}
function save(d){localStorage.setItem('money-track-v2',JSON.stringify(d))}

function App(){
 const [account,setAccount]=useState(()=>{try{return JSON.parse(localStorage.getItem('money-track-account'))||null}catch{return null}});
 const [data,setData]=useState(()=>{const d=load(); return d});
 const [page,setPage]=useState('dashboard');
 const [mobile,setMobile]=useState(false);
 const [toast,setToast]=useState('');
 const [dailyOpen,setDailyOpen]=useState(false);
 const [noticeOpen,setNoticeOpen]=useState(false);
 const [notifications,setNotifications]=useState(()=>{try{return JSON.parse(localStorage.getItem('money-track-notifications'))||[]}catch{return[]}});
 const [lastDailyDate,setLastDailyDate]=useState(()=>localStorage.getItem('money-track-last-daily')||'');
 useEffect(()=>save(data),[data]);
 useEffect(()=>{localStorage.setItem('money-track-notifications',JSON.stringify(notifications))},[notifications]);
 useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(''),2800);return()=>clearTimeout(t)}},[toast]);

 const s=useMemo(()=>calc(data),[data]);
 const go=p=>{setPage(p);setMobile(false)};
 const createAccount=(profile)=>{
   const a={email:profile.email,password:profile.password};
   localStorage.setItem('money-track-account',JSON.stringify(a));
   const d={...data,profile:{...data.profile,name:profile.name}};
   setData(d); setAccount(a);
   setPage('dashboard');
   setToast('Welcome to MoneyTrack.');
   enableBrowserNotifications();
 };
 const login=(email,password)=>{
   if(!account || email.toLowerCase()!==account.email.toLowerCase() || password!==account.password) return false;
   setAccount(account); return true;
 };
 const logout=()=>{setAccount(null);setPage('dashboard');};
 const dailyMessage=()=>{
   if(s.today<=s.safe) return `You spent ${money(s.today)} today. Your safe limit was ${money(s.safe)}. You are within your plan.`;
   return `You spent ${money(s.today)} today, ${money(s.today-s.safe)} above your safe pace. Your remaining daily budget has been recalculated.`;
 };
 const showDaily=()=>{
   const date=todayISO();
   if(lastDailyDate===date)return;
   setLastDailyDate(date);
   localStorage.setItem('money-track-last-daily',date);
   const n={id:uid(),date,type:'daily',title:'Your daily money check',message:dailyMessage(),time:new Date().toISOString()};
   setNotifications(prev=>[n,...prev].slice(0,30));
   setDailyOpen(true);
   if('Notification' in window && Notification.permission==='granted'){
     new Notification('MoneyTrack — Daily Money Check',{body:n.message});
   }
 };
 useEffect(()=>{
   if(!account)return;
   const check=()=>{
     const hour=new Date().getHours();
     if(hour>=21)showDaily();
   };
   check();
   const timer=setInterval(check,30000);
   return()=>clearInterval(timer);
 },[account,s.today,s.safe,lastDailyDate]);
 const enableBrowserNotifications=()=>{
   if('Notification' in window && Notification.permission==='default') Notification.requestPermission();
 };
 if(!account) return <Auth onLogin={login} onSignup={createAccount}/>;

 return <div className="shell">
   <aside className={mobile?'sidebar open':'sidebar'}>
     <div className="brand"><span className="brand-mark"><i></i><i></i><i></i></span><span>Money<span>Track</span></span></div>
     <button className="mobile-close" onClick={()=>setMobile(false)}><X/></button>
     <nav>{[['dashboard',LayoutDashboard,'Dashboard'],['expenses',Receipt,'Daily Expenses'],['commitments',CalendarClock,'Commitments'],['afford',Target,'Can I afford?'],['reports',ChartNoAxesCombined,'Analytics'],['settings',SettingsIcon,'Money Plan']].map(([id,I,label])=><button key={id} onClick={()=>go(id)} className={page===id?'nav active':'nav'}><I size={18}/>{label}</button>)}</nav>
     <div className="side-bottom">
       <div className="side-card"><ShieldCheck size={18}/><div><b>Private by design</b><span>Your MVP data stays in this browser.</span></div></div>
       <button className="reset" onClick={()=>{if(confirm('Reset all Money Track data?')){const x=seed();setData(x);setToast('Reset complete')}}}><RefreshCcw size={14}/> Reset demo data</button>
       <button className="reset logout-btn" onClick={logout}><LogOut size={14}/> Log out</button>
     </div>
   </aside>
   <main className="main">
     <header className="topbar">
       <button className="mobile-menu" onClick={()=>setMobile(true)}><Menu/></button>
       <div><div className="crumb">PERSONAL MONEY CONTROL</div><h1>{page==='dashboard'?`Good morning, ${data.profile.name||'there'} 👋`:pageTitle(page)}</h1><p>{page==='dashboard'?'Know where your money is going — and how to make it last.':pageSubtitle(page)}</p></div>
       <div className="top-actions">
         <button className="bell-btn" onClick={()=>setNoticeOpen(true)} title="Notifications"><Bell size={18}/>{notifications.length>0&&<span>{notifications.length>9?'9+':notifications.length}</span>}</button>
         <div className="balance-pill"><span>Available</span><b>{money(s.remaining)}</b></div>
         <button className="avatar">{(data.profile.name||'M').slice(0,1).toUpperCase()}</button>
       </div>
     </header>
     {toast&&<div className="toast"><CheckCircle2 size={17}/>{toast}</div>}
     {page==='dashboard'&&<Dashboard s={s} data={data} setPage={go}/>}
     {page==='expenses'&&<Expenses data={data} setData={setData} s={s} toast={setToast}/>}
     {page==='commitments'&&<Commitments data={data} setData={setData} s={s} toast={setToast}/>}
     {page==='afford'&&<Afford s={s}/>}
     {page==='reports'&&<Reports s={s}/>}
     {page==='settings'&&<Settings data={data} setData={setData} toast={setToast}/>}
   </main>
   {dailyOpen&&<DailyModal s={s} onClose={()=>setDailyOpen(false)} onAdd={()=>{setDailyOpen(false);go('expenses')}}/>}
   {noticeOpen&&<NotificationPanel notifications={notifications} onClose={()=>setNoticeOpen(false)} onDaily={()=>{setNoticeOpen(false);setDailyOpen(true)}}/>}
 </div>
}

function Auth({onLogin,onSignup}){
 const [mode,setMode]=useState('login');
 const [name,setName]=useState('');
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [confirm,setConfirm]=useState('');
 const [show,setShow]=useState(false);
 const [error,setError]=useState('');
 const submit=e=>{
   e.preventDefault();setError('');
   if(mode==='signup'){
     if(!name.trim()||!email.trim()||password.length<6){setError('Enter your name, a valid email and a password of at least 6 characters.');return}
     if(password!==confirm){setError('Passwords do not match.');return}
     onSignup({name:name.trim(),email:email.trim(),password});
   }else{
     if(!email||!password){setError('Enter your email and password.');return}
     if(!onLogin(email,password)){setError('Email or password is incorrect.');return}
   }
 };
 return <div className="auth-shell">
   <div className="auth-card">
     <div className="auth-brand"><span className="brand-mark"><i></i><i></i><i></i></span><b>Money<span>Track</span></b></div>
     <div className="auth-kicker">PERSONAL MONEY CONTROL</div>
     <h1>{mode==='login'?'Welcome back 👋':'Start controlling your money'}</h1>
     <p className="auth-sub">{mode==='login'?'Log in to see today’s safe spending amount and your money runway.':'Create your private MoneyTrack account and build your first money plan.'}</p>
     <form onSubmit={submit} className="auth-form">
       {mode==='signup'&&<label>Your name<input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Gangothri"/></label>}
       <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label>
       <label>Password<div className="password-field"><input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters"/><button type="button" onClick={()=>setShow(!show)}>{show?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>
       {mode==='signup'&&<label>Confirm password<input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Re-enter password"/></label>}
       {error&&<div className="auth-error"><AlertTriangle size={15}/>{error}</div>}
       <button className="primary auth-submit">{mode==='login'?<LockKeyhole size={17}/>:<UserPlus size={17}/>} {mode==='login'?'Log in':'Create account'}</button>
     </form>
     <div className="auth-switch">{mode==='login'?<>New to MoneyTrack? <button onClick={()=>{setMode('signup');setError('')}}>Create an account</button></>:<>Already have an account? <button onClick={()=>{setMode('login');setError('')}}>Log in</button></>}</div>
     <div className="auth-privacy"><ShieldCheck size={15}/><span>Your MVP data stays in this browser. No bank access is required.</span></div>
   </div>
 </div>
}

function DailyModal({s,onClose,onAdd}){
 const good=s.today<=s.safe;
 return <div className="modal-backdrop">
   <div className="daily-modal">
     <button className="modal-close" onClick={onClose}><X size={18}/></button>
     <div className={'daily-icon '+(good?'good':'warn')}>{good?<CheckCircle2 size={25}/>:<Bell size={25}/>}</div>
     <div className="modal-kicker">DAILY MONEY CHECK · 9:00 PM</div>
     <h2>{good?'🎉 Great job today!':'🌙 Your money check-in'}</h2>
     <p className="modal-lead">{good?`You spent ${money(s.today)} today, within your safe limit of ${money(s.safe)}.`:`You spent ${money(s.today)} today, ${money(s.today-s.safe)} above your safe pace.`}</p>
     <div className="daily-grid">
       <div><span>Spent today</span><b>{money(s.today)}</b></div>
       <div><span>Safe today</span><b>{money(s.safe)}</b></div>
       <div><span>Money left</span><b>{money(s.remaining)}</b></div>
       <div><span>Days to salary</span><b>{s.left}</b></div>
     </div>
     <div className={'daily-advice '+(good?'good':'warn')}>
       <Lightbulb size={17}/><p>{good?`You are on track. Your current safe amount for the next day is ${money(s.safe)}.`:`No judgement — MoneyTrack adjusts the plan. Aim for about ${money(s.safe)} per day for the remaining ${s.left} days.`}</p>
     </div>
     <div className="modal-actions"><button className="secondary" onClick={onClose}>Close</button><button className="primary" onClick={onAdd}>Add / review expenses</button></div>
   </div>
 </div>
}

function NotificationPanel({notifications,onClose,onDaily}){
 return <div className="modal-backdrop">
   <div className="notification-panel">
     <div className="panel-head"><h3>Notifications</h3><button className="modal-close" onClick={onClose}><X size={18}/></button></div>
     {!notifications.length?<Empty icon={Bell} text="Your daily money updates will appear here."/>:<div className="notification-list">{notifications.map(n=><button key={n.id} className="notification-item" onClick={n.type==='daily'?onDaily:undefined}><div className="notification-item-icon"><Bell size={15}/></div><div><b>{n.title}</b><p>{n.message}</p><small>{new Date(n.time).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})}</small></div></button>)}</div>}
   </div>
 </div>
}

function pageTitle(p){return ({expenses:'Daily Expenses',commitments:'Commitments',afford:'Can I afford this?',reports:'Your Money Analytics',settings:'Your Money Plan'})[p]}
function pageSubtitle(p){return ({expenses:'Log a small amount today. Money Track handles the rest.',commitments:'Protect the money that is already promised to bills and responsibilities.',afford:'Check a purchase against your real month, not just your current balance.',reports:'See patterns, categories and progress over time.',settings:'Set the numbers that make your daily budget realistic.'})[p]}
function calc(d){const now=new Date();const month=now.getMonth(),year=now.getFullYear();const ex=d.expenses.filter(e=>{const x=new Date(e.date);return x.getMonth()===month&&x.getFullYear()===year});const committed=d.commitments.reduce((a,x)=>a+Number(x.amount),0);const spent=ex.reduce((a,x)=>a+Number(x.amount),0);const usable=Math.max(0,Number(d.profile.income)-committed-Number(d.profile.reserve));const remaining=Math.max(0,usable-spent);const left=daysLeft(Number(d.profile.salaryDay)||1);const safe=remaining/left;const today=ex.filter(e=>e.date===todayISO()).reduce((a,x)=>a+Number(x.amount),0);const cats=CATS.map((name,i)=>({name,value:ex.filter(e=>e.cat===name).reduce((a,x)=>a+Number(x.amount),0),fill:COLORS[i]})).filter(x=>x.value>0);const daily=Array.from({length:Math.min(14,Math.max(7,new Date(year,month+1,0).getDate()))},(_,i)=>{const date=new Date(year,month,Math.max(1,new Date().getDate()-13+i));const key=date.toISOString().slice(0,10);return {label:date.toLocaleDateString('en-IN',{day:'numeric',month:'short'}),amount:ex.filter(e=>e.date===key).reduce((a,x)=>a+Number(x.amount),0)}});return {ex,committed,spent,usable,remaining,left,safe,today,cats,daily}}

function Dashboard({s,data,setPage}){const risk=s.remaining<=0?'danger':s.today>s.safe*1.5?'warn':'good';return <div className="content"><section className="hero"><div><div className="hero-kicker"><span className="pulse"></span> MONEY RUNWAY</div><h2>{risk==='good'?'You’re on track.':risk==='warn'?'A little above your pace.':'Let’s protect the rest of the month.'}</h2><p>Based on your income, commitments, reserve and spending so far.</p></div><div className="hero-right"><div className="hero-safe"><span>Safe to spend today</span><strong>{money(s.safe)}</strong><small>{s.left} days to next salary</small></div></div></section><div className="stats"><Stat icon={WalletCards} label="Available money" value={money(s.remaining)} note={`of ${money(s.usable)} usable`} tone="green"/><Stat icon={Receipt} label="Spent this month" value={money(s.spent)} note={`Today ${money(s.today)}`} tone="blue"/><Stat icon={CalendarClock} label="Upcoming commitments" value={money(s.committed)} note={`${data.commitments.length} payments`} tone="purple"/><Stat icon={ShieldCheck} label="Emergency reserve" value={money(data.profile.reserve)} note="Protected amount" tone="amber"/></div><div className="dash-grid"><Panel title="Today at a glance" icon={Clock3}><div className="today-main"><div className="today-ring" style={{'--p':`${Math.min(100,s.safe?Math.round((s.today/s.safe)*100):0)}%`}}><div><b>{money(s.today)}</b><span>spent today</span></div></div><div className="today-copy"><div><span>Daily target</span><b>{money(s.safe)}</b></div><div><span>Difference</span><b className={s.today>s.safe?'red':'green'}>{s.today>s.safe?'+':''}{money(s.today-s.safe)}</b></div><p>{s.today<=s.safe?'Nice. You are within today’s planned pace.':'You can still recover by keeping the next few days closer to the safe limit.'}</p></div></div></Panel><Panel title="Where your money went" icon={ChartNoAxesCombined}><div className="chart-wrap">{s.cats.length?<><ResponsiveContainer width="48%" height={230}><PieChart><Pie data={s.cats} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={3}>{s.cats.map(x=><Cell key={x.name} fill={x.fill}/>)}</Pie><Tooltip formatter={v=>money(v)}/></PieChart></ResponsiveContainer><div className="legend">{s.cats.map(x=><div key={x.name}><span style={{background:x.fill}}></span><label>{x.name}</label><b>{money(x.value)}</b></div>)}</div></>:<Empty icon={ChartNoAxesCombined} text="Add expenses to see your automatic chart."/>}</div></Panel></div><div className="dash-grid lower"><Panel title="Spending trend" icon={ChartNoAxesCombined}><ResponsiveContainer width="100%" height={245}><AreaChart data={s.daily}><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity=".25"/><stop offset="100%" stopColor="#10b981" stopOpacity="0"/></linearGradient></defs><CartesianGrid stroke="#edf1f5" vertical={false}/><XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={10}/><YAxis tickLine={false} axisLine={false} fontSize={10}/><Tooltip formatter={v=>money(v)}/><Area type="monotone" dataKey="amount" stroke="#10b981" fill="url(#g)" strokeWidth={3}/></AreaChart></ResponsiveContainer></Panel><Panel title="Upcoming money" icon={CalendarClock}><div className="commit-list">{data.commitments.slice().sort((a,b)=>a.due-b.due).map(c=><div className="commit-row" key={c.id}><div className="mini-icon"><IndianRupee size={15}/></div><div><b>{c.name}</b><span>Due {c.due}th · {c.cat}</span></div><strong>{money(c.amount)}</strong></div>)}{!data.commitments.length&&<Empty text="No commitments yet."/>}</div><button className="soft-button" onClick={()=>setPage('commitments')}>Manage commitments <ChevronRight size={15}/></button></Panel></div><section className="insight"><div className="insight-icon"><Lightbulb size={20}/></div><div><b>Money Track insight</b><p>{s.spent===0?'Start with today’s expenses. Once you log a few days, Money Track can show meaningful spending patterns.':s.today>s.safe?`You are ${money(s.today-s.safe)} above today’s safe pace. That does not mean you failed — your remaining daily budget has been recalculated.`:`You have ${money(s.remaining)} of usable money left with ${s.left} days until salary. Your current safe daily amount is ${money(s.safe)}.`}</p></div></section></div>}
function Stat({icon:Icon,label,value,note,tone}){return <div className="stat-card"><div className={'stat-icon '+tone}><Icon size={18}/></div><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div></div>}
function Panel({title,icon:Icon,children}){return <section className="panel"><div className="panel-head"><div><h3>{title}</h3></div>{Icon&&<Icon size={17} className="panel-icon"/>}</div>{children}</section>}
function Empty({icon:Icon,text}){return <div className="empty">{Icon&&<Icon size={28}/>}<span>{text}</span></div>}
function Expenses({data,setData,s,toast}){const [f,setF]=useState({amount:'',cat:'Food',date:todayISO(),note:''});const add=e=>{e.preventDefault();if(!f.amount||Number(f.amount)<=0)return;setData({...data,expenses:[...data.expenses,{id:uid(),amount:Number(f.amount),cat:f.cat,date:f.date,note:f.note.trim()}]});setF({...f,amount:'',note:''});toast('Expense saved. Your safe daily amount updated.')} ;const del=id=>{setData({...data,expenses:data.expenses.filter(x=>x.id!==id)});toast('Expense removed.')};return <div className="content"><div className="page-grid"><form className="panel form-card" onSubmit={add}><div className="form-title"><div className="round-icon green-bg"><Plus size={20}/></div><div><h3>Add an expense</h3><p>It takes less than 10 seconds.</p></div></div><label>Amount<input autoFocus type="number" min="1" step="1" placeholder="₹ 0" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})}/></label><label>Category<select value={f.cat} onChange={e=>setF({...f,cat:e.target.value})}>{CATS.map(c=><option key={c}>{c}</option>)}</select></label><label>Date<input type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></label><label>Note <span>(optional)</span><input placeholder="e.g. lunch with friends" value={f.note} onChange={e=>setF({...f,note:e.target.value})}/></label><button className="primary big" type="submit"><Plus size={17}/> Save expense</button><div className="tiny-tip"><Lightbulb size={14}/> Log it today so tomorrow’s number is accurate.</div></form><Panel title="This month" icon={Receipt}><div className="expense-total"><span>Total spending</span><b>{money(s.spent)}</b></div><div className="list">{s.ex.slice().reverse().map(e=><ExpenseRow e={e} key={e.id} del={del}/>)}</div>{!s.ex.length&&<Empty text="No expenses this month. Add your first one."/>}</Panel></div></div>}
function ExpenseRow({e,del}){const I=CAT_ICON[e.cat]||MoreHorizontal;return <div className="expense-row"><div className="expense-cat"><span><I size={16}/></span><div><b>{e.cat}</b><small>{e.note||'No note'} · {new Date(e.date+'T12:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</small></div></div><div className="expense-right"><strong>-{money(e.amount)}</strong><button onClick={()=>del(e.id)} title="Delete"><Trash2 size={15}/></button></div></div>}
function Commitments({data,setData,s,toast}){const [f,setF]=useState({name:'',amount:'',due:5,cat:'Bills'});const add=e=>{e.preventDefault();if(!f.name||!f.amount)return;setData({...data,commitments:[...data.commitments,{id:uid(),name:f.name.trim(),amount:Number(f.amount),due:Number(f.due),cat:f.cat}]});setF({name:'',amount:'',due:5,cat:'Bills'});toast('Commitment added. Your usable money was recalculated.')} ;const del=id=>{setData({...data,commitments:data.commitments.filter(x=>x.id!==id)});toast('Commitment removed.')};return <div className="content"><div className="page-grid"><form className="panel form-card" onSubmit={add}><div className="form-title"><div className="round-icon purple-bg"><CalendarClock size={20}/></div><div><h3>Add a commitment</h3><p>Money you already know you must pay.</p></div></div><label>Name<input placeholder="Rent, EMI, insurance..." value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></label><label>Amount<input type="number" min="1" placeholder="₹ 0" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})}/></label><label>Due day<input type="number" min="1" max="31" value={f.due} onChange={e=>setF({...f,due:e.target.value})}/></label><label>Category<select value={f.cat} onChange={e=>setF({...f,cat:e.target.value})}>{CATS.map(c=><option key={c}>{c}</option>)}</select></label><button className="primary big"><Plus size={17}/> Add commitment</button></form><Panel title="Your commitments" icon={CalendarClock}><div className="commit-summary"><div><span>Total committed</span><b>{money(s.committed)}</b></div><div><span>Usable after commitments</span><b>{money(s.usable)}</b></div></div><div className="list">{data.commitments.map(c=><div className="expense-row" key={c.id}><div className="expense-cat"><span className="purple-bg"><IndianRupee size={16}/></span><div><b>{c.name}</b><small>Due {c.due}th · {c.cat}</small></div></div><div className="expense-right"><strong>{money(c.amount)}</strong><button onClick={()=>del(c.id)}><Trash2 size={15}/></button></div></div>)}{!data.commitments.length&&<Empty text="No commitments. Add rent, EMI, bills or subscriptions."/>}</div></Panel></div></div>}
function Afford({s}){const [amount,setAmount]=useState('');const r=amount?Number(amount)>s.remaining?'red':Number(amount)>s.safe*7?'yellow':'green':null;return <div className="content narrow"><section className="afford-hero"><div className="afford-mark"><Target size={25}/></div><div><span className="crumb">PURCHASE DECISION</span><h2>Can I afford this?</h2><p>Check the purchase against your month before you spend.</p></div></section><div className="panel afford-card"><label>What do you want to buy?<div className="money-input"><span>₹</span><input autoFocus type="number" min="1" placeholder="0" value={amount} onChange={e=>setAmount(e.target.value)}/></div></label>{r&&<div className={'decision '+r}><div className="decision-icon">{r==='green'?<CheckCircle2/>:r==='yellow'?<AlertTriangle/>:<AlertTriangle/>}</div><div><span>{r==='green'?'YES — IT FITS YOUR PLAN':r==='yellow'?'CAUTION — IT WILL REDUCE YOUR ROOM':'BETTER TO WAIT'}</span><h3>{r==='green'?'You can make this purchase.':r==='yellow'?'You can afford it, but it changes your short-term budget.':'This purchase is larger than the money you can safely use right now.'}</h3><p>{r==='green'?`After this purchase, you would still have ${money(s.remaining-Number(amount))} usable.`:r==='yellow'?`Your safe daily amount may fall from ${money(s.safe)} after buying it.`:`You have ${money(s.remaining)} of usable money left. Protect your upcoming commitments and reserve first.`}</p></div></div>}<div className="afford-stats"><div><span>Available</span><b>{money(s.remaining)}</b></div><div><span>Safe/day</span><b>{money(s.safe)}</b></div><div><span>Days left</span><b>{s.left}</b></div></div></div></div>}
function Reports({s}){return <div className="content"><div className="report-cards"><Stat icon={ArrowDownRight} label="This month" value={money(s.spent)} note="Total spending" tone="blue"/><Stat icon={ArrowUpRight} label="Still available" value={money(s.remaining)} note="Usable money" tone="green"/><Stat icon={Target} label="Daily pace" value={money(s.safe)} note="Safe amount" tone="purple"/></div><div className="dash-grid"><Panel title="Last 14 days" icon={ChartNoAxesCombined}><ResponsiveContainer width="100%" height={320}><BarChart data={s.daily}><CartesianGrid stroke="#edf1f5" vertical={false}/><XAxis dataKey="label" tickLine={false} axisLine={false}/><YAxis tickLine={false} axisLine={false}/><Tooltip formatter={v=>money(v)}/><Bar dataKey="amount" fill="#10b981" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></Panel><Panel title="Category breakdown" icon={Receipt}>{s.cats.length?<div className="report-list">{s.cats.sort((a,b)=>b.value-a.value).map(x=><div key={x.name}><div><span style={{background:x.fill}}></span><b>{x.name}</b></div><strong>{money(x.value)}</strong><em style={{width:`${Math.max(3,Math.round(x.value/s.spent*100))}%`,background:x.fill}}></em></div>)}</div>:<Empty text="No category data yet."/>}</Panel></div></div>}
function Settings({data,setData,toast}){const [f,setF]=useState(data.profile);const save=e=>{e.preventDefault();setData({...data,profile:{...f,income:Number(f.income),salaryDay:Number(f.salaryDay),reserve:Number(f.reserve)}});toast('Money plan saved. All calculations updated.')} ;return <div className="content narrow"><section className="settings-intro"><div className="round-icon green-bg"><WalletCards size={21}/></div><div><h2>Your money plan</h2><p>Set the basic numbers once. Money Track uses them every day.</p></div></section><form className="panel form-card settings-form" onSubmit={save}><label>Your name<input value={f.name} placeholder="e.g. Gangothri" onChange={e=>setF({...f,name:e.target.value})}/></label><label>Monthly income<input type="number" min="0" value={f.income} onChange={e=>setF({...f,income:e.target.value})}/></label><label>Salary / income day<input type="number" min="1" max="31" value={f.salaryDay} onChange={e=>setF({...f,salaryDay:e.target.value})}/><small>Money Track uses this to calculate days until your next income.</small></label><label>Protected emergency reserve<input type="number" min="0" value={f.reserve} onChange={e=>setF({...f,reserve:e.target.value})}/><small>This amount is excluded from everyday spending.</small></label><button className="primary big"><CheckCircle2 size={17}/> Save money plan</button></form></div>}
createRoot(document.getElementById('root')).render(<App/>);
