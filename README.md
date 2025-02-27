# Project Documentation

## Getting Started

This guide will help you set up and run the project locally.

### Prerequisites

- Node.js (recommended latest LTS version)
- npm, yarn, pnpm, or bun package manager
- PostgreSQL database access (via Neon)
- Firebase project (for notifications)
- Google API key (for Gemini AI integration)

### Installation

Before running the server, install all dependencies:

```bash
npm i
```

```bash
npm run db:pull
```

```bash
npm run db:generate
```

### Development Server

Run the development server using one of the following commands:

```bash
npm run dev
```

Once running, open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Technology Stack

- Next.js: Full-stack React framework for the entire application

## Features

### Database

- Neon DB: Serverless PostgreSQL database for robust and scalable data storage

### Authentication

- Stack Auth: Integrated with Neon DB for secure user authentication and session management

### AI Integration

- Gemini AI: Provides intelligent suggestions for task titles and summarizes descriptions

### Notifications

- Firebase: Handles push notifications to keep users informed in real-time

### Hosting & Deployment

- Vercel: Cloud platform for hosting and automated deployments

### Project Management Tools

- Gantt chart visualization for project timeline management
- Timetable viewer to track and display deadlines
- Personal reminder system for setting and managing individual tasks
