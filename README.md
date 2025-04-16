# Apartment Complaint Management System

A comprehensive web application for managing apartment complex complaints, built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Folder Structure](#folder-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

### User Features
- **User Authentication**: Secure registration and login system
- **Complaint Submission**: Submit new complaints with title, description, category, and priority
- **Complaint Management**: View, edit, and delete complaints based on status
- **Status Tracking**: Track complaints through various statuses (pending, in-progress, resolved, closed, rejected)
- **Payment Processing**: Make payments for resolved complaints
- **Receipt Generation**: View and print payment receipts

### Admin Features
- **User Management**: Add, view, and delete users
- **Complaint Overview**: View and manage all complaints across users
- **Status Updates**: Update complaint status and assign payment amounts
- **Dashboard**: View statistics on complaint statuses
- **Reports**: Generate and view system usage reports

## Technology Stack

### Frontend
- React.js
- React Router for navigation
- Tailwind CSS for styling
- Axios for API requests

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication

### Development Tools
- Vite.js for frontend development
- Nodemon for backend development
- ESLint for code linting
- Git for version control

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14.x or later)
- [npm](https://www.npmjs.com/) (v6.x or later)
- [MongoDB](https://www.mongodb.com/) (v4.x or later)
- [Git](https://git-scm.com/)

## Installation

### Clone the Repository

```bash
git clone https://github.com/yourusername/apartment-complaint-system.git
cd apartment-complaint-system
```

### Install Backend Dependencies

```bash
cd backend
npm install
```

### Install Frontend Dependencies

```bash
cd ../
npm install
```

## Configuration

### Backend Configuration

Create a `.env` file in the `backend` directory with the following variables:

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/complaint_system
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
```

Replace `your_jwt_secret_key` with a secure random string.

### Frontend Configuration

The frontend is configured to connect to the backend API at `http://localhost:5000/api`. If you need to change this, update the `baseURL` in `src/services/api.js`.

## Running the Application

### Development Mode

#### Start the Backend Server

```bash
cd backend
npm run dev
```

This will start the backend server on port 5000 with nodemon for automatic reloading.

#### Start the Frontend Development Server

```bash
# From the root directory
npm run dev
```

This will start the Vite development server, typically on port 5173 or 5174.

### Production Mode

#### Build the Frontend

```bash
npm run build
```

This will create a production build in the `dist` directory.

#### Start the Production Server

```bash
cd backend
npm start
```

This will serve the backend API and the frontend build from the `dist` directory.

## Usage Guide

### User Guide

1. **Registration and Login**
   - Register with your name, email, password, and door number
   - Login with your email and password

2. **Dashboard**
   - View a summary of your complaints by status
   - Access quick links to common actions

3. **Submitting a Complaint**
   - Navigate to "New Complaint"
   - Fill in the title, description, category, and priority
   - Submit the form

4. **Managing Complaints**
   - View all your complaints in "My Complaints"
   - Filter complaints by status (pending, in-progress, resolved, closed, rejected)
   - Edit or delete complaints in pending status
   - View detailed information about each complaint

5. **Making Payments**
   - When a complaint is resolved, a payment button will appear
   - Enter your payment details and complete the transaction
   - View and print the payment receipt

### Admin Guide

1. **Login**
   - Login with admin credentials

2. **Dashboard**
   - View statistics on complaint statuses
   - Access quick links to admin functions

3. **Managing Users**
   - View all users in the system
   - Add new users with door numbers
   - Delete existing users

4. **Managing Complaints**
   - View all complaints across users
   - Filter complaints by status
   - Update complaint status (pending, in-progress, resolved, rejected)
   - Assign payment amounts to resolved complaints
   - View payment status for complaints

5. **Reports**
   - View user activity and complaint resolution metrics

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/user` - Get current user info

### User Endpoints

- `GET /api/complaints` - Get user's complaints
- `POST /api/complaints` - Create a new complaint
- `GET /api/complaints/:id` - Get a specific complaint
- `PUT /api/complaints/:id` - Update a complaint
- `DELETE /api/complaints/:id` - Delete a complaint
- `POST /api/complaints/:id/payment` - Process payment for a complaint

### Admin Endpoints

- `GET /api/admin/complaints` - Get all complaints
- `PUT /api/admin/complaints/:id` - Update complaint status
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create a new user
- `DELETE /api/admin/users/:id` - Delete a user
- `GET /api/admin/stats` - Get dashboard statistics

## Folder Structure

```
apartment-complaint-system/
├── backend/                  # Backend code
│   ├── config/               # Configuration files
│   ├── controllers/          # Route controllers
│   ├── middleware/           # Custom middleware
│   ├── models/               # Mongoose models
│   ├── routes/               # API routes
│   └── server.js             # Entry point
├── public/                   # Public assets
├── src/                      # Frontend code
│   ├── components/           # React components
│   │   ├── admin/            # Admin components
│   │   ├── auth/             # Authentication components
│   │   ├── complaint/        # Complaint components
│   │   └── layout/           # Layout components
│   ├── context/              # React context
│   ├── services/             # API services
│   ├── App.jsx               # Main App component
│   └── main.jsx              # Entry point
├── .env                      # Environment variables
├── .gitignore                # Git ignore file
├── package.json              # Project dependencies
└── README.md                 # Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React.js](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite.js](https://vitejs.dev/)
