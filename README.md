# Orbit-Plan Backend

## Overview

Orbit-Plan is a content calendar and planner designed for solo influencers and small teams to manage social media content. The backend, built with Strapi and PostgreSQL, provides a headless CMS to handle content planning, team collaboration, and API-driven data for the frontend.

**Key features include:**
- Project management with tags and categories
- Team management with guest invites
- Support for a freemium model

This repository (`orbit-plan-backend`) contains the Strapi backend, connected to a PostgreSQL database named `orbit_plan`. It exposes APIs for projects, tags, categories, and teams, secured with JWT authentication.

## Features

### Content Types:
- **Project**: Manages content ideas with title, description, status, scheduled date, tags, categories, and assigned users.
- **Tag**: Labels for organizing projects (e.g., "Social Media").
- **Category**: Broader groupings (e.g., "Marketing").
- **Team**: Supports collaboration with members and guest invite tokens.

### APIs
RESTful endpoints for all content types, accessible with JWT authentication.

### Authentication
JWT-based authentication via Strapi's user-permissions plugin, ready for social login integration (frontend).

### Freemium Model
Planned middleware to limit free-tier users (e.g., max 5 projects).

### Database
Self-hosted PostgreSQL for development, with plans for a managed service (e.g., AWS RDS) in production.

## Tech Stack

- **Strapi**: Headless CMS for content management and API generation (open-source).
- **PostgreSQL**: Relational database for structured data (open-source).
- **Node.js**: Runtime for Strapi.
- **Git**: Version control with GitHub/GitLab.

## Prerequisites

- **Node.js**: v16 or higher (npm included).
- **PostgreSQL**: v13 or higher, installed locally.
- **Git**: For cloning and version control.
- **Postman or curl**: For testing APIs.

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url> orbit-plan-backend
cd orbit-plan-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up PostgreSQL

**Install PostgreSQL:**
- macOS: `brew install postgresql`
- Ubuntu: `sudo apt install postgresql postgresql-contrib`
- Windows: Download from postgresql.org

**Start PostgreSQL:**
- macOS: `brew services start postgresql`
- Ubuntu: `sudo service postgresql start`

**Create database:**
```sql
psql -U postgres
CREATE DATABASE orbit_plan;
\q
```

**(Optional) Create a dedicated user:**
```sql
CREATE USER orbit_plan_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE orbit_plan TO orbit_plan_user;
```

### 4. Configure Environment

Create a `.env` file in orbit-plan-backend:
```
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=orbit_plan
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_secure_password
DATABASE_SSL=false
```

Verify `config/database.js`:
```javascript
module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', '127.0.0.1'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'orbit_plan'),
      user: env('DATABASE_USERNAME', 'postgres'),
      password: env('DATABASE_PASSWORD', 'your_secure_password'),
      ssl: env.bool('DATABASE_SSL', false),
    },
  },
});
```

### 5. Run Strapi
```bash
npm run develop
```

Access the admin panel at http://localhost:1337/admin.  
Create an admin user (e.g., admin@orbitplan.com, password: securepassword).

## Content Types

The backend defines four collection types in Strapi's Content-Type Builder:

### Tag
- **Fields**: Name (Text, Required, Unique)
- **Purpose**: Labels for projects (e.g., "Social Media").

### Category
- **Fields**: Name (Text, Required, Unique)
- **Purpose**: Groupings for projects (e.g., "Marketing").

### Team
- **Fields**:
    - Name (Text, Required)
    - Members (many-to-many Users)
    - GuestInvites (JSON, e.g., `{"tokens": ["xyz789"]}`)
- **Purpose**: Manages team collaboration.

### Project
- **Fields**:
    - Title (Text, Required)
    - Description (Rich Text)
    - projectStatus (Enumeration: Draft, In Progress, Scheduled, Published)
    - scheduledDate (DateTime)
    - tags (many-to-many Tags)
    - categories (many-to-many Categories)
    - users_permissions_users (many-to-many Users)
- **Purpose**: Represents content ideas or tasks.

To view or edit, go to Content-Type Builder in the admin panel.

## API Endpoints

All endpoints require authentication for write operations. Use a JWT token obtained from `/api/auth/local`.

### Projects
- `GET /api/projects?populate=*`: Fetch all projects with relations (tags, categories, users).

**Example response:**
```json
{
  "data": [
    {
      "id": 3,
      "title": "Instagram Campaign",
      "description": "Launch a new Instagram campaign for summer products.",
      "projectStatus": "Draft",
      "scheduledDate": "2025-05-20T04:30:00.000Z",
      "tags": [{ "id": 1, "name": "Social Media" }],
      "categories": [{ "id": 2, "name": "Marketing" }],
      "users_permissions_users": [{ "id": 2, "username": "user" }]
    }
  ],
  "meta": { "pagination": {  } }
}
```

### Other Endpoints
- **Tags**: `GET /api/tags`
- **Categories**: `GET /api/categories`
- **Teams**: `GET /api/teams?populate=*`

**To authenticate:**
```bash
curl -X POST http://localhost:1337/api/auth/local -d 'identifier=admin@orbitplan.com&password=securepassword'
```

**Use the returned jwt in headers:**
```bash
curl -H "Authorization: Bearer <jwt_token>" "http://localhost:1337/api/projects?populate=*"
```

## Permissions

### Public Role
- `find`, `findOne` enabled for Projects, Tags, Categories, Teams.

### Authenticated Role
- `create`, `update`, `delete`, `find`, `findOne` enabled for all content types and Users.

Configure in Settings > Roles in the admin panel.

## Sample Data

Add sample data in Content Manager:

- **Tag**: Social Media
- **Category**: Marketing
- **Team**: Content Creators (Members: admin@orbitplan.com, user@orbitplan.com; GuestInvites: `{"tokens": ["xyz789"]}`)
- **Project**: Instagram Campaign (Status: Draft, Scheduled: 2025-05-20, Tags: Social Media, Categories: Marketing, AssignedUsers: user@orbitplan.com)

## Planned Features

### Guest Invites
Implement a custom controller to generate and validate invite tokens for GuestInvites.

### Freemium Model
Add middleware to limit free-tier users (e.g., max 5 projects).

### Production Database
Transition to a managed PostgreSQL service (e.g., AWS RDS).

## Development Notes

- **Security**: Consider filtering sensitive user fields (e.g., email) in API responses using a custom controller.
- **Version Control**:
    - `.gitignore` includes `node_modules`, `.env`, `build`, `.cache`, `.tmp`.
    - Commit changes regularly:
      ```bash
      git add .
      git commit -m "Update backend"
      git push origin main
      ```
- **Troubleshooting**:
    - Check Strapi logs in `.tmp` for errors.
    - Verify PostgreSQL connection with `pg_isready`.
    - Ensure JWT token is valid for authenticated requests.

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-name`).
3. Commit changes (`git commit -m "Add feature"`).
4. Push to the branch (`git push origin feature-name`).
5. Open a pull request.

## License

This project is licensed under the MIT License. See LICENSE for details.