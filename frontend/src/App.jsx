import React from 'react';
import { BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashBoard';
import BookingForm from './components/forms/BookingForm';




function App() {
  return (
    <BrowserRouter>
     
        <Routes>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/book" element={
            <div className="min-h-screen bg-gray-100 py-10 relative">
              <div className="container mx-auto">
                <BookingForm />
              </div>
            </div>
          } />

          <Route path="*" element={<Navigate to="/admin" replace />} />

        </Routes>
      {/* </Layout> */}
    </BrowserRouter>
  );
}

export default App;