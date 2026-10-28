# 💰 MoneyTrack — Smart Expense Tracker
<img width="1889" height="892" alt="image" src="https://github.com/user-attachments/assets/09286158-f1ba-487e-b741-f9479827c472" />   <img width="1883" height="860" alt="image" src="https://github.com/user-attachments/assets/ed57d9c4-2c96-46b3-970a-a2ffdb33bb4a" />



**MoneyTrack** is a web-based expense tracking application designed to help users manage their money, track daily spending, and understand their spending habits through interactive charts and a simple dashboard.

🔗 **Live Demo:** [MoneyTrack](https://money-track-1-tn00.onrender.com)  
💻 **GitHub Repository:** [MoneyTrack on GitHub](https://github.com/gangothrivanam/money-track)

## ✨ Features

- 📊 **Expense Analytics:** Visualize spending patterns using interactive charts.
- 💸 **Daily Expense Tracking:** Record and monitor daily expenses.
- 💰 **Income Management:** Keep track of income and expenses.
- 🔔 **Notifications:** Display popup notifications and expense alerts.
- 📈 **Dashboard:** View financial information in one place.
- 📱 **Responsive Design:** Access the application on different screen sizes.
- ⚙️ **Settings:** Manage available application preferences.
- 🔐 **User Authentication:** Register and log in to your account.

*Note: Features may vary depending on the functionality available in the deployed version.*

## 🛠️ Technologies Used

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3
- Vite

### Backend
- Node.js
- Express.js

### Database
- MySQL

### Tools & Deployment
- Git and GitHub
- Visual Studio Code
- Render
- Aiven MySQL

## 🏗️ Project Architecture

MoneyTrack uses a client-server architecture.

1. **Frontend:** React.js provides the user interface.
2. **Backend:** Node.js and Express.js handle API requests and application logic.
3. **Database:** MySQL stores application data.
4. **API Communication:** The frontend communicates with the backend through REST API endpoints.
5. **Deployment:** The frontend and backend are deployed separately on Render, with MySQL hosted on Aiven.

## 🚀 Live Application

Try the application here:

👉 [Open MoneyTrack](https://money-track-1-tn00.onrender.com)

## 💻 Run the Project Locally

### Prerequisites

Install the following tools:

- Node.js and npm
- MySQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/gangothrivanam/money-track.git
```

Navigate into the project folder:

```bash
cd money-track
```

### 2. Configure the Backend

Navigate to the backend folder:

```bash
cd server
```

Install the dependencies:

```bash
npm install
```

Create a `.env` file inside the `server` folder and configure the required environment variables:

```env
PORT=4000
DB_HOST=your_mysql_host
DB_PORT=your_mysql_port
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
JWT_SECRET=your_secret_key
CLIENT_ORIGIN=http://localhost:5173
```

**Important:** Replace the example values with your own database credentials and secret key. Never upload your `.env` file or expose passwords and secret keys on GitHub.

Initialize the database tables:

```bash
npm run db:init
```

Start the backend server:

```bash
npm start
```

### 3. Configure the Frontend

Open a new terminal and navigate to the frontend folder:

```bash
cd client
```

Install the dependencies:

```bash
npm install
```

Create a `.env` file inside the `client` folder:

```env
VITE_API_URL=http://localhost:4000/api
```

Start the frontend:

```bash
npm run dev
```

### 4. Open the Application

Visit the local address displayed in your terminal, usually:

`http://localhost:5173`

You can now test the application in your browser.

## 🔒 Security Notes

- Store credentials in environment variables.
- Never commit `.env` files to GitHub.
- Use strong, unique secret keys.
- Keep database credentials private.
- Validate user input on the backend.

## 🎯 Project Goal

The goal of MoneyTrack is to make personal expense management easier by providing a simple way to record expenses, monitor income, and visualize spending habits.

## 👩‍💻 Developer

**Vanam Gangothri**  
B.Tech Computer Science and Engineering | 2026 Graduate

- GitHub: [gangothrivanam](https://github.com/gangothrivanam)
- Project: [MoneyTrack Repository](https://github.com/gangothrivanam/money-track)

---

⭐ If you find this project useful, consider giving the repository a star!
