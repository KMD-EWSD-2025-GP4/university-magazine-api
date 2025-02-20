# EWSD API Documentation

This directory contains the API documentation for the Enterprise Web Software Development project.

## Getting Started

### Prerequisites

- [Postman](https://www.postman.com/downloads/) installed on your machine
- The API server running locally or in your environment

### Setting Up Postman

1. Open Postman
2. Import the collection file: `postman/ewsd-university-magazine-api.postman.json`
3. Set up environment variables:
   - `baseUrl`: Your API base URL (e.g., `http://localhost:3001`)
   - `authToken`: Your authentication token (obtained after login)

## API Modules

### User Management

- **Register User** (`POST /api/user/register`)
  - Register a new user with email, password, first name, last name, and faculty ID
  - Body: `{ email, password, firstName, lastName, facultyId }`

- **Login User** (`POST /api/user/login`)
  - Authenticate user with email and password
  - Body: `{ email, password }`
  - Returns authentication token

- **Get Current User** (`GET /api/user/me`)
  - Get details of currently authenticated user
  - Requires authentication token

### Academic Management

- **Get All Faculties** (`GET /api/academic/faculty`)
  - Get list of all faculties
  - Requires authentication token

- **Get Academic Years** (`GET /api/academic/academic-year`)
  - Get list of all academic years
  - Requires authentication token

- **Get Academic Year by ID** (`GET /api/academic/academic-year/by-id/:id`)
  - Get specific academic year by ID
  - Requires authentication token

- **Get Academic Year by Date** (`GET /api/academic/academic-year/by-date`)
  - Get academic year by date
  - Query params: `date` (format: YYYY-MM-DD)
  - Requires authentication token

- **Get Terms** (`GET /api/academic/term`)
  - Get list of all terms
  - Requires authentication token

- **Get Term by ID** (`GET /api/academic/term/by-id`)
  - Get specific term by ID
  - Query params: `id`
  - Requires authentication token

### Admin Management

#### User Operations
- **Reset User Password** (`POST /api/admin/reset-user-password`)
  - Reset a user's password (Admin only)
  - Body: `{ userId, newPassword }`
  - Requires authentication token and admin role

- **Change User Role** (`POST /api/admin/change-user-role`)
  - Change a user's role (Admin only)
  - Body: `{ userId, newRole }`
  - Available roles: ['guest', 'student', 'marketing_coordinator', 'marketing_manager', 'admin']
  - Requires authentication token and admin role

#### Faculty Operations
- **Create Faculty** (`POST /api/admin/faculty`)
  - Body: `{ name }`
- **Update Faculty** (`PUT /api/admin/faculty`)
  - Body: `{ id, name }`
- **Delete Faculty** (`DELETE /api/admin/faculty`)
  - Body: `{ id }`

#### Academic Year Operations
- **Create Academic Year** (`POST /api/admin/academic-year`)
  - Body: `{ startDate, endDate, newClosureDate, finalClosureDate }`
  - All dates must be in ISO 8601 format
- **Update Academic Year** (`PUT /api/admin/academic-year`)
  - Body: `{ id, startDate, endDate, newClosureDate, finalClosureDate }`
  - All dates must be in ISO 8601 format
- **Delete Academic Year** (`DELETE /api/admin/academic-year`)
  - Body: `{ id }`

#### Term Operations
- **Create Term** (`POST /api/admin/term`)
  - Body: `{ name, content }`
- **Update Term** (`PUT /api/admin/term`)
  - Body: `{ id, name, content }`
- **Delete Term** (`DELETE /api/admin/term`)
  - Body: `{ id }`

## Authentication

Most endpoints require authentication using a JWT token. To authenticate:

1. Login using the `/api/user/login` endpoint
2. Copy the returned token
3. Set the token in your Postman environment variable `authToken`
4. The token will be automatically included in the request headers as `Authorization: Bearer {token}`

## Error Handling

The API uses standard HTTP status codes and returns error messages in the following format:

```json
{
  "error": {
    "message": "Error message here",
    "status": 400
  }
}
```

Common error codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error