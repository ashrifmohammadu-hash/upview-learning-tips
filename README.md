# Upview Learning Tips Inbox

## Project Overview
Upview Learning Tips Inbox is a full-stack web application designed for authors to submit learning tips and reviewers to moderate them. It features user authentication, a tip scoring service, and distinct dashboards for authors and reviewers.

## Tech Stack
* **FastAPI**: High-performance Python backend framework for the REST API.
* **SQLAlchemy**: ORM for database interactions.
* **SQLite**: Lightweight local database.
* **JWT**: Secure token-based authentication (using python-jose).
* **bcrypt**: Password hashing for secure credential storage.
* **React**: Frontend UI library.
* **Vite**: Fast frontend build tool.
* **pytest**: Automated testing framework.

## Architecture
```text
React UI
   ↓
FastAPI REST API
   ↓
Auth / Tip Services
   ↓
Scoring Service
   ↓
SQLite
```
The **Scoring Service** is separated from the HTTP layer to ensure it remains a pure business logic module. This allows it to be tested in isolation, mocked during HTTP tests, and easily swapped out (e.g., replaced with a real ML model API) without affecting the FastAPI routing or request validation logic.

## Setup

### Backend
Open a terminal in the `backend` folder:
```bash
cd backend
python -m venv .venv
# Windows activation:
.\.venv\Scripts\activate
# Mac/Linux activation:
# source .venv/bin/activate

pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload
```

### Frontend
Open another terminal in the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```

## Tests
To run automated tests, navigate to the `backend` folder, ensure your virtual environment is activated, and run:
```bash
pytest
```

## Seed Credentials
The seed script (`python -m app.seed`) creates the following users:

**Author:**
* Email: `author@example.com`
* Password: `author123`

**Reviewer:**
* Email: `reviewer@example.com`
* Password: `reviewer123`

## Authentication Flow

The application uses distinct authentication flows for Authors and Reviewers.

**Author:**
Register -> Login -> Submit Tips

**Reviewer:**
Existing Account -> Login -> Review Tips

*Note: Reviewer registration is intentionally disabled through the frontend because reviewer access is a highly privileged role managed internally.*

## API Endpoints
* `POST /api/auth/register`: Register a new author account.
* `POST /api/auth/login`: Authenticate and receive a JWT.
* `POST /api/tips`: Submit a new learning tip (Author only).
* `GET /api/tips`: List tips submitted by the authenticated author.
* `GET /api/reviewer/tips/pending`: List pending/unscored tips (Reviewer only).
* `PATCH /api/reviewer/tips/{tip_id}/approve`: Approve a tip (Reviewer only).
* `PATCH /api/reviewer/tips/{tip_id}/reject`: Reject a tip with a reason (Reviewer only).
* `PATCH /api/reviewer/tips/{tip_id}/reopen`: Reopen a rejected tip (Reviewer only).

## Assumptions
* It's assumed that the SQLite database is sufficient for local development and testing.
* Passwords for seeded users are simplified for testing purposes.
* All scoring flags subtract a static amount (20 points) from a base score of 100 for demonstration purposes.

## Known Limitations
* Basic error handling on the frontend (native alerts or simple red text instead of toasts).
* In a production environment, SQLite should be replaced with PostgreSQL or MySQL to better handle concurrency, though basic concurrent update checks are implemented.

---

# Reviewer Questions

### 1. What happens if scoring is down during a spike of submissions?
If the scoring service throws an exception or fails, the tip is NOT dropped. It is successfully saved to the database with its `status` set to `unscored` and its `score` set to `null`. This ensures no data is lost during an outage. In the future, a background task or message queue (like Celery or RabbitMQ) could be implemented to retry scoring for these `unscored` tips asynchronously.

### 2. How do you prevent an author from approving their own tip?
Role-based access control (RBAC) is enforced at the backend API level. Hiding the "Approve" button on the frontend is purely for UX. The FastAPI endpoints for reviewer actions (`/api/reviewer/...`) use a dependency (`get_current_reviewer`) that inspects the JWT payload, looks up the user, and strictly verifies that their role is `reviewer`. If an author attempts to call these endpoints (e.g., via cURL or Postman), the backend rejects the request with a `403 Forbidden` error.

### 3. If two reviewers click approve and reject at the same time, what should the user see and why?
The system prevents conflicting final states using a database transaction state check. The `UPDATE` query includes a `WHERE status = 'pending'` clause. Whichever request reaches the database first successfully updates the row. The second request attempts to update a row that is no longer `pending`, resulting in 0 rows updated. The backend detects this (using `synchronize_session=False` and checking the update count) and returns a `409 Conflict` error to the second reviewer, which the frontend displays, preventing silent overwriting of decisions.

### 4. Which part of the code would you replace first if a real ML model were added?
I would replace the implementation inside the `scoring_service.score_tip(text)` function in `backend/app/scoring/service.py`. Because the scoring logic is decoupled from the FastAPI routers and database models, replacing the deterministic rules with an external ML API call (or loading a local model) would only require changing this specific module, keeping the rest of the application completely unaffected.

