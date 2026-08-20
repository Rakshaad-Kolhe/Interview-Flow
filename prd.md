# Product Requirements Document (PRD) - InterviewFlow

## 1. Product Overview
**Name**: InterviewFlow  
**Tagline**: Master the technical interview.  
**Description**: InterviewFlow is an AI-powered mock interview platform that simulates real-world software engineering interviews. It generates dynamic, role-specific questions and provides a secure, real-time environment for candidates to practice and refine their answers.

## 2. Problem Statement
Technical interviews are stressful and often require practicing under simulated pressure. Existing solutions are either static question banks (like LeetCode) or expensive peer-to-peer mock interview services. Developers need an on-demand, intelligent system that acts as a technical interviewer to help them practice dynamically.

## 3. Target Audience
- **Junior to Senior Software Engineers**: Preparing for technical interviews (Backend, Frontend, Fullstack).
- **System Architects**: Preparing for system design rounds.
- **Career Transitioners**: Building confidence before their first technical screens.

## 4. Key Features & Requirements

### 4.1 User Authentication & Management
- **Req 4.1.1**: Users must be able to securely register and log in.
- **Req 4.1.2**: Sessions must be securely maintained using HttpOnly cookies for server-side rendering and JWTs for WebSocket authentication.
- **Req 4.1.3**: Users must have a secure dashboard restricted to their own data.

### 4.2 AI Mock Interview Generation
- **Req 4.2.1**: Users can select an interview role (e.g., Backend Developer) and difficulty (e.g., Medium, Hard).
- **Req 4.2.2**: The system must prompt an LLM to generate a specific number of contextual, non-repetitive interview questions based on the parameters.
- **Req 4.2.3**: Questions must be cached to ensure fast retrieval and optimize LLM API usage.

### 4.3 Live Interview Session (Real-Time)
- **Req 4.3.1**: The live session must operate via WebSockets (Socket.io) to simulate real-time interactions.
- **Req 4.3.2**: The interface must be completely distraction-free, emphasizing the current question.
- **Req 4.3.3**: The system must track interview progression (e.g., "Question 2 of 5") and emit events upon completion.
- **Req 4.3.4**: Users must have a code/text area to submit answers to the current question before moving forward.

### 4.4 Dashboard and Progress Tracking
- **Req 4.4.1**: Users must see an aggregated view of their total interviews, in-progress sessions, and completed sessions.
- **Req 4.4.2**: Users must be able to resume "In Progress" interviews or review "Completed" ones.

## 5. Non-Functional Requirements
- **Performance**: The frontend must prioritize Server-Side Rendering (SSR) for fast initial paints and SEO capabilities.
- **Aesthetics**: The UI must follow a strict, professional design system (Tailwind CSS) avoiding generic "AI dashboard" clichés.
- **Scalability**: The backend must gracefully handle concurrent WebSocket connections and safely degrade if Redis or the LLM provider fails.
- **Security**: Strict prevention of Insecure Direct Object References (IDOR). Users cannot fetch or join interviews they did not create.

## 6. Future Iterations (Out of Scope for v1)
- Advanced AI grading and feedback on submitted answers.
- Voice-to-text integration for verbal answering.
- Collaborative whiteboarding for System Design questions.
