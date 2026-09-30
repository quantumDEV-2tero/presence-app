# Presence

<p align="center">
  <img src="logo.svg" alt="Presence logo" width="96">
</p>

<h3 align="center">Modern, QR powered attendance management for teachers</h3>

<p align="center">
  Create classes, open attendance sessions, share a live QR code, and export attendance records in seconds.
</p>

<p align="center">
  <strong>French interface</strong> · <strong>Teacher focused</strong> · <strong>GitHub Pages ready</strong> · <strong>Supabase powered</strong>
</p>

---

## Overview

**Presence** is a lightweight attendance web application designed around one simple workflow:

**Create a course → start a session → students scan the QR code → attendance is recorded → close and export the session**

The teacher dashboard is authenticated with Supabase Auth. Students do **not** need to create accounts. A public QR attendance page lets students register their name and mark their presence during an open session.

The project is built as a static web app, so it can be hosted on GitHub Pages without a traditional application server.

## Features

### Teacher dashboard

* Secure teacher sign in and account creation
* Teacher profile setup
* Course creation with unique join codes
* Session based attendance management
* Start and instantly close attendance sessions
* Live session QR links
* Attendance history for each course
* Attendance detail view with timestamps

### Attendance and exports

* Public student QR flow with no student account required
* One attendance action per student for the active session
* CSV export
* Excel compatible export
* Print friendly attendance view
* Session specific QR links

### Product polish

* Modern dark interface
* Optional light mode
* Responsive layout for desktop and mobile
* Toast notifications instead of intrusive success alerts
* Helpful empty states
* Teacher settings page
* Installable PWA support
* Custom Presence branding and favicon

## How it works

### 1. Teacher signs in

The teacher creates an account or signs in with email and password.

### 2. Teacher creates a course

A course gets a unique code that identifies the class.

### 3. Teacher starts an attendance session

Each session gets its own QR based attendance URL.

### 4. Students scan the QR code

Students open the public attendance page, enter their name, and continue without creating an account.

### 5. Attendance is recorded

When the session is open, students can mark their presence. The teacher can refresh the attendance list to see recorded entries.

### 6. Teacher closes and exports

The teacher closes the session instantly, then can view, export, or print the attendance records.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Authentication | Supabase Auth |
| Database | Supabase PostgreSQL |
| API access | Supabase REST API + RPC |
| Security | PostgreSQL Row Level Security |
| Hosting | GitHub Pages |
| PWA | Web App Manifest + Service Worker |
| QR generation | QRServer API |

## Project structure

```text
presence-app/
├── index.html                  # Main application and dashboard
├── auth.js                    # Teacher authentication flow
├── logo.svg                   # Presence application logo
├── manifest.webmanifest       # PWA manifest
├── sw.js                      # Service worker and app shell cache
└── .github/
    └── workflows/
        └── pages.yml          # GitHub Pages deployment
```

## Data model

Presence uses a simple relational model:

```text
profiles
  └── teacher profiles

classes
  └── courses owned by teachers

students
  └── students linked to a class without requiring a login

enrollments
  └── class ↔ student relationships

attendance_sessions
  └── individual attendance periods for a class

attendance
  └── presence records linked to students and sessions
```

Anonymous student actions are handled through dedicated database functions, while teacher data is protected through authentication and Row Level Security policies.

## Security

The frontend only uses a **Supabase publishable key**. A Supabase service role or secret key must never be placed in client side code.

Authorization is enforced at the database level with **Row Level Security**. Teacher operations are restricted to the teacher who owns the relevant course and session.

The public student flow uses controlled database functions rather than exposing unrestricted direct write access to the attendance tables.

### Important production checklist

Before using the project in a real institution:

* Keep Row Level Security enabled on exposed tables
* Review all public RPC functions and rate limits
* Configure Supabase email confirmation and password security
* Enable leaked password protection in Supabase Auth
* Configure the correct production Site URL and redirect URLs
* Never commit a service role or secret key

## Local development

Because Presence is a static application, no frontend build step is required.

1. Clone the repository.

```bash
git clone https://github.com/quantumdDEV-web/presence-app.git
cd presence-app
```

2. Open the project with a local static server.

For example:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

3. Configure your Supabase project.

The frontend expects the Supabase project URL and publishable key in the application code. For production, keep the publishable key only on the client and rely on RLS and secure database functions for authorization.

## GitHub Pages deployment

Deployment is automated through:

```text
.github/workflows/pages.yml
```

Every push to `main` triggers the GitHub Pages workflow.

To enable Pages in a fork or new repository:

1. Open **Settings → Pages**
2. Select **GitHub Actions** as the source
3. Push to `main`

The workflow publishes the repository as a static site.

## PWA support

Presence can be installed as an app on supported browsers.

The project includes:

* `manifest.webmanifest` for app metadata
* `sw.js` for the cached application shell
* An in app installation control when the browser exposes the install prompt

The PWA is intended to make repeated classroom use faster and more convenient.

## Design principles

Presence is intentionally focused on classroom speed:

**Minimal steps**  
A teacher should be able to start attendance in seconds.

**No student account friction**  
Students scan, enter their name, and mark attendance.

**Session based tracking**  
Every lecture is a separate attendance session.

**Database enforced permissions**  
Access control is not left entirely to the frontend.

**Mobile friendly**  
The core attendance workflow remains usable on phones.

## Future ideas

Possible next steps for the project include:

* Live attendance counters
* Attendance analytics and charts
* Student attendance profiles
* Semester reports
* PDF report generation
* Multiple teacher roles
* Institution level administration
* Better QR expiration and session security
* Realtime attendance updates with Supabase Realtime

## Contributing

Contributions, UI improvements, bug fixes, and feature ideas are welcome.

A good contribution should keep the core Presence workflow simple and should preserve database security and teacher ownership rules.

## License

No open source license has been declared for this repository yet. Add a license file before presenting the project as reusable open source software.

---

<p align="center">
  Built with HTML, JavaScript, Supabase, and GitHub Pages.
</p>
