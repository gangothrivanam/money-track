import React from 'react';
import { STATUS } from '../utils/calc.js';
export const Card=({title,children,tone,className=''})=><section className={`card ${tone||''} ${className}`}>{title&&<h2>{title}</h2>}{children}</section>;
export const Stat=({label,value,sub,tone})=><div className={'stat '+(tone||'')}><small>{label}</small><b>{value}</b>{sub&&<em>{sub}</em>}</div>;
export const Progress=({value,max,label})=>{const p=max>0?Math.min(100,value/max*100):0;return<div><div className="pl"><span>{label}</span><span>{Math.round(p)}%</span></div><div className="prog" role="progressbar" aria-valuenow={Math.round(p)} aria-valuemin="0" aria-valuemax="100"><i className={p>=100?'bad':p>=80?'warn':''} style={{width:p+'%'}}/></div></div>};
export const StatusPill=({status})=>{const[t,c]=STATUS[status];return<span className={'pill '+c}>{t}</span>};
export const Err=({msg})=>msg?<p className="err" role="alert">{msg}</p>:null;
export const Empty=({children})=><p className="empty">{children}</p>;
