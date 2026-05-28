# EduCRM — Overseas Education Student Management CRM

A production-ready CRM Dashboard for education consultancies, built with React + Tailwind CSS.

## 🎨 Design
- Inspired by the Berry Admin / Zoho CRM style shown in the reference screenshot
- Primary color: #2c5aa9 (blue) | Accent: #ee3c3c (red)
- Background: #FAF8F5
- Font: Plus Jakarta Sans + Sora

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation & Run

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in browser
# http://localhost:5173
```

### Build for Production
```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
 ├── components/
 │    ├── sidebar/       # Sidebar with collapse toggle
 │    ├── navbar/        # Top navbar with profile dropdown
 │    ├── cards/         # KPI cards
 │    ├── tables/        # Students table with pagination
 │    ├── filters/       # Student filter system
 │    ├── charts/        # Recharts components
 │    └── ui/            # Kanban board
 ├── pages/
 │    ├── Dashboard.jsx  # KPI cards + charts + recent apps
 │    ├── Students.jsx   # Full student table + filters
 │    ├── Leads.jsx      # Kanban pipeline board
 │    ├── Analytics.jsx  # Full analytics with 4 charts
 │    ├── Applications.jsx
 │    ├── Universities.jsx
 │    └── Placeholder.jsx
 ├── data/
 │    ├── students.js    # 12 mock student records
 │    └── mockData.js    # Leads, charts, dashboard data
 ├── routes/
 │    └── AppRoutes.jsx
 ├── App.jsx
 └── main.jsx
```

## ✨ Features

- **Collapsible Sidebar** — icon-only or full with labels
- **Dashboard** — 9 KPI cards, growth chart, country pie, revenue bar
- **Students Module** — full table, pagination, sort, filter system
- **Leads Kanban** — 5-stage pipeline (New → Converted/Lost)
- **Analytics** — 4 charts + country breakdown table
- **Applications** — searchable table
- **Universities** — card grid view
- **Notifications** — dropdown bell
- **Profile Menu** — dropdown with logout

## 🔌 Connecting a Backend

Replace mock data in `src/data/` with Axios API calls:

```js
// Example
import axios from 'axios';
const { data } = await axios.get('/api/students');
```
