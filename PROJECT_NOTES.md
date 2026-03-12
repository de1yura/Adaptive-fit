# AdaptiveFit — Project Summary Notes

## What Is It
A personalised fitness and nutrition web app that adapts workout and nutrition plans based on weekly user feedback. Users onboard with their goals, experience, and equipment — the app generates a tailored plan and adjusts it over time using a rule-based adaptive engine.

---

## Tech Stack

### Backend
- **Language:** Java 17
- **Framework:** Spring Boot 3.2.3
- **Security:** Spring Security + JWT (jjwt 0.12.5)
- **ORM:** Spring Data JPA / Hibernate
- **Database:** MySQL 8 (Docker container)
- **API Docs:** OpenAPI / Swagger (springdoc 2.3.0)
- **Other:** Lombok, BCrypt password hashing, JavaMailSender (SMTP)

### Frontend
- **Library:** React 19
- **Build Tool:** Vite 7.3
- **Routing:** React Router DOM 7
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Styling:** Custom CSS (dark theme, CSS variables, responsive)

### Infrastructure
- Docker Compose for MySQL
- Environment variables for secrets (DB password, JWT secret, mail credentials)

---

## Development Methodology

### How It Was Built: PRD-Driven Development with Ralph

The application was not hand-coded line by line. Instead, it followed a **PRD-driven autonomous development** approach:

1. **A detailed Product Requirements Document (PRD) was written first** — this served as the design phase, the prototype, and the specification all in one. The PRD defined 8 implementation phases, 40 user stories with acceptance criteria, 30 functional requirements, non-goals, and technical constraints. It covered everything from database entities to API endpoints to frontend component names.

2. **Ralph, an autonomous coding agent, consumed the PRD and generated the entire codebase** — phase by phase, following the user stories and acceptance criteria. Ralph scaffolded the project, created entities, wrote services, built controllers, wired up the frontend pages, and connected everything together.

3. **The PRD acted as the pre-implementation planning** — there were no separate wireframes or flowcharts. The PRD *was* the architectural diagram, the API contract, and the UI specification. All design decisions (split logic, calorie formulas, adaptation rules, component structure) were defined upfront in the document before any code was generated.

4. **Implementation followed the 8 phases sequentially:**
   - Phase 1: Project scaffolding + authentication (JWT, registration, email verification, password reset)
   - Phase 2: Onboarding wizard + plan generation engine
   - Phase 3: Workout management + exercise logging
   - Phase 4: Nutrition targets + daily intake logging
   - Phase 5: Weekly check-in system + adaptive engine (the core feature)
   - Phase 6: Progress tracking + dashboard
   - Phase 7: Data export + event logging
   - Phase 8: Polish, error handling, testing

5. **After generation, the frontend was replaced** — the original MUI-based frontend was swapped out for a friend's better-designed custom CSS frontend, then adapted to work with the Spring Boot backend (enum mapping, response transformation, link-based auth flows).

### Was There Prototyping?
The PRD itself was the prototype. No separate mockups or throwaway code were produced. The document defined the exact endpoint names, request/response shapes, entity fields, and UI component hierarchy before implementation began.

---

## Testing Approach

### What Testing Was Done
- **Unit tests** were written for core business logic:
  - `AdaptiveEngineServiceTest` — tests all 6 adaptation rules with various inputs (low adherence, high difficulty, easy workouts, perfect adherence, goal timeline pressure, weight plateaus)
  - `PlanGeneratorServiceTest` — tests workout split generation for different profile combinations (goals, experience levels, equipment types) and nutrition calculation
- **Integration tests** were written for critical API flows:
  - `AuthControllerTest` — full auth flow: register → verify → login, plus password reset
  - `CheckInControllerTest` — check-in submission → adaptation triggering → new plan version created
- **All tests use H2 in-memory database** (not the real MySQL) for fast, isolated execution
- **45 tests total, all passing**

### Types of Testing Used
- **Unit Testing:** Individual service methods tested in isolation with mocked dependencies (e.g., testing each adaptation rule independently)
- **Integration Testing:** Full HTTP request/response cycles tested through Spring's `@SpringBootTest` with `TestRestTemplate`, hitting real controller → service → repository → H2 database
- **White-box Testing:** Tests written with full knowledge of internal logic — e.g., testing specific adaptation rule branches, verifying intensity transitions, checking that plan versions increment correctly
- **Regression Testing:** The full test suite (`mvn test`) was run after changes to verify nothing broke
- **Manual/Exploratory Testing:** The app was run locally and tested through the browser — registration flows, onboarding, workout logging, check-ins, and verifying adaptations appeared correctly in the UI

### Testing Strategy
Tests were written **alongside the code** as part of the phased development, not as an afterthought. The PRD specified testing as Phase 8, but the test infrastructure (H2 config, test base classes) was set up early so tests could be added incrementally.

---

## The Adaptive Engine — How It Works

### Is It Machine Learning?
**No.** The adaptive engine is a **deterministic, rule-based system** — not machine learning, not AI. There is no model training, no neural network, no statistical learning. It uses a fixed set of **6 if-then rules** that evaluate user check-in data and make predictable, explainable adjustments. Given the same inputs, it will always produce the same outputs.

Think of it like a thermostat: if the temperature is too high, turn the heating down. If it's too low, turn it up. The engine follows simple conditional logic, not learned patterns.

### The 6 Adaptation Rules

Each week, the user submits a check-in with: sessions completed, difficulty rating (1–5), and current weight. The engine evaluates all 6 rules **sequentially** against this data:

| # | Rule Name | Trigger Condition | What It Does |
|---|-----------|-------------------|--------------|
| 1 | **Adherence Drop** | Sessions completed < 60% of planned days | Reduces training days by 1 (min 2) and lowers intensity one level |
| 2 | **Too Hard** | Difficulty rating ≥ 4 | Lowers intensity one level and reduces sets by 1 on all exercises |
| 3 | **Too Easy** | Difficulty ≤ 2 AND all sessions completed | Raises intensity one level and increases sets by 1 |
| 4 | **Perfect** | All sessions completed AND difficulty = 3 | No changes — plan is working well |
| 5 | **Goal Timeline** | Less than 30% of goal weeks remaining AND average adherence < 80% | Increases intensity to catch up |
| 6 | **Nutrition Plateau** | Weight unchanged for 3 consecutive weigh-ins | Adjusts calories by ±150 (decrease for fat loss, increase for muscle gain) |

### Intensity Level State Machine

Intensity moves along a **4-level linear scale**. It can only move one step at a time:

```
LIGHT → MODERATE → INTENSE → VERY_INTENSE
```

- `reduceIntensity()` moves one step left (LIGHT stays at LIGHT)
- `increaseIntensity()` moves one step right (VERY_INTENSE stays at VERY_INTENSE)

Multiple rules can fire in the same check-in (e.g., Rule 1 reduces intensity, then Rule 5 increases it back), so the final result is the cumulative effect of all triggered rules.

### Plan Versioning (Immutable History)

The engine never modifies an existing plan. Instead:

1. The current ACTIVE plan is set to ARCHIVED status
2. A brand new plan is created at version N+1 with ACTIVE status
3. All workout days and exercises are **deep-copied** from the old plan with adjustments applied (modified sets, reduced days, new intensity)
4. A human-readable `changeSummary` is generated explaining every change (e.g., "Reduced intensity from INTENSE to MODERATE because difficulty was rated too hard; Reduced sets by 1")
5. The check-in record stores both `planVersionBefore` and `planVersionAfter`

This means the user can see their full plan history — every version, what changed, and why.

### Full Logic Flow: What Happens When a User Checks In

```
User submits check-in (sessions, difficulty, weight, notes)
         ↓
POST /api/checkin/submit
         ↓
CheckInController → AdaptiveEngineService.processCheckIn()
         ↓
1. Load user's profile, active workout plan, and nutrition plan
2. Initialise tracking variables (newDaysPerWeek, newIntensity, setsAdjustment)
         ↓
3. Evaluate Rule 1: Is adherence below 60%?
   → Yes: reduce days, reduce intensity
         ↓
4. Evaluate Rule 2: Is difficulty ≥ 4?
   → Yes: reduce intensity, reduce sets by 1
         ↓
5. Evaluate Rule 3: Is difficulty ≤ 2 AND all sessions done?
   → Yes: increase intensity, increase sets by 1
         ↓
6. Evaluate Rule 4: Is it perfect (all sessions, difficulty = 3)?
   → Yes: log "no changes needed"
         ↓
7. Evaluate Rule 5: Near end of goal timeline with low adherence?
   → Yes: increase intensity to catch up
         ↓
8. Evaluate Rule 6: Weight unchanged for 3+ weigh-ins?
   → Yes: adjust calories ±150 based on goal
         ↓
9. If any workout changes occurred:
   → Archive old plan, create new plan (version N+1)
   → Deep-copy all days/exercises with adjustments
         ↓
10. If nutrition changed:
    → Create new nutrition plan (version N+1)
         ↓
11. Save check-in record with version before/after
12. Return AdaptationResponse (summary, new version, what rules fired)
```

### Nutrition Calculation

Initial nutrition targets are calculated during onboarding using the **Mifflin-St Jeor equation** (gender-neutral average):
- BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 78
- TDEE = BMR × activity multiplier (based on days per week)
- Goal adjustment: fat loss = -500 cal, muscle gain = +300 cal, maintenance = 0
- Macro split varies by goal (e.g., muscle gain: 30% protein, 45% carbs, 25% fat)

If body stats aren't provided, it falls back to static defaults (2000 cal baseline).

---

## Key Features
1. **User Registration & Email Verification** — JWT auth, link-based email verification
2. **Onboarding Wizard** — 4-step setup (goal, schedule, equipment, body stats)
3. **Plan Generation** — Auto-generates workout split + nutrition targets based on profile
4. **Workout Logging** — Per-exercise tracking (sets, reps, weight)
5. **Nutrition Logging** — Daily macro intake tracking vs targets
6. **Weekly Check-In** — User reports sessions completed, difficulty, weight
7. **Adaptive Engine** — 6 deterministic rules that auto-adjust plans on check-in
8. **Progress Tracking** — Adherence charts, weight trend, plan version history
9. **Exercise Management** — Custom exercises, day templates, saved splits
10. **Admin Panel** — User management, announcements

---

## Project Structure
```
AdaptiveFit/
├── adaptivefit-api/          (Spring Boot backend)
│   ├── src/main/java/com/adaptivefit/
│   │   ├── controller/       (13 REST controllers)
│   │   ├── service/          (8 business logic services)
│   │   ├── model/            (15 JPA entities + enums)
│   │   ├── repository/       (12 Spring Data repos)
│   │   ├── dto/              (request + response DTOs)
│   │   ├── security/         (JWT filter, token provider)
│   │   ├── config/           (Security, CORS, JWT config)
│   │   └── exception/        (Global error handling)
│   └── src/main/resources/
│       ├── application.properties
│       └── data.sql          (60 seeded exercises)
├── adaptivefit-client/       (React frontend)
│   └── src/
│       ├── pages/            (13 page components)
│       ├── components/       (PlanBuilder)
│       ├── api.js            (Axios config + helpers)
│       ├── App.jsx           (Router + layout)
│       └── index.css         (Full dark theme CSS)
├── docker-compose.yml        (MySQL container)
└── .env                      (Secrets)
```

---

## Testing That Exists
- **AdaptiveEngineServiceTest** — Unit tests for all 6 adaptation rules
- **PlanGeneratorServiceTest** — Unit tests for workout split generation and nutrition calculation
- **AuthControllerTest** — Integration tests for register, login, verify, password reset
- **CheckInControllerTest** — Integration tests for check-in submission and adaptation triggering
- Tests use **H2 in-memory database** (not real MySQL)
- **45 tests total, all passing**
