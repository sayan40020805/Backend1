# TODO: Fix MongoDB Connection for Render Deployment

- [x] Edit test-db.js to remove fallback hardcoded MongoDB Atlas URI and require MONGO_URI environment variable only
- [x] Update .env.example to add placeholder for MONGO_URI environment variable with example MongoDB Atlas connection string
- [x] Confirm src/server.js is correctly using process.env.MONGO_URI for connection
- [x] Provide instructions to set MONGO_URI environment variable on Render dashboard
- [x] Add note in TODO.md about environment variable setup

## Instructions to set MONGO_URI environment variable on Render

1. Go to your Render Dashboard.
2. Select your backend service.
3. Navigate to the "Environment" tab.
4. Click "Add Environment Variable".
5. Set the key as `MONGO_URI`.
6. Set the value to your MongoDB Atlas connection string, e.g.:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority`
7. Save the changes.
8. Redeploy your Render service to apply the new environment variable.

This will ensure your backend connects to the remote MongoDB instance instead of localhost.
