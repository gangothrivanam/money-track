import React,{useState} from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { Err } from '../components/ui.jsx';
function Form({mode,onAuth}){
  const reg=mode==='register';const[f,setF]=useState({name:'',email:'',password:''});const[err,setErr]=useState('');const[busy,setBusy]=useState(false);
  const set=k=>e=>setF({...f,[k]:e.target.value});
  async function submit(e){e.preventDefault();setErr('');
    if(reg&&!f.name.trim())return setErr('Enter your name.');
    if(!/^\S+@\S+\.\S+$/.test(f.email))return setErr('Enter a valid email address.');
    if(f.password.length<8)return setErr('Password must be at least 8 characters.');
    setBusy(true);try{const r=await api(reg?'/auth/register':'/auth/login','POST',f);localStorage.setItem('mt_token',r.token);onAuth()}catch(x){setErr(x.message)}setBusy(false)}
  return<div className="authwrap"><form className="card auth" onSubmit={submit} noValidate>
    <div className="brand big"><span className="bars"><i/><i/><i/></span> Money<b>Track</b></div><p className="tagline">Track today. Plan tomorrow. Make your money last.</p>
    <h2>{reg?'Create your account':'Log in'}</h2>
    {reg&&<label>Name<input value={f.name} onChange={set('name')} autoComplete="name"/></label>}
    <label>Email<input type="email" value={f.email} onChange={set('email')} autoComplete="email"/></label>
    <label>Password<input type="password" value={f.password} onChange={set('password')} autoComplete={reg?'new-password':'current-password'}/></label>
    <Err msg={err}/><button className="btn" disabled={busy}>{busy?'Please wait…':reg?'Create account':'Log in'}</button>
    <p className="muted">{reg?<>Already registered? <Link to="/login">Log in</Link></>:<>New here? <Link to="/register">Create an account</Link></>}</p></form></div>;
}
export const Login=p=><Form mode="login" {...p}/>;
export const Register=p=><Form mode="register" {...p}/>;
