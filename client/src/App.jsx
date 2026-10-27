import React,{useState,useEffect,useCallback,useMemo,createContext,useContext,useRef} from 'react';
import { Routes,Route,NavLink,Navigate,useNavigate } from 'react-router-dom';
import { api,getToken } from './services/api.js';
import { compute,upcoming,evaluateAlerts } from './utils/calc.js';
import Toasts from './components/Toasts.jsx';
import Bell from './components/Bell.jsx';
import { Login,Register } from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Expenses from './pages/Expenses.jsx';
import Commitments from './pages/Commitments.jsx';
import Income from './pages/Income.jsx';
import Analytics from './pages/Analytics.jsx';
import Settings from './pages/Settings.jsx';
export const Ctx=createContext();export const useApp=()=>useContext(Ctx);
const loadPrefs=()=>{try{return{enabled:{},largeThreshold:2000,toastSeconds:6,...JSON.parse(localStorage.getItem('mt_prefs')||'{}')}}catch{return{enabled:{},largeThreshold:2000,toastSeconds:6}}};

export default function App(){
  const[authed,setAuthed]=useState(!!getToken());
  const[data,setData]=useState(null);
  const[toasts,setToasts]=useState([]);
  const[prefs,setPrefsState]=useState(loadPrefs);
  const seen=useRef(new Set(JSON.parse(localStorage.getItem('mt_seen')||'[]')));
  const nav=useNavigate();
  const setPrefs=p=>{setPrefsState(p);localStorage.setItem('mt_prefs',JSON.stringify(p))};
  const refresh=useCallback(async()=>{const d=await api('/bootstrap');setData(d);return d},[]);
  useEffect(()=>{if(authed)refresh().catch(()=>{})},[authed,refresh]);
  const calc=useMemo(()=>data&&compute(data),[data]);
  const upc=useMemo(()=>data?upcoming(data.commitments):[],[data]);

  // Show each alert once, store it in history, then toast it.
  const raise=useCallback(async list=>{
    for(const a of list){
      if(seen.current.has(a.key))continue;
      seen.current.add(a.key);localStorage.setItem('mt_seen',JSON.stringify([...seen.current].slice(-300)));
      setToasts(t=>[...t,{...a,id:a.key}]);
      if(a.type!=='saved')api('/notifications','POST',{title:a.title,message:a.message,notification_type:a.type}).catch(()=>{});
      if(Notification.permission==='granted')new Notification(a.title,{body:a.message});
    }
    setData(d=>d);
  },[]);
  // Alerts that depend on date/state (not on a just-saved expense) run when data loads or changes.
  useEffect(()=>{if(calc)raise(evaluateAlerts(calc,upc,prefs))},[calc,upc,prefs,raise]);
  const afterExpense=async amount=>{const d=await refresh();const c=compute(d);await raise(evaluateAlerts(c,upcoming(d.commitments),prefs,amount))};
  const logout=()=>{localStorage.removeItem('mt_token');setAuthed(false);setData(null);nav('/login')};
  const dismiss=id=>setToasts(t=>t.filter(x=>x.id!==id));

  if(!authed)return(<Routes><Route path="/register" element={<Register onAuth={()=>{setAuthed(true);nav('/income')}}/>}/><Route path="*" element={<Login onAuth={()=>{setAuthed(true);nav('/')}}/>}/></Routes>);
  if(!data)return<div className="center">Loading your finances…</div>;
  const onboarding=!(data.settings&&+data.settings.monthly_salary>0);
  return(<Ctx.Provider value={{data,calc,upc,refresh,afterExpense,prefs,setPrefs,raise}}>
    <div className="shell">
      <aside className="side"><div className="brand"><span className="bars"><i/><i/><i/></span> Money<b>Track</b></div>
        <nav>{[['/','Dashboard'],['/expenses','Add expense'],['/commitments','Commitments'],['/income','Income'],['/analytics','Analytics'],['/settings','Settings']].map(([to,l])=><NavLink key={to} to={to} end={to==='/'}>{l}</NavLink>)}</nav>
        <button className="link" onClick={logout}>Log out</button></aside>
      <main className="main">
        <header className="top"><p className="tagline">Track today. Plan tomorrow. Make your money last.</p><Bell notifications={data.notifications} onRead={async()=>{await api('/notifications/read','POST');refresh()}}/></header>
        {onboarding&&<div className="banner">Start here: <NavLink to="/income">set your income</NavLink>, then add commitments and an emergency reserve in <NavLink to="/settings">Settings</NavLink>.</div>}
        <Routes><Route path="/" element={<Dashboard/>}/><Route path="/expenses" element={<Expenses/>}/><Route path="/commitments" element={<Commitments/>}/><Route path="/income" element={<Income/>}/><Route path="/analytics" element={<Analytics/>}/><Route path="/settings" element={<Settings/>}/><Route path="*" element={<Navigate to="/"/>}/></Routes>
      </main>
    </div>
    <Toasts items={toasts} seconds={prefs.toastSeconds} onClose={dismiss}/>
  </Ctx.Provider>);
}
