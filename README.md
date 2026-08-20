# InterviewFlow

## Purpose
A small AI-powered mock interview platform created to demonstrate full-stack engineering concepts.

## Stack
* Next.js (App Router, Tailwind CSS)
* TypeScript
* Express.js
* PostgreSQL (via Prisma)
* MongoDB (via Mongoose)
* Redis
* Docker & Docker Compose

## Architecture
- **PostgreSQL**: Used for structured, relational data and transactional consistency (Users, Interviews, Payments). We avoid duplicating user data by enforcing strict normalization and using foreign keys (`userId`).
- **MongoDB**: Used for flexible, unstructured document data (AI responses, variable interview metadata).
- **Redis**: Used for fast ephemeral caching (future implementation).
- **Prisma ORM**: Provides type-safe database access and natively uses parameterized queries to protect against SQL Injection.

## Authentication Architecture

1. **Register**: Validates input (Zod), normalizes email, hashes the password using `bcrypt`, and persists the User to PostgreSQL.
2. **Login**: Verifies password against the stored hash and issues a JSON Web Token (JWT).
3. **Protected Requests**: A JWT middleware (`auth.ts`) extracts the `Bearer` token from the `Authorization` header, verifies the signature using `JWT_SECRET`, and attaches the decoded `userId` to the Express Request.
4. **Authorization Checks**: Every protected route derives ownership purely from the JWT `userId`. Protected interview queries scope the requested interview ID to the authenticated user's ID. Therefore a user cannot access or modify another user's interview through the tested IDOR attack path.

### Database Transactions
A PostgreSQL transaction is used when multiple database operations must maintain atomicity. For example, when creating an Interview, we simultaneously create an `Interview` record and an `InterviewLog` record using `prisma.$transaction`. If either query fails, the entire transaction rolls back cleanly, ensuring no orphaned data.

## External Integrations

### LLM Architecture
The AI integration is architected behind a dedicated service boundary. The application validates the expected LLM response using Zod and handles timeout/error scenarios using AbortController.

For deterministic local/interview demonstration, the current provider response is **simulated** rather than making a real paid LLM request.

### Payment Architecture
Payment integration is implemented as a **simulated/sandbox** architecture.

The backend performs server-side validation and persists the verified payment using a PostgreSQL transaction. No real payment provider is currently connected.

### Third-Party API
We integrated a public programming trivia API (JokeAPI) to demonstrate basic asynchronous fetching.

## Async JavaScript Concepts Demonstrated

### The Event Loop
JavaScript is single-threaded. The **Event Loop** manages concurrency by pushing asynchronous operations to Web APIs (or Node APIs), moving their callbacks to the Task/Microtask Queues, and executing them only when the Call Stack is empty.

### Promises, Async/Await & Parallelism
A **Promise** represents the eventual completion of an asynchronous operation. `async/await` is syntactic sugar over Promises, allowing asynchronous code (like `await fetch(...)`) to look and behave like synchronous code without blocking the main thread.

When executing asynchronous requests, you can choose sequential or parallel behavior based on whether the operations depend on each other:
```javascript
// Sequential (if B depends on A)
await A();
await B();

// Parallel (if A and B are independent)
const [a, b] = await Promise.all([A(), B()]);
```
Our application primarily relies on sequential fetching to guarantee authentication steps are completed before retrieving dependent data.

### Closures
A **Closure** occurs when a function retains access to variables from its lexical scope even after the outer function has returned. We demonstrate this in `services/api.ts` with `createScopedApiClient(basePath)`, which captures the `basePath` in its closure scope for subsequent function calls.

### JavaScript Hoisting
* `var` declarations are hoisted and initialized with `undefined`.
* `let` and `const` declarations are hoisted but remain in the Temporal Dead Zone until initialization.
* Function declarations can be called before their declaration in their scope.

## Advanced Systems (Redis, WebSockets, SSR)

### Redis Caching (Cache-Aside)
We utilize Redis to cache heavily read endpoints like `/api/interviews`. 
- **Cache-aside pattern**: The backend explicitly checks Redis. On a miss, it queries PostgreSQL and sets the cache.
- **TTL**: Cache entries expire after 60 seconds to prevent indefinitely stale data.
- **Invalidation**: Modifying an interview explicitly deletes the user's cache key.
- **Graceful Failure**: If Redis is unavailable, the application gracefully falls back to querying PostgreSQL directly.

### WebSockets & Session State
For the Live Interview experience, we use **WebSockets** (`socket.io`) to enable bi-directional, real-time communication between the browser and backend.
- **Authentication**: Connections are authorized using JWTs injected during the socket handshake.
- **Redis Session State**: The current interview state is stored using the key `interviews:session:{id}` with a 30-minute TTL.
- **Restart Behavior**: Redis preserves temporary session state independently of Node process memory. If the Node/WebSocket server restarts, the WebSocket connection itself is lost and the client must reconnect. Redis allows the temporary session state to remain available after the restart.

### Scheduled Jobs (Cron)
A background Cron job (`node-cron`) runs hourly to automatically clean up database clutter, specifically marking interviews stuck in the "created" state for >24 hours as "abandoned". 

### Next.js Server Components (SSR)
The `/dashboard` page is a pure Server Component. Browser `localStorage` is client-side, but Next.js Server Components execute on the server. `HttpOnly` cookies can be read server-side and are therefore suitable for the SSR authentication path.

(Note: In the WebSocket client route, we preserve a copy of the token in `localStorage` for backward compatibility with the Socket.io handshake. This is a known security tradeoff).

## Running locally

1. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. Setup environment variables:
   Copy `.env.example` to `.env` in the root folder, and update values if needed.

3. Start infrastructure (Databases):
   ```bash
   docker compose up -d
   ```

## Final Feature Matrix

| Requirement | Final Status |
| ----------- | -------------- |
| Async API fetching | Implemented |
| Promises | Implemented |
| async/await | Implemented |
| Callback understanding | Documented |
| Event Loop | Documented |
| Closures | Implemented |
| Hoisting | Documented |
| PostgreSQL | Implemented |
| Prisma | Implemented |
| SQL filtering | Implemented |
| SQL ordering | Implemented |
| SQL grouping | Missing |
| Normalization | Implemented |
| Transactions | Implemented |
| MongoDB | Implemented |
| JWT | Implemented |
| HttpOnly cookies | Implemented |
| Authorization | Implemented |
| IDOR protection | Implemented for tested ownership paths |
| LLM | Simulated |
| Payment | Simulated |
| Redis caching | Implemented |
| Redis session state | Implemented |
| WebSockets | Implemented |
| Cron | Implemented |
| SSR | Implemented |
| Server Components | Implemented |
| Docker | Statically verified |
| Automated tests | Implemented |

## Git Workflow
The project follows a standard Feature Branch workflow:
`feature/* -> develop -> main`

## Interview Discussion Points

### Authentication
* **Why JWT?**: Stateless, easily verifiable without database lookups, compact.
* **Why HttpOnly cookies?**: Moving tokens to `HttpOnly` cookies mitigates Cross-Site Scripting (XSS) risks since the token cannot be accessed by rogue JavaScript, and automatically enables SSR data fetching.
* **Auth vs Authz**: Authentication verifies *who* you are (Login/JWT). Authorization verifies what you are *allowed to do* (IDOR ownership checks).

### Database
* **Why PostgreSQL?**: Reliable, ACID-compliant relational data modeling ensures strict data integrity for core entities (Users, Interviews, Payments).
* **Why MongoDB?**: Flexible schema for storing potentially unstructured or highly variable interview responses without costly SQL migrations.
* **What is normalization?**: Structuring a database to reduce data redundancy and improve data integrity (e.g., using `userId` foreign keys instead of duplicating user emails).
* **Why use transactions?**: To guarantee Atomicity. If we create a Payment but fail to unlock Premium access, a transaction rolls everything back to prevent inconsistent states.

### Redis
* **Why Redis?**: In-memory speeds. Perfect for transient state and reducing load on the primary database for read-heavy operations.
* **What is cache-aside?**: The application first asks the cache. If missing, it asks the DB, then explicitly stores the result in the cache for next time.
* **What happens if Redis goes down?**: The application catches the connection error and gracefully falls back to querying PostgreSQL.

### Security
* Security controls implemented for the project's scope include parameterized queries (preventing SQL injection), JWT verification, and strict Zod validation.
