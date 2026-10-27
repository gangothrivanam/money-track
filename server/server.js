import 'dotenv/config';
import app from './app.js';
if(!process.env.JWT_SECRET){console.error('Set JWT_SECRET in server/.env');process.exit(1)}
app.listen(process.env.PORT||4000,()=>console.log('MoneyTrack API running on port '+(process.env.PORT||4000)));
