import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { bad } from '../middleware/auth.js';
const r=Router();
const tok=u=>jwt.sign({id:u.id},process.env.JWT_SECRET,{expiresIn:'7d'});
r.post('/register',async(req,res,next)=>{try{
  const{name,email,password}=req.body||{};
  if(!name?.trim()||!/^\S+@\S+\.\S+$/.test(email||'')||(password||'').length<8)return bad(res,'Enter a name, a valid email and a password of 8+ characters.');
  const[ex]=await pool.query('SELECT id FROM users WHERE email=?',[email.toLowerCase()]);
  if(ex.length)return bad(res,'This email is already registered.');
  const[ins]=await pool.query('INSERT INTO users(name,email,password_hash) VALUES(?,?,?)',[name.trim(),email.toLowerCase(),await bcrypt.hash(password,12)]);
  await pool.query('INSERT INTO budget_settings(user_id) VALUES(?)',[ins.insertId]);
  res.status(201).json({token:tok({id:ins.insertId}),user:{id:ins.insertId,name:name.trim(),email}});
}catch(e){next(e)}});
r.post('/login',async(req,res,next)=>{try{
  const{email,password}=req.body||{};
  const[[u]]=await pool.query('SELECT * FROM users WHERE email=?',[(email||'').toLowerCase()]);
  if(!u||!(await bcrypt.compare(password||'',u.password_hash)))return res.status(401).json({error:'Email or password is incorrect.'});
  res.json({token:tok(u),user:{id:u.id,name:u.name,email:u.email}});
}catch(e){next(e)}});
export default r;
