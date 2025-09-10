# 🚀 CRM Application - Full Stack MERN Project

A modern, feature-rich Customer Relationship Management (CRM) application built with the MERN stack. This application provides comprehensive customer and lead management capabilities with real-time updates, drag-and-drop functionality, and an intuitive dashboard.

![CRM Dashboard](https://img.shields.io/badge/Status-Active-brightgreen)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue)
![License](https://img.shields.io/badge/License-ISC-yellow)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## ✨ Features

### 🔐 Authentication & Authorization
- User registration and login with JWT tokens
- Protected routes and middleware
- Role-based access control
- Secure password hashing with bcrypt

### 👥 Customer Management
- Complete CRUD operations for customers
- Advanced search and filtering
- Pagination support
- Drag-and-drop row reordering
- Bulk operations (delete multiple customers)
- Customer detail views with lead management

### 🎯 Lead Management
- Lead creation and management under customers
- Lead status tracking (New, Contacted, Converted, Lost)
- Lead value tracking
- Status-based filtering
- Real-time updates via WebSocket

### 📊 Dashboard & Analytics
- Interactive dashboard with KPI cards
- Customer and lead statistics
- Time-series charts using Recharts
- Real-time data visualization

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Dark/Light theme support
- Modern component library (shadcn/ui)
- Smooth animations and transitions
- Drag-and-drop interface
- Toast notifications

### 🔄 Real-time Features
- WebSocket integration for live updates
- Real-time notifications
- Live data synchronization

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Joi** - Data validation
- **Socket.io** - Real-time communication
- **Jest** - Testing framework
- **bcryptjs** - Password hashing

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Component library
- **Recharts** - Data visualization
- **@dnd-kit** - Drag and drop
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Unit testing
- **Nodemon** - Development server

## 📁 Project Structure

```
crm/
├── backend/                    # Node.js/Express backend
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── controllers/       # Route controllers
│   │   ├── middlewares/       # Custom middleware
│   │   ├── models/           # Mongoose models
│   │   ├── routes/           # API routes
│   │   ├── validators/       # Joi validation schemas
│   │   ├── app.js            # Express app configuration
│   │   └── server.js         # Server entry point
│   ├── tests/                # Backend tests
│   ├── package.json
│   └── jest.config.js
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── api/              # API configuration
│   │   ├── components/       # Reusable components
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── modals/       # Modal components
│   │   │   └── Sidebar/      # Navigation components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions
│   │   ├── pages/            # Page components
│   │   ├── redux/            # Redux store and slices
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # App entry point
│   ├── public/               # Static assets
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/grep-many/crm.git
cd crm
```

### 2. Install Dependencies

Install backend dependencies:
```bash
cd backend
npm install
```

Install frontend dependencies:
```bash
cd ../frontend
npm install
```

## 🔧 Environment Variables

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/crm_database
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/crm_database

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
```

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start the Backend Server:**
```bash
cd backend
npm run dev
```
The backend will start on `http://localhost:5000`

2. **Start the Frontend Development Server:**
```bash
cd frontend
npm run dev
```
The frontend will start on `http://localhost:5173`

3. **Access the Application:**
Open your browser and navigate to `http://localhost:5173`

### Production Mode

1. **Build the Frontend:**
```bash
cd frontend
npm run build
```

2. **Start the Backend in Production:**
```bash
cd backend
npm start
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register a new user | `{ name, email, password }` |
| POST | `/api/auth/login` | Login user | `{ email, password }` |

### Customer Endpoints

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| GET | `/api/customers` | Get all customers | `page`, `limit`, `search` |
| POST | `/api/customers` | Create new customer | `{ name, email, phone, company }` |
| GET | `/api/customers/:id` | Get customer by ID | - |
| PUT | `/api/customers/:id` | Update customer | `{ name, email, phone, company }` |
| DELETE | `/api/customers/:id` | Delete customer | - |

### Lead Endpoints

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| GET | `/api/customers/:customerId/leads` | Get customer leads | `status` |
| POST | `/api/customers/:customerId/leads` | Create new lead | `{ title, description, value, status }` |
| PUT | `/api/customers/:customerId/leads/:leadId` | Update lead | `{ title, description, value, status }` |
| DELETE | `/api/customers/:customerId/leads/:leadId` | Delete lead | - |

### WebSocket Events

| Event | Description | Data |
|-------|-------------|------|
| `connect` | Client connects | - |
| `disconnect` | Client disconnects | - |
| `customer_updated` | Customer data updated | `{ customer }` |
| `lead_updated` | Lead data updated | `{ lead, customerId }` |

## 🗄 Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  passwordHash: String,
  role: String (default: 'user'),
  createdAt: Date,
  updatedAt: Date
}
```

### Customer Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  company: String,
  ownerId: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Lead Model
```javascript
{
  _id: ObjectId,
  customerId: ObjectId (ref: Customer),
  title: String,
  description: String,
  status: String (enum: ['New', 'Contacted', 'Converted', 'Lost']),
  value: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/DigitalOcean)

1. **Set Environment Variables:**
   - `PORT` (auto-set by platform)
   - `MONGODB_URI`
   - `JWT_SECRET`

2. **Deploy:**
```bash
cd backend
git push heroku main
```

### Frontend Deployment (Netlify/Vercel)

1. **Set Environment Variables:**
   - `VITE_API_URL` (your deployed backend URL)

2. **Deploy:**
```bash
cd frontend
npm run build
# Upload dist folder to your hosting platform
```

### Docker Deployment

The project includes optimized Docker configuration for easy deployment:

#### Quick Start with Docker

1. **Clone and navigate to the project:**
```bash
git clone https://github.com/grep-many/crm.git
cd crm
```

2. **Start all services:**
```bash
docker-compose up -d
```

3. **Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

#### Docker Services

- **Frontend**: React app with Vite dev server (Port 5173)
- **Backend**: Node.js API server (Port 5000)
- **MongoDB**: Database with persistent storage (Port 27017)

#### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build -d

# Remove all containers and volumes
docker-compose down -v
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [React](https://reactjs.org/) and [Express.js](https://expressjs.com/) communities
- [MongoDB](https://www.mongodb.com/) for the database solution

---

**Happy Coding! 🎉**