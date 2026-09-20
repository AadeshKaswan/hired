# 🚀 AI Job Portal & Resume Analyzer

A modern, full-stack recruitment platform and AI-powered resume analysis engine built with **React 19**, **Node.js/Express 5**, **MongoDB**, and **Google Gemini AI**.

---

## 📖 Overview

The **AI Job Portal & Resume Analyzer** streamlines hiring and job hunting:
- **Job Seekers:** Browse and filter job opportunities, apply with uploaded resumes, track application statuses, and analyze resumes with Google Gemini AI to receive an ATS compatibility score, strengths, weaknesses, missing skills, and tailored recommendations.
- **Employers:** Post and manage job openings, view applicants, review candidate resumes, and update hiring statuses.
- **Administrators:** Oversee platform activity, manage registered users, jobs, and applications through a dedicated admin dashboard.

---

## 🏗️ Architecture & Tech Stack

```
job/
├── client/              # React 19 Single Page Application (Tailwind CSS, Framer Motion)
├── server/              # Node.js / Express 5 REST API (MongoDB/Mongoose, Gemini AI)
├── .env.example         # Root template environment variables
├── .gitignore           # Comprehensive repository ignore rules
├── LICENSE              # MIT License
└── README.md            # Project documentation
```

### Technology Breakdown

| Component | Stack & Tools | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, React Router v7, Tailwind CSS v3, Framer Motion, Axios | Dynamic, responsive UI with dark/light themes and animated transitions. |
| **Backend API** | Node.js (v18+), Express 5, Mongoose 9, Multer, `jsonwebtoken`, `bcryptjs` | Authentication, job listings, application workflows, and file management. |
| **AI Integration** | Google Gemini API (`@google/generative-ai`) | Extracts resume text and performs in-depth ATS analysis & scoring. |
| **Document Parsing**| `pdfreader`, `mammoth` | Server-side text extraction from PDF and Word (.docx) documents. |
| **Database** | MongoDB (Local or MongoDB Atlas) | Stores users, jobs, applications, and resume analysis reports. |

---

## ⚙️ Prerequisites

Ensure the following runtimes and tools are installed:
- **Node.js:** v18.x or v20.x+ and **npm** (v9+)
- **MongoDB:** v6.0+ (running locally at `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI)
- **Google Gemini API Key:** Obtainable from [Google AI Studio](https://aistudio.google.com/)

---

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd job
```

---

### 2. Configure Backend (`server/`)

1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your environment file from the provided example:
   ```bash
   cp .env.example .env
   ```
4. Edit `.env` and fill in your values:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/jobportal
   JWT_SECRET=your-very-strong-jwt-secret-here
   GEMINI_API_KEY=your-gemini-api-key-here
   ```
5. Start the backend server:
   ```bash
   npm start
   ```
   *The server runs at `http://localhost:5000`.*

---

### 3. Configure Frontend (`client/`)

1. Open a new terminal and navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) Create a local environment file:
   ```bash
   cp .env.example .env
   ```
   Default values:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_BACKEND_URL=http://localhost:5000
   ```
4. Start the frontend development server:
   ```bash
   npm start
   ```
   *The application opens automatically at `http://localhost:3000`.*

---

## 🔒 Security & Privacy In Roles

- **Role-Based Access Control:** Registration role selection is restricted to `'jobseeker'` and `'employer'`. Administrative accounts cannot be created via the public registration endpoint.

---

## 📦 Building for Production

### Frontend Production Build
```bash
cd client
npm run build
```
Creates an optimized static production bundle in `client/build/`.

### Backend Production Execution
```bash
cd server
NODE_ENV=production node server.js
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
