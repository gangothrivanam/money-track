<img width="1885" height="872" alt="image" src="https://github.com/user-attachments/assets/a70f2553-a9e8-4a95-b2ab-66b0af3537f0" />
MoneyTrack 💰
MoneyTrack is a personal finance tracking web application designed to
help users record income and expenses, monitor daily spending, and
manage budgets.
Features
- User registration and login
- Record and review income and expenses
- Track spending over time
- Manage budget settings
- Dashboard for viewing financial activity
Features available in the deployed version depend on the frontend,
backend, and database being configured correctly.

Tech Stack
Frontend
- React
- Vite
- HTML, CSS, and JavaScript
Backend
- Node.js
- Express.js
- JWT-based authentication
- mysql2 for MySQL database access
Database
- MySQL
Project Structure
money-track/
├── client/          # React + Vite frontend
└── server/          # Express API and database scripts
Run Locally
1. Requirements
Install: - Node.js and npm - MySQL Server

Clone the repository and open it in your terminal:
git clone https://github.com/gangothrivanam/money-track.git
cd money-track
2. Configure the database
Create a MySQL database named moneytrack.

Run the database initialization script from the server directory if
your project includes the initialization script:
cd server
npm install
npm run db:init
Create a server/.env file with your own local database credentials:
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_USER=YOUR_MYSQL_USERNAME
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=moneytrack
JWT_SECRET=REPLACE_WITH_A_LONG_RANDOM_SECRET
CLIENT_ORIGIN=http://localhost:5173
Do not commit .env files or real passwords/secrets to GitHub.
3. Start the backend
From the server directory:
npm start
The API should run at http://localhost:4000 when the configuration is
correct. The health endpoint is available at:
http://localhost:4000/health
4. Configure and start the frontend
Open a second terminal:
cd client
npm install
Create client/.env with:
VITE_API_URL=http://localhost:4000/api
Start the development server:
npm run dev
Vite usually serves the frontend at http://localhost:5173.
Deployment
To make MoneyTrack work publicly, deploy all required parts:
1. Frontend: Deploy the client directory to a static hosting
   provider that supports Vite.
   - Build command: npm install && npm run build
   - Publish directory: dist
2. Backend: Deploy the server directory to a Node.js hosting
   provider.
   - Build command: npm install
   - Start command: npm start
3. Database: Use a hosted MySQL database and configure the backend
   environment variables with its connection details.
4. Set VITE_API_URL in the frontend hosting settings to the deployed
   backend API URL plus /api.
5. Set CLIENT_ORIGIN in the backend environment to the exact deployed
   frontend origin.
A GitHub repository alone stores the code; it does not automatically
host the Node.js API or provide a running MySQL database. Check the
selected providers' current free-plan limits before deploying.
Environment Variables
  Variable          Purpose
  PORT            Port used by the backend host
  DB_HOST         MySQL server hostname
  DB_PORT         MySQL server port, commonly 3306
  DB_USER         MySQL username
  DB_PASSWORD     MySQL password
  DB_NAME         Database name, such as moneytrack
  JWT_SECRET      Private secret used to sign authentication tokens
  CLIENT_ORIGIN   Deployed frontend origin allowed by CORS
  VITE_API_URL    Frontend API base URL, including /api

Use your hosting provider's environment-variable settings for production
secrets. Never put real credentials in this README or in source control.
Security Notes
- Keep all passwords, JWT secrets, and production database credentials
  private.
- Do not commit .env files.
- Use a unique, strong JWT_SECRET for production.
- Restrict database access according to your database provider's
  security settings.
Repository
GitHub: https://github.com/gangothrivanam/money-track
License
Add a license file if you intend to publish this project under an
open-source license.
