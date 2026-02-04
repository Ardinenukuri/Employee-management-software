# Employee Management API

This is a RESTful API for a simple employee management system, built with NestJS.

## Features

-   **Authentication:** JWT-based authentication (Register, Login).
-   **RBAC:** Role-based access control (Admin, Employee).
-   **Employee Management:** CRUD operations for employees (Admin only).
-   **Attendance Tracking:** Clock-in and Clock-out functionality for employees.
-   **Queued Notifications:** Emails are sent via a background queue (Redis/Bull) upon clock-in.
-   **Reporting:** Generate daily attendance reports in PDF and Excel formats.

## Stack

-   [NestJS](https://nestjs.com/) v11
-   [TypeORM](https://typeorm.io/) with MySQL
-   [PassportJS](http://www.passportjs.org/) for authentication
-   [Jest](https://jestjs.io/) for testing
-   [Swagger](https://swagger.io/) for API documentation
-   [Bull](https://github.com/OptimalBits/bull) for message queues with Redis
-   `jsPDF` & `exceljs` for report generation

---

## Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   NPM
-   MySQL Server
-   Redis Server
-   [Docker](https://www.docker.com/) (recommended for running MySQL and Redis)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/employee-management-api.git
    cd employee-management-api
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Configuration

1.  Create a `.env` file in the root of the project by copying the example file:
    ```bash
    cp .env.example .env
    ```

2.  Update the `.env` file with your database, JWT, and Redis credentials.

    ```ini
    # .env
    DB_HOST=localhost
    DB_PORT=3306
    DB_USERNAME=your_db_user
    DB_PASSWORD=your_db_password
    DB_DATABASE=employee_management

    JWT_SECRET=YOUR_SUPER_SECRET_KEY
    JWT_EXPIRATION_TIME=3600s

    REDIS_HOST=localhost
    REDIS_PORT=6379

    PORT=3000
    ```

### Running the Application

```bash
# Development mode with hot-reloading
npm run start:dev
```

The application will be running on `http://localhost:3000`.

### Running Tests

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run test coverage
npm run test:cov
```

---

## API Documentation

Once the application is running, you can access the Swagger UI for interactive API documentation at:

[http://localhost:3000/api](http://localhost:3000/api)