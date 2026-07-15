# NotionNotes

A full-stack, Notion-inspired note-taking application with real-time collaboration, markdown editing, and a clean minimal UI.

## Tech Stack

**Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Zustand, Framer Motion, Socket.IO Client

**Backend:** Express.js, TypeScript, MySQL (Sequelize ORM), Socket.IO, JWT (access + refresh tokens), Zod validation

## Features

- Authentication with JWT + HTTP-only refresh tokens
- Two-factor authentication (email-based codes)
- Full CRUD for notes with soft delete (trash) and archive
- Markdown editor with write/preview/split view
- Full-text search with filters (category, tag, date range)
- Categories and tags for organization
- Kanban board view with drag-and-drop
- Real-time collaboration (cursors, typing indicators, live sync)
- Note linking with `[[wikilink]]` syntax
- Version history with restore
- Public note sharing via unique URLs
- Export as Markdown, Text, HTML, or PDF
- Keyboard shortcuts
- Dark/light theme
- PWA support with offline caching

## Setup

### Prerequisites

- Node.js 18+
- MySQL 8+

### Backend

```bash
cd backend
cp .env.example .env       # Edit with your MySQL credentials and a random JWT_SECRET
npm install
npm run dev                 # Starts on port 5000
```

### Frontend

```bash
cd frontend
cp .env.example .env       # Set NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install
npm run dev                 # Starts on port 3000
```

### Environment Variables

**Backend (.env)**

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | (empty) |
| `DB_NAME` | Database name | `notes_app` |
| `JWT_SECRET` | Secret for JWT signing | (required) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:3000` |
| `NODE_ENV` | Environment | `development` |

**Frontend (.env)**

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | `http://localhost:5000` |

## Available Scripts

### Backend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Start production server |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Start production server |

## Architecture

```
frontend/               # Next.js 16 app
  src/
    app/                # App router (pages)
    components/         # React components
    hooks/              # Custom React hooks
    lib/                # Utilities (api, export, sanitize, templates)
    store/              # Zustand stores (auth, notes, theme, toast)
    styles/             # Global CSS with design tokens

backend/                # Express.js API
  src/
    controllers/        # Route handlers
    middleware/          # Auth, rate limiting
    models/             # Sequelize models
    routes/             # Express routes
    collaboration/      # WebSocket server
    config/             # Database config
```
