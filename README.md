# Recovery-pro

Complete Account Recovery and Password Management System

## Features

- User registration and login with JWT authentication
- Password reset via email recovery tokens
- Email verification
- Password change for authenticated users
- Audit logging for all security-related actions
- Rate limiting and security headers (Helmet)

## Project Structure

```
backend/
├── index.js                  # Express server entry point
├── controllers/
│   ├── authController.js     # Registration, login, profile
│   └── recoveryController.js # Password reset, email verification
├── middleware/
│   └── auth.js               # JWT authentication middleware
├── models/
│   ├── AuditLog.js           # Audit log schema
│   ├── RecoveryToken.js      # Recovery token schema
│   └── User.js               # User schema
├── routes/
│   ├── auth.js               # Auth routes
│   └── recovery.js           # Recovery routes
└── .env.example              # Environment variable template
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp backend/.env.example backend/.env
   ```

3. Start the server:
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

| Method | Endpoint             | Description          | Auth Required |
|--------|----------------------|----------------------|---------------|
| POST   | `/api/auth/register` | Register a new user  | No            |
| POST   | `/api/auth/login`    | Login and get token  | No            |
| GET    | `/api/auth/profile`  | Get user profile     | Yes           |

### Recovery

| Method | Endpoint                              | Description                 | Auth Required |
|--------|---------------------------------------|-----------------------------|---------------|
| POST   | `/api/recovery/password-reset/request`| Request password reset      | No            |
| POST   | `/api/recovery/password-reset/confirm`| Confirm password reset      | No            |
| POST   | `/api/recovery/email/request-verification` | Request email verification | Yes      |
| POST   | `/api/recovery/email/verify`          | Verify email                | No            |
| POST   | `/api/recovery/change-password`       | Change password             | Yes           |

### Health

| Method | Endpoint       | Description  | Auth Required |
|--------|----------------|--------------|---------------|
| GET    | `/api/health`  | Health check | No            |

## Environment Variables

| Variable      | Description                |
|---------------|----------------------------|
| MONGODB_URI   | MongoDB connection string  |
| JWT_SECRET    | Secret key for JWT signing |
| PORT          | Server port (default 3000) |
| NODE_ENV      | Environment (development/production) |
| EMAIL_SERVICE | Email service provider     |
| EMAIL_USER    | Email username             |
| EMAIL_PASS    | Email password             |

## License

MIT
