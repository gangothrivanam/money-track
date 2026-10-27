// Creates the moneytrack database and tables using the credentials in server/.env
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
const sql=fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)),'../../database/schema.sql'),'utf8');
try{
  const c=await mysql.createConnection({host:process.env.DB_HOST,port:+process.env.DB_PORT||3306,user:process.env.DB_USER,password:process.env.DB_PASSWORD,multipleStatements:true});
  await c.query(sql);await c.end();
  console.log('Database "moneytrack" is ready.');
}catch(e){
  if(e.code==='ER_TABLE_EXISTS_ERROR')console.log('Tables already exist. Nothing to do.');
  else{console.error('Could not set up the database:',e.message,'\nCheck DB_USER and DB_PASSWORD in server/.env and that MySQL is running.');process.exit(1)}
}
