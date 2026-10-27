# MoneyTrack

React + Express + MySQL personal finance app. React talks only to the Express API; only the API talks to MySQL.

## Status
Implemented: auth (bcrypt + JWT), income, commitments (add/edit/delete/mark paid), emergency reserve, calculation engine, expenses (add/edit/delete), dashboard, Recharts analytics with date filters, popup alerts with history and per-type toggles.
Not yet built: monthly report page (print/download) and next-month planning page. The `monthly_plans` table and schema exist; no API or UI yet.
Tested: the calculation and alert engine (`client/src/utils/calc.js`). The API and React UI were syntax-checked/written but not run against a live MySQL, so run through the checklist below.

## Setup on Windows (VS Code)
1. Install Node.js 20+ and MySQL 8. 
2. Import the schema: `mysql -u root -p < database/schema.sql`
3. Create a DB user: `CREATE USER 'moneytrack_user'@'localhost' IDENTIFIED BY 'your_password'; GRANT ALL ON moneytrack.* TO 'moneytrack_user'@'localhost';`
4. Server: `cd server`, copy `.env.example` to `.env`, fill values (long random JWT_SECRET), then `npm install` and `npm run dev`.
5. Client: `cd client`, copy `.env.example` to `.env`, then `npm install` and `npm run dev`. Open http://localhost:5173.

## Deployment
GitHub Pages hosts only the built client (`npm run build`, set `VITE_BASE=/money-track/` and `VITE_API_URL` to your API's HTTPS URL). The Express API and MySQL must be hosted elsewhere (Render, Railway, a VPS, managed MySQL). Set `CLIENT_ORIGIN` on the API to your Pages URL, serve the API over HTTPS, keep MySQL off the public internet (private network or IP allow-list), and never commit `.env`.

## Notifications
Alerts show in-app and optionally as browser notifications while the site is open. Alerts when the site is closed need web push or a scheduled backend job.

## Manual test checklist
Add an expense and see today's total change; edit and delete it; exceed the daily limit and see the red alert; stay under it and see none; add a commitment and see it in date order; mark it paid and confirm available money does not change; register a second user and confirm they see none of the first user's data; refresh and confirm data persists.
