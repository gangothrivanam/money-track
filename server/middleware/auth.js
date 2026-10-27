import jwt from 'jsonwebtoken';
export function auth(req,res,next){
  const t=(req.headers.authorization||'').replace('Bearer ','');
  try{req.userId=jwt.verify(t,process.env.JWT_SECRET).id;next()}catch{res.status(401).json({error:'Please log in again.'})}
}
export const bad=(res,msg)=>res.status(400).json({error:msg});
export const isDate=d=>/^\d{4}-\d{2}-\d{2}$/.test(d||'')&&!isNaN(new Date(d));
export const fail=(err,req,res,next)=>{console.error(err);res.status(500).json({error:'Something went wrong on the server.'})};
