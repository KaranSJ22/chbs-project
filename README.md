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
- Sequelize ORM
- MySQL

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
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=conference_hall_system
   DB_DIALECT=mysql
   DB_POOL_MAX=15
   DB_POOL_MIN=0
   DB_POOL_ACQUIRE=30000
   DB_POOL_IDLE=10000
   SERVER_PORT=3000
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

   The application will be available at `http://localhost:5173`.


