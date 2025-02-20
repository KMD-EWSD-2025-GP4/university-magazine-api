# EWSD API Documentation

This directory contains the API documentation for the Enterprise Web Software Development project.

## Getting Started

### Prerequisites

- [Postman](https://www.postman.com/downloads/) installed on your machine
- The API server running locally or in your environment

### Setting Up Postman

1. Open Postman
2. Import the collection file: `postman/ewsd-api.postman.json`
3. Set up environment variables:
   - `baseUrl`: Your API base URL (e.g., `http://localhost:3000`)
   - `authToken`: Your authentication token (obtained after login)

## API Modules

### User Management

- **Register User** (`POST /api/users/register`)
  - Register a new user with email, password, and personal details
  - Returns user details and success message

- **Login User** (`POST /api/users/login`)
  - Authenticate user with email and password
  - Returns authentication token and user details

- **Get Current User** (`GET /api/users/me`)
  - Get details of currently authenticated user
  - Requires authentication token

- **Get Students by Faculty** (`GET /api/users/students/:facultyId`)
  - Get all students in a specific faculty
  - Requires authentication token

### Admin Management

#### User Operations
- **Reset User Password** (`POST /api/admin/users/reset-password`)
  - Reset a user's password (Admin only)
  - Requires authentication token and admin role

- **Change User Role** (`POST /api/admin/users/change-role`)
  - Change a user's role (Admin only)
  - Requires authentication token and admin role

#### Faculty Operations
- **Create Faculty** (`POST /api/admin/faculties`)
- **Get All Faculties** (`GET /api/admin/faculties`)
- **Update Faculty** (`PUT /api/admin/faculties/:id`)
- **Delete Faculty** (`DELETE /api/admin/faculties/:id`)

#### Academic Year Operations
- **Create Academic Year** (`POST /api/admin/academic-years`)
- **Get Academic Years** (`GET /api/admin/academic-years`)
- **Get Academic Year by ID** (`GET /api/admin/academic-years/:id`)
- **Update Academic Year** (`PUT /api/admin/academic-years/:id`)
- **Delete Academic Year** (`DELETE /api/admin/academic-years/:id`)

#### Term Operations
- **Create Term** (`POST /api/admin/terms`)
- **Get Terms** (`GET /api/admin/terms`)
- **Get Term by ID** (`GET /api/admin/terms/:id`)
- **Update Term** (`PUT /api/admin/terms/:id`)
- **Delete Term** (`DELETE /api/admin/terms/:id`)

## Authentication

Most endpoints require authentication using a JWT token. To authenticate:

1. Login using the `/api/users/login` endpoint
2. Copy the returned token
3. Set the token in your Postman environment variable `authToken`
4. The token will be automatically included in the request headers

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

## Rate Limiting

The API implements rate limiting to prevent abuse. Limits are:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users