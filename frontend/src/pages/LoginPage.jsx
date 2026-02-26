import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: sessionLoading, user } = useAuth();

  const [loginType, setLoginType] = useState('EMPLOYEE'); // 'EMPLOYEE' | 'PA'
  const [empDetails, setEmpDetails] = useState({ empCode: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  if (sessionLoading) return null;
  
  if (isAuthenticated) {
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'PA') return <Navigate to="/pa" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmpDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { empCode, password } = empDetails;
      const response = await login(empCode, password, loginType);
      const role = response.user.role;

      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'PA') navigate('/pa');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isPA = loginType === 'PA';

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('/assets/login-bg.jpg')" }}
    >
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl flex-col md:flex-row">

        {/* Left Section (Branding) */}
        <div className="relative flex w-full flex-col items-center justify-center bg-blue-700 p-12 text-white md:w-1/2">
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-6 p-4">
              <img
                src="/assets/logo.png"
                alt="ISRO/CHBS Logo"
                className="h-24 w-auto object-contain drop-shadow-lg"
              />
            </div>
            <h1 className="mb-2 text-4xl font-bold tracking-tight">CHBS Portal</h1>
            <p className="text-blue-200 text-lg">Conference Hall Booking System</p>
            <div className="mt-8 h-1 w-16 bg-blue-500 rounded-full"></div>
          </div>
        </div>

        {/* Right Section (Login Form) */}
        <div className="flex w-full flex-col justify-center bg-white p-12 md:w-1/2">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-500 mt-2">Select your login type to continue.</p>
          </div>

          {/* Login Type Toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-6">
            <button
              type="button"
              onClick={() => { setLoginType('EMPLOYEE'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors duration-200
                ${!isPA ? 'bg-blue-700 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              Employee / Admin
            </button>
            <button
              type="button"
              onClick={() => { setLoginType('PA'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors duration-200
                ${isPA ? 'bg-blue-700 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              Front Office
            </button>
          </div>

          {isPA && (
            <p className="mb-4 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded px-3 py-2">
              Front Office accounts can only access the booking form to book on behalf of officers.
            </p>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded border border-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                {isPA ? 'PA Code' : 'Employee ID'}
              </label>
              <input
                type="text"
                name="empCode"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-700 transition duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={empDetails.empCode}
                onChange={handleChange}
                placeholder={isPA ? 'e.g. PA00101' : 'e.g. HSFC101'}
                maxLength={7}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-700 transition duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={empDetails.password}
                onChange={handleChange}
                placeholder="Your Password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-lg bg-blue-700 px-4 py-3 font-bold text-white shadow-lg transition duration-200 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${loading ? 'opacity-70 cursor-wait' : ''}`}
            >
              {loading ? 'Signing In...' : `Sign In as ${isPA ? 'PA' : 'Employee'}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;