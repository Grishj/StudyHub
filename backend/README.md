Markdown

# PSC Study App - Backend API

## Setup

1. Install dependencies:
```bash
npm install
Setup environment variables:
Bash

cp .env.example .env
# Edit .env with your configuration
Setup database:
Bash

npx prisma migrate dev
npx prisma generate
npm run prisma:seed
Run development server:
Bash

npm run dev




🚀 SETUP & RUN INSTRUCTIONS
1. Install Dependencies:
Bash

npm install
2. Setup Environment:
Bash

cp .env.example .env
# Edit .env with your configuration
3. Setup Database:
Bash

# Run migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Seed database (optional)
npm run prisma:seed
4. Create Upload Directory:
Bash

mkdir -p uploads/{notes,questions,syllabus,profile,group,chat,general}
5. Run Development Server:
Bash

npm run dev
6. Access:
API: http://localhost:3000/api/v1
Health Check: http://localhost:3000/api/v1/health
Prisma Studio: npm run prisma:studio
📡 API ENDPOINTS SUMMARY
Authentication:
POST /api/v1/auth/register - Register user
POST /api/v1/auth/login - Login
POST /api/v1/auth/logout - Logout
POST /api/v1/auth/forgot-password - Request password reset
POST /api/v1/auth/reset-password - Reset password
POST /api/v1/auth/refresh-token - Refresh JWT token
GET /api/v1/auth/profile - Get profile
Profile:
GET /api/v1/profile/me - Get own profile
GET /api/v1/profile/:id - Get user profile
PATCH /api/v1/profile/me - Update profile
PATCH /api/v1/profile/me/avatar - Update avatar
GET /api/v1/profile/me/stats - Get user stats
GET /api/v1/profile/me/achievements - Get achievements
GET /api/v1/profile/me/progress - Get progress
POST /api/v1/profile/me/progress - Update progress
GET /api/v1/profile/me/content - Get user content
GET /api/v1/profile/me/bookmarks - Get bookmarks
POST /api/v1/profile/me/change-password - Change password
DELETE /api/v1/profile/me - Delete account
Categories:
GET /api/v1/categories - Get all categories
GET /api/v1/categories/:id - Get category by ID
GET /api/v1/categories/name/:name - Get category by name
GET /api/v1/categories/:id/stats - Get category stats
POST /api/v1/categories - Create category (admin)
PATCH /api/v1/categories/:id - Update category (admin)
DELETE /api/v1/categories/:id - Delete category (admin)
Syllabus:
GET /api/v1/syllabus - Get all syllabus
GET /api/v1/syllabus/search - Search syllabus
GET /api/v1/syllabus/category/:categoryId - Get by category
GET /api/v1/syllabus/:id - Get syllabus by ID
GET /api/v1/syllabus/:id/adjacent - Get next/previous
POST /api/v1/syllabus - Create syllabus (admin)
PATCH /api/v1/syllabus/:id - Update syllabus (admin)
DELETE /api/v1/syllabus/:id - Delete syllabus (admin)
POST /api/v1/syllabus/category/:categoryId/reorder - Reorder
PATCH /api/v1/syllabus/:id/toggle-publish - Toggle publish
Notes:
GET /api/v1/notes - Get all notes (with filters)
GET /api/v1/notes/:id - Get note by ID
GET /api/v1/notes/:id/comments - Get note comments
POST /api/v1/notes - Create note
PATCH /api/v1/notes/:id - Update note
DELETE /api/v1/notes/:id - Delete note
POST /api/v1/notes/:id/vote - Vote on note
POST /api/v1/notes/:id/comments - Add comment
DELETE /api/v1/notes/comments/:commentId - Delete comment
Questions:
GET /api/v1/questions - Get all questions
GET /api/v1/questions/:id - Get question by ID
GET /api/v1/questions/:id/comments - Get comments
POST /api/v1/questions - Create question
PATCH /api/v1/questions/:id - Update question
DELETE /api/v1/questions/:id - Delete question
POST /api/v1/questions/:id/vote - Vote
POST /api/v1/questions/:id/comments - Add comment
Quizzes:
GET /api/v1/quizzes - Get all quizzes
GET /api/v1/quizzes/daily - Get daily quiz
GET /api/v1/quizzes/leaderboard - Global leaderboard
GET /api/v1/quizzes/:id - Get quiz by ID
GET /api/v1/quizzes/:id/leaderboard - Quiz leaderboard
GET /api/v1/quizzes/:id/stats - Quiz statistics
POST /api/v1/quizzes - Create quiz (admin)
POST /api/v1/quizzes/:id/submit - Submit quiz
GET /api/v1/quizzes/attempts/:attemptId - Get result
GET /api/v1/quizzes/history/me - Quiz history
PATCH /api/v1/quizzes/:id - Update quiz (admin)
DELETE /api/v1/quizzes/:id - Delete quiz (admin)
Groups:
GET /api/v1/groups - Get all groups
GET /api/v1/groups/:id - Get group by ID
GET /api/v1/groups/:id/members - Get members
POST /api/v1/groups - Create group
PATCH /api/v1/groups/:id - Update group
DELETE /api/v1/groups/:id - Delete group
POST /api/v1/groups/:id/join - Join group
POST /api/v1/groups/:id/leave - Leave group
PATCH /api/v1/groups/:id/members/:userId/role - Update role
DELETE /api/v1/groups/:id/members/:userId - Remove member
GET /api/v1/groups/my/groups - Get user's groups
Notifications:
GET /api/v1/notifications - Get notifications
GET /api/v1/notifications/unread-count - Unread count
PATCH /api/v1/notifications/mark-all-read - Mark all read
PATCH /api/v1/notifications/:id/read - Mark as read
DELETE /api/v1/notifications/all - Delete all
DELETE /api/v1/notifications/:id - Delete notification
Bookmarks:
GET /api/v1/bookmarks - Get bookmarks
POST /api/v1/bookmarks/toggle - Toggle bookmark
GET /api/v1/bookmarks/check/:contentType/:contentId - Check status
Reports:
GET /api/v1/reports/my - Get user's reports
GET /api/v1/reports/all - Get all reports (admin)
POST /api/v1/reports - Create report
PATCH /api/v1/reports/:id/status - Update status (admin)
DELETE /api/v1/reports/:id - Delete report
Upload:
POST /api/v1/upload/single - Upload single file
POST /api/v1/upload/multiple - Upload multiple files
GET /api/v1/upload/download/:id - Download file
GET /api/v1/upload - Get user's files
DELETE /api/v1/upload/:id - Delete file
Search:
GET /api/v1/search?q=query - Global search
GET /api/v1/search/notes?q=query - Search notes
GET /api/v1/search/questions?q=query - Search questions
GET /api/v1/search/quizzes?q=query - Search quizzes
GET /api/v1/search/groups?q=query - Search groups
GET /api/v1/search/users?q=query - Search users
🔌 SOCKET.IO EVENTS
Chat Events:
chat:join-group - Join group chat
chat:leave-group - Leave group chat
chat:send-message - Send message
chat:edit-message - Edit message
chat:delete-message - Delete message
chat:typing - User typing
chat:stop-typing - User stopped typing
chat:load-messages - Load message history
chat:new-message - Receive new message
chat:message-edited - Message edited
chat:message-deleted - Message deleted
chat:user-joined - User joined
chat:user-left - User left
chat:user-typing - User is typing
chat:user-stop-typing - User stopped typing
WebRTC Events:
webrtc:join-room - Join video/audio room
webrtc:leave-room - Leave room
webrtc:offer - Send WebRTC offer
webrtc:answer - Send WebRTC answer
webrtc:ice-candidate - Exchange ICE candidates
webrtc:toggle-audio - Toggle audio
webrtc:toggle-video - Toggle video
webrtc:start-screen-share - Start screen sharing
webrtc:stop-screen-share - Stop screen sharing
webrtc:user-joined - User joined room
webrtc:user-left - User left room
webrtc:existing-peers - Get existing peers
✅ ALL FEATURES C


-----------------------------------------



📋 QUICK REFERENCE - ALL ENDPOINTS
Authentication (Public)
Bash

POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout                  # Protected
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
POST   /api/v1/auth/refresh-token
GET    /api/v1/auth/profile                 # Protected
Profile (Protected)
Bash

GET    /api/v1/profile/me
GET    /api/v1/profile/:id
PATCH  /api/v1/profile/me
PATCH  /api/v1/profile/me/avatar
GET    /api/v1/profile/me/stats
GET    /api/v1/profile/me/achievements
GET    /api/v1/profile/me/progress
POST   /api/v1/profile/me/progress
GET    /api/v1/profile/me/content
GET    /api/v1/profile/me/bookmarks
POST   /api/v1/profile/me/change-password
DELETE /api/v1/profile/me
Categories (Public)
Bash

GET    /api/v1/categories
GET    /api/v1/categories/:id
GET    /api/v1/categories/name/:name
GET    /api/v1/categories/:id/stats
POST   /api/v1/categories                   # Protected
PATCH  /api/v1/categories/:id               # Protected
DELETE /api/v1/categories/:id               # Protected
Syllabus (Public/Protected)
Bash

GET    /api/v1/syllabus
GET    /api/v1/syllabus/search
GET    /api/v1/syllabus/category/:categoryId
GET    /api/v1/syllabus/:id
GET    /api/v1/syllabus/:id/adjacent
POST   /api/v1/syllabus                     # Protected
PATCH  /api/v1/syllabus/:id                 # Protected
DELETE /api/v1/syllabus/:id                 # Protected
Notes
Bash

GET    /api/v1/notes
GET    /api/v1/notes/:id
GET    /api/v1/notes/:id/comments
POST   /api/v1/notes                        # Protected
PATCH  /api/v1/notes/:id                    # Protected
DELETE /api/v1/notes/:id                    # Protected
POST   /api/v1/notes/:id/vote               # Protected
POST   /api/v1/notes/:id/comments           # Protected
DELETE /api/v1/notes/comments/:commentId    # Protected
Questions
Bash

GET    /api/v1/questions
GET    /api/v1/questions/:id
GET    /api/v1/questions/:id/comments
POST   /api/v1/questions                    # Protected
PATCH  /api/v1/questions/:id                # Protected
DELETE /api/v1/questions/:id                # Protected
POST   /api/v1/questions/:id/vote           # Protected
POST   /api/v1/questions/:id/comments       # Protected
Quizzes
Bash

GET    /api/v1/quizzes
GET    /api/v1/quizzes/daily
GET    /api/v1/quizzes/leaderboard
GET    /api/v1/quizzes/:id
GET    /api/v1/quizzes/:id/leaderboard
GET    /api/v1/quizzes/:id/stats
POST   /api/v1/quizzes                      # Protected
POST   /api/v1/quizzes/:id/submit           # Protected
GET    /api/v1/quizzes/attempts/:attemptId  # Protected
GET    /api/v1/quizzes/history/me           # Protected
PATCH  /api/v1/quizzes/:id                  # Protected
DELETE /api/v1/quizzes/:id                  # Protected
Groups
Bash

GET    /api/v1/groups
GET    /api/v1/groups/:id
GET    /api/v1/groups/:id/members
POST   /api/v1/groups                       # Protected
PATCH  /api/v1/groups/:id                   # Protected
DELETE /api/v1/groups/:id                   # Protected
POST   /api/v1/groups/:id/join              # Protected
POST   /api/v1/groups/:id/leave             # Protected
PATCH  /api/v1/groups/:id/members/:userId/role  # Protected
DELETE /api/v1/groups/:id/members/:userId   # Protected
GET    /api/v1/groups/my/groups             # Protected
Search (Public)
Bash
Group Chat Routes:
Endpoint	Method	Auth	Description
/groups/chat/:groupId/messages	GET	Yes	Get chat messages (paginated)
/groups/chat/:groupId/messages	POST	Yes	Send message (REST fallback)
/groups/chat/messages/:messageId	PATCH	Yes	Edit message
/groups/chat/messages/:messageId	DELETE	Yes	Delete message
/groups/chat/:groupId/stats	GET	Yes	Get chat statistics
/groups/chat/:groupId/search	GET	Yes	Search messages
/groups/chat/:groupId/upload	POST	Yes	Upload file to chat

GET    /api/v1/search?q=query
GET    /api/v1/search/notes?q=query
GET    /api/v1/search/questions?q=query
GET    /api/v1/search/quizzes?q=query
GET    /api/v1/search/groups?q=query
GET    /api/v1/search/users?q=query
Bookmarks (Protected)
Bash

GET    /api/v1/bookmarks
POST   /api/v1/bookmarks/toggle
GET    /api/v1/bookmarks/check/:contentType/:contentId
Notifications (Protected)
Bash

GET    /api/v1/notifications
GET    /api/v1/notifications/unread-count
PATCH  /api/v1/notifications/mark-all-read
PATCH  /api/v1/notifications/:id/read
DELETE /api/v1/notifications/all
DELETE /api/v1/notifications/:id
Reports (Protected)
Bash

GET    /api/v1/reports/my
GET    /api/v1/reports/all
POST   /api/v1/reports
PATCH  /api/v1/reports/:id/status
DELETE /api/v1/reports/:id
Upload (Protected)
Bash

POST   /api/v1/upload/single
POST   /api/v1/upload/multiple
GET    /api/v1/upload/download/:id
GET    /api/v1/upload
DELETE /api/v1/upload/:id
🧪 Testing Workflo


----------------------------------------

Endpoint	Method	Auth	Description
/download/note/:id	GET	No	Download single note
/download/note/:id/json	GET	No	Download note as JSON
/download/notes/bulk	POST	Yes	Download multiple notes as ZIP
/download/question/:id	GET	No	Download single question
/download/questions/year/:year	GET	No	Download questions by year
/download/questions/category/:categoryId	GET	No	Download questions by category
/download/syllabus/:id	GET	No	Download syllabus
/download/syllabus/category/:categoryId	GET	No	Download all syllabus for category
/download/stats	GET	Yes	Get user's download statistics
/download/history	GET	Yes	Get user's download history
/download/most-downloaded	GET	No	Get most downloaded content