import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardData, handleBookingAction } from './employee';
import { useAuth } from '../context/AuthContext';
import NavBar from '../components/common/NavBar';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const empCode = user?.empCode || "UNKNOWN";

  const [data, setData] = useState({ historyTable: [], pendingTable: [] });

  const loadData = useCallback(async () => {
    const dashboardData = await fetchDashboardData();
    setData(dashboardData);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onCancelBooking = async (bookingId) => {
    try {
      await handleBookingAction(bookingId, 'CANCEL');
      await loadData();
    } catch (err) {
      alert("Cancel failed. Please try again.");
    }
  };

  // Helper: is the booking date strictly in the future?
  const isFuture = (dateStr) => new Date(dateStr) > new Date(new Date().toDateString());

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-[#333333]">
      <NavBar />

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 bg-[#F8F9FA] border-r border-gray-200 p-4 space-y-4 hidden lg:block">
          {/* User profile card */}
          <div className="group relative w-full overflow-hidden rounded-2xl bg-white shadow-md">
            {/* Gradient header with orange accent */}
            <div className="relative h-20 bg-gradient-to-r from-[#0b3d91] to-[#1a5bb8]">
              <div className="absolute bottom-0 h-1 w-full bg-orange-500" />
            </div>
            {/* Avatar — overlaps header */}
            <div className="relative z-10 -mt-10 flex justify-center">
              <img
                src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y&s=256"
                alt="Profile"
                className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-lg transition-transform duration-500 ease-out group-hover:scale-110"
              />
            </div>
            {/* Info */}
            <div className="px-4 py-3 pb-5 text-center">
              <h2 className="mb-0.5 text-base font-bold text-slate-800">
                {user?.name || empCode}
              </h2>
              <p className="mb-3 text-xs font-bold tracking-wide text-orange-600">
                EMP ID: {empCode}
              </p>
              <div className="inline-flex items-center justify-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#0b3d91]">Employee</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-gray-400 mb-3 border-b pb-1">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Pending</span>
                <span className="font-bold text-yellow-600">{data.pendingTable.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Confirmed</span>
                <span className="font-bold text-green-600">
                  {data.historyTable.filter(b => b.BOOKINGSTATUS === 'CONFIRMED').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Rejected</span>
                <span className="font-bold text-red-600">
                  {data.historyTable.filter(b => b.BOOKINGSTATUS === 'REJECTED').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cancelled</span>
                <span className="font-bold text-gray-500">
                  {data.historyTable.filter(b => b.BOOKINGSTATUS === 'CANCELLED').length}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden px-6 py-4">


          {/* Tables Section */}
          <section className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden mb-6">
            <div className="lg:w-1/2 bg-[#F8F9FA] border border-gray-200 rounded-xl shadow-sm overflow-y-auto">
              <div className="bg-[#F8F9FA] px-4 py-2 border-b border-gray-200 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#007BFF] rounded-full"></span>
                <h3 className="text-[#003366] font-bold text-sm uppercase">Booking History</h3>
              </div>
              {data.historyTable.length === 0 ? (
                <p className="p-6 text-center text-gray-400 text-sm italic">No booking history found.</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-[#333333] border-b uppercase text-xs">
                    <tr>
                      <th className="p-3">Title</th>
                      <th className="p-3">Hall</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Slot</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.historyTable.map((item) => (
                      <tr key={item.BOOKINGID} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="p-3 font-medium">{item.MEETTITLE}</td>
                        <td className="p-3">{item.HALLNAME}</td>
                        <td className="p-3">{new Date(item.MeetDate).toLocaleDateString()}</td>
                        <td className="p-3">{item.TIME_RANGE}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${item.BOOKINGSTATUS === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                            item.BOOKINGSTATUS === 'REJECTED' ? 'bg-red-100 text-red-700' :
                              item.BOOKINGSTATUS === 'CANCELLED' ? 'bg-gray-100 text-gray-600' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                            {item.BOOKINGSTATUS}
                          </span>
                        </td>
                        {/* Cancel button — only for CONFIRMED bookings that are in the future */}
                        <td className="p-3 text-center">
                          {item.BOOKINGSTATUS === 'CONFIRMED' && isFuture(item.MeetDate) && (
                            <button
                              onClick={() => onCancelBooking(item.BOOKINGID)}
                              className="text-red-700 hover:bg-red-50 px-3 py-1 rounded border border-red-200 text-xs font-semibold"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {/* Pending Bookings */}
            <div className="lg:w-1/2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-y-auto">
              <div className="bg-[#F8F9FA] px-4 py-2 border-b border-gray-200 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#FF6600] rounded-full"></span>
                <h3 className="text-[#003366] font-bold text-sm uppercase">Pending Bookings</h3>
              </div>
              {data.pendingTable.length === 0 ? (
                <p className="p-6 text-center text-gray-400 text-sm italic">No pending bookings.</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-[#333333] border-b uppercase text-xs">
                    <tr>
                      <th className="p-3">Title</th>
                      <th className="p-3">Hall</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Slot</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pendingTable.map((item) => (
                      <tr key={item.BOOKINGID} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="p-3 font-medium">{item.MEETTITLE}</td>
                        <td className="p-3">{item.HALLNAME}</td>
                        <td className="p-3">{new Date(item.MeetDate).toLocaleDateString()}</td>
                        <td className="p-3">{item.TIME_RANGE}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => onCancelBooking(item.BOOKINGID)}
                            className="text-red-700 hover:bg-red-50 px-3 py-1 rounded border border-red-200 text-xs font-semibold"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Booking History */}
          </section>
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;


// cascade rendering