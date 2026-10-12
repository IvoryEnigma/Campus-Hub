# AIT CAMPUS HUB

> Unified campus communication, official announcements, hostel updates, academic communities, alumni mentorship, and student innovation platform for **Army Institute of Technology (AIT), Pune**.

---

## 1. Project Architecture Overview

AIT Campus Hub is built as a fullstack production-grade web application:

- **Frontend**: React 19 + Vite 8
- **Design System**: Vanilla CSS token-based design system tailored for AIT Pune (clean off-white background `#f8fafc`, slate typography `#0f172a`, restrained blue accents `#1e40af` / `#2563eb`).
- **Icons**: Lucide Icons (`lucide-react`).
- **Backend API**: Node.js + Express 5 with REST endpoints and middleware for authorization, privacy masking, and hostel isolation.
- **Data Persistence**: Atomic, persistent JSON database engine (`server/data.json` & `server/db.js`) with thread-safe file operations.
- **Security & RBAC**: Role-based access control (`student`, `faculty`, `warden`, `club_lead`, `alumni`, `admin`) enforced at the server level.

---

## 2. Core Capabilities Implemented

### Main Navigation & Layout
1. **Home**: Personalized dashboard with pinned announcements, unread badge, recent community posts, hostel status, upcoming events, and quick actions.
2. **Campus Inbox**: Unified inbox supporting All, Unread, Pinned, and Saved tabs, source & category filters, full-text search, persistent read/saved states, and reply drawers.
3. **Communities**: All campus communication spaces with zero popularity comparisons or member rosters.
4. **FE Announcements**: Dedicated space for First Year Engineering academic circulars, journal guidelines, and notices.
5. **Departments**: Academic hubs for IT, COMP, ENTC, MECH, and ARE.
6. **Hostel**: Restricted, isolated communication spaces for Girls' Hostel and Boys' Hostel.
7. **Innovation Hub**: Ideas board, peer collaboration, teammate requests, verified alumni opportunities, application tracker, and project showcase with milestones.
8. **Saved**: Quick access to bookmarked circulars and notices.
9. **Profile**: Student Privacy Shield ensuring registration number, phone, email, and branch are never exposed publicly.
10. **Admin & Moderation**: Console for reviewing alumni verification submissions and managing official announcements.

### Exactly 29 Club Communication Channels
Pre-configured with exact required names:
1. AR-VR
2. Astronomy Club
3. Centre of Excellence for AI & Robotics
4. Code Programming Club
5. College Innovation Development Club (CIDC)
6. Cultural & Musical Board
7. Cycling Club
8. Debate, Quiz & Dramatics Clubs
9. Drone Club
10. EV Cell
11. Film Club
12. Fine Arts Club
13. Google Development Student Club (GDSC)
14. I & E Cell
15. Information Security & Digital Forensic Club
16. Magazine Board
17. Music and Dance Club
18. Nature Club
19. NSS Club
20. OSS Club
21. Press News Cell
22. Public Relation (PR)
23. R&D Cell
24. Radio Club
25. SAE – AIT Collegiate Club
26. Social Media Cell
27. Spiritual Club
28. Sports Club
29. Technical & Maths Board

### Security & Privacy Protections
- **Hostel Isolation**: Girls' Hostel residents and Boys' Hostel residents cannot query or view each other's hostel data. Enforced on the server with HTTP 403.
- **Official Notice Verification**: Regular students cannot toggle or publish official notices. Only authorized faculty, club leads (for their club), wardens (for their hostel), or admins may do so.
- **Student Privacy Shield**: Public profiles and community feeds strictly sanitize user payloads, redacting registration numbers, phone numbers, and emails.
- **Alumni Opportunity Verification**: Only approved alumni accounts can post verified opportunities. Unverified accounts require administrator review.

---

## 3. Running the Application

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
npm install
```

### Run Fullstack Application
To run both backend and frontend concurrently:
```bash
npm start
```
Or in separate terminals:
```bash
# Terminal 1: Start Express API server (port 5001)
npm run server

# Terminal 2: Start Vite Frontend (port 5173)
npm run dev
```

### Run Automated Security Test Suite
```bash
npm test
```

### Production Build
```bash
npm run build
```

---

## 4. Official Links & Integrations
- Official AIT Pune Website: [https://www.aitpune.com/](https://www.aitpune.com/)
- External ERP/WhatsApp/SMS: Clearly designated as not connected until official college API credentials and SSO are provisioned.
