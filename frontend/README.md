# Insyd Notification System - POC

A proof-of-concept notification system for the Insyd Architecture Industry social platform, built with Next.js, Socket.IO, and SQLite.

## Features

- **Real-time Notifications**: Instant delivery via WebSocket connections
- **User Management**: Create and manage users
- **Social Actions**: Follow/unfollow users, create posts
- **Notification Types**: Follow notifications, new post notifications
- **Browser Notifications**: Desktop notifications when permission granted

## Architecture

This POC implements a simplified version of the system design documented in [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md).

### Tech Stack

- **Frontend**: Next.js 15 with App Router, Socket.IO Client, Tailwind CSS
- **Backend**: Node.js with Express, Socket.IO, Prisma ORM
- **Database**: SQLite (for simplicity in POC)
- **Real-time**: WebSocket connections for instant notifications

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

### Running the Application

1. Start the backend server:

   ```bash
   npm run server:dev
   ```

2. In a new terminal, start the frontend:

   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:3000`

## How to Test

1. **Create Users**: Use the "Create New User" button to add some test users
2. **Select User**: Choose a user from the list (this simulates logging in)
3. **Follow Others**: In the Users section, follow other users
4. **Create Posts**: Create a new post - followers will get notifications
5. **Real-time Notifications**: Open multiple browser tabs with different users to see real-time notifications

## System Design

The complete system design is documented in [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md), which includes:

- High-level architecture
- Component breakdown
- Database schema
- Scaling considerations
- Performance analysis
- Future enhancements

## API Endpoints

### Users

- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `POST /api/users/:id/follow` - Follow a user
- `DELETE /api/users/:id/follow` - Unfollow a user
- `GET /api/users/:id/following` - Get users followed by a user

### Posts

- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create a new post

### Notifications

- `GET /api/users/:id/notifications` - Get user's notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read

## Database Schema

```sql
-- Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Follows table
CREATE TABLE follows (
    id TEXT PRIMARY KEY,
    followerId TEXT NOT NULL,
    followingId TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (followerId) REFERENCES users(id),
    FOREIGN KEY (followingId) REFERENCES users(id)
);

-- Posts table
CREATE TABLE posts (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- Notifications table
CREATE TABLE notifications (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data TEXT,
    read BOOLEAN DEFAULT FALSE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);
```

## WebSocket Events

- `join` - User joins with their ID
- `notification` - Real-time notification delivery

## Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Deploy with default settings

### Backend (Railway/Heroku)

1. Create a new app on Railway or Heroku
2. Set environment variables:
   - `DATABASE_URL` (for production database)
   - `NODE_ENV=production`
   - `PORT=3001`
3. Deploy the backend

### Database (Supabase)

1. Create a new project on Supabase
2. Update `DATABASE_URL` in environment variables
3. Run `npx prisma db push` to create tables

## Limitations (POC)

- No authentication/authorization
- SQLite database (not suitable for production)
- No email/push notifications
- Basic error handling
- No rate limiting
- No caching

## Future Enhancements

- Email and push notifications
- User preferences
- Advanced notification filtering
- Notification batching
- AI-powered relevance scoring
- Analytics dashboard
- Mobile app support

## Contributing

This is a proof-of-concept for the Insyd assignment. The system is designed to demonstrate the core notification functionality while maintaining simplicity for rapid development.

## License

This project is for assessment purposes only.
