# PulseBoard - Live Polls For Feedback

PulseBoard is a production-minded MERN stack platform for creating live polls, sharing public links, collecting feedback, viewing real-time analytics, and publishing final results.

This project was built for the **Web Dev Cohort 2026 Hackathon**.


## Repository

GitHub: https://github.com/Rajesh-Kumar71/pulseboard-live-polls

## Features

- User registration and login
- Protected creator dashboard
- Create polls with multiple questions
- Single-option questions
- Required and optional questions
- Anonymous response mode
- Authenticated response mode
- Poll expiry support
- Public poll sharing link
- Response collection from public poll links
- Duplicate response prevention for authenticated polls
- Creator-only analytics dashboard
- Total response count
- Question-wise summaries
- Option counts and percentages
- Anonymous vs authenticated participation insights
- Progress-bar based analytics
- Publish final results
- Same public poll link shows final results after publishing
- Real-time live response count and analytics updates using Socket.IO

## Tech Stack

### Frontend

- React
- Vite
- React Router DOM
- Axios
- Socket.IO Client
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Socket.IO
- Helmet
- CORS

## Project Structure

```txt
pulseboard-live-polls/
├── client/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── sockets/
│
├── server/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── sockets/
│       └── utils/
│
├── README.md
├── package.json
└── .gitignore
```

## Hackathon Requirement Coverage

| Requirement | Status |
|---|---|
| MERN stack | Implemented |
| Frontend and backend | Implemented |
| Authentication | Implemented |
| Protected routes | Implemented |
| Poll creation | Implemented |
| Multiple questions | Implemented |
| Single option selection | Implemented |
| Required/optional questions | Implemented |
| Anonymous responses | Implemented |
| Authenticated responses | Implemented |
| Poll expiry | Implemented |
| Public poll links | Implemented |
| Response collection | Implemented |
| Analytics dashboard | Implemented |
| Total responses | Implemented |
| Question-wise summaries | Implemented |
| Option counts | Implemented |
| Participation insights | Implemented |
| Publish final results | Implemented |
| Same link shows published results | Implemented |
| WebSocket live updates | Implemented |
| Single GitHub repository structure | Implemented |

## Main User Flow

1. A user registers or logs in.
2. The creator opens the dashboard.
3. The creator creates a poll with questions, options, expiry time, and response mode.
4. The creator shares the public poll link.
5. Respondents open the link and submit feedback.
6. The creator views live analytics.
7. The creator publishes final results.
8. The same public poll link shows the final result summary after publishing.

## API Routes

### Auth

```txt
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Polls

```txt
POST  /api/polls
GET   /api/polls/my
GET   /api/polls/public/:slug
GET   /api/polls/:pollId/analytics
PATCH /api/polls/:pollId/publish
GET   /api/polls/public/:slug/results
```

### Responses

```txt
POST /api/responses/:slug
```

## WebSocket Events

### Client emits

```txt
poll:join
```

### Server emits

```txt
poll:response-submitted
poll:analytics-updated
```

## Database Models

### User

Stores creator/respondent account information.

Key fields:

- name
- email
- password
- timestamps

### Poll

Stores poll details, questions, options, expiry, status, creator, and public slug.

Key fields:

- title
- description
- creator
- slug
- responseMode
- expiresAt
- status
- isPublished
- questions

### Response

Stores submitted poll responses.

Key fields:

- poll
- respondentUser
- respondentType
- answers
- timestamps

## Security Measures

- Passwords are hashed with bcryptjs
- Password field uses `select: false`
- JWT secret is stored in environment variables
- MongoDB URI is stored in environment variables
- Protected routes are used for creator actions
- Poll creator ownership is checked for analytics and publishing
- Poll expiry is validated on the backend
- Required questions are validated on the backend
- Selected option is checked against the original question
- Authenticated polls require login before submission
- Duplicate authenticated responses are blocked
- Public results expose aggregate summaries only
- Respondent identity is not exposed in public results
- Socket.IO events use poll-specific rooms
- Socket events do not broadcast user identity or raw answers
- Helmet is enabled for HTTP security headers
- CORS is configured using environment variables
- JSON request body size is limited
- Environment files are excluded from Git

## Expiry Handling Note

Poll expiry is enforced on the backend during response submission. Public poll and dashboard status are also derived from `expiresAt`, so expired polls do not accept responses even if no background worker has updated the stored status field.

A future production improvement can add a scheduled job to update expired poll statuses in the database.

## Real-time Updates

PulseBoard uses Socket.IO for real-time updates.

When a response is submitted:

- the server emits live response count updates to the poll room
- the server emits updated analytics data to the poll room
- the analytics dashboard updates without manual refresh
- no respondent identity or raw answer data is sent over the socket

## Local Setup

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd pulseboard-live-polls
```

### 2. Start MongoDB with Docker

```bash
docker run -d --name pulseboard-mongo -p 27017:27017 -v pulseboard_mongo_data:/data/db mongo:7
```

If the container already exists:

```bash
docker start pulseboard-mongo
```

### 3. Backend setup

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/pulseboard
JWT_SECRET=replace_with_strong_secret
JWT_EXPIRES_IN=1d
```

Run backend:

```bash
npm run dev
```

Backend runs on:

```txt
http://localhost:5000
```

Health check:

```txt
http://localhost:5000/api/health
```

### 4. Frontend setup

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Run frontend:

```bash
npm run dev
```

Frontend runs on:

```txt
http://localhost:5173
```

## Build Check

Run the frontend production build from the `client` folder:

```bash
cd client
npm run build
```

The build output is generated inside:

```txt
client/dist
```

The backend is plain Node.js/Express JavaScript and does not require a separate build step.

## Deployment Plan

Recommended deployment:

```txt
Frontend: Vercel
Backend: Render Web Service
Database: MongoDB Atlas
```

### Backend environment variables for Render

```env
NODE_ENV=production
CLIENT_URL=https://your-vercel-app.vercel.app
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_strong_secret
JWT_EXPIRES_IN=1d
```

### Frontend environment variable for Vercel

```env
VITE_API_BASE_URL=https://your-render-backend-url.onrender.com
```

## Production Notes

The current version uses JWT in localStorage for hackathon simplicity. A future production upgrade can move authentication to HTTP-only secure cookies.

For production use, recommended future improvements include:

- HTTP-only secure cookie authentication
- stricter rate limiting on auth and response routes
- scheduled job for expiry status updates
- request logging and monitoring
- analytics export

## Future Improvements

- Poll templates
- QR code sharing
- Manual poll close option
- Email verification
- HTTP-only cookie authentication
- Advanced charts
- Export analytics as CSV/PDF
- Rate limiting for auth and response routes
- Scheduled job to update expired poll statuses

## Final Submission Checklist

- Public GitHub repository link added
- Live deployed frontend link added
- Backend API deployed and connected
- MongoDB Atlas database connected
- README updated with final links
- `.env` files not committed
- `node_modules` not committed
- Frontend build checked successfully
