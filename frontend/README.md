# SafeReach — Smart Student Safety Tracker

A full-stack prototype for real-time student safety monitoring, built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**.

---

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## Demo Login Credentials

Visit `/` (role selector) to choose your role, then log in with the credentials below.

### Admin
| Field    | Value                              |
|----------|------------------------------------|
| URL      | `/login/admin`                     |
| Email    | `admin@demo.safereach.edu`     |
| Password | `Admin@2025`                       |
| OTP Code | `000000`                           |

### Teacher
| Field    | Value                              |
|----------|------------------------------------|
| URL      | `/login/teacher`                   |
| Email    | `teacher@demo.safereach.edu`   |
| Password | `Teacher@2025`                     |

### Parent
| Field    | Value                              |
|----------|------------------------------------|
| URL      | `/login/parent`                    |
| Email    | `parent@demo.safereach.edu`    |
| Password | `Parent@2025`                      |

---

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Framework   | Next.js 15 (App Router)           |
| Language    | TypeScript 5 (strict mode)        |
| Styling     | Tailwind CSS v3 (custom tokens)   |
| Font        | Inter (next/font/google)          |
| Icons       | Material Symbols Outlined (Google Fonts) |
| Runtime     | Node.js                           |

---

## Project Structure

```
stitch_smart_student_safety_tracker/
├── app/
│   ├── layout.tsx                  # Root layout (html, body, Inter font)
│   ├── globals.css                 # Tailwind directives + custom CSS classes
│   ├── page.tsx                    # Role selector landing page
│   │
│   ├── login/
│   │   ├── admin/page.tsx          # Admin login (credentials + OTP)
│   │   ├── teacher/page.tsx        # Teacher login
│   │   └── parent/page.tsx         # Parent login
│   │
│   ├── admin/
│   │   ├── layout.tsx              # Admin layout (TopNav + Sidebar, auto-highlights via pathname)
│   │   ├── dashboard/page.tsx      # System overview, transit map, alerts
│   │   ├── account/page.tsx        # Admin account hub, system activity log
│   │   ├── incidents/page.tsx      # Incident log with filters and severity tracking
│   │   ├── reports/page.tsx        # Safety reports, charts, export
│   │   ├── students/
│   │   │   ├── page.tsx            # Student directory table
│   │   │   ├── add/page.tsx        # 4-step student enrollment wizard
│   │   │   └── profile/page.tsx    # Individual student profile + safety logs
│   │   └── teachers/
│   │       ├── page.tsx            # Staff directory table
│   │       └── profile/page.tsx    # Individual teacher profile + classes
│   │
│   ├── teacher/
│   │   ├── layout.tsx              # Teacher layout (Sidebar + top header, auto-highlights)
│   │   ├── dashboard/page.tsx      # Class snapshot, schedule, messages
│   │   ├── students/page.tsx       # Student records table
│   │   ├── attendance/page.tsx     # Mark attendance (P/A/L per student)
│   │   ├── messages/page.tsx       # Two-panel messaging with parents
│   │   └── reports/page.tsx        # File incidents + past reports
│   │
│   └── parent/
│       ├── layout.tsx              # Parent layout (Sidebar + top header, auto-highlights)
│       ├── dashboard/page.tsx      # Child tracking, billing, notifications
│       ├── students/page.tsx       # My children with live location
│       ├── attendance/page.tsx     # Calendar view + absence history
│       ├── messages/page.tsx       # Messaging with teachers/school
│       └── reports/page.tsx        # Progress reports + subject scores
│
├── components/
│   ├── AdminSidebar.tsx            # Admin sidebar (auto active-item via layout)
│   ├── AdminTopNav.tsx             # Admin top navigation bar
│   ├── TeacherSidebar.tsx          # Teacher sidebar
│   └── ParentSidebar.tsx           # Parent sidebar
│
├── tailwind.config.ts              # Custom design tokens (colors, spacing, typography)
├── postcss.config.mjs              # PostCSS config for Tailwind
├── next.config.ts                  # Next.js config
├── tsconfig.json                   # TypeScript config
└── package.json                    # Dependencies and scripts
```

---

## All Routes

### Public / Auth
| Route            | Description                          |
|------------------|--------------------------------------|
| `/`              | Role selection (Admin / Teacher / Parent) |
| `/login/admin`   | Admin login with 2FA OTP             |
| `/login/teacher` | Teacher login                        |
| `/login/parent`  | Parent login                         |

### Admin Portal
| Route                       | Description                          |
|-----------------------------|--------------------------------------|
| `/admin/dashboard`          | Live transit map, attendance stats, safety alerts |
| `/admin/students`           | Student directory with search        |
| `/admin/students/add`       | 4-step enrollment wizard             |
| `/admin/students/profile`   | Student profile + safety logs        |
| `/admin/teachers`           | Staff directory + backup assignments |
| `/admin/teachers/profile`   | Teacher profile + class schedule     |
| `/admin/incidents`          | Incident log with severity/status filters |
| `/admin/reports`            | Safety reports + analytics charts    |
| `/admin/account`            | System audit, activity log, admin profile |

### Teacher Portal
| Route                  | Description                          |
|------------------------|--------------------------------------|
| `/teacher/dashboard`   | Class snapshot, schedule, parent messages |
| `/teacher/students`    | Student records table                |
| `/teacher/attendance`  | Mark P/A/L attendance per student    |
| `/teacher/messages`    | Two-panel chat with parents/staff    |
| `/teacher/reports`     | File incident reports + past reports |

### Parent Portal
| Route                   | Description                          |
|-------------------------|--------------------------------------|
| `/parent/dashboard`     | Child tracking, billing, checklist   |
| `/parent/students`      | My children with live location feed  |
| `/parent/attendance`    | Monthly calendar + absence history   |
| `/parent/messages`      | Chat with teachers and school admin  |
| `/parent/reports`       | Progress reports + teacher remarks   |

---

## Design System

### Brand Colors
| Token                   | Hex       | Usage                         |
|-------------------------|-----------|-------------------------------|
| `primary`               | `#00236f` | Main brand, buttons, headings |
| `secondary`             | `#006b5f` | Success states, secondary actions |
| `tertiary`              | `#4b1c00` | Parent portal accent          |
| `error`                 | `#ba1a1a` | Alerts, critical, delete      |
| `background`            | `#f8f9fb` | Page background               |
| `surface`               | `#f8f9fb` | Card/component background     |

### Custom Spacing Tokens
| Token                          | Value  |
|--------------------------------|--------|
| `stack-sm`                     | 8px    |
| `stack-md`                     | 16px   |
| `stack-lg`                     | 24px   |
| `gutter`                       | 24px   |
| `container-padding-mobile`     | 16px   |
| `container-padding-desktop`    | 32px   |

### Typography Scale
| Token        | Size / Line Height    |
|--------------|-----------------------|
| `label-sm`   | 12px / 1.3            |
| `label-md`   | 14px / 1.4            |
| `body-md`    | 16px / 1.5            |
| `headline-md`| 24px / 1.3            |
| `headline-lg`| 32px / 1.2            |
| `display-lg` | 48px / 1.1            |

### Custom CSS Classes (globals.css)
| Class                    | Purpose                               |
|--------------------------|---------------------------------------|
| `.auth-bg`               | Gradient background for login pages   |
| `.glass-card`            | Frosted-glass card style              |
| `.status-chip`           | Inline status badge                   |
| `.bento-grid`            | 12-column CSS grid layout             |
| `.step-transition`       | Multi-step form transition            |
| `.hidden-step`           | Hide inactive form step               |
| `.custom-scrollbar`      | Styled scrollbar for activity feeds   |
| `.student-table-container` | Constrained table scroll container  |

---

## Navigation Architecture

Each role group has a **shared layout file** that wraps all pages in that group. The layout reads `usePathname()` to determine which sidebar item to highlight — no individual page needs to manage nav state.

```
app/admin/layout.tsx     →  AdminTopNav + AdminSidebar (auto-active)
app/teacher/layout.tsx   →  TeacherSidebar + sticky top header (auto-active)
app/parent/layout.tsx    →  ParentSidebar + sticky top header (auto-active)
```

This means every page file only contains its **own content** — no sidebar/topnav imports, no `activeItem` props to maintain.

---

## Key Configuration Files

### `next.config.ts`
```ts
{ images: { unoptimized: true } }
```

### `tsconfig.json`
- Strict mode enabled
- Path alias: `@/*` → `./*`
- JSX: `preserve` (Next.js handles transpilation)

### `tailwind.config.ts`
- Content paths: `./app/**/*.{ts,tsx}`, `./components/**/*.{ts,tsx}`
- Full custom color palette (Material Design 3 tokens)
- Custom spacing + font-size scales

---

## Available Scripts

| Script          | Description                    |
|-----------------|--------------------------------|
| `npm run dev`   | Start dev server (localhost:3000) |
| `npm run build` | Production build               |
| `npm start`     | Start production server        |
| `npm run lint`  | Run ESLint                     |

---

## Browser Support

Modern browsers with ES2017+ support. Tested on Chrome, Firefox, Edge, and Safari.

---

## Notes

- This is a **prototype / demo** application. Authentication is simulated (no real backend).
- All login credentials are hardcoded demo values — do not use in production.
- Images are sourced from Google's AIDA public CDN for prototype purposes only.
- The app is fully static (`○` in the build output) — all pages are pre-rendered at build time.
