# Task Management System (AWT Mini Project)

A full-stack task manager built with **React + Vite**, **Node.js + Express**, and **MongoDB Atlas**.

## Features
- Create, view, edit, and delete tasks (CRUD)
- Task title, description, status, priority, due date, and category
- Search tasks and filter by status / priority
- Dashboard summary cards
- Responsive layout
- REST API with Express and MongoDB/Mongoose
- Ready for Vercel (frontend) + Render (backend)

## 1. Requirements
- Node.js 20.19+ or 22.12+
- npm
- MongoDB Atlas account
- Git and GitHub account (for deployment)
- VS Code (recommended)

Check Node/npm:
```bash
node -v
npm -v
```

## 2. MongoDB Atlas setup
1. Sign in at https://www.mongodb.com/cloud/atlas/register
2. Create a free database deployment (M0).
3. Under **Database Access**, create a database user and password.
4. Under **Network Access**, add your current IP for local development. For Render deployment, you can temporarily allow `0.0.0.0/0` (all IPs); use a strong database password and restrict access where possible.
5. Select **Connect → Drivers → Node.js** and copy the connection string.
6. Replace `<username>`, `<password>`, and `<cluster-url>` in the template below. URL-encode special characters in the password.

Example:
```text
mongodb+srv://YOUR_DB_USER:YOUR_DB_PASSWORD@YOUR_CLUSTER.mongodb.net/task_manager?retryWrites=true&w=majority
```
Do not share or commit this connection string.

## 3. Run locally

### Backend
Open a terminal in the project root:
```bash
cd backend
npm install
```
Create `backend/.env` by copying `.env.example`, then add your Atlas URI:
```env
PORT=5000
MONGO_URI=mongodb+srv://YOUR_DB_USER:YOUR_DB_PASSWORD@YOUR_CLUSTER.mongodb.net/task_manager?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173
```
Start the API:
```bash
npm run dev
```
API health check: http://localhost:5000/api/health

### Frontend
Open a second terminal:
```bash
cd frontend
npm install
```
Create `frontend/.env` from `.env.example`:
```env
VITE_API_URL=http://localhost:5000/api
```
Start Vite:
```bash
npm run dev
```
Open the local URL printed by Vite (normally http://localhost:5173).

## 4. Deploy backend to Render
1. Push the complete project folder to a GitHub repository.
2. In Render, choose **New → Web Service** and connect the repository.
3. Set **Root Directory** to `backend`.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add these environment variables in Render:
   - `MONGO_URI` = your MongoDB Atlas connection string
   - `CLIENT_URL` = your deployed Vercel frontend URL (for example `https://your-app.vercel.app`)
   - `NODE_ENV` = `production`
   - `PORT` is provided by Render; do not need to set it manually.
7. Deploy. Copy the Render service URL, e.g. `https://your-api.onrender.com`.
8. Test `https://YOUR-RENDER-URL/api/health`.

Render free instances may sleep when inactive, so the first request after inactivity can take a little longer.

## 5. Deploy frontend to Vercel
1. In Vercel, choose **Add New → Project** and import the same GitHub repository.
2. Set **Root Directory** to `frontend`.
3. Framework preset: Vite.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add environment variable:
   - `VITE_API_URL` = `https://YOUR-RENDER-URL/api`
7. Deploy.
8. Copy the Vercel domain and add it to Render's `CLIENT_URL` environment variable. If you change Render environment variables, redeploy/restart the service.
9. Redeploy the Vercel frontend if you change its environment variables.

## 6. Important deployment notes
- The frontend calls the backend using `VITE_API_URL`; it must end with `/api`.
- `CLIENT_URL` on Render must exactly match your Vercel origin, without a trailing slash.
- Never put `MONGO_URI` in the frontend or in a `VITE_` variable.
- Never commit `.env` files. The included `.env.example` files are safe templates.
- This is an academic mini-project starter. Before production use, add authentication, authorization, rate limiting, stronger validation, and user-specific data ownership.

## 7. API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check API status |
| GET | `/api/tasks` | List tasks; optional `?status=Pending&priority=High&search=report` |
| GET | `/api/tasks/:id` | Get one task |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

### Example POST body
```json
{
  "title": "Complete AWT assignment",
  "description": "Finish the task manager mini project",
  "status": "In Progress",
  "priority": "High",
  "category": "College",
  "dueDate": "2026-12-01"
}
```

## 8. Suggested project demonstration
1. Show the dashboard and task summary.
2. Add a task with a due date and priority.
3. Edit its title/status.
4. Search and filter tasks.
5. Delete a task.
6. Show that data remains after refreshing (MongoDB Atlas persistence).
7. Show the deployed Vercel frontend and Render API health endpoint.
