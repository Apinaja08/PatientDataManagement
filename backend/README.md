# Patient Management System — Backend

A RESTful backend API built with **Node.js**, **Express**, and **MongoDB (Mongoose)** for managing patients and appointments.

---

## Tech Stack

| Package     | Purpose                              |
|-------------|--------------------------------------|
| express     | HTTP server and routing              |
| mongoose    | MongoDB ODM                          |
| dotenv      | Environment variable management      |
| node-cron   | Scheduled jobs (auto age update)     |
| nodemon     | Auto-restart server on file changes  |

---

## Folder Structure

```
backend/
├── models/
│   ├── patient.js            # Patient schema with auto age calculation
│   └── Appointment.js        # Appointment schema
├── routes/
│   ├── patientRoutes.js      # Patient CRUD + address update
│   └── appointmentRoutes.js  # Appointment CRUD + availability + cancel
├── utils/
│   └── cronJobs.js           # Scheduled job: auto-update age every year
├── .env                      # Environment variables (not committed to git)
├── .gitignore
├── package.json
├── server.js                 # Entry point
└── README.md
```

---

## Setup & Run

### 1. Prerequisites
- Node.js installed
- MongoDB running locally (`mongodb://localhost:27017`)

### 2. Install dependencies
```bash
cd backend
npm install
```

### 3. Configure environment
The `.env` file is already created with:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/patientDB
```

### 4. Start the server
```bash
npm start
```
Expected output:
```
Server running on port 5000
MongoDB Connected
[CRON] Daily age update job scheduled (runs at midnight).
```

---

## Changes Made

### `models/patient.js` — Updated
- Added `dateOfBirth` (Date, required) — source of truth for age
- Changed `age` to be **auto-calculated** — no longer manually provided
- Added a Mongoose `pre("save")` hook that calculates age from `dateOfBirth` every time a patient is saved

**Why:** Age should never be entered manually. It must be derived from the date of birth and updated automatically every year.

---

### `models/Appointment.js` — No changes
- Keeps `patient` (ref), `doctor`, `date`, `reason`, `status`
- `status` enum: `Scheduled` | `Completed` | `Cancelled`

---

### `routes/patientRoutes.js` — Updated
Added a new endpoint:

| Method | Endpoint               | Description             |
|--------|------------------------|-------------------------|
| PATCH  | `/patients/:id/address` | Update address only     |

All existing CRUD endpoints remain:

| Method | Endpoint          | Description          |
|--------|-------------------|----------------------|
| GET    | `/patients`        | Get all patients     |
| GET    | `/patients/:id`    | Get one patient      |
| POST   | `/patients`        | Add a new patient    |
| PUT    | `/patients/:id`    | Update full patient  |
| DELETE | `/patients/:id`    | Delete a patient     |

---

### `routes/appointmentRoutes.js` — Updated
Added two new endpoints:

| Method | Endpoint                         | Description                          |
|--------|----------------------------------|--------------------------------------|
| GET    | `/appointments/availability`     | Check doctor availability on a date  |
| PATCH  | `/appointments/:id/cancel`       | Cancel a specific appointment        |

All existing CRUD endpoints remain:

| Method | Endpoint              | Description               |
|--------|-----------------------|---------------------------|
| GET    | `/appointments`        | Get all appointments      |
| GET    | `/appointments/:id`    | Get one appointment       |
| POST   | `/appointments`        | Book a new appointment    |
| PUT    | `/appointments/:id`    | Update appointment        |
| DELETE | `/appointments/:id`    | Delete appointment        |

---

### `utils/cronJobs.js` — New File
- Schedules a job using `node-cron` that runs **every day at midnight**
- Finds all patients whose birthday is today
- Recalculates and saves their updated age
- Logs each update to the console

**Cron expression:** `0 0 * * *` = every day at 00:00

---

### `server.js` — Updated
- Added `require("dotenv").config()` to load `.env`
- Replaced hard-coded MongoDB URL with `process.env.MONGO_URI`
- Replaced hard-coded port `5000` with `process.env.PORT`
- Added `startAgeUpdateJob()` call after MongoDB connects successfully

---

### `.env` — New File
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/patientDB
```

---

### `.gitignore` — New File
```
node_modules/
.env
```

---

## API Reference & Postman Testing

### Base URL
```
http://localhost:5000
```

---

### Patient Endpoints

#### Add Patient
```
POST /patients
Content-Type: application/json
```
```json
{
  "name": "John Doe",
  "dateOfBirth": "1990-03-15",
  "gender": "Male",
  "contact": "0771234567",
  "address": "123 Main St",
  "medicalHistory": "Diabetes"
}
```
> Age is auto-calculated from `dateOfBirth`. Do NOT send `age` manually.

---

#### Get All Patients
```
GET /patients
```

---

#### Get One Patient
```
GET /patients/:id
```

---

#### Update Patient (full)
```
PUT /patients/:id
Content-Type: application/json
```
```json
{
  "name": "John Doe Updated",
  "dateOfBirth": "1990-03-15",
  "gender": "Male",
  "contact": "0779999999"
}
```

---

#### Update Address Only
```
PATCH /patients/:id/address
Content-Type: application/json
```
```json
{
  "address": "456 New Road, Colombo"
}
```

---

#### Delete Patient
```
DELETE /patients/:id
```

---

### Appointment Endpoints

#### Check Doctor Availability
```
GET /appointments/availability?doctor=Dr.Smith&date=2026-03-10
```
**Response (available):**
```json
{ "available": true, "message": "Dr.Smith is available on 2026-03-10" }
```
**Response (not available):**
```json
{
  "available": false,
  "message": "Dr.Smith has 2 appointment(s) on 2026-03-10",
  "appointments": [...]
}
```

---

#### Book Appointment
```
POST /appointments
Content-Type: application/json
```
```json
{
  "patient": "<patient _id>",
  "doctor": "Dr. Smith",
  "date": "2026-03-10T09:00:00.000Z",
  "reason": "Regular checkup",
  "status": "Scheduled"
}
```

---

#### Get All Appointments
```
GET /appointments
```
> Returns appointments with patient `name` and `contact` populated.

---

#### Get One Appointment
```
GET /appointments/:id
```

---

#### Update Appointment
```
PUT /appointments/:id
Content-Type: application/json
```
```json
{
  "doctor": "Dr. Johnson",
  "date": "2026-03-12T10:00:00.000Z"
}
```

---

#### Cancel Appointment
```
PATCH /appointments/:id/cancel
```
No body needed. Changes status to `"Cancelled"`.

> Returns 400 if appointment is already cancelled.

---

#### Delete Appointment
```
DELETE /appointments/:id
```

---

## Postman Setup Tips

1. Open Postman → click **New** → **Request**
2. For POST/PUT/PATCH requests:
   - Click **Body** tab
   - Select **raw**
   - Change dropdown to **JSON**
   - Paste the JSON body
3. Copy `_id` values from POST responses and paste them into URL paths for GET/PUT/PATCH/DELETE calls
