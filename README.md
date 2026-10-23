# Business Cards REST API (Node.js & Express)

A robust, production-grade RESTful API for a business management web application built with **Node.js**, **Express**, and **MongoDB**. This project allows regular users to explore and favorite business cards, while verified business owners can create, manage, and publish their cards. Full administrator privileges allow comprehensive oversight across users and cards.

---

## 🚀 Features

- **User Authentication & Authorization**:
  - Encrypted passwords using `bcrypt`.
  - Secure, signed JSON Web Tokens (`jsonwebtoken`) storing `_id`, `isBusiness`, and `isAdmin`.
  - Granular role-based access control guards: `authGuard`, `businessGuard`, and `adminGuard`.
  - **Account Locking (Security Bonus)**: Automatically locks an account for 24 hours after 3 consecutive failed login attempts on the same email.

- **Business Card Management**:
  - Full CRUD operations on business cards.
  - Automatic unique 7-digit `bizNumber` generator.
  - Like/Unlike card functionality for registered users.
  - Users can view and manage their own cards via `/cards/my-cards`.
  - **Admin Card Number Edit (Bonus)**: Admins can assign custom business numbers while guaranteeing uniqueness.

- **Logging & Diagnostics**:
  - Real-time colored console logging with `morgan` and `chalk` (displaying timestamp, HTTP method, URL, status code, and response time).
  - **File Error Logger (Bonus)**: Daily log files created under `/logs/YYYY-MM-DD.log` capturing every request error with status $\ge 400$.

- **Static Fallback & Error Handling**:
  - Unhandled requests route to the `/public` static folder.
  - Proper `404 Not Found` JSON responses when static files or routes don't exist.
  - Standardized JSON error and validation messages.

- **Data Validation & Integrity**:
  - Strict input validation using `Joi` with custom Israeli phone formats, password strength requirements, and URI checks.
  - Mongoose models with subdocument schemas conforming to project specifications.
  - Pre-seeded initial data on startup (1 regular user, 1 business user, 1 admin user, and 3 sample business cards).

---

## 🛠️ Tech Stack & Dependencies

- **Node.js** (ES Modules)
- **Express.js** v5
- **MongoDB** & **Mongoose** v9
- **Bcrypt** for password hashing
- **JSON Web Token (JWT)** for stateless sessions
- **Joi** for request payload schema validation
- **Morgan** & **Chalk** for colored HTTP terminal logging
- **Moment** for accurate date formatting
- **CORS** & **Dotenv** for environment configuration

---

## 📁 Project Structure

```text
FinalProject-NodeJS/
├── controllers/
│   ├── cards.js           # Cards endpoints (GET, POST, PUT, PATCH, DELETE)
│   └── users.js           # Users endpoints (GET, POST, PUT, PATCH, DELETE)
├── middlewares/
│   ├── guard.js           # JWT authentication and authorization guards
│   └── logger.js          # Morgan console logger and daily file error logger
├── models/
│   ├── Card.js            # Card Mongoose schema and model
│   └── User.js            # User Mongoose schema and model
├── public/
│   └── index.html         # Static fallback landing page
├── services/
│   ├── bizNumber.service.js # Unique business number generation
│   ├── seed.service.js      # Initial seed for users and cards
│   └── user.service.js      # User registration and login business logic
├── validation/
│   ├── card.validation.js # Joi schemas for card creation and update
│   └── user.validation.js # Joi schemas for registration, edit, and login
├── logs/                  # Daily error log files (e.g., 2026-10-16.log)
├── docs/                  # Project specifications and documentation
├── app.js                 # Express application entrypoint
├── package.json           # Dependencies and project scripts
└── .env                   # Environment variables
```

---

## ⚙️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository_url>
   cd FinalProject-NodeJS
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create or edit the `.env` file in the root directory:
   ```env
   PORT=3000
   MONGO_URL=mongodb://127.0.0.1:27017/business_cards_db
   JWT_SECRET=YOUR_SUPER_SECRET_KEY_HERE
   TOKEN_EXPIRES_IN=24h
   FRONTEND_URL=*
   ```

4. **Run the server**:
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Standard start
   npm start
   ```

Upon launch, the server connects to MongoDB, seeds initial users and cards if the database is empty, and begins listening on the configured port.

---

## 🔑 Initial Demo Accounts

The database is pre-seeded with three accounts (all using password `Aa1234!`):

| Role | Email | Password | Business Status | Admin Status |
| :--- | :--- | :--- | :--- | :--- |
| **Regular User** | `regular@gmail.com` | `Aa1234!` | `false` | `false` |
| **Business User** | `business@gmail.com` | `Aa1234!` | `true` | `false` |
| **Admin User** | `admin@gmail.com` | `Aa1234!` | `true` | `true` |

---

## 📡 API Endpoints

### 👤 Users (`/users`)

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/users` | None | Register a new user |
| `POST` | `/users/login` | None | Authenticate user & retrieve JWT token |
| `GET` | `/users` | Admin | Retrieve all users |
| `GET` | `/users/:id` | Own User or Admin | Retrieve specific user details |
| `PUT` | `/users/:id` | Own User | Edit user information |
| `PATCH`| `/users/:id` | Own User | Toggle `isBusiness` status |
| `DELETE`| `/users/:id`| Own User or Admin | Delete user account |

### 📇 Cards (`/cards`)

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/cards` | None | Retrieve all cards |
| `GET` | `/cards/my-cards` | Registered User | Retrieve all cards created by the logged-in user |
| `GET` | `/cards/:id` | None | Retrieve single card by ID |
| `POST` | `/cards` | Business User | Create a new business card |
| `PUT` | `/cards/:id` | Card Creator | Update card details |
| `PATCH`| `/cards/:id` | Registered User | Like / Unlike a card |
| `PATCH`| `/cards/biz-number/:id` | Admin *(Bonus)* | Change a card's unique business number |
| `DELETE`| `/cards/:id`| Card Creator or Admin | Delete a card |

---

## 🔒 Security & Best Practices

- **Strict Schema Validation**: All user and card payloads are checked with Joi before any DB operation.
- **Password Security**: Passwords require uppercase, lowercase, numbers, and special characters; passwords are never returned in responses.
- **Protection Against Brute-force**: Consecutive incorrect password attempts lock the account for 24 hours.
- **Clean Architecture**: Modularity is strictly enforced — all source files adhere to clean coding guidelines and remain under 200 lines.

