# RAC CRM Dashboard

A full-stack CRM dashboard application built for managing students, applications, universities, leads, and analytics.

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Axios

### Backend
- Python
- Django
- Django REST Framework

### Database
- PostgreSQL

---

## Project Structure

```text
crm_dash/
│
├── backend/
│   ├── Backend/          # Django project configuration
│   ├── CRM/              # Main CRM application
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── routes/
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

# Features

- Dashboard overview
- Student management
- Student filtering
- Applications management
- University management
- Leads management
- Analytics
- Import students
- API integration
- PostgreSQL database integration

---

# Prerequisites

Make sure the following are installed:

- Python 3.10+
- Node.js 18+
- PostgreSQL
- npm

---

# Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment.

### Windows

```bash
venv\Scripts\activate
```

### Linux/macOS

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## Configure Environment Variables

Create a `.env` file inside the backend directory:

```env
DB_NAME=rac_crm
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

DEBUG=True
SECRET_KEY=your-secret-key
```

---

## Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE rac_crm;
```

Run migrations:

```bash
python manage.py migrate
```

---

## Run Backend

```bash
python manage.py runserver
```

The backend will run at:

```text
http://127.0.0.1:8000
```

---

# Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

---




