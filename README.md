# Conference Hall Booking System (CHBS)

A web-based application for managing conference hall bookings, approvals, and administration.

## Project Structure

```
chbs-project/
├── frontend/       React + Vite application
├── backend/        Node.js + Express REST API
```

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS

### Backend
- Node.js
- Express 5
- ODBC
- Sybase

### Backend Setup

1. Navigate to the backend directory:
   ```terminal
   cd backend
   ```

2. Install dependencies:
   ```terminal
   npm install
   ```

3. Create a `.env` file in the backend root with the following variables:
   ```
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   DB_POOL_MAX=your_db_pool_max
   DB_POOL_MIN=your_db_pool_min
   SERVER_PORT=your_server_port
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=your_jwt_expires_in
   CORS_ORIGIN=your_cors_origin
   ```

4. Start the server:
   ```terminal
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```terminal
   cd frontend
   ```

2. Install dependencies:
   ```teminal
   npm install
   ```

3. Start the development server:
   ```terminal
   npm run dev
   ```
