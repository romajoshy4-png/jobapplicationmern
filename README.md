# Job Application Tracker — MERN starter

This is a runnable learning scaffold for your assessment. It includes the frontend/backend structure and setup, but leaves assessment-specific business rules as TODOs for you to implement and understand.

## Requirements
- Node.js 20+
- MongoDB Atlas test database

## Setup

### 1. Backend
```bash
cd backend
npm install
```
Create `backend/.env` based on `.env.example`, and put your own **test** MongoDB Atlas URI in `MONGODB_URI`.
```bash
npm run dev
```
Backend runs at `http://localhost:5000`.

### 2. Frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the URL Vite prints (normally `http://localhost:5173`).

## API starter routes
- `GET /api/health` — health check
- `GET /api/applications` — list applications (filter/search TODO)
- `POST /api/applications` — create application (validation and ID generation TODO)
- `GET /api/applications/:id` — get one application
- `PATCH /api/applications/:id` — update editable fields (rules TODO)
- `PATCH /api/applications/:id/status` — change status (workflow validation TODO)
- `DELETE /api/applications/:id` — delete application (delete rule TODO)

All API responses use `{ success, message, data }`.

## Assessment checklist to implement
1. Validate `appliedDate` on frontend **and** backend (no future dates).
2. Generate `JA-XXX-NNN` on the backend only, with a sequence per company. Consider a counter collection and an atomic update to avoid duplicate sequence numbers.
3. Enforce status transitions on the backend; only show valid next statuses in the UI.
4. Record each status change with timestamp and render a timeline.
5. Compute follow-up date as applied date + 7 days and derive `isOverdue`.
6. Return HTTP 409 for duplicate active company + role (case-insensitive).
7. Add backend query params for status and company search, and status counts.
8. Never update application ID or applied date after creation.
9. Reject deletion when status is `Interview` or `Offer`; confirm in the UI.
10. Add at least five meaningful commits during your exam, take two screenshots, and update README with them.

## Important
- `.env.example` is safe to commit. Do not commit real credentials. If your evaluator explicitly requires a `.env` file, use only a disposable test database credential and rotate/delete it after evaluation.
- This starter intentionally does not implement all graded rules for you; complete and test each TODO yourself.
