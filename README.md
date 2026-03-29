# 🎟️ Event Booking System

> A production-ready RESTful API for managing events and booking tickets — built with **Node.js**, **Express.js**, and **MySQL**.

Built as part of a Junior Node.js Backend Developer selection test. The system handles real-world concerns like **concurrent ticket booking**, **unique booking codes**, **attendance check-in**, and **full API documentation**.

---

## 📸 API Overview

```
POST   /users                    →  Register a new user
GET    /events                   →  Browse all upcoming events
POST   /events                   →  Create a new event
POST   /bookings                 →  Book tickets (race-condition safe)
GET    /users/:id/bookings       →  View all bookings for a user
POST   /events/:id/attendance    →  Check in using booking code
GET    /health                   →  Health check
```

📄 **Interactive Docs** → `http://localhost:3000/api-docs`

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MySQL 8 |
| MySQL Driver | mysql2/promise |
| Validation | express-validator |
| Unique Codes | uuid (v4) |
| API Docs | swagger-ui-express + js-yaml |
| Environment | dotenv |
| Dev Tool | nodemon |

---

## 🗂️ Project Structure

```
event-booking-system/
│
├── src/
│   ├── config/
│   │   └── db.js                    # MySQL connection pool
│   │
│   ├── controllers/                 # Business logic (separated from routes)
│   │   ├── user.controller.js
│   │   ├── event.controller.js
│   │   ├── booking.controller.js
│   │   └── attendance.controller.js
│   │
│   ├── routes/                      # Route definitions only (no logic here)
│   │   ├── user.routes.js
│   │   ├── event.routes.js
│   │   └── booking.routes.js
│   │
│   ├── validators/                  # All input validation rules
│   │   └── schemas.js
│   │
│   ├── middlewares/                 # Reusable middleware
│   │   ├── validate.js              # Runs express-validator checks
│   │   └── errorHandler.js         # Global error handler
│   │
│   ├── app.js                       # Express app setup + Swagger
│   └── server.js                    # Entry point — starts the server
│
├── schema.sql                       # Full database schema export
├── swagger.yaml                     # OpenAPI 3.0 documentation
├── postman_collection.json          # Postman collection for testing
├── .env.example                     # Environment variable template
├── Dockerfile                       # Docker image config
├── docker-compose.yml               # One-command local setup
├── package.json
└── README.md
```

---

## 🗄️ Database Design

Four tables with proper relationships, constraints, and foreign keys:

```
users
  ├── id              INT UNSIGNED  PK AUTO_INCREMENT
  ├── name            VARCHAR(100)  NOT NULL
  ├── email           VARCHAR(150)  NOT NULL UNIQUE
  └── created_at      DATETIME      DEFAULT NOW()

events
  ├── id                INT UNSIGNED  PK AUTO_INCREMENT
  ├── title             VARCHAR(200)  NOT NULL
  ├── description       TEXT
  ├── date              DATETIME      NOT NULL
  ├── total_capacity    INT UNSIGNED  NOT NULL
  ├── remaining_tickets INT UNSIGNED  NOT NULL
  └── created_at        DATETIME      DEFAULT NOW()

bookings
  ├── id             INT UNSIGNED  PK AUTO_INCREMENT
  ├── user_id        INT UNSIGNED  FK → users(id)
  ├── event_id       INT UNSIGNED  FK → events(id)
  ├── tickets_count  INT UNSIGNED  DEFAULT 1
  ├── booking_code   CHAR(36)      UNIQUE  ← UUID v4
  └── booking_date   DATETIME      DEFAULT NOW()

event_attendance
  ├── id          INT UNSIGNED  PK AUTO_INCREMENT
  ├── user_id     INT UNSIGNED  FK → users(id)
  ├── event_id    INT UNSIGNED  FK → events(id)
  ├── booking_id  INT UNSIGNED  FK → bookings(id) UNIQUE
  └── entry_time  DATETIME      DEFAULT NOW()
```

**Key Constraints:**
- One booking per user per event `UNIQUE(user_id, event_id)`
- One check-in per booking `UNIQUE(booking_id)`
- All foreign keys have `ON DELETE CASCADE`

---

## 🔐 Race Condition Handling

The biggest technical challenge in ticket booking is **concurrency** — when multiple users try to book the last ticket at the same time.

This API solves it using a **MySQL Transaction with row-level locking**:

```
BEGIN TRANSACTION
  ↓
SELECT remaining_tickets FROM events WHERE id = ? FOR UPDATE
  ↓  (row is now locked — no other request can read or write it)
Check if tickets are available
  ↓
INSERT INTO bookings (... booking_code = UUID ...)
  ↓
UPDATE events SET remaining_tickets = remaining_tickets - ?
  ↓
COMMIT  ← lock released
```

If anything fails at any step → `ROLLBACK` → no partial data is saved.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MySQL** v8 or higher
- **npm** v9 or higher

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/event-booking-system.git
cd event-booking-system
```

---

### Step 2 — Install Dependencies

```bash
npm install
```

---

### Step 3 — Set Up Environment Variables

```bash
# Mac/Linux
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=event_booking_db
```

> Leave DB_PASSWORD blank if your MySQL has no password set.

> Never commit `.env` to GitHub — it is already listed in `.gitignore`.

---

### Step 4 — Set Up the Database

**Option A — Terminal:**
```bash
mysql -u root -p < schema.sql
```

**Option B — MySQL Workbench:**
```
Server → Data Import → Import from Self-Contained File → select schema.sql → Start Import
```

**Verify 4 tables were created:**
```sql
USE event_booking_db;
SHOW TABLES;
```

Expected:
```
+---------------------------+
| Tables_in_event_booking_db|
+---------------------------+
| bookings                  |
| event_attendance          |
| events                    |
| users                     |
+---------------------------+
```

---

### Step 5 — Run the Server

```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

**Expected terminal output:**
```
✅ Database connected successfully
🚀 Server running on port 3000
📄 Swagger docs → http://localhost:3000/api-docs
```

---

## 📡 API Endpoints

### Users

| Method | Endpoint | Description |
|---|---|---|
| POST | `/users` | Create a new user |
| GET | `/users/:id/bookings` | Get all bookings for a user |

### Events

| Method | Endpoint | Description |
|---|---|---|
| GET | `/events` | List all upcoming events (date > NOW) |
| POST | `/events` | Create a new event |

### Bookings

| Method | Endpoint | Description |
|---|---|---|
| POST | `/bookings` | Book ticket(s) — transaction safe with FOR UPDATE |

### Attendance

| Method | Endpoint | Description |
|---|---|---|
| POST | `/events/:id/attendance` | Check in an attendee using booking code |

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Confirm the server is running |

---

## 📬 Testing the API

### Option A — Swagger UI (Recommended)
After starting the server open in your browser:
```
http://localhost:3000/api-docs
```
Full interactive documentation — try every endpoint directly in the browser with example bodies.

---

### Option B — Postman
```
1. Open Postman
2. Click Import
3. Select postman_collection.json from the project root
4. All endpoints are pre-configured with example request bodies
```

---

### Option C — Quick curl Flow

```bash
# 1. Create a user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'

# 2. Create an event
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{"title": "Tech Conf 2026", "date": "2026-09-01T09:00:00Z", "total_capacity": 100}'

# 3. Book a ticket — note the booking_code in the response
curl -X POST http://localhost:3000/bookings \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "event_id": 1, "tickets_count": 2}'

# 4. Check in using the booking_code returned in step 3
curl -X POST http://localhost:3000/events/1/attendance \
  -H "Content-Type: application/json" \
  -d '{"booking_code": "paste-your-uuid-here"}'
```

---

## 📦 Response Format

Every API response follows a consistent structure:

**Success:**
```json
{
  "success": true,
  "message": "Booking confirmed successfully",
  "data": {
    "booking_id": 1,
    "booking_code": "550e8400-e29b-41d4-a716-446655440000",
    "tickets_count": 2
  }
}
```

**Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "data": [
    { "field": "email", "message": "Must be a valid email address" }
  ]
}
```

**Not Found / Business Logic Error:**
```json
{
  "success": false,
  "message": "User has already booked this event",
  "data": null
}
```

---

## 🐳 Docker Setup (One Command)

Make sure **Docker Desktop** is running, then:

```bash
docker-compose up --build
```

This will automatically:
- Start a **MySQL 8** container and import the schema
- Start the **Node.js API** server
- Connect both via a private Docker network

| URL | What it is |
|---|---|
| `http://localhost:3000` | API base URL |
| `http://localhost:3000/api-docs` | Swagger interactive docs |

**Stop everything:**
```bash
docker-compose down
```

**Stop and wipe all data:**
```bash
docker-compose down -v
```

---

## ✅ Submission Checklist

- [x] GitHub repository with clean commit history
- [x] `README.md` with full setup and run instructions
- [x] `schema.sql` complete database schema export
- [x] `swagger.yaml` OpenAPI 3.0 documentation
- [x] `postman_collection.json` with all endpoints and example responses
- [x] `Dockerfile` and `docker-compose.yml` for one-command setup