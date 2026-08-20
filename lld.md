# Low-Level Design (LLD) - InterviewFlow

## 1. Database Schema

### 1.1 PostgreSQL (Prisma)

**User Model**
- `id`: String (UUID, PK)
- `name`: String
- `email`: String (Unique)
- `password`: String (Hashed)
- `createdAt`: DateTime (Indexed)
- `interviews`: Relation[]

**Interview Model**
- `id`: String (UUID, PK)
- `userId`: String (FK, Indexed)
- `title`: String
- `type`: String (e.g., 'Backend', 'System Design')
- `status`: Enum ('Created', 'In Progress', 'Completed')
- `createdAt`: DateTime
- `updatedAt`: DateTime

### 1.2 MongoDB (Mongoose)

**Audit Log Collection**
- `_id`: ObjectId
- `action`: String (e.g., 'INTERVIEW_CREATED', 'AI_GENERATED')
- `userId`: String
- `metadata`: JSON Object
- `timestamp`: Date

## 2. API Endpoints (Express)

### Auth Routes
- `POST /api/auth/register`
  - **Body**: `{ name, email, password }`
  - **Response**: `201 Created`
- `POST /api/auth/login`
  - **Body**: `{ email, password }`
  - **Response**: `200 OK` (Sets `HttpOnly` Cookie, returns token for WS)

### Interview Routes
- `GET /api/interviews`
  - **Auth**: Required (Cookie)
  - **Logic**: Checks Redis for cached list. If miss, queries Postgres (`orderBy: { createdAt: 'desc' }`), caches result, and returns.
- `GET /api/interviews/:id`
  - **Auth**: Required
  - **Logic**: Validates ownership to prevent IDOR.
- `POST /api/interviews/:id/generate`
  - **Auth**: Required
  - **Body**: `{ role, difficulty, count }`
  - **Logic**: Calls LLM provider. Returns array of generated questions.

## 3. Real-Time Communication (Socket.io)

### Connection & Handshake
- **Auth**: Client passes JWT in `auth: { token }` payload during connection.
- **Middleware**: Server verifies JWT before allowing upgrade.

### Events

| Event Name | Direction | Payload | Description |
|------------|-----------|---------|-------------|
| `start_session` | Client -> Server | `{ interviewId }` | Initializes the interview state in Redis. |
| `question:shown`| Server -> Client | `{ questionNumber, text }` | Broadcasts the current question to the client. |
| `submit_answer` | Client -> Server | `{ interviewId, answer }` | Client submits their answer text. |
| `interview:progress`| Server -> Client | `{ currentQuestion, totalQuestions }`| Updates the client progress bar. |
| `interview:completed`| Server -> Client | `{ message }` | Marks session as completed and closes session. |

## 4. Frontend Architecture

### 4.1 Component Structure
Located in `frontend/components/ui/`:
- `Button.tsx`: Handles primary/secondary variants and loading spinners.
- `Input.tsx`: Form fields with integrated error states.
- `Card.tsx`: Structural containers for dashboard and details.
- `Badge.tsx`: Semantic status indicators.

### 4.2 Data Fetching Strategy
- **Dashboard (`/dashboard`)**: Uses Next.js Server Components. Calls backend API via `serverFetch` utilizing cookies. Fails gracefully if unauthorized.
- **Client Interactions (`/login`, `/interviews/:id`)**: Uses Client Components with standard React `useState` and `useEffect` to handle forms and dynamic UI states (like AI generation loading).
