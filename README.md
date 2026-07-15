# 🧠 Brainweave (NotionNotes)

Brainweave is a premium, high-performance note-taking canvas designed to capture, organize, and filter thoughts. Built with a sleek space-midnight dark theme, smooth micro-animations, collapsible sidebars, and strict security integrations, it provides a distraction-free environment for developer workflows.

Live Frontend: [https://brainweave-tau.vercel.app](https://brainweave-tau.vercel.app)  
Live Backend API: [https://brainweave-9oog.onrender.com](https://brainweave-9oog.onrender.com)

---

## ✨ Features

*   **Elegant Shape Landing Page**: Dynamic, glowing glassmorphic background hero built with Kokonut UI and Framer Motion.
*   **Dual-Level Collapsible Sidebar**: Left-rail navigation combined with a detail panel that collapses completely to maximize screen space.
*   **Notebook Folders**: Organize thoughts into clean, separate folder categories (e.g., Work, Personal, Ideas).
*   **Tag filtering**: Group notes across notebook folders with tag identifiers and instant search filters.
*   **Interactive Kanban Boards**: Switch views to manage task lists and track item progress dynamically.
*   **Security Integration**: Enforces optional email Two-Factor Authentication (2FA) on login and profile changes.
*   **Note Version History**: Track, review, and restore previous iterations of note revisions.
*   **Dual Database Dialect Support**: Uses MySQL locally for speed and PostgreSQL in production for free persistent hosting on Render.

---

## 🛠️ Tech Stack

### Frontend
*   **Framework**: Next.js (App Router, Turbopack)
*   **Styling**: Tailwind CSS
*   **State Management**: Zustand
*   **Animations**: Framer Motion
*   **Icons**: Lucide Icons, React Icons, Carbon Icons

### Backend
*   **Runtime**: Node.js & TypeScript
*   **Framework**: Express
*   **Database ORM**: Sequelize (supporting MySQL + PostgreSQL)
*   **Authentication**: JWT (JSON Web Tokens), bcryptjs, and OTP-based 2FA

---

## 📂 Project Structure

```text
├── backend/
│   ├── src/
│   │   ├── config/      # Database connections (MySQL/Postgres)
│   │   ├── controllers/ # Logic handlers (Auth, 2FA, Notes, Tags, Versions)
│   │   ├── middleware/  # JWT validation checks
│   │   ├── models/      # Sequelize schema models (User, Note, Tag, Category)
│   │   └── routes/      # Express API endpoints
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/         # Next.js routes (Dashboard, Login, Share)
│   │   ├── components/  # Sleek UI widgets, sidebar, editor layout
│   │   ├── lib/         # Axios config & styling utilities
│   │   └── store/       # Zustand authentication and note stores
│   ├── package.json
│   └── tailwind.config.ts
├── render.yaml          # Blueprint file for Render cloud hosting
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites
*   Node.js (v18+)
*   MySQL (installed and running locally)

### 1. Configure the Backend
1. Go into the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside `/backend` with the following contents:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=notes_app
   JWT_SECRET=your_jwt_secret_key
   ALLOWED_ORIGINS=http://localhost:3000
   NODE_ENV=development
   ```
4. Run the backend server in development mode:
   ```bash
   npm run dev
   ```

### 2. Configure the Frontend
1. Open a new terminal window and go into the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside `/frontend` with the following:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
4. Launch the Next.js dev server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)**!

---

## ☁️ Deployment

### Backend (on Render)
The project contains a `render.yaml` blueprint file. 

1. Link your repository to Render.
2. Render will automatically spin up a **PostgreSQL** database and link it to your backend service.
3. Configure the following **Environment Variables** in the Web Service's Settings:
   *   `DATABASE_URL`: *[Linked automatically from Render's Postgres connection]*
   *   `ALLOWED_ORIGINS`: `https://brainweave-tau.vercel.app`
   *   `JWT_SECRET`: *[Your custom secure JWT string]*
   *   `NODE_ENV`: `production`

### Frontend (on Vercel)
1. Add a new project on Vercel and import your repository.
2. Set the **Root Directory** option to `frontend`.
3. In Vercel's **Environment Variables** tab, add:
   *   `NEXT_PUBLIC_API_URL`: `https://brainweave-9oog.onrender.com/api`
4. Trigger a deploy.
