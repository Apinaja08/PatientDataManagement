# Patient Management System

Full-stack Patient Management System with a Node.js/Express/MongoDB backend and a React + Vite + Tailwind frontend.

## Project Structure

```text
Patient_Management/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   └── pages/
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Features

### Patient Data Management
- Add patient
- Update full patient details
- Update address only (`PATCH /patients/:id/address`)
- Auto-calculate age from `dateOfBirth`
- Auto-update age yearly via scheduled cron job

### Appointment Management
- Book appointment
- Check doctor availability (`GET /appointments/availability?doctor=...&date=YYYY-MM-DD`)
- Cancel appointment (`PATCH /appointments/:id/cancel`)
- View and delete appointments

### Frontend (React)
- Dashboard with summary cards and recent data
- Patient management UI (search, add, edit, address update, delete)
- Appointment management UI (book, filter, cancel, delete)
- Doctor availability checker UI

## Tech Stack

### Backend
- Express
- Mongoose
- dotenv
- node-cron
- nodemon

### Frontend
- React
- Vite
- Tailwind CSS
- Axios
- React Router DOM
- React Hot Toast

## Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/patientDB
```

## Run Locally

### 1) Start backend

```bash
cd backend
npm install
npm start
```

Backend runs on `http://localhost:5000`.

### 2) Start frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

## API Quick Reference

### Patients
- `GET /patients`
- `GET /patients/:id`
- `POST /patients`
- `PUT /patients/:id`
- `PATCH /patients/:id/address`
- `DELETE /patients/:id`

### Appointments
- `GET /appointments`
- `GET /appointments/:id`
- `POST /appointments`
- `PUT /appointments/:id`
- `PATCH /appointments/:id/cancel`
- `DELETE /appointments/:id`
- `GET /appointments/availability?doctor=...&date=YYYY-MM-DD`

## Git Notes

- `node_modules` and `.env` are excluded by `.gitignore`
- If dependencies are missing after clone, run `npm install` in both `backend` and `frontend`
