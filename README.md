# RAC CRM Dashboard

A full-stack CRM dashboard application for managing students and CRM data.

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
RAC-CRM-Platform/
│
├── Backend/
│   ├── Backend/          # Django project configuration
│   ├── CRM/              # CRM application
│   ├── accounts/         # Authentication
│   ├── manage.py
│   └── requirements.txt
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## Prerequisites

Make sure the following are installed:

- Python - 3.12.10
- Node.js - v26.1.0
- PostgreSQL - 16.14

---

## Backend Setup

Navigate to the backend directory:

```bash
cd Backend
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

## Environment Variables

Create a `.env` file inside the `Backend` directory:

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

Create the PostgreSQL database:

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

Backend:

```text
http://127.0.0.1:8000
```

---

## Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd Frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `Frontend` directory:

```env
VITE_API_URL=http://localhost:8000/api
```

Run the development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## Application Architecture

```text
User
 │
 ▼
React + Vite
 │
 │ REST API
 ▼
Django REST Framework
 │
 ▼
PostgreSQL
```