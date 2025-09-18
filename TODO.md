# TODO: Remove Local MongoDB from Backend

## Completed
- [x] Analyze project structure and MongoDB usage
- [x] Create plan for removal
- [x] Remove mongoose from package.json
- [x] Update models/User.js to use in-memory storage
- [x] Update models/Poll.js to use in-memory storage
- [x] Remove MongoDB connection from src/server.js
- [x] Remove MongoDB connection from test-db.js
- [x] Update api/auth/signup.js to remove connection and use new models
- [x] Update api/auth/login.js to remove connection and use new models
- [x] Update api/polls/index.js to remove connection and use new models
- [x] Update api/polls/my.js to remove connection and use new models
- [x] Update api/polls/[id].js to remove connection and use new models
- [x] Update api/polls/[id]/vote.js to remove connection and use new models
- [x] Update routes/auth.js to use new models
- [x] Update routes/polls.js to use new models

## Followup
- [ ] Run npm install
- [ ] Test the backend
