# Scholarship Portal

A full-stack scholarship management system for IIT Bhilai with CSV import, document tracking, and advanced search features.

## Features

- **CSV Import**: Bulk import students and applications with configurable column mapping
- **Advanced Search**: Filter by scholarship, year, batch, branch, income range, gender, application status
- **Document Management**: Track document validity with status (valid/invalid/needs_changes)
- **Email Notifications**: Notify students about document issues and application status
- **Constraints**: Max 2 applications per student, no duplicate applications
- **Admin Dashboard**: Statistics, charts, and quick actions
- **Public Portal**: Students can browse scholarships and check application status

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + Recharts
- **Backend**: Express.js + MongoDB (Mongoose)
- **Authentication**: JWT
- **File Storage**: Local filesystem

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

1. **Install Server Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Install Client Dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Configure Environment**
   
   Edit `server/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/scholarship_portal
   JWT_SECRET=your_secret_key
   ```

4. **Seed Admin User**
   ```bash
   cd server
   npm run seed
   ```
   
   Default credentials:
   - Username: `admin`
   - Password: `admin123`

5. **Start Development Servers**
   
   Terminal 1 (Server):
   ```bash
   cd server
   npm run dev
   ```
   
   Terminal 2 (Client):
   ```bash
   cd client
   npm run dev
   ```

6. **Access the Application**
   - Admin Panel: http://localhost:3000/login
   - Public Portal: http://localhost:3000/

## CSV Import Format

### Student Import Columns
| CSV Column | Database Field |
|------------|----------------|
| S. No | serialNo |
| ID No | rollNo |
| Name | name |
| Course | branch |
| Gender | gender |
| Financial Year | financialYear |
| Batch | batch |
| Year | year |
| Income | income |
| Father Income | fatherIncome |
| Phone | phone |
| Email | email |

### Application Import Columns
| CSV Column | Database Field |
|------------|----------------|
| S. No | serialNo |
| ID No | rollNo |
| Name | name |
| Course | branch |
| Gender | gender |
| Financial Year | financialYear |
| Scholarship Scheme | scholarshipName |
| Amount | amount |
| Fresh / Renewal | applicationType |

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current admin

### Students
- `GET /api/students` - List students with filters
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Scholarships
- `GET /api/scholarships` - List scholarships
- `GET /api/scholarships/active` - Active scholarships
- `POST /api/scholarships` - Create scholarship
- `PUT /api/scholarships/:id` - Update scholarship
- `PATCH /api/scholarships/:id/toggle` - Toggle active status

### Applications
- `GET /api/applications` - List applications with filters
- `GET /api/applications/by-rollno/:rollNo` - Get by roll number
- `POST /api/applications` - Create application
- `PATCH /api/applications/:id/status` - Update status
- `PATCH /api/applications/:id/document/:index` - Review document
- `POST /api/applications/:id/notify` - Send email notification
- `PATCH /api/applications/bulk-status` - Bulk status update

### Import
- `POST /api/import/students` - Import students from CSV
- `POST /api/import/applications` - Import applications from CSV
- `GET /api/import/template` - Download CSV template

### Dashboard
- `GET /api/dashboard` - Dashboard statistics
- `GET /api/dashboard/export` - Export data

## Project Structure

```
/Scholarship_Website
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Layout
│   │   ├── pages/         # All page components
│   │   ├── App.jsx        # Main app with routing
│   │   └── main.jsx       # Entry point
│   └── public/            # Static assets
├── server/                 # Express backend
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   ├── utils/             # Email utility
│   ├── uploads/           # File uploads
│   ├── index.js           # Server entry
│   └── seed.js            # Database seeder
├── IITBhLogo.png          # IIT Bhilai logo
└── README.md
```

## License

MIT
