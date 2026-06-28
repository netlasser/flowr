# FLOWR Beta Technical Specification

## Table of Contents
1. [System Architecture](#system-architecture)
2. [API Endpoint Specifications](#api-endpoint-specifications)
3. [Database Design](#database-design)
4. [Security Requirements](#security-requirements)
5. [Testing Strategy](#testing-strategy)
6. [Deployment Architecture](#deployment-architecture)
7. [Monitoring & Observability](#monitoring--observability)

---

## System Architecture

### Overview
FLOWR is a full-stack web application with:
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Zustand
- **Backend**: Express.js (Node.js) + PostgreSQL
- **Auth**: JWT-based authentication
- **Observability**: Sentry for error tracking and performance monitoring
- **Deployment**: Vercel (frontend) + Vercel or Render (backend)

### Frontend Architecture
```
src/
├── components/
│   ├── auth/          # Authentication components
│   ├── beta/          # Beta-specific components
│   ├── dashboard/     # Analytics and dashboard
│   ├── ui/            # Reusable UI components (Radix UI)
│   └── zone/          # Zone management and focus features
├── lib/               # Utilities and helpers
├── services/          # API clients
├── store/             # Zustand state management
└── types/             # TypeScript type definitions
```

### Backend Architecture
```
server/
├── __tests__/         # Server-side tests
├── middleware/        # Express middleware (auth, etc.)
├── migrations/        # Database migrations
├── models/            # Data models
└── routes/            # API route handlers
```

---

## API Endpoint Specifications

### Beta Feedback Endpoints

#### 1. Submit Feedback
**Endpoint**: `POST /api/beta/feedback`
**Auth**: Required
**Request Body**:
```json
{
  "type": "bug|feature|general",
  "message": "string",
  "context": {
    "url": "string",
    "userAgent": "string",
    "timestamp": "ISO string"
  }
}
```
**Response**: `201 Created`
```json
{
  "id": "uuid",
  "userId": "uuid",
  "type": "bug|feature|general",
  "message": "string",
  "createdAt": "ISO string"
}
```

#### 2. Get Beta Analytics Summary
**Endpoint**: `GET /api/beta/analytics`
**Auth**: Required (admin only)
**Response**: `200 OK`
```json
{
  "totalFeedbackCount": 123,
  "feedbackByType": { "bug": 45, "feature": 50, "general": 28 },
  "activeTesters": 30,
  "sessionsCompleted": 1500,
  "averageSessionDuration": 24.5
}
```

---

## Database Design

### Beta Feedback Table
```sql
CREATE TABLE IF NOT EXISTS beta_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('bug', 'feature', 'general')),
  message TEXT NOT NULL,
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_beta_feedback_user_id ON beta_feedback(user_id);
CREATE INDEX idx_beta_feedback_type ON beta_feedback(type);
```

---

## Security Requirements

1. **Authentication**: All protected endpoints require valid JWT
2. **Authorization**: Admin-only endpoints check user role
3. **Input Validation**: All inputs validated and sanitized
4. **Rate Limiting**: Prevent abuse of API endpoints
5. **CORS**: Restrict origins appropriately
6. **Data Encryption**: Secrets stored in environment variables

---

## Testing Strategy

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and database interactions
- **End-to-End Tests**: Test full user flows (future)
- **Coverage**: Target 80%+ test coverage for critical code

---

## Deployment Architecture

- **Vercel**: Frontend deployment with automatic preview environments
- **Vercel/Render**: Backend deployment
- **Supabase/PostgreSQL**: Managed database
- **GitHub Actions**: CI/CD pipeline for testing and deployment

---

## Monitoring & Observability

- **Sentry**: Error tracking and performance monitoring for frontend and backend
- **Custom Metrics**: Track beta-specific KPIs (feedback count, active testers, etc.)
- **Logging**: Structured logging for debugging and auditing
