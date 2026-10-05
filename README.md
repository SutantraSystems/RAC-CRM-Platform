# RAC CRM Dashboard

A full-stack CRM dashboard application for managing students and CRM data.

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router, Recharts, Lucide React

### Backend

- Python
- Django
- Django REST Framework
- pandas and openpyxl (Excel import)

### Database

- PostgreSQL

---

## Project Structure

```text
RAC-CRM-Platform/
│
├── Backend/
│   ├── Backend/              # Django project configuration (settings, urls)
│   ├── CRM/                  # CRM app: students, documents, comments, reminders
│   ├── accounts/             # Authentication
│   ├── media/                # Uploaded files (created automatically, git-ignored)
│   ├── .env.example
│   ├── manage.py
│   └── requirements.txt
│
├── Frontend/
│   ├── src/
│   │   ├── api/              # Axios instance
│   │   ├── components/
│   │   ├── context/          # Auth context
│   │   ├── data/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/         # API calls
│   │   └── utils/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## Prerequisites

Make sure the following are installed:

- Python 3.12.10 (Django 6 needs Python 3.12 or newer)
- Node.js v26.1.0
- PostgreSQL 16.14

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

### Windows (Command Prompt)

```bat
venv\Scripts\activate
```

### Windows (PowerShell)

```powershell
.\venv\Scripts\Activate.ps1
```

### Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## Environment Variables

Create a `.env` file inside the `Backend` directory. You can start from the
example file:

```bash
cp .env.example .env        # Linux / macOS (cmd): copy .env.example .env
```

```bash
copy .env.example .env        # Windows (cmd): copy .env.example .env
```


Then fill in your values:

```env
DB_NAME=rac_crm
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DEBUG=True
SECRET_KEY=your-secret-key
REMINDER_DUE_WINDOW_MINUTES=1440

SESSION_COOKIE_AGE=86400
SESSION_COOKIE_SECURE=false
CSRF_COOKIE_SECURE=false
SESSION_EXPIRE_AT_BROWSER_CLOSE=true
```

### Session Configuration

The application uses Django session-based authentication.

For local development over HTTP:

```env
SESSION_COOKIE_AGE=86400
SESSION_COOKIE_SECURE=false
CSRF_COOKIE_SECURE=false
SESSION_EXPIRE_AT_BROWSER_CLOSE=true
```

For production over HTTPS:
```env
SESSION_COOKIE_AGE=86400
SESSION_COOKIE_SECURE=true
CSRF_COOKIE_SECURE=true
SESSION_EXPIRE_AT_BROWSER_CLOSE=true
```

To generate a secret key:

```bash
python -c "from django.core.management.utils import get_random_secret_key as k; print(k())"
```

> Never commit the `.env` file. It is already listed in `.gitignore`.

---

## Database Setup

Create the PostgreSQL database:

```sql
CREATE DATABASE rac_crm;
```

Or from the command line:

```bash
psql -U postgres -c "CREATE DATABASE rac_crm;"
```

Run migrations:

```bash
python manage.py migrate
```

---

## Database Migrations

Whenever changes are made to Django models, create and apply migrations.

After making changes to a model, run:

```bash
python manage.py makemigrations
```

Then apply the migrations:

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
http://localhost:8000
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

Create a `.env` file inside the `Frontend` directory (or copy `.env.example`):

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

---