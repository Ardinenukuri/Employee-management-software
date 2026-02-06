
# 🏢 Employee Management System API (Senior Edition)

This is a high-scale, production-ready RESTful API built with **NestJS v11**. It implements an advanced **Role-Based Access Control (RBAC)** system and a hybrid reporting engine designed for both speed and scale.

## 🌟 Key Engineering Highlights
- **Hybrid Reporting Engine:** Supports both **Direct Synchronous Downloads** for quick lookups and a **Non-blocking Asynchronous Pattern** (Bull/Redis) for high-scale data processing.
- **Role-Based Security:** Strict division of duties. Admins manage the workforce; Employees manage their own attendance.
- **100% Logic Coverage:** Enforced **100% testing threshold** across all Services, Controllers, and Guards.
- **Data Integrity:** **Hard-delete cascading** ensures that deleting an employee automatically sanitizes all associated historical records.

---

## 🛠 Prerequisites
- **Node.js:** v18.x or higher
- **MySQL:** v8.0+ 
- **Redis:** Required for background job processing (Bull) and email queuing.

---

## 🚀 Quick Start

1.  **Install:** `npm install`
2.  **Config:** Create a `.env` file (see `.env.example`).
3.  **Database:** `CREATE DATABASE employee_management;`
4.  **Start Services:**
    ```bash
    # Start Redis (WSL/Linux)
    sudo service redis-server start
    
    # Start NestJS
    npm run start:dev
    ```

---

## 🧪 Comprehensive Testing Guide

Access the Swagger UI: **[http://localhost:3000/api](http://localhost:3000/api)**

### Phase 1: The Administrator's Journey (Management)

**1. Create the Admin Account**
- `POST /auth/register` a new user.
- **Database Action:** Open your MySQL client and manually change this user's `role` column from `'employee'` to `'admin'`.
- `POST /auth/login` to get your **Admin JWT**. 
- Click **"Authorize"** at the top of Swagger and enter `Bearer [YOUR_TOKEN]`.

**2. Oversight & Reporting (Two Methods)**
*   **Method A: Quick Download (Synchronous)** 
    - `GET /reports/attendance/pdf`: Returns the PDF file immediately in the response.
    - `GET /reports/attendance/excel`: Returns the Excel file immediately.
    - *Best for: Daily or weekly reports with small datasets.*
*   **Method B: Scalable Export (Asynchronous)** 
    - `POST /reports/attendance/generate`: Trigger a background job. Returns a `jobId`.
    - `GET /reports/status/{jobId}`: Poll to check if the worker is finished.
    - `GET /reports/download/{jobId}`: Retrieve the final file once completed.
    - *Best for: Annual reports or datasets with 10,000+ records.*

**3. Manage the Workforce**
- `GET /employees`: View the full paginated list of company staff.
- `PATCH /employees/{id}`: Update employee details or roles.
- `DELETE /employees/{id}`: Terminate an employee. All associated attendance data is deleted automatically.

---

### Phase 2: The Employee's Journey (Self-Service)

**1. Track Attendance**
- `POST /attendance/clock-in`: **Expected:** `201 Created`. Check console for "Sending Email" log (Queued via Bull).
- `POST /attendance/clock-out`: **Expected:** `200 OK`.
- **Validation Check:** Try to clock-in twice. **Expected:** `409 Conflict`.

**2. Security/Boundary Testing**
- Attempt to call **any** `/reports/` or `/employees/` endpoint with an Employee token.
- **Expected Result:** `403 Forbidden`.

---

## 📊 Expected API Responses

| Action | Success Code | Error Code | Reason |
| :--- | :--- | :--- | :--- |
| **Quick PDF Download** | `200 OK` | `403 Forbidden` | Only Admins can export data |
| **Clock-In** | `201 Created` | `409 Conflict` | User already clocked in today |
| **Terminating User** | `200 OK` | `404 Not Found` | User ID does not exist |
| **Reset Password** | `201 Created` | `401 Unauthorized` | Invalid or expired reset token |

---

## 🛠 Quality Assurance

### Automated Coverage
This project maintains a strict **100% coverage threshold** for business logic.
```bash
npm run test:cov
```

### Security Headers (Helmet)
Every response includes industry-standard protection. Verify in the browser "Network" tab:
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security: max-age=31536000`
- `X-Frame-Options: SAMEORIGIN`

---

### Senior Architectural Note
> "I implemented a dual-mode reporting system. While synchronous endpoints provide immediate utility for daily tasks, the **Asynchronous Producer-Consumer architecture** (using Bull/Redis) ensures the API remains non-blocking and responsive during heavy data exports, a requirement for any enterprise-grade system."
