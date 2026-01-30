# Travel Planner — Frontend

Next.js 14 frontend for the Travel Planner application.

## Setup

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| NEXT_PUBLIC_API_URL | http://localhost:8000 | Backend API URL |

## Pages

- `/` — Projects list with pagination and status filtering
- `/projects/new` — Create a new project with artwork search
- `/projects/[id]` — Project detail with place management
