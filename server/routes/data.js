import { Router } from 'express';
import { pool } from '../config/db.js';
import { auth, bad, isDate } from '../middleware/auth.js';
const r=Router();r.use(auth);
const q=(s,p)=>pool.query(s,p).then(x=>x[0]);
export const CATS=['Food','Travel','Shopping','Bills','Entertainment','Health','Education','Personal Care','Other'];
const REC=['monthly','weekly','yearly','one-time'];
const h=fn=>async(req,res,next)=>{try{await fn(req,res)}catch(e){next(e)}};

// Everything the client needs for the calculation engine, scoped to the logged-in user
r.get('/bootstrap',h(async(req,res)=>{const u=req.userId;
  const[[settings]]=await pool.query('SELECT monthly_salary,salary_day,emergency_reserve,daily_spending_limit FROM budget_settings WHERE user_id=?',[u]);
  res.json({settings,
    incomes:await q('SELECT id,source_name,amount,income_date,income_type FROM incomes WHERE user_id=? ORDER BY income_date DESC',[u]),
    commitments:await q('SELECT id,name,amount,category,due_date,recurrence,payment_status,paid_date,notes FROM commitments WHERE user_id=? ORDER BY due_date',[u]),
    expenses:await q('SELECT id,amount,category,description,expense_date,payment_method FROM expenses WHERE user_id=? ORDER BY expense_date DESC,id DESC',[u]),
    notifications:await q('SELECT id,title,message,notification_type,is_read,created_at FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT 100',[u])});
}));

r.put('/settings',h(async(req,res)=>{
  const{monthly_salary=0,salary_day=1,emergency_reserve=0,daily_spending_limit=0}=req.body;
  if([monthly_salary,emergency_reserve,daily_spending_limit].some(v=>!(+v>=0))||!(salary_day>=1&&salary_day<=31))return bad(res,'Amounts must be zero or more and salary day must be 1-31.');
  await q(`INSERT INTO budget_settings(user_id,monthly_salary,salary_day,emergency_reserve,daily_spending_limit) VALUES(?,?,?,?,?)
   ON DUPLICATE KEY UPDATE monthly_salary=VALUES(monthly_salary),salary_day=VALUES(salary_day),emergency_reserve=VALUES(emergency_reserve),daily_spending_limit=VALUES(daily_spending_limit)`,[req.userId,monthly_salary,salary_day,emergency_reserve,daily_spending_limit]);
  res.json({ok:true});
}));

r.post('/incomes',h(async(req,res)=>{const{source_name,amount,income_date,income_type='other'}=req.body;
  if(!source_name?.trim()||!(+amount>0)||!isDate(income_date))return bad(res,'Enter a source, an amount above zero and a date.');
  const x=await q('INSERT INTO incomes(user_id,source_name,amount,income_date,income_type) VALUES(?,?,?,?,?)',[req.userId,source_name.trim(),amount,income_date,income_type==='salary'?'salary':'other']);
  res.status(201).json({id:x.insertId});}));
r.delete('/incomes/:id',h(async(req,res)=>{await q('DELETE FROM incomes WHERE id=? AND user_id=?',[req.params.id,req.userId]);res.json({ok:true})}));

const cVal=b=>b.name?.trim()&&+b.amount>=0&&isDate(b.due_date)&&REC.includes(b.recurrence||'monthly');
r.post('/commitments',h(async(req,res)=>{const b=req.body;if(!cVal(b))return bad(res,'Enter a name, an amount, a valid due date and recurrence.');
  const x=await q('INSERT INTO commitments(user_id,name,amount,category,due_date,recurrence,notes) VALUES(?,?,?,?,?,?,?)',[req.userId,b.name.trim(),b.amount,b.category||'Bills',b.due_date,b.recurrence||'monthly',b.notes||null]);
  res.status(201).json({id:x.insertId});}));
r.put('/commitments/:id',h(async(req,res)=>{const b=req.body;if(!cVal(b))return bad(res,'Check the commitment details.');
  await q('UPDATE commitments SET name=?,amount=?,category=?,due_date=?,recurrence=?,notes=? WHERE id=? AND user_id=?',[b.name.trim(),b.amount,b.category||'Bills',b.due_date,b.recurrence,b.notes||null,req.params.id,req.userId]);res.json({ok:true});}));
r.post('/commitments/:id/pay',h(async(req,res)=>{const d=isDate(req.body?.paid_date)?req.body.paid_date:new Date().toISOString().slice(0,10);
  await q("UPDATE commitments SET payment_status='paid',paid_date=? WHERE id=? AND user_id=?",[d,req.params.id,req.userId]);res.json({ok:true});}));
r.delete('/commitments/:id',h(async(req,res)=>{await q('DELETE FROM commitments WHERE id=? AND user_id=?',[req.params.id,req.userId]);res.json({ok:true})}));

const eVal=b=>+b.amount>0&&CATS.includes(b.category)&&isDate(b.expense_date);
r.post('/expenses',h(async(req,res)=>{const b=req.body;if(!eVal(b))return bad(res,'Enter an amount above zero, a category and a date.');
  const x=await q('INSERT INTO expenses(user_id,amount,category,description,expense_date,payment_method) VALUES(?,?,?,?,?,?)',[req.userId,b.amount,b.category,b.description||null,b.expense_date,b.payment_method||null]);
  res.status(201).json({id:x.insertId});}));
r.put('/expenses/:id',h(async(req,res)=>{const b=req.body;if(!eVal(b))return bad(res,'Check the expense details.');
  await q('UPDATE expenses SET amount=?,category=?,description=?,expense_date=?,payment_method=? WHERE id=? AND user_id=?',[b.amount,b.category,b.description||null,b.expense_date,b.payment_method||null,req.params.id,req.userId]);res.json({ok:true});}));
r.delete('/expenses/:id',h(async(req,res)=>{await q('DELETE FROM expenses WHERE id=? AND user_id=?',[req.params.id,req.userId]);res.json({ok:true})}));

r.post('/notifications',h(async(req,res)=>{const{title,message,notification_type}=req.body;if(!title||!message||!notification_type)return bad(res,'Missing notification fields.');
  const x=await q('INSERT INTO notifications(user_id,title,message,notification_type) VALUES(?,?,?,?)',[req.userId,title,message,notification_type]);res.status(201).json({id:x.insertId});}));
r.post('/notifications/read',h(async(req,res)=>{await q('UPDATE notifications SET is_read=1 WHERE user_id=?',[req.userId]);res.json({ok:true})}));
export default r;
