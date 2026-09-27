# 🎯 Hobby Tracker

A full-stack web application that helps users track their hobbies, record practice sessions, monitor progress, interact with a community, and receive AI-powered hobby suggestions.

## 🌐 Live Demo

**Frontend:**
https://hobby-tracker-1.onrender.com/

**Backend API:**
https://hobby-tracker-d8ol.onrender.com/

**API Documentation:**
https://hobby-tracker-d8ol.onrender.com/docs

---

## 📌 About the Project

Hobby Tracker is a full-stack productivity and hobby-management application designed to help users build consistency in their hobbies.

Users can create an account, maintain their profile, add hobbies, record practice sessions, track their progress, earn badges, interact with other users through a community feed, and get personalized hobby suggestions.

The application uses a modern frontend-backend architecture with a cloud-hosted PostgreSQL database.

---

## ✨ Features

### 🔐 User Authentication

* User registration
* User login
* User logout
* Firebase Authentication

### 👤 User Profile

* Create and update profile
* Add name
* Add bio
* Add avatar image URL
* Display registered email

### 🎨 Hobby Management

* Add hobbies
* View personal hobbies
* Select hobbies while logging practice

### 📝 Practice Tracking

* Log practice sessions
* Record practice duration
* Add practice notes
* View practice history
* Calculate total practice minutes
* Calculate weekly practice minutes
* Track practice streaks

### 🏆 Gamification

The application provides badges based on user activity, including:

* 🔥 7 Day Streak
* 💯 100 Minutes
* 🏆 500 Minutes
* 🌟 1000 Minutes
* 📚 10 Practice Sessions

### 🌎 Community Feed

Users can:

* Create posts
* Add optional image URLs
* View community posts
* Like posts
* Unlike posts
* Add comments
* View comments

### 🏆 Practice Leaderboard

The leaderboard calculates users' total practice minutes and displays them according to their accumulated practice time.

### 🤖 AI Hobby Suggestions

Users can describe their interests and receive hobby suggestions through the AI suggestion feature.

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* JavaScript
* HTML
* CSS

### Backend

* FastAPI
* Python
* SQLAlchemy
* Uvicorn

### Database

* PostgreSQL
* Supabase

### Authentication

* Firebase Authentication

### Deployment

* Render

---

## 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │      User           │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React + Vite       │
                    │     Frontend         │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │   FastAPI Backend    │
                    │      Render          │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ SQLAlchemy ORM       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ PostgreSQL Database  │
                    │      Supabase        │
                    └──────────────────────┘

                    Firebase Authentication
                           │
                           ▼
                    User Authentication
```

---

## 📂 Project Structure

```text
hobby-tracker/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── requirements.txt
│   └── ...
│
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── firebase.js
│   ├── ai.js
│   └── ...
│
├── public/
│
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 🔌 Backend API

The backend is built using FastAPI and provides REST API endpoints for the application's main features.

### Hobbies

```text
POST   /hobbies/
GET    /hobbies/user/{user_id}
DELETE /hobbies/{hobby_id}
```

### Practice Logs

```text
POST /logs/
GET  /logs/user/{user_id}
GET  /logs/user/{user_id}/total-minutes
GET  /logs/user/{user_id}/weekly-minutes
GET  /logs/user/{user_id}/streak
DELETE /logs/{log_id}
```

### Profiles

```text
POST   /profiles/
GET    /profiles/user/{user_id}
PUT    /profiles/user/{user_id}
DELETE /profiles/user/{user_id}
```

### Community

```text
GET    /community/posts
POST   /community/posts
GET    /community/posts/user/{user_id}
DELETE /community/posts/{post_id}

POST   /community/likes
DELETE /community/likes/{post_id}
GET    /community/likes/check/{post_id}/{user_id}

POST   /community/comments
GET    /community/comments/{post_id}
DELETE /community/comments/{comment_id}
```

### Dashboard

```text
GET /dashboard/{user_id}
```

---

## 📖 API Documentation

FastAPI automatically provides interactive API documentation.

### Swagger UI

https://hobby-tracker-d8ol.onrender.com/docs

### OpenAPI JSON

https://hobby-tracker-d8ol.onrender.com/openapi.json

---

## 🚀 Running the Project Locally

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd hobby-tracker
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Start the frontend

```bash
npm run dev
```

The Vite development server will provide a local URL such as:

```text
http://localhost:5173
```

---

## 🐍 Running the Backend Locally

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn main:app --reload
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

Swagger documentation:

```text
http://127.0.0.1:8000/docs
```

---

## 🔑 Environment Variables

Sensitive credentials and configuration values should be stored in environment variables rather than committed to GitHub.

Example:

```text
DATABASE_URL=your_supabase_postgresql_connection_string
```

Frontend Firebase configuration should also be handled securely according to the project's configuration.

> Never upload passwords, private API keys, database credentials, or other sensitive secrets to GitHub.

---

## ☁️ Deployment

The project is deployed using **Render**.

### Frontend

```text
https://hobby-tracker-1.onrender.com/
```

### Backend

```text
https://hobby-tracker-d8ol.onrender.com/
```

### Database

The application uses PostgreSQL hosted through Supabase.

---

## 🎯 Project Goals

The main goals of Hobby Tracker are:

* Encourage consistent hobby practice
* Help users monitor their progress
* Make practice tracking simple
* Provide motivation through streaks and badges
* Create a community around hobbies
* Provide personalized hobby suggestions
* Demonstrate a complete full-stack application architecture

---

## 🔮 Future Improvements

Possible future enhancements include:

* Real-time community updates
* Profile pictures through cloud storage
* More advanced analytics and charts
* Monthly and yearly practice statistics
* More achievement badges
* Personalized AI recommendations
* Notifications and reminders
* Follow/friend functionality
* Improved leaderboard profiles
* Mobile-responsive UI improvements

---

## 👩‍💻 Author

**Yashika Aggarwal**

B.Tech Computer Science & Technology

Maharaja Agrasen Institute of Technology

---

## ⭐ Acknowledgement

This project was developed as a full-stack application to explore frontend development, REST APIs, database management, authentication, cloud deployment, and AI-powered functionality.

If you find this project useful, consider giving the repository a ⭐ on GitHub.
