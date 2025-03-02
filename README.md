# University Magazine API

A RESTful API service for managing a university magazine system built with Node.js, TypeScript, Fastify, and PostgreSQL.

## Prerequisites

- Node.js (>= 22.11 < 23)
- Docker and Docker Compose (optional, for local development)
- yarn

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Fastify
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: JWT

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd university-magazine-api
```

### 2. Environment Setup

Copy the example environment file and update it with your settings:

```bash
cp .env.example .env
```

The default values in `.env.example` should work for local development.

### 3. Start the Database

Use Docker Compose to start the PostgreSQL database:

```bash
docker compose up -d
```

This will start PostgreSQL on port 5432.

### 4. Install Dependencies

```bash
yarn install
```

### 5. Database Migrations

Generate and run database migrations: (only needed if you're making changes to the database schema)

```bash
yarn migration:generate
```

### 6. Start the Development Server

```bash
yarn dev
```

The server will start on http://localhost:3001 by default (or the port specified in your .env file).

## Available Scripts

- `yarn dev` - Start the development server with hot reload
- `yarn build` - Build the project for production
- `yarn start` - Start the production server
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint errors
- `yarn prettier` - Format code with Prettier
- `yarn prettier:check` - Check code formatting
- `yarn migration:generate` - Generate database migrations (run this after making changes to the database schema)

## Project Structure

```
├── src/
│   ├── config/        # Configuration files (e.g. environment variables)
│   ├── db/            # Database setup and schema
│   ├── middleware/    # Custom middlewares (e.g. authentication)
│   ├── modules/       # Feature modules
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions
├── drizzle/           # Database migrations
└── docker-compose.yml # Docker services configuration
```

## Environment Variables

| Variable    | Description                | Default Value                                                    |
|------------|----------------------------|------------------------------------------------------------------|
| PORT       | Server port                | 3001                                                             |
| HOST       | Server host                | 0.0.0.0                                                          |
| LOG_LEVEL  | Logging level             | debug                                                            |
| DB_URL     | PostgreSQL connection URL | postgress://postgres:postgres@localhost:5432/university_magazine_db |
| JWT_SECRET | JWT signing secret        | (Set in .env)                                                    |
| API_URL    | Base API URL              | http://localhost:3001                                            |
| FRONTEND_URL    | Base Client URL              | http://localhost:3000                                            |
| EMAIL_FROM | Email sender address      | (Set in .env)                                                    |
| RESEND_API_KEY | Resend API Key        | (Set in .env)                                                    |
| AWS_ACCESS_KEY_ID | AWS Access Key ID        | (Set in .env)                                                    |
| AWS_SECRET_ACCESS_KEY | AWS Secret Access Key        | (Set in .env)                                                    |
| AWS_REGION | AWS Region                | (Set in .env)                                                    |
| AWS_BUCKET_NAME | AWS Bucket Name        | (Set in .env)                                                    |
