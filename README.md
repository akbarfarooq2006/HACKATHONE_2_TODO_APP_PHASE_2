# 📝 TaskApp - Full-Stack Todo Application

A modern, full-stack todo application built with **Next.js** and **FastAPI**, featuring JWT-based authentication, persistent storage with Neon PostgreSQL, and a spec-driven development workflow.

---

## 🚀 Features

- ✅ **User Authentication** - Sign up/sign in with Better Auth + JWT tokens
- ✅ **Task Management** - Create, read, update, delete tasks
- ✅ **Task Completion** - Toggle task completion status
- ✅ **User Isolation** - Each user sees only their own tasks
- ✅ **Responsive UI** - Modern, mobile-friendly interface
- ✅ **Secure API** - JWT token-based stateless authentication

---

## 🛠️ Technology Stack

| Layer              | Technology                  |
| :----------------- | :-------------------------- |
| **Frontend**       | Next.js 16+ (App Router)    |
| **UI Framework**   | React 19, Tailwind CSS 4    |
| **Backend**        | Python FastAPI              |
| **ORM**            | SQLModel                    |
| **Database**       | Neon Serverless PostgreSQL  |
| **Authentication** | Better Auth + JWT           |
| **Development**    | Claude Code + Spec-Kit Plus |

---

## 📁 Project Structure

```
phase_2/
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── api/             # API route handlers
│   │   ├── auth/            # JWT authentication logic
│   │   ├── models/          # SQLModel database models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── config.py        # App configuration
│   │   ├── database.py      # Database connection
│   │   └── main.py          # App entry point
│   ├── main.py              # Uvicorn entry
│   └── pyproject.toml       # Python dependencies
│
├── frontend/                # Next.js frontend
│   ├── app/                 # App Router pages
│   │   ├── dashboard/       # Protected dashboard page
│   │   ├── sign-in/         # Authentication pages
│   │   ├── sign-up/
│   │   └── api/auth/        # Auth API routes
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utilities & API client
│   ├── types/               # TypeScript type definitions
│   └── package.json         # Node.js dependencies
│
├── specs/                   # Feature specifications
│   ├── 01-monorepo-init/    # Project setup spec
│   ├── 02-auth-db/          # Authentication spec
│   ├── 03-todo-crud/        # Task CRUD spec
│   └── 04-landing-ui/       # Landing page spec
│
├── history/                 # Prompt History Records
├── schema.sql               # Database schema
├── CLAUDE.md                # Claude Code instructions
└── phase_II_overview.md     # Project overview
```

---

## 🔌 API Endpoints

All endpoints require a valid JWT token in the `Authorization: Bearer <token>` header.

| Method   | Endpoint                             | Description       |
| :------- | :----------------------------------- | :---------------- |
| `GET`    | `/api/{user_id}/tasks`               | List all tasks    |
| `POST`   | `/api/{user_id}/tasks`               | Create a new task |
| `GET`    | `/api/{user_id}/tasks/{id}`          | Get task details  |
| `PUT`    | `/api/{user_id}/tasks/{id}`          | Update a task     |
| `DELETE` | `/api/{user_id}/tasks/{id}`          | Delete a task     |
| `PATCH`  | `/api/{user_id}/tasks/{id}/complete` | Toggle completion |

---

## 🗄️ Database Schema

### Tables

**user** (managed by Better Auth)

- `id` - TEXT PRIMARY KEY
- `email` - TEXT UNIQUE NOT NULL
- `name` - TEXT
- `createdAt`, `updatedAt` - TIMESTAMP

**session**

- `id` - TEXT PRIMARY KEY
- `userId` - TEXT (FK → user.id)
- `token` - TEXT UNIQUE
- `expiresAt` - TIMESTAMP

**tasks**

- `id` - INTEGER PRIMARY KEY
- `user_id` - TEXT (FK → user.id)
- `title` - TEXT NOT NULL
- `description` - TEXT
- `completed` - BOOLEAN DEFAULT FALSE
- `created_at`, `updated_at` - TIMESTAMP

---

## ⚙️ Prerequisites

- **Node.js** 18+
- **Python** 3.12+
- **uv** (Python package manager)
- **Neon PostgreSQL** database account

---

## 🏃‍♂️ Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd phase_2
```

### 2. Set Up Environment Variables

**Backend** (`backend/.env`):

```env
DATABASE_URL=postgresql://user:password@host/database
BETTER_AUTH_SECRET=your-secret-key
```

**Frontend** (`frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
DATABASE_URL=postgresql://user:password@host/database
BETTER_AUTH_SECRET=your-secret-key
```

### 3. Initialize the Database

```bash
# Run the schema migration
psql $DATABASE_URL < schema.sql
```

### 4. Start the Backend

```bash
cd backend
uv sync                          # Install dependencies
uv run uvicorn main:app --reload --port 8000
```

### 5. Start the Frontend

```bash
cd frontend
npm install                      # Install dependencies
npm run dev                      # Start dev server on port 3000
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 🔐 Authentication Flow

1. **User signs up/signs in** → Better Auth creates session + JWT token
2. **Frontend stores token** → Sent with every API request
3. **Backend verifies token** → Extracts user ID from JWT
4. **Backend filters data** → Returns only that user's tasks

---

## 📋 Available Scripts

### Frontend

| Command         | Description              |
| :-------------- | :----------------------- |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint               |

### Backend

| Command                            | Description               |
| :--------------------------------- | :------------------------ |
| `uv run uvicorn main:app --reload` | Start development server  |
| `uv sync`                          | Install/sync dependencies |

---

## 🧪 Testing

```bash
# Backend API tests
./test-backend-api.sh

# Authentication tests
./test-auth.sh

# Hybrid auth tests
./test-hybrid-auth.sh
```

---

## 📖 Development Workflow

This project follows **Spec-Driven Development (SDD)**:

1. **Write Spec** → Define feature in `specs/<feature>/spec.md`
2. **Generate Plan** → Create implementation plan in `specs/<feature>/plan.md`
3. **Break into Tasks** → Document tasks in `specs/<feature>/tasks.md`
4. **Implement** → Build using Claude Code with spec references
5. **Record** → Document prompts in `history/prompts/`

---

## 📄 License

This project was created for Hackathon Phase II.

---

## 🤝 Contributing

1. Read the relevant spec before implementing
2. Follow the patterns in `CLAUDE.md`
3. Create small, testable changes
4. Document architectural decisions in ADRs

---

Built with ❤️ using Claude Code + Spec-Kit Plus
