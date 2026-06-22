# API Contracts for InterviewX AI

## Auth Endpoints
POST /api/auth/register — { email, password } → { token, refreshToken, user: { id, email, isPremium } }
POST /api/auth/login — { email, password } → { token, refreshToken, user: { id, email, isPremium } }
POST /api/auth/refresh — { refreshToken } → { token, refreshToken }
GET /api/auth/profile — (protected) → { id, email, isPremium, interviewsUsed, maxInterviews, createdAt, name }
PUT /api/auth/profile — (protected) { name } → { id, email, name, isPremium }
POST /api/auth/logout — (protected) → { message }

## Interview Endpoints
POST /api/interview/start — (protected) { role, roundType, difficulty, resumeText } → { interviewId, question, round }
POST /api/interview/next — (protected) { interviewId, question, answer, round } → { question, round, finished, evaluation? }
POST /api/interview/report — (protected) { interviewId, role, roundType, difficulty, answers } → { report }
GET /api/interview/history — (protected) → Interview[]
GET /api/interview/analytics — (protected) → { totalInterviews, avgScore, bestScore, recent, isPremium, remainingFree }

## Payment Endpoints
POST /api/payment/create-order — (protected) → { success, id, amount, currency }
POST /api/payment/verify — (protected) { razorpay_order_id, razorpay_payment_id, razorpay_signature } → { success, message, isPremium }

## Admin Endpoints (admin: true required)
GET /api/admin/stats — (admin) → { totalUsers, premiumUsers, totalRevenue, totalInterviews, activeToday }
GET /api/admin/users — (admin) → User[]
PATCH /api/admin/users/:id/block — (admin) → { message }
PATCH /api/admin/users/:id/unblock — (admin) → { message }

## User Model Fields
email, password, name, isPremium, subscriptionPlan, subscriptionStart, subscriptionEnd, paymentId, interviewsUsed, maxInterviews, interviewCount, lastInterviewReset, isBlocked, refreshToken, createdAt, updatedAt

## Interview Model Fields
userId, role, roundType, difficulty, resumeText, qa[{question, answer, feedback, score}], finalScore, technicalScore, communicationScore, problemSolvingScore, strengths[], weaknesses[], improvementTopics[], studyPlan, createdAt

## Payment Model Fields
userId, orderId, paymentId, amount, currency, status (created/paid/failed), planType, createdAt
