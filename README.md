# Backend - Authentication API

RESTful API built with Node.js, Express, TypeScript, MongoDB, and JWT authentication.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/authentication
JWT_SECRET=your-super-secret-jwt-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
FRONTEND_URL=http://localhost:3000
```

3. Start development server:
```bash
npm run dev
```

The API will run on `http://localhost:5000`

## API Endpoints

Base URL: `http://localhost:5000/api/auth`

### POST /register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Registration successful. Please check your email to verify your account."
}
```

### POST /login
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `401` - Invalid credentials
- `403` - Email not verified

### POST /verify-email/:token
Verify user email address.

**Response:**
```json
{
  "message": "Email verified successfully"
}
```

### POST /forgot-password
Request password reset.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "message": "Email sent if exists",
  "resetToken": "abc123..." // Only if user exists
}
```

### POST /reset-password/:token
Reset password with token.

**Request Body:**
```json
{
  "password": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password reset success"
}
```

## Project Structure

```
src/
├── config/
│   └── db.ts              # MongoDB connection
├── middleware/
│   └── auth.middleware.ts # JWT authentication
├── models/
│   └── User.ts            # User schema
├── routes/
│   └── auth.routes.ts     # Authentication routes
├── services/
│   └── email.service.ts   # Email sending service
└── server.ts              # Express app setup
```

## User Model

```typescript
{
  name: string
  email: string (unique)
  password: string (hashed)
  isVerified: boolean
  verificationToken?: string
  verificationTokenExpiry?: Date
  resetToken?: string
  resetTokenExpiry?: Date
}
```

## Security

- Passwords hashed with bcryptjs (10 rounds)
- JWT tokens expire after 1 day
- Verification tokens expire after 24 hours
- Reset tokens expire after 15 minutes
- Email verification required for login

## Email Configuration

The application uses nodemailer for sending emails. Configure SMTP settings in `.env`:

- **Gmail**: Use App Password (not regular password)
- **Other SMTP**: Update `SMTP_HOST` and `SMTP_PORT` accordingly

## Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
