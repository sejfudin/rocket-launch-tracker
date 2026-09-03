# Povio ReactJS Assignment

## Rocket Launch Tracker

Welcome to the Povio ReactJS Assignment! This repository contains a starter codebase for building a Rocket Launch Tracker application.


---

## Prerequisites

- [macOS Setup](./docs/01_macOS.md)
- [Windows Setup](./docs/01_Windows.md)

---

## Quick Start

### 1. Install Dependencies

```bash
# Use the correct Node.js version
nvm use

# Install dependencies
yarn
```

### 2. Setup Environment

```bash
yarn setup
```

### 3. Generate Required Code

```bash
yarn generate
```

### 4. Start Database

```bash

# Apply database migrations
yarn db migrate apply
```

### 5. Start Development Servers

```bash
# Start all apps (frontend + backend)
yarn dev
```

Or start individual servers:

```bash
# Frontend only
yarn fe dev

# Backend only
yarn be dev
```

---

## Useful Commands

### Development

| Command | Description |
|---------|-------------|
| `yarn dev` | Start all development servers |
| `yarn fe dev` | Start frontend only |
| `yarn be dev` | Start backend only |
| `yarn storybook` | Start Storybook for UI components |

### Testing

| Command | Description |
|---------|-------------|
| `yarn test` | Run all tests |
| `yarn test:watch` | Run tests in watch mode |

### Code Quality

| Command | Description |
|---------|-------------|
| `yarn typecheck` | Run TypeScript type checking |
| `yarn lint` | Run linter |
| `yarn format` | Format code |
| `yarn check` | Run all checks (before committing) |

### Database

| Command | Description |
|---------|-------------|
| `yarn db migrate apply` | Apply database migrations |
| `yarn db studio` | Open Prisma Studio |

---

## Project Structure

```
├── apps/
│   ├── fe/          # Frontend (React + Vite)
│   ├── be/          # Backend (NestJS)
│   ├── admin/       # Admin dashboard
│   └── storybook/   # Storybook for UI components
├── packages/
│   └── ui/          # Shared UI component library
├── docs/
│   ├── assignment.md  # Assignment instructions
│   └── ...
└── ...
```

---

## Required Tools

The following tools are already set up in this project. You **must** use them:

| Tool | Purpose |
|------|---------|
| `@povio/ui` | UI component library |
| `@tanstack/react-query` | Data fetching & caching |
| `@tanstack/react-router` | Type-safe routing |


---

## API Documentation

When running the backend server, API documentation is available at:
- **Swagger UI**: http://localhost:4000/api/docs

---

## Before Committing

Always run the check scripts before committing:

```bash
yarn check
```

---

Good luck with your assignment! 🚀
