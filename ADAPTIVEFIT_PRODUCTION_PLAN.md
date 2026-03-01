# AdaptiveFit - Production Plan

## Project Identity

- **Name:** AdaptiveFit
- **Type:** Personalised Fitness & Nutrition Web Application
- **Purpose:** Dissertation project — a fully functional adaptive fitness platform that generates workout/nutrition plans and dynamically adjusts them based on user behaviour, adherence, and weekly check-ins.
- **Frontend:** React (JavaScript)
- **Backend:** Java Spring Boot
- **Database:** MySQL
- **Auth:** Spring Security with JWT
- **Build Tools:** Maven (backend), npm/Vite (frontend)

---

## Definition of Done

A user can: **Register -> Verify Email -> Complete Onboarding -> Receive Personalised Plan -> Log Workouts -> Submit Weekly Check-In -> See Plan Adapt Automatically with Explanations.**

All plan changes must be visible, versioned, and explained to the user.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                     │
│  Port: 3000                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │  Auth    │ │Onboarding│ │Dashboard │ │ Weekly Check-In│  │
│  │  Pages   │ │  Flow    │ │& Workouts│ │   & Progress   │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────┘  │
│                         │                                   │
│              Axios HTTP calls (JWT in headers)              │
└─────────────────────────┼───────────────────────────────────┘
                          │
                    REST API (JSON)
                          │
┌─────────────────────────┼───────────────────────────────────┐
│                   BACKEND (Spring Boot)                     │
│  Port: 8080                                                 │
│  ┌──────────────┐ ┌────────────────┐ ┌───────────────────┐ │
│  │ Auth Module  │ │ Plan Generator │ │ Adaptive Engine   │ │
│  │ (Security,   │ │ (Workout +     │ │ (Check-in logic,  │ │
│  │  JWT, Email) │ │  Nutrition)    │ │  plan adjustment) │ │
│  └──────────────┘ └────────────────┘ └───────────────────┘ │
│  ┌──────────────┐ ┌────────────────┐ ┌───────────────────┐ │
│  │ User Profile │ │ Workout Log    │ │ Event Logger      │ │
│  │ Service      │ │ Service        │ │ (for evaluation)  │ │
│  └──────────────┘ └────────────────┘ └───────────────────┘ │
│                         │                                   │
│                    JPA / Hibernate                          │
└─────────────────────────┼───────────────────────────────────┘
                          │
                 ┌────────┴────────┐
                 │     MySQL       │
                 │   Database      │
                 └─────────────────┘
```

---

## Database Schema

### Table: `users`

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| email | VARCHAR(255) UNIQUE NOT NULL | login identifier |
| password_hash | VARCHAR(255) NOT NULL | bcrypt hashed |
| email_verified | BOOLEAN DEFAULT FALSE | must verify before using app |
| verification_token | VARCHAR(255) | for email verification link |
| reset_token | VARCHAR(255) | for password reset |
| reset_token_expiry | DATETIME | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### Table: `user_profiles`

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| user_id | BIGINT FK -> users.id UNIQUE | |
| fitness_goal | ENUM('FAT_LOSS', 'MUSCLE_GAIN', 'GENERAL_FITNESS') | |
| experience_level | ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') | |
| days_per_week | INT (1-7) | gym days available |
| session_duration_minutes | INT | e.g. 30, 45, 60, 90 |
| equipment_access | ENUM('FULL_GYM', 'HOME_BASIC', 'BODYWEIGHT_ONLY') | |
| dietary_preference | ENUM('NO_PREFERENCE', 'VEGETARIAN', 'VEGAN', 'HALAL', 'GLUTEN_FREE') | |
| height_cm | DECIMAL(5,1) NULLABLE | |
| weight_kg | DECIMAL(5,1) NULLABLE | |
| age | INT NULLABLE | |
| goal_duration_weeks | INT | how many weeks to achieve goal |
| onboarding_completed | BOOLEAN DEFAULT FALSE | |

### Table: `workout_plans`

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| user_id | BIGINT FK -> users.id | |
| version | INT | increments on each adaptation |
| status | ENUM('ACTIVE', 'ARCHIVED') | only one ACTIVE per user |
| intensity_level | ENUM('LIGHT', 'MODERATE', 'INTENSE', 'VERY_INTENSE') | |
| days_per_week | INT | may change on adaptation |
| created_at | DATETIME | |
| change_summary | TEXT NULLABLE | "What changed and why" explanation |

### Table: `workout_days`

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| plan_id | BIGINT FK -> workout_plans.id | |
| day_number | INT (1-7) | day within the weekly cycle |
| day_label | VARCHAR(50) | e.g. "Day 1 - Push", "Day 3 - Legs" |
| focus_area | VARCHAR(100) | e.g. "Chest & Triceps" |

### Table: `workout_exercises`

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| workout_day_id | BIGINT FK -> workout_days.id | |
| exercise_name | VARCHAR(255) | |
| sets | INT | |
| reps | VARCHAR(50) | e.g. "8-12" or "AMRAP" |
| rest_seconds | INT | |
| order_index | INT | display order |
| notes | VARCHAR(255) NULLABLE | e.g. "slow eccentric" |

### Table: `exercise_library`

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| name | VARCHAR(255) UNIQUE | |
| muscle_group | VARCHAR(100) | e.g. "Chest", "Quadriceps" |
| equipment_required | ENUM('NONE', 'DUMBBELLS', 'BARBELL', 'CABLE_MACHINE', 'FULL_GYM') | |
| difficulty | ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') | |
| description | TEXT NULLABLE | |

### Table: `workout_logs`

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| user_id | BIGINT FK -> users.id | |
| workout_day_id | BIGINT FK -> workout_days.id | |
| completed_at | DATE | |
| marked_complete | BOOLEAN | |

### Table: `exercise_logs`

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| workout_log_id | BIGINT FK -> workout_logs.id | |
| exercise_id | BIGINT FK -> workout_exercises.id | |
| actual_sets | INT NULLABLE | |
| actual_reps | VARCHAR(50) NULLABLE | |
| actual_weight_kg | DECIMAL(5,1) NULLABLE | |

### Table: `nutrition_plans`

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| user_id | BIGINT FK -> users.id | |
| plan_version | INT | matches workout_plans version |
| daily_calories | INT | |
| protein_g | INT | |
| carbs_g | INT | |
| fats_g | INT | |
| dietary_tips | TEXT | JSON array of tip strings |
| created_at | DATETIME | |

### Table: `nutrition_logs`

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| user_id | BIGINT FK -> users.id | |
| log_date | DATE | |
| calories_consumed | INT NULLABLE | |
| protein_g | DECIMAL(5,1) NULLABLE | |
| carbs_g | DECIMAL(5,1) NULLABLE | |
| fats_g | DECIMAL(5,1) NULLABLE | |

### Table: `weekly_checkins`

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| user_id | BIGINT FK -> users.id | |
| week_number | INT | relative to plan start |
| sessions_completed | INT | how many gym sessions that week |
| difficulty_rating | INT (1-5) | 1=too easy, 5=too hard |
| current_weight_kg | DECIMAL(5,1) NULLABLE | |
| notes | TEXT NULLABLE | |
| submitted_at | DATETIME | |
| plan_version_before | INT | version before adaptation |
| plan_version_after | INT | version after adaptation |

### Table: `event_logs`

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK AUTO_INCREMENT | |
| user_id | BIGINT FK -> users.id NULLABLE | null for system events |
| event_type | VARCHAR(50) | see event types below |
| event_data | TEXT | JSON payload with event details |
| created_at | DATETIME | |

**Event types:** `USER_REGISTERED`, `EMAIL_VERIFIED`, `ONBOARDING_COMPLETED`, `PLAN_GENERATED`, `WORKOUT_COMPLETED`, `CHECKIN_SUBMITTED`, `PLAN_ADAPTED`, `EXERCISE_SUBSTITUTED`, `NUTRITION_LOGGED`

---

## API Endpoints

### Auth (`/api/auth`)

| Method | Path | Description | Auth Required |
|---|---|---|---|
| POST | `/register` | Register new user (email, password) | No |
| GET | `/verify?token={token}` | Verify email address | No |
| POST | `/login` | Login, returns JWT | No |
| POST | `/logout` | Invalidate session | Yes |
| POST | `/forgot-password` | Send password reset email | No |
| POST | `/reset-password` | Reset password with token | No |

### Onboarding (`/api/onboarding`)

| Method | Path | Description | Auth Required |
|---|---|---|---|
| POST | `/submit` | Submit onboarding questionnaire, triggers plan generation | Yes |
| GET | `/status` | Check if user has completed onboarding | Yes |

### Workout Plans (`/api/plans`)

| Method | Path | Description | Auth Required |
|---|---|---|---|
| GET | `/current` | Get user's active workout plan with all days/exercises | Yes |
| GET | `/history` | Get all plan versions with change summaries | Yes |
| GET | `/{planId}` | Get a specific plan version | Yes |

### Workouts (`/api/workouts`)

| Method | Path | Description | Auth Required |
|---|---|---|---|
| GET | `/week` | Get this week's workout schedule with completion status | Yes |
| GET | `/day/{dayId}` | Get exercises for a specific workout day | Yes |
| POST | `/complete` | Mark a workout day as complete, with optional exercise logs | Yes |
| PUT | `/substitute` | Substitute an exercise in the plan | Yes |

### Nutrition (`/api/nutrition`)

| Method | Path | Description | Auth Required |
|---|---|---|---|
| GET | `/targets` | Get current daily calorie + macro targets and tips | Yes |
| POST | `/log` | Log daily nutrition intake | Yes |
| GET | `/log/history` | Get nutrition log history | Yes |

### Check-In (`/api/checkin`)

| Method | Path | Description | Auth Required |
|---|---|---|---|
| POST | `/submit` | Submit weekly check-in, triggers adaptive logic | Yes |
| GET | `/history` | Get all past check-ins | Yes |
| GET | `/due` | Check if a check-in is due this week | Yes |

### Progress (`/api/progress`)

| Method | Path | Description | Auth Required |
|---|---|---|---|
| GET | `/dashboard` | Get adherence %, workouts completed, weight trend, plan version count | Yes |
| GET | `/export` | Export anonymised user data as JSON (for dissertation evaluation) | Yes |

### Admin/Evaluation (`/api/admin`)

| Method | Path | Description | Auth Required |
|---|---|---|---|
| GET | `/events` | Get event log entries (filterable by type, date range) | Admin |
| GET | `/export/all` | Export anonymised data for all users as CSV/JSON | Admin |

---

## Adaptive Logic (Core Algorithm)

This is the key differentiator of the application. The adaptation runs when a user submits a weekly check-in.

### Inputs

- `sessions_completed` (int): how many sessions user actually did
- `difficulty_rating` (1-5): user's perceived difficulty
- `current_weight_kg` (optional): for progress tracking
- `days_per_week` in current plan
- `intensity_level` of current plan
- `fitness_goal` from profile
- `goal_duration_weeks` from profile
- `weeks_elapsed` since plan start

### Adaptation Rules

```
RULE 1 — ADHERENCE DROP
IF sessions_completed < (days_per_week * 0.6):
    REDUCE days_per_week by 1 (minimum 2)
    REDUCE intensity by 1 level
    EXTEND session duration slightly to compensate volume
    change_summary += "You completed fewer sessions than planned.
    We've reduced your weekly sessions to make the plan more
    manageable while keeping you on track."

RULE 2 — TOO HARD
IF difficulty_rating >= 4:
    REDUCE intensity by 1 level
    REDUCE sets or reps slightly
    change_summary += "You rated last week as quite difficult.
    We've eased the intensity to help you stay consistent."

RULE 3 — TOO EASY
IF difficulty_rating <= 2 AND sessions_completed >= days_per_week:
    INCREASE intensity by 1 level
    INCREASE sets or reps slightly
    change_summary += "Great work! You found last week manageable
    and completed all sessions. We've increased the challenge."

RULE 4 — PERFECT ADHERENCE
IF sessions_completed >= days_per_week AND difficulty_rating == 3:
    NO CHANGE to plan structure
    change_summary += "You're right on track. Keep it up!
    No changes needed this week."

RULE 5 — GOAL TIMELINE ADJUSTMENT
IF weeks_remaining < (goal_duration_weeks * 0.3) AND progress_behind_target:
    INCREASE intensity by 1 level
    ADJUST calorie targets more aggressively
    change_summary += "You're in the final stretch of your goal
    timeline. We've adjusted your plan to help you finish strong."

RULE 6 — NUTRITION ADJUSTMENT
IF weight_trend shows no change over 2+ weeks AND goal is FAT_LOSS:
    REDUCE daily_calories by 100-200
    change_summary += "Your weight has plateaued. We've slightly
    reduced your calorie target to restart progress."

IF weight_trend shows no change over 2+ weeks AND goal is MUSCLE_GAIN:
    INCREASE daily_calories by 100-200
    change_summary += "Your weight has stalled. We've slightly
    increased your calorie target to support muscle growth."
```

### Output

- New `workout_plan` (version N+1) with status ACTIVE (previous version set to ARCHIVED)
- Updated `nutrition_plan` (version N+1)
- `change_summary` stored on the new plan and displayed to the user

---

## Frontend Pages & Components

### Page Map

```
/                          -> Landing page (public)
/register                  -> Registration form
/verify-email              -> Email verification status page
/login                     -> Login form
/forgot-password           -> Password reset request
/reset-password?token=x    -> Password reset form
/onboarding                -> Multi-step onboarding questionnaire
/dashboard                 -> Main dashboard (post-onboarding home)
/workouts                  -> Weekly workout plan view
/workouts/:dayId           -> Individual workout day detail + logging
/nutrition                 -> Nutrition targets + daily logging
/checkin                   -> Weekly check-in form
/progress                  -> Progress tracking & plan history
/settings                  -> User profile & account settings
```

### Key UI Components

| Component | Description |
|---|---|
| `Navbar` | Top navigation with logo, links, user menu. Shows different items based on auth state. |
| `ProtectedRoute` | Wrapper that redirects to /login if not authenticated, to /onboarding if not onboarded. |
| `OnboardingWizard` | Multi-step form: Goal -> Experience -> Schedule -> Equipment -> Diet -> Body stats. Progress bar at top. |
| `WeeklyPlanView` | Card grid showing each workout day. Green check on completed days. Click to expand. |
| `WorkoutDayCard` | Lists exercises with sets/reps. "Mark Complete" button. Optional weight/rep logging per exercise. |
| `ExerciseRow` | Single exercise display with substitute button. |
| `NutritionDashboard` | Shows calorie/macro targets as progress rings. Simple log form below. |
| `CheckInForm` | Form: sessions completed (number input), difficulty (1-5 slider), weight (optional), notes. |
| `AdaptationAlert` | Banner/modal that appears after check-in showing what changed and why. Prominent display. |
| `ProgressCharts` | Line chart for weight over time. Bar chart for weekly adherence. Plan version timeline. |
| `PlanHistoryTimeline` | Vertical timeline showing each plan version with change_summary text. |

---

## Project File Structure

### Backend (Spring Boot)

```
adaptivefit-api/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/com/adaptivefit/
│   │   │   ├── AdaptiveFitApplication.java
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── JwtConfig.java
│   │   │   │   ├── CorsConfig.java
│   │   │   │   └── WebConfig.java
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── OnboardingController.java
│   │   │   │   ├── WorkoutPlanController.java
│   │   │   │   ├── WorkoutController.java
│   │   │   │   ├── NutritionController.java
│   │   │   │   ├── CheckInController.java
│   │   │   │   ├── ProgressController.java
│   │   │   │   └── AdminController.java
│   │   │   ├── dto/
│   │   │   │   ├── request/
│   │   │   │   │   ├── RegisterRequest.java
│   │   │   │   │   ├── LoginRequest.java
│   │   │   │   │   ├── OnboardingRequest.java
│   │   │   │   │   ├── WorkoutLogRequest.java
│   │   │   │   │   ├── NutritionLogRequest.java
│   │   │   │   │   ├── CheckInRequest.java
│   │   │   │   │   └── SubstituteExerciseRequest.java
│   │   │   │   └── response/
│   │   │   │       ├── AuthResponse.java
│   │   │   │       ├── WorkoutPlanResponse.java
│   │   │   │       ├── NutritionPlanResponse.java
│   │   │   │       ├── DashboardResponse.java
│   │   │   │       ├── ProgressResponse.java
│   │   │   │       └── AdaptationResponse.java
│   │   │   ├── model/
│   │   │   │   ├── User.java
│   │   │   │   ├── UserProfile.java
│   │   │   │   ├── WorkoutPlan.java
│   │   │   │   ├── WorkoutDay.java
│   │   │   │   ├── WorkoutExercise.java
│   │   │   │   ├── ExerciseLibrary.java
│   │   │   │   ├── WorkoutLog.java
│   │   │   │   ├── ExerciseLog.java
│   │   │   │   ├── NutritionPlan.java
│   │   │   │   ├── NutritionLog.java
│   │   │   │   ├── WeeklyCheckIn.java
│   │   │   │   ├── EventLog.java
│   │   │   │   └── enums/
│   │   │   │       ├── FitnessGoal.java
│   │   │   │       ├── ExperienceLevel.java
│   │   │   │       ├── EquipmentAccess.java
│   │   │   │       ├── DietaryPreference.java
│   │   │   │       ├── IntensityLevel.java
│   │   │   │       └── PlanStatus.java
│   │   │   ├── repository/
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── UserProfileRepository.java
│   │   │   │   ├── WorkoutPlanRepository.java
│   │   │   │   ├── WorkoutDayRepository.java
│   │   │   │   ├── WorkoutExerciseRepository.java
│   │   │   │   ├── ExerciseLibraryRepository.java
│   │   │   │   ├── WorkoutLogRepository.java
│   │   │   │   ├── ExerciseLogRepository.java
│   │   │   │   ├── NutritionPlanRepository.java
│   │   │   │   ├── NutritionLogRepository.java
│   │   │   │   ├── WeeklyCheckInRepository.java
│   │   │   │   └── EventLogRepository.java
│   │   │   ├── service/
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── EmailService.java
│   │   │   │   ├── JwtService.java
│   │   │   │   ├── UserService.java
│   │   │   │   ├── OnboardingService.java
│   │   │   │   ├── PlanGeneratorService.java
│   │   │   │   ├── AdaptiveEngineService.java
│   │   │   │   ├── WorkoutService.java
│   │   │   │   ├── NutritionService.java
│   │   │   │   ├── ProgressService.java
│   │   │   │   ├── EventLogService.java
│   │   │   │   └── DataExportService.java
│   │   │   ├── security/
│   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   ├── JwtTokenProvider.java
│   │   │   │   └── CustomUserDetailsService.java
│   │   │   └── exception/
│   │   │       ├── GlobalExceptionHandler.java
│   │   │       ├── ResourceNotFoundException.java
│   │   │       └── BadRequestException.java
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── data.sql                  (seed exercise library)
│   │       └── schema.sql                (optional, JPA can auto-create)
│   └── test/
│       └── java/com/adaptivefit/
│           ├── service/
│           │   ├── AdaptiveEngineServiceTest.java
│           │   ├── PlanGeneratorServiceTest.java
│           │   └── AuthServiceTest.java
│           └── controller/
│               ├── AuthControllerTest.java
│               └── CheckInControllerTest.java
```

### Frontend (React)

```
adaptivefit-client/
├── package.json
├── vite.config.js
├── index.html
├── public/
│   └── favicon.ico
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── api/
│   │   ├── axiosConfig.js              (base URL, JWT interceptor)
│   │   ├── authApi.js
│   │   ├── onboardingApi.js
│   │   ├── workoutApi.js
│   │   ├── nutritionApi.js
│   │   ├── checkinApi.js
│   │   └── progressApi.js
│   ├── context/
│   │   └── AuthContext.jsx             (JWT storage, login/logout state)
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useFetch.js
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── onboarding/
│   │   │   ├── OnboardingWizard.jsx
│   │   │   ├── GoalStep.jsx
│   │   │   ├── ExperienceStep.jsx
│   │   │   ├── ScheduleStep.jsx
│   │   │   ├── EquipmentStep.jsx
│   │   │   ├── DietStep.jsx
│   │   │   └── BodyStatsStep.jsx
│   │   ├── workouts/
│   │   │   ├── WeeklyPlanView.jsx
│   │   │   ├── WorkoutDayCard.jsx
│   │   │   ├── ExerciseRow.jsx
│   │   │   └── ExerciseLogForm.jsx
│   │   ├── nutrition/
│   │   │   ├── NutritionDashboard.jsx
│   │   │   ├── MacroRing.jsx
│   │   │   └── NutritionLogForm.jsx
│   │   ├── checkin/
│   │   │   ├── CheckInForm.jsx
│   │   │   └── AdaptationAlert.jsx
│   │   ├── progress/
│   │   │   ├── ProgressCharts.jsx
│   │   │   ├── AdherenceChart.jsx
│   │   │   ├── WeightChart.jsx
│   │   │   └── PlanHistoryTimeline.jsx
│   │   └── common/
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       ├── Input.jsx
│   │       ├── Modal.jsx
│   │       ├── Loader.jsx
│   │       └── Alert.jsx
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── VerifyEmailPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   ├── ResetPasswordPage.jsx
│   │   ├── OnboardingPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── WorkoutsPage.jsx
│   │   ├── WorkoutDayPage.jsx
│   │   ├── NutritionPage.jsx
│   │   ├── CheckInPage.jsx
│   │   ├── ProgressPage.jsx
│   │   └── SettingsPage.jsx
│   └── styles/
│       └── index.css                   (Tailwind or global CSS)
```

---

## Implementation Phases (Build Order)

Each phase must be fully functional and testable before moving to the next.

### PHASE 1: Project Scaffolding & Auth

**Backend tasks:**
1. Initialise Spring Boot project with dependencies: Spring Web, Spring Security, Spring Data JPA, MySQL Driver, Lombok, JavaMailSender, jjwt
2. Configure `application.properties` (DB connection, JWT secret, mail server)
3. Create `User` entity and `UserRepository`
4. Implement `SecurityConfig` with JWT filter chain
5. Implement `JwtTokenProvider` (generate, validate, extract claims)
6. Implement `JwtAuthenticationFilter`
7. Implement `AuthService` (register, verify email, login, forgot/reset password)
8. Implement `EmailService` (send verification + reset emails)
9. Implement `AuthController` with all auth endpoints
10. Implement `GlobalExceptionHandler`

**Frontend tasks:**
1. Initialise React project with Vite
2. Install dependencies: react-router-dom, axios, (optional: tailwindcss)
3. Set up `axiosConfig.js` with base URL and JWT interceptor
4. Create `AuthContext` for managing auth state and JWT in localStorage
5. Build `RegisterPage`, `LoginPage`, `VerifyEmailPage`, `ForgotPasswordPage`, `ResetPasswordPage`
6. Implement `ProtectedRoute` component
7. Build `Navbar` with conditional rendering based on auth state

**Acceptance criteria:** User can register, receive verification email, verify, login, and see a protected dashboard shell. Password reset flow works.

---

### PHASE 2: Onboarding & Plan Generation

**Backend tasks:**
1. Create `UserProfile` entity and repository
2. Create all enum types (`FitnessGoal`, `ExperienceLevel`, etc.)
3. Create `WorkoutPlan`, `WorkoutDay`, `WorkoutExercise` entities and repositories
4. Create `ExerciseLibrary` entity, repository, and seed data (`data.sql` with 50-80 exercises covering all muscle groups and equipment types)
5. Create `NutritionPlan` entity and repository
6. Implement `OnboardingService` (save profile, trigger plan generation)
7. Implement `PlanGeneratorService`:
   - Select exercises based on goal, experience, equipment, days_per_week
   - Structure into push/pull/legs or upper/lower or full-body splits based on days_per_week
   - Calculate sets/reps based on goal and experience
   - Calculate calorie targets using Mifflin-St Jeor equation + activity multiplier + goal adjustment
   - Calculate macro split (protein/carbs/fats) based on goal
   - Generate dietary tips based on goal and dietary preference
8. Implement `OnboardingController`
9. Implement `WorkoutPlanController` (GET current, GET history)

**Frontend tasks:**
1. Build `OnboardingWizard` with step components (`GoalStep`, `ExperienceStep`, `ScheduleStep`, `EquipmentStep`, `DietStep`, `BodyStatsStep`)
2. Build `OnboardingPage` that redirects to dashboard on completion
3. Update `ProtectedRoute` to check onboarding status
4. Build basic `DashboardPage` showing current plan summary

**Acceptance criteria:** User completes onboarding, receives a personalised workout plan and nutrition targets. Plan is viewable. Calorie/macro targets are calculated correctly.

---

### PHASE 3: Workout Management & Logging

**Backend tasks:**
1. Create `WorkoutLog` and `ExerciseLog` entities and repositories
2. Implement `WorkoutService` (get weekly schedule, get day detail, mark complete, log exercises, substitute exercise)
3. Implement `WorkoutController` with all workout endpoints
4. Implement `EventLogService` and `EventLog` entity (start logging events)

**Frontend tasks:**
1. Build `WorkoutsPage` with `WeeklyPlanView`
2. Build `WorkoutDayPage` with `WorkoutDayCard` and `ExerciseRow` components
3. Implement workout completion flow (mark complete button with optional exercise logging)
4. Implement exercise substitution UI
5. Add completion status indicators (checkmarks on completed days)

**Acceptance criteria:** User can view their weekly plan, see individual workouts, mark them complete (with optional weight/rep logging), and substitute exercises.

---

### PHASE 4: Nutrition

**Backend tasks:**
1. Create `NutritionLog` entity and repository
2. Implement `NutritionService` (get targets, log intake, get history)
3. Implement `NutritionController`

**Frontend tasks:**
1. Build `NutritionPage` with `NutritionDashboard`
2. Build `MacroRing` components for visual calorie/macro display
3. Build `NutritionLogForm` for daily intake logging
4. Show dietary tips from the nutrition plan

**Acceptance criteria:** User can see their daily calorie/macro targets, log daily intake, and view dietary tips.

---

### PHASE 5: Weekly Check-In & Adaptive Engine

**Backend tasks:**
1. Create `WeeklyCheckIn` entity and repository
2. Implement `AdaptiveEngineService` with all adaptation rules (see Adaptive Logic section above)
3. The service must:
   - Accept check-in data
   - Evaluate all rules against current plan and check-in data
   - Generate a new plan version if changes are needed
   - Generate a new nutrition plan if changes are needed
   - Write a human-readable `change_summary`
   - Archive the old plan, activate the new one
   - Log `CHECKIN_SUBMITTED` and `PLAN_ADAPTED` events
4. Implement `CheckInController`

**Frontend tasks:**
1. Build `CheckInPage` with `CheckInForm` (sessions completed, difficulty slider 1-5, optional weight, notes)
2. Build `AdaptationAlert` component that displays after check-in submission showing what changed and why
3. Add check-in due indicator to dashboard/navbar
4. Add check-in history view

**Acceptance criteria:** User submits weekly check-in. System adapts the plan based on the rules. User sees a clear explanation of what changed and why. New plan version is active. Old version is archived.

---

### PHASE 6: Progress & Dashboard

**Backend tasks:**
1. Implement `ProgressService` (calculate adherence %, aggregate workout stats, weight trend, plan version count)
2. Implement `ProgressController`
3. Enhance `DashboardController` to return summary data

**Frontend tasks:**
1. Build full `DashboardPage` with summary cards (workouts this week, adherence, current plan version, next check-in date)
2. Build `ProgressPage` with `ProgressCharts`
3. Build `WeightChart` (line chart over time)
4. Build `AdherenceChart` (bar chart per week)
5. Build `PlanHistoryTimeline` (vertical timeline of plan versions with change summaries)

**Acceptance criteria:** Dashboard shows actionable summary. Progress page shows visual charts and plan history timeline.

---

### PHASE 7: Data Export & Evaluation Support

**Backend tasks:**
1. Implement `DataExportService` (anonymised JSON and CSV export of user journey data)
2. Implement `AdminController` for event log access and bulk export
3. Ensure all key events are logged throughout the application

**Frontend tasks:**
1. Build `SettingsPage` with profile editing and account management
2. Add export button for individual user data (if needed)

**Acceptance criteria:** Anonymised data can be exported. Event logs capture the full user journey. System is stable for demonstration.

---

### PHASE 8: Polish & Testing

**Backend tasks:**
1. Write unit tests for `AdaptiveEngineService` (all adaptation rules)
2. Write unit tests for `PlanGeneratorService`
3. Write integration tests for auth flow
4. Write integration tests for check-in -> adaptation flow
5. API documentation (Swagger/OpenAPI via springdoc-openapi)

**Frontend tasks:**
1. Responsive design pass (desktop-first, but usable on tablet)
2. Error handling on all API calls (toast notifications for errors)
3. Loading states on all data-fetching pages
4. Empty states (no workouts logged yet, no check-ins yet)
5. Form validation on all forms
6. Accessibility pass (semantic HTML, ARIA labels, keyboard navigation)

**Acceptance criteria:** All tests pass. No broken flows. Professional, polished UI. API is documented.

---

## Exercise Library Seed Data Structure

The `data.sql` should seed the `exercise_library` table. Minimum coverage:

| Muscle Group | Example Exercises |
|---|---|
| Chest | Bench Press, Incline Dumbbell Press, Cable Fly, Push-Up |
| Back | Barbell Row, Lat Pulldown, Seated Cable Row, Pull-Up |
| Shoulders | Overhead Press, Lateral Raise, Face Pull, Arnold Press |
| Quadriceps | Barbell Squat, Leg Press, Lunges, Leg Extension |
| Hamstrings | Romanian Deadlift, Leg Curl, Good Morning |
| Glutes | Hip Thrust, Bulgarian Split Squat, Glute Bridge |
| Biceps | Barbell Curl, Dumbbell Curl, Hammer Curl |
| Triceps | Tricep Pushdown, Overhead Extension, Close-Grip Bench |
| Core | Plank, Cable Crunch, Hanging Leg Raise, Russian Twist |
| Full Body | Deadlift, Clean and Press, Burpee |

Each exercise must have: `name`, `muscle_group`, `equipment_required`, `difficulty`, `description`.

---

## Calorie & Macro Calculation Reference

### Basal Metabolic Rate (Mifflin-St Jeor)

```
Male:   BMR = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
Female: BMR = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161
```

If gender not collected, use average: `BMR = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 78`

### Total Daily Energy Expenditure (TDEE)

```
Activity multiplier based on days_per_week:
1-2 days: 1.375 (lightly active)
3-4 days: 1.55  (moderately active)
5-6 days: 1.725 (very active)
7 days:   1.9   (extremely active)

TDEE = BMR * activity_multiplier
```

### Goal Adjustment

```
FAT_LOSS:        daily_calories = TDEE - 500
MUSCLE_GAIN:     daily_calories = TDEE + 300
GENERAL_FITNESS: daily_calories = TDEE
```

### Macro Split

```
FAT_LOSS:
  protein = weight_kg * 2.2 (g)
  fats    = daily_calories * 0.25 / 9 (g)
  carbs   = (daily_calories - (protein * 4) - (fats * 9)) / 4 (g)

MUSCLE_GAIN:
  protein = weight_kg * 2.0 (g)
  fats    = daily_calories * 0.25 / 9 (g)
  carbs   = (daily_calories - (protein * 4) - (fats * 9)) / 4 (g)

GENERAL_FITNESS:
  protein = weight_kg * 1.6 (g)
  fats    = daily_calories * 0.30 / 9 (g)
  carbs   = (daily_calories - (protein * 4) - (fats * 9)) / 4 (g)
```

### Fallback

If user does not provide height/weight/age, use static defaults:
- FAT_LOSS: 1800 cal, 150g protein, 180g carbs, 50g fat
- MUSCLE_GAIN: 2800 cal, 180g protein, 320g carbs, 75g fat
- GENERAL_FITNESS: 2200 cal, 130g protein, 250g carbs, 65g fat

---

## Workout Split Logic

```
IF days_per_week <= 2:
  Full Body (A/B split)

IF days_per_week == 3:
  Push / Pull / Legs

IF days_per_week == 4:
  Upper / Lower / Upper / Lower

IF days_per_week == 5:
  Push / Pull / Legs / Upper / Lower

IF days_per_week >= 6:
  Push / Pull / Legs / Push / Pull / Legs
```

Exercises per session:
- BEGINNER: 4-5 exercises, 3 sets each
- INTERMEDIATE: 5-6 exercises, 3-4 sets each
- ADVANCED: 6-7 exercises, 4 sets each

---

## Key Dependencies

### Backend (Maven pom.xml)

```xml
spring-boot-starter-web
spring-boot-starter-data-jpa
spring-boot-starter-security
spring-boot-starter-mail
spring-boot-starter-validation
mysql-connector-j
io.jsonwebtoken:jjwt-api (0.12.x)
io.jsonwebtoken:jjwt-impl
io.jsonwebtoken:jjwt-jackson
lombok
springdoc-openapi-starter-webmvc-ui
spring-boot-starter-test
```

### Frontend (package.json)

```json
react
react-dom
react-router-dom
axios
recharts (for progress charts)
```

Optional but recommended:
```json
tailwindcss (styling)
react-hot-toast (notifications)
lucide-react (icons)
```

---

## Environment Configuration

### Backend `application.properties`

```properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/adaptivefit
spring.datasource.username=root
spring.datasource.password=${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

jwt.secret=${JWT_SECRET}
jwt.expiration=86400000

spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

app.frontend.url=http://localhost:3000
```

### Frontend `.env`

```
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## Summary Checklist

| # | Deliverable | Phase |
|---|---|---|
| 1 | User registration with email verification | 1 |
| 2 | Secure login/logout with JWT | 1 |
| 3 | Password reset flow | 1 |
| 4 | Onboarding questionnaire (6 steps) | 2 |
| 5 | Automatic workout plan generation | 2 |
| 6 | Automatic nutrition target calculation | 2 |
| 7 | Exercise library (seeded) | 2 |
| 8 | Weekly workout plan view | 3 |
| 9 | Workout completion logging | 3 |
| 10 | Optional exercise rep/weight logging | 3 |
| 11 | Exercise substitution | 3 |
| 12 | Nutrition target display with macro rings | 4 |
| 13 | Daily nutrition intake logging | 4 |
| 14 | Dietary tips display | 4 |
| 15 | Weekly check-in form | 5 |
| 16 | Adaptive engine (6 rules) | 5 |
| 17 | Plan versioning with change explanations | 5 |
| 18 | Dashboard with summary stats | 6 |
| 19 | Progress charts (weight, adherence) | 6 |
| 20 | Plan history timeline | 6 |
| 21 | Event logging throughout system | 7 |
| 22 | Anonymised data export (JSON/CSV) | 7 |
| 23 | Unit + integration tests | 8 |
| 24 | API documentation (Swagger) | 8 |
| 25 | Responsive, accessible, polished UI | 8 |
