import React, { useEffect, useState, useCallback } from 'react';
import { fetchDashboardData, handleBookingAction } from './employee';
import { useAuth } from '../context/AuthContext';
import NavBar from '../components/common/NavBar';
import UserProfileCard from '../components/common/UserProfileCard';
import BookingTable from '../components/domain/BookingTable';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const empCode = user?.empCode || 'UNKNOWN';

  const [data, setData] = useState({ historyTable: [], pendingTable: [] });

  const loadData = useCallback(async () => {
    const dashboardData = await fetchDashboardData();
    setData(dashboardData);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const onCancelBooking = async (bookingId) => {
    try {
      await handleBookingAction(bookingId, 'CANCEL');
      await loadData();
    } catch {
      alert('Cancel failed. Please try again.');
    }
  };

  // Helper: is the booking date strictly in the future?
  const isFuture = (dateStr) => new Date(dateStr) > new Date(new Date().toDateString());

  // Summary counts
  const confirmed = data.historyTable.filter(b => b.BOOKINGSTATUS === 'CONFIRMED').length;
  const rejected = data.historyTable.filter(b => b.BOOKINGSTATUS === 'REJECTED').length;
  const cancelled = data.historyTable.filter(b => b.BOOKINGSTATUS === 'CANCELLED').length;

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-[#333333]">
      <NavBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 bg-[#F8F9FA] border-r border-gray-200 p-4 space-y-4 hidden lg:block">
          <UserProfileCard user={user} empCode={empCode} role="Employee" />

          {/* Summary */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-gray-400 mb-3 border-b pb-1">Summary</h3>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Pending', value: data.pendingTable.length, color: 'text-yellow-600' },
                { label: 'Confirmed', value: confirmed, color: 'text-green-600' },
                { label: 'Rejected', value: rejected, color: 'text-red-600' },
                { label: 'Cancelled', value: cancelled, color: 'text-gray-500' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-500">{label}</span>
                  <span className={`font-bold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden px-6 py-4">
          <section className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden mb-6">
            <div className="lg:w-1/2 overflow-y-auto">
              <BookingTable
                title="Booking History"
                accentColor="bg-[#007BFF]"
                rows={data.historyTable}
                emptyMessage="No booking history found."
                showStatus
                onCancel={onCancelBooking}
                isFuture={isFuture}
              />
            </div>
            <div className="lg:w-1/2 overflow-y-auto">
              <BookingTable
                title="Pending Bookings"
                accentColor="bg-[#FF6600]"
                rows={data.pendingTable}
                emptyMessage="No pending bookings."
                alwaysShowCancel
                onCancel={onCancelBooking}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;