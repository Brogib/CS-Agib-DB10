# SBD Store Backend

A simple Express.js backend for the SBD Module 6 case study.

## Project Structure

```
my-app-backend/
├── node_modules/
├── src/
│   ├── config/         # Database connection, environment variables
│   ├── controllers/    # Request handlers (logic for endpoints)
│   ├── middleware/     # Custom middleware (auth, error handling)
│   ├── models/         # Database schemas (raw SQL queries)
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic (database interactions)
│   ├── utils/          # Utility functions (helpers, validations)
│   └── app.js          # Express app setup
├── .env                # Sensitive environment variables
├── .gitignore          # Files to ignore in git (node_modules, .env)
├── package.json        # Dependencies and scripts
├── README.md           # Documentation
└── server.js           # Entry point (starts the server)
```

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database

## Setup

1. Clone the repository.
2. Navigate to the project directory.
3. Run `npm install` to install dependencies.
4. Copy `.env.example` to `.env` and fill in your PostgreSQL credentials.
5. Run the `seed.sql` script in your PostgreSQL database to create tables and sample data.
6. Start the server:
   - Production: `npm start`
   - Development: `npm run dev` (auto‑restart with nodemon)

## API Endpoints

See `Documentation.md` for a complete list of endpoints, request/response formats, and examples.

## Case Study

This backend serves as the starting point for the SBD Module 6 case study. Students are required to enhance it with security features, complex queries, and more. Refer to `workspace-context/CaseStudy.md` for the detailed tasks.

## License

MIT