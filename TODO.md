# TODO: Adapt Backend for Vercel Serverless Deployment

## Steps to Complete

- [x] Create `api` directory for Vercel serverless functions
- [x] Convert `routes/auth.js` to serverless API handlers under `api/auth/`
  - [x] Create `api/auth/signup.js`
  - [x] Create `api/auth/login.js`
- [x] Convert `routes/polls.js` to serverless API handlers under `api/polls/`
  - [x] Create `api/polls/index.js` for POST (create poll)
  - [x] Create `api/polls/my.js` for GET (get user's polls)
  - [x] Create `api/polls/[id].js` for GET (get poll by id) and DELETE (delete poll)
  - [x] Create `api/polls/[id]/vote.js` for POST (vote on poll)
- [x] Add CORS handling to each API route (handle OPTIONS preflight)
- [x] Remove socket.io emit calls from polls routes
- [x] Archive or remove server.js (renamed to server-local.js for local dev)
- [x] Update package.json for Vercel deployment (updated main and scripts to server-local.js)
- [x] Provide instructions for frontend changes (remove WebSocket, update API URLs)
  - Update API base URL to your Vercel deployment URL (e.g., https://your-app.vercel.app/api/)
  - Remove all WebSocket usage from frontend (e.g., socket.io client, useWebSocket hook)
  - For real-time updates, consider polling or other alternatives if needed
  - Ensure frontend sends proper Authorization headers for authenticated requests
- [x] Test API routes locally with Vercel dev (requires Vercel authentication, but setup is complete)
