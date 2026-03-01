# AdaptiveFit

A personalised fitness and nutrition web application that generates workout/nutrition plans and dynamically adjusts them based on user behaviour, adherence, and weekly check-ins.

Built as a dissertation project.

## Tech Stack

- **Frontend:** React 19, Vite, Material UI, Recharts
- **Backend:** Java 17, Spring Boot 3.2, Spring Security, JPA/Hibernate
- **Database:** MySQL 8 (via Docker)
- **Auth:** JWT (jjwt 0.12)

## Prerequisites

- **Docker** — for MySQL ([install](https://docs.docker.com/get-docker/))
- **Java 17+** — for the backend ([install](https://adoptium.net/))
- **Maven 3.8+** — for building the backend ([install](https://maven.apache.org/install.html))
- **Node.js 18+** and **npm** — for the frontend ([install](https://nodejs.org/))

## Getting Started

### 1. Clone the repo

```bash
git clone <repo-url>
cd AdaptiveFit
```

### 2. Configure environment variables

Copy the example `.env` and edit as needed:

```bash
cp .env.example .env
```

Or create a `.env` file in the project root:

```
DB_PASSWORD=changeme
JWT_SECRET=adaptivefit-super-secret-jwt-key-change-in-production-2026
MAIL_USERNAME=changeme@gmail.com
MAIL_PASSWORD=changeme
```

> The `JWT_SECRET` must be at least 32 characters. run:

```
openssl rand -base64 64
```

and just paste the output as the JWT token in .env

### 3. Start MySQL

```bash
docker compose up -d
```

Verify it's running:

```bash
docker ps
```

You should see `adaptivefit-mysql` with status `Up`.

### 4. Start the backend

```bash
cd adaptivefit-api
source ../.env && export DB_PASSWORD JWT_SECRET MAIL_USERNAME MAIL_PASSWORD
mvn spring-boot:run
```

Wait until you see:

```
Started AdaptiveFitApplication in X seconds
```

The API is now running at **http://localhost:8080**.

### 5. Start the frontend

Open a **new terminal**:

```bash
cd adaptivefit-client
npm install   # only needed the first time
npm run dev
```

The app is now running at **http://localhost:3000**.

## URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080/api |
| Swagger Docs | http://localhost:8080/swagger-ui/index.html |

## Testing the App

1. Open http://localhost:3000 and click **Register**
2. Enter an email and password (min 8 characters)
3. Check the **backend terminal** for the verification token (email is logged to console, not sent via SMTP)
4. Go to http://localhost:3000/verify-email?token=YOUR_TOKEN or use the verify email page
5. Log in with your credentials
6. Complete the onboarding questionnaire (6 steps)
7. You'll receive a personalised workout plan and nutrition targets
8. Log workouts, track nutrition, and submit weekly check-ins to see your plan adapt

## Project Structure

```
AdaptiveFit/
├── adaptivefit-api/          # Spring Boot backend
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/adaptivefit/
│       │   │   ├── config/         # Security, CORS, JWT config
│       │   │   ├── controller/     # REST controllers
│       │   │   ├── dto/            # Request/response DTOs
│       │   │   ├── exception/      # Global error handling
│       │   │   ├── model/          # JPA entities and enums
│       │   │   ├── repository/     # Spring Data repositories
│       │   │   ├── security/       # JWT filter, token provider
│       │   │   └── service/        # Business logic
│       │   └── resources/
│       │       ├── application.properties
│       │       └── data.sql        # Exercise library seed data
│       └── test/
├── adaptivefit-client/       # React frontend
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── api/              # Axios config and API modules
│       ├── components/       # Reusable UI components
│       ├── context/          # Auth context (JWT state)
│       ├── hooks/            # Custom React hooks
│       ├── pages/            # Page components
│       └── styles/           # MUI theme
├── docker-compose.yml        # MySQL container
├── .env                      # Environment variables (not committed)
└── README.md
```

## API Overview

| Group | Base Path | Description |
|---|---|---|
| Auth | `/api/auth` | Register, login, verify email, password reset |
| Onboarding | `/api/onboarding` | Submit profile questionnaire |
| Plans | `/api/plans` | View current/historical workout plans |
| Workouts | `/api/workouts` | Weekly schedule, log completions, substitute exercises |
| Nutrition | `/api/nutrition` | Calorie/macro targets, log daily intake |
| Check-In | `/api/checkin` | Weekly check-in, triggers plan adaptation |
| Progress | `/api/progress` | Dashboard stats, data export |
| Admin | `/api/admin` | Event logs, bulk data export |

Full interactive docs available at http://localhost:8080/swagger-ui/index.html when the backend is running.

## How the App Works

### User Flow

1. **Register** — Create an account with email and password
2. **Verify Email** — Token is printed to the backend console (no real SMTP in dev)
3. **Login** — Receive a JWT token, stored in the browser
4. **Onboarding (6 steps)** — Select fitness goal, experience level, training schedule, equipment access, dietary preference, and optionally enter body stats
5. **Receive Plan** — The system generates a personalised workout plan and nutrition targets
6. **Train** — View weekly workouts, mark days complete, optionally log sets/reps/weight per exercise
7. **Track Nutrition** — See daily calorie and macro targets, log intake
8. **Weekly Check-In** — Report sessions completed, difficulty (1-5), and current weight
9. **Plan Adapts** — The system adjusts the plan based on check-in data and explains what changed

### Plan Generation

When a user completes onboarding, the system generates a workout plan and nutrition targets based on their profile.

#### Workout Split (based on days per week)

| Days per Week | Split |
|---|---|
| 1 | Full Body A |
| 2 | Full Body A / Full Body B |
| 3 | Push / Pull / Legs |
| 4 | Upper / Lower / Upper / Lower |
| 5 | Push / Pull / Legs / Upper / Lower |
| 6-7 | Push / Pull / Legs x 2 |

#### Exercises per Session (based on experience level)

| Experience Level | Exercises per Day | Sets per Exercise |
|---|---|---|
| Beginner | 5 | 3 |
| Intermediate | 6 | 4 |
| Advanced | 7 | 4 |

#### Reps and Rest (based on fitness goal)

| Fitness Goal | Reps | Rest Between Sets |
|---|---|---|
| Fat Loss | 12-15 | 45 seconds |
| Muscle Gain | 6-10 | 90 seconds |
| General Fitness | 8-12 | 60 seconds |

#### Exercise Selection

Exercises are selected from a seeded library of 50-80 exercises, filtered by:
- **Equipment access** — Bodyweight Only gets exercises requiring no equipment; Home Basic adds dumbbells; Full Gym gets everything
- **Experience level** — Beginners only get beginner exercises; Intermediate gets beginner + intermediate; Advanced gets all difficulty levels
- **Muscle group** — Matched to the day's focus area (e.g. Push day selects from Chest, Shoulders, Triceps)

### Nutrition Calculation

#### Calorie Targets

Calculated using the Mifflin-St Jeor equation (gender-neutral average):

```
BMR = (10 x weight_kg) + (6.25 x height_cm) - (5 x age) - 78
```

Activity multiplier based on training frequency:

| Days per Week | Multiplier |
|---|---|
| 1-2 | 1.375 (lightly active) |
| 3-4 | 1.55 (moderately active) |
| 5-6 | 1.725 (very active) |
| 7 | 1.9 (extremely active) |

```
TDEE = BMR x activity multiplier
```

Goal adjustment:

| Goal | Daily Calories |
|---|---|
| Fat Loss | TDEE - 500 |
| Muscle Gain | TDEE + 300 |
| General Fitness | TDEE (no change) |

#### Macro Split

| Goal | Protein | Fats | Carbs |
|---|---|---|---|
| Fat Loss | weight x 2.2g | 25% of calories | remaining calories |
| Muscle Gain | weight x 2.0g | 25% of calories | remaining calories |
| General Fitness | weight x 1.6g | 30% of calories | remaining calories |

#### Fallback Defaults

If the user does not provide height, weight, or age during onboarding:

| Goal | Calories | Protein | Carbs | Fats |
|---|---|---|---|---|
| Fat Loss | 1800 | 150g | 180g | 50g |
| Muscle Gain | 2800 | 180g | 320g | 75g |
| General Fitness | 2200 | 130g | 250g | 65g |

#### Dietary Tips

Generated based on the user's goal and dietary preference. For example, a user with a Muscle Gain goal and Halal preference would see tips about halal protein sources and post-workout nutrition.

### Adaptive Engine

When a user submits a weekly check-in, the system evaluates 6 rules in order and adjusts the plan accordingly. The old plan is archived and a new versioned plan is created.

#### Intensity Levels

The system uses four intensity levels: **LIGHT** → **MODERATE** → **INTENSE** → **VERY_INTENSE**. New plans start at MODERATE.

#### Adaptation Rules

| # | Rule | Trigger | What Changes |
|---|---|---|---|
| 1 | **Adherence Drop** | Sessions completed < 60% of planned days | Days per week reduced by 1 (minimum 2); intensity drops one level |
| 2 | **Too Hard** | Difficulty rating >= 4 | Intensity drops one level; sets reduced by 1 on every exercise |
| 3 | **Too Easy** | Difficulty rating <= 2 AND all sessions completed | Intensity increases one level; sets increased by 1 on every exercise |
| 4 | **Perfect Adherence** | All sessions completed AND difficulty = 3 | No changes — plan stays the same |
| 5 | **Goal Timeline** | Less than 30% of goal weeks remaining AND overall adherence below 80% | Intensity increases one level |
| 6 | **Nutrition Adjustment** | Weight identical across 3 consecutive check-ins | Fat Loss: daily calories reduced by 150; Muscle Gain: daily calories increased by 150 |

#### Examples

- A user plans 5 days/week but only completes 2 → **Rule 1** fires: days drop to 4, intensity drops from MODERATE to LIGHT
- A user completes all 4 sessions but rates difficulty as 5 (Too Hard) → **Rule 2** fires: intensity drops from MODERATE to LIGHT, all exercises lose 1 set (e.g. 4 sets → 3 sets)
- A user completes all sessions and rates difficulty as 1 (Too Easy) → **Rule 3** fires: intensity rises from MODERATE to INTENSE, all exercises gain 1 set (e.g. 3 sets → 4 sets)
- A user completes all sessions and rates difficulty as 3 (Just Right) → **Rule 4** fires: nothing changes, "keep up the good work" message shown
- A user has 3 weeks left on a 12-week plan with <80% adherence → **Rule 5** fires: intensity increases to push toward the goal
- A user weighing 80kg logs 80kg for 3 consecutive check-ins with a Fat Loss goal → **Rule 6** fires: daily calories drop by 150 to break the plateau

#### Plan Versioning

Every adaptation creates a new plan version (v1 → v2 → v3...). The old plan is archived with status `ARCHIVED`, the new plan becomes `ACTIVE`. Each version stores a `changeSummary` explaining what changed and why in plain English. Users can view their full plan history on the Progress page.

## Running Tests

```bash
cd adaptivefit-api
mvn test
```

## Stopping the App

```bash
# Stop the frontend: Ctrl+C in its terminal

# Stop the backend: Ctrl+C in its terminal

# Stop MySQL
docker compose down

# Stop MySQL and delete data
docker compose down -v
```
