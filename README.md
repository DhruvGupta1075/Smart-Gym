# Smart Gym Analytics Platform (MERN Stack)

A cloud-based full-stack gym management platform developed using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js), engineered with role-based dashboards (Admin, Trainer, Member), contactless daily QR code self check-in, interactive workout and nutrition planners, body transformation tracking, and Chart.js telemetry.

---

## Key Features

### 1. Authentication & Security
- **JWT & HTTP-Only Cookies**: Secure session token delivery and cross-site scripting (XSS) defense.
- **Bcrypt Password Encryption**: Salted cryptographic password storage.
- **Role-Based Access Control (RBAC)**: Strict permission boundaries between `Admin`, `Trainer`, and `Member`.
- **Restricted Access & Email Whitelist**: Only pre-approved emails in the authorization directory can register or authenticate for `Admin` and `Trainer` privileges.

### 2. Admin Operations Hub
- **Executive Dashboard**: Live telemetry for active members, daily attendance volume, monthly recurring revenue, and expiring memberships.
- **Member Management**: Complete CRUD operations, membership renewals, coach assignments, and full profile inspection.
- **Daily QR Kiosk**: Displays dynamically signed daily check-in QR codes on gym wall/counter displays with auto-refresh and manual token fallback.
- **Email Whitelist Registry**: Add or revoke authorized staff credentials.
- **Exportable Reports**: Generate instant PDF and CSV downloads.

### 3. Trainer & Coaching Hub
- **Athlete Client Roster**: Track assigned client streak days, active programs, attendance, and body metric progress.
- **Interactive Workout Program Builder**: Create multi-day split routines (sets, reps, rest intervals, muscle group focus, technique instructions).
- **Nutrition & Macro Planner**: Build custom caloric targets and protein/carbs/fats splits with meal scheduling and dietary guidelines.

### 4. Member Portal & Self Check-In
- **Daily QR Self Check-In**: Camera-based scanner or manual daily code entry with celebratory particle fireworks.
- **Daily Workout Routine**: Interactive day-by-day checklist to tick off completed exercise sets.
- **Diet & Nutrition**: View daily macros, scheduled meal breakdowns, and hydration targets.
- **Body Transformation Tracker**: Log body weight, body fat %, circumference measurements (chest, waist, arms, thighs), and lift 1RMs with Chart.js progress lines.

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Chart.js, React-Chartjs-2, HTML5-QRCode, Canvas-Confetti, jsPDF, Lucide React Icons.
- **Backend**: Node.js, Express.js, Mongoose, JWT, BcryptJS, Cookie-Parser, CORS, QRCode generator, Morgan.
- **Database**: MongoDB Atlas or automatic embedded fallback via `mongodb-memory-server` for instantaneous zero-setup execution.

---

## Quick Start & Installation

### 1. Install Dependencies
```bash
# In the root directory:
npm run install:all
```

### 2. Run Backend API Server
```bash
npm run server
# Server starts on http://localhost:5000 with auto-seeded demo dataset!
```

### 3. Run Frontend Client
```bash
npm run client
# Client dev server starts on http://localhost:5173
```

---

## Default Demo Profiles (1-Click Login Available)

| Role | Name | Email | Password |
|---|---|---|---|
| **Admin** | Marcus Vance | `admin@smartgym.com` | `Admin@12345` |
| **Trainer** | Coach Alex (Strength) | `trainer.alex@smartgym.com` | `Trainer@12345` |
| **Trainer** | Coach Sarah (Nutrition) | `trainer.sarah@smartgym.com` | `Trainer@12345` |
| **Member** | Jordan Miller (Platinum) | `jordan.member@gmail.com` | `Member@12345` |
| **Member** | Elena Rostova (Gold) | `elena.member@gmail.com` | `Member@12345` |

*(You can also use the 1-Click Demo Buttons directly on the login screen!)*
