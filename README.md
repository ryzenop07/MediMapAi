# MediMapAi — Django + React

A medicine finder web app with location-based search and AI-powered suggestions.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Django 4.2+ + Django REST Framework |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | PyJWT (Bearer tokens) |
| AI | difflib fuzzy search + optional OpenAI embeddings |
| Frontend | React + Vite + Tailwind CSS |
| Maps | Google Maps API |

## Quick Start

### Backend (Django)

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend dev server: http://localhost:5173  
Django API server: http://localhost:8000

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Login, get JWT |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/pharmacy/` | Create/update pharmacy |
| POST | `/api/pharmacy/inventory/` | Update inventory |
| GET | `/api/pharmacy/me/` | Get pharmacist's pharmacy |
| GET | `/api/search/?query=&lat=&lng=` | Search medicine nearby |
| GET | `/api/ai/suggest/?query=` | AI medicine suggestions |

## Environment Variables

Copy `.env.example` to `.env` in the `backend/` directory:

```
DJANGO_SECRET_KEY=your-secret-key
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=your-openai-key  # optional
DEBUG=True
```
