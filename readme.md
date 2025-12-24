# 🚀 Project Management API

A **role-based Project Management REST API** built with **Node.js, Express, MongoDB**, featuring **secure authentication**, **project-level RBAC**, and modular architecture. This backend powers collaborative project, task, subtask, and note management similar to tools like Jira or Asana.

---

## 📌 Key Features

* 🔐 **JWT Authentication** (Access + Refresh Tokens)
* 🍪 **Secure httpOnly Cookie-based Auth**
* 👥 **Role-Based Access Control (RBAC)**

  * Global roles (Admin, User)
  * Project-level roles (Project Admin, Member, Viewer)
* 📁 **Project Management**
* ✅ **Task & Subtask Management**
* 📝 **Project Notes**
* 🧩 **Scalable Middleware-based Authorization**
* 🛡️ Production-ready security patterns

---

## 🏗️ Tech Stack

* **Backend**: Node.js, Express.js
* **Database**: MongoDB + Mongoose
* **Authentication**: JWT (Access & Refresh Tokens)
* **Authorization**: Custom RBAC Middleware
* **Validation**: Custom API Errors & Handlers

---

## 🔑 Roles & Permissions

### 🌍 Global Roles

| Role  | Description                 |
| ----- | --------------------------- |
| ADMIN | Full system access          |
| USER  | Standard authenticated user |

### 📂 Project-Level Roles

| Role           | Permissions               |
| -------------- | ------------------------- |
| PROJECT_ADMIN  | Full control over project |
| PROJECT_MEMBER | Create & update tasks     |
| VIEWER         | Read-only access          |

---

## 🔐 Authentication Flow

1. User logs in → Access & Refresh tokens generated
2. Tokens stored in **httpOnly cookies**
3. Access token used for API authorization
4. Refresh token rotates when access token expires
5. Logout clears cookies & invalidates refresh token in DB

---

## 📁 API Routes

### 🗂️ Project Routes (`/api/v1/projects`)

| Method | Endpoint                      | Access         |
| ------ | ----------------------------- | -------------- |
| GET    | `/`                           | Authenticated  |
| POST   | `/`                           | Authenticated  |
| GET    | `/:projectId`                 | Project Member |
| PUT    | `/:projectId`                 | Admin only     |
| DELETE | `/:projectId`                 | Admin only     |
| GET    | `/:projectId/members`         | Project Member |
| POST   | `/:projectId/members`         | Project Admin  |
| PUT    | `/:projectId/members/:userId` | Project Admin  |
| DELETE | `/:projectId/members/:userId` | Project Admin  |

---

### ✅ Task Routes (`/api/v1/tasks`)

| Method | Endpoint                         | Access                 |
| ------ | -------------------------------- | ---------------------- |
| GET    | `/:projectId`                    | Project Member         |
| POST   | `/:projectId`                    | Project Admin / Member |
| GET    | `/:projectId/t/:taskId`          | Project Member         |
| PUT    | `/:projectId/t/:taskId`          | Project Admin          |
| DELETE | `/:projectId/t/:taskId`          | Project Admin          |
| POST   | `/:projectId/t/:taskId/subtasks` | Project Admin          |
| PUT    | `/:projectId/st/:subTaskId`      | Project Member         |
| DELETE | `/:projectId/st/:subTaskId`      | Project Admin          |

---

### 📝 Notes Routes (`/api/v1/notes`)

| Method | Endpoint                | Access         |
| ------ | ----------------------- | -------------- |
| GET    | `/:projectId`           | Project Member |
| POST   | `/:projectId`           | Project Admin  |
| GET    | `/:projectId/n/:noteId` | Project Member |
| PUT    | `/:projectId/n/:noteId` | Project Admin  |
| DELETE | `/:projectId/n/:noteId` | Project Admin  |

---

### ❤️ Health Check

```
GET /api/v1/healthcheck
```

---

## 🧠 Authorization Architecture

* **authenticate** → validates JWT & attaches user
* **resolveProjectRole** → determines user role in project
* **allowProjectRoles(...)** → checks allowed project roles
* **adminOnly** → global admin enforcement

This keeps controllers **clean and business-focused**.

---

## 🛠️ Environment Variables

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/projectdb
CORS = *
ACCESS_TOKEN_EXPIRY = your_access_expiry
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY=your_refresh_expiry
NODE_ENV=development
MAILTRAP_SMTP_HOST = your-creditianls
MAILTRAP_SMTP_PORT =your-creditianls
MAILTRAP_SMTP_USER=your-creditianls
MAILTRAP_SMTP_PASSWORD=your-creditianls

FORGOT_PASSWORD_REDIRECT_URL = http://localhost:3000/forgot-password 

```

---

## ▶️ Run Locally

```bash
# Install dependencies
npm install

# Start server
npm run dev
```

---

## 📈 Future Improvements

* Refresh token reuse detection
* Audit logs
* Project invitations via email
* Rate limiting
* Swagger / OpenAPI docs

---

## ✅ Project Quality Notes

* Middleware-driven RBAC (industry standard)
* No role logic inside controllers
* Secure cookie-based authentication
* Easily extensible for SaaS products

---

## 👨‍💻 Author

**Yash **
Backend Developer | API & System Design Enthusiast

---
