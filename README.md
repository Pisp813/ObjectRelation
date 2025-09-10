# Object Design System

A full-stack application for managing object design systems with AI-powered features.

## Project Structure

This project has been split into separate frontend and backend directories:

```
├── frontend/          # React frontend application
│   ├── client/        # React source code
│   ├── shared/        # Shared types/schemas
│   ├── package.json   # Frontend dependencies
│   └── vite.config.ts # Frontend build configuration
├── backend/           # FastAPI backend application
│   ├── app/           # FastAPI application code
│   ├── alembic/       # Database migrations
│   ├── shared/        # Shared types/schemas
│   ├── requirements.txt # Python dependencies
│   └── main.py        # Backend entry point
├── package.json       # Root package.json for managing both
└── README.md          # This file
```

## Setup

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- PostgreSQL database

### Installation

1. Install all dependencies:
   ```bash
   npm run install:all
   ```

   Or install them separately:
   ```bash
   # Frontend dependencies
   npm run install:frontend
   
   # Backend dependencies
   npm run install:backend
   ```

### Database Setup

1. Initialize the database:
   ```bash
   npm run db:init
   ```

2. Run migrations:
   ```bash
   npm run db:migrate
   ```

## Development

### Start both frontend and backend:

```bash
npm run dev
```

This will start:
- Frontend on http://localhost:5173
- Backend on http://localhost:8000

### Start services separately:

```bash
# Start only the frontend
npm run dev:frontend

# Start only the backend
npm run dev:backend
```

## Building

### Build the frontend for production:

```bash
npm run build:frontend
```

## API Documentation

Once the backend is running, visit:
- API docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

## Environment Variables

Create a `.env` file in the root directory with your configuration:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/dbname

# OpenAI API (for AI features)
OPENAI_API_KEY=your_openai_api_key

# Other configuration
SECRET_KEY=your_secret_key
```

## Features

- Object management with relationships and hierarchies
- AI-powered search and recommendations
- Report generation
- Modern React frontend with Material-UI components
- FastAPI backend with PostgreSQL database
- Real-time updates and responsive design
