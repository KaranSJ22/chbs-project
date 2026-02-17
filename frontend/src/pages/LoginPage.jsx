import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const LoginPage = () => {
  const navigate = useNavigate();
  
 
  const [empDetails, setEmpDetails] = useState({
    empCode: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  //
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmpDetails((prev) => ({
      ...prev,          
      [name]: value     
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 3. Extract values from state object
      const { empCode, password } = empDetails;

      const response = await authService.login(empCode, password);
      console.log("Login Success:", response);

      const roleId = response.user.role; 

      if (roleId === 'R01') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 items-center justify-center p-4">
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
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-500 mt-2">Please enter your details to sign in.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded border border-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Employee ID
              </label>
              <input
                type="text"
                name="empCode"  // <--- Important: Matches state key
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-700 transition duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={empDetails.empCode}
                onChange={handleChange}
                placeholder="e.g. HSFC101"
                required
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password" // <--- Important: Matches state key
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
              className={`w-full transform rounded-lg bg-blue-700 px-4 py-3 font-bold text-white shadow-lg transition duration-200 hover:bg-blue-800 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
              ${loading ? 'opacity-70 cursor-wait' : ''}`}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;