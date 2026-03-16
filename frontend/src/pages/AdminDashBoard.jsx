import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AddHallForm from '../components/forms/AddHallForm';
import AddMeetTypeForm from '../components/forms/AddMeetTypeForm';
import DisableHallForm from '../components/forms/DisableHallForm';
import { fetchAllHalls } from '../services/hallService';
import { adminService } from '../services/adminService';
import { getUserDashboard } from '../services/bookingService';
import RecordsTable from '../components/domain/admin/RecordsTable';
import NavBar from '../components/common/NavBar';
import UserProfileCard from '../components/common/UserProfileCard';
import AdminSidebarNav from '../components/domain/admin/AdminSidebarNav';

// All possible views in a flat list
const VIEWS = [
  { key: 'ADD_HALL', label: 'Add Hall', type: 'form' },
  { key: 'DISABLE_HALL', label: 'Disable Hall', type: 'form' },
  { key: 'ADD_MEET_TYPE', label: 'Add Meet Type', type: 'form' },
  { key: 'VIEW_HALLS', label: 'All Halls', type: 'records' },
  { key: 'PENDING', label: 'Pending Requests', type: 'records' },
  { key: 'MY_HISTORY', label: 'My Booking History', type: 'records' },
];

const AdminDashboard = () => {
  const { user } = useAuth();

  const [activeView, setActiveView] = useState('ADD_HALL');
  const [recordData, setRecordData] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentView = VIEWS.find(v => v.key === activeView);
  const isRecordsView = currentView?.type === 'records';

  useEffect(() => {
    if (!isRecordsView) return;
    setLoading(true);
    const fetchData = async () => {
      try {
        let data = [];
        if (activeView === 'VIEW_HALLS') data = await fetchAllHalls();
        else if (activeView === 'PENDING') data = await adminService.getPendingBookings();
        else if (activeView === 'MY_HISTORY') data = await getUserDashboard();
        setRecordData(data);
      } catch (err) {
        console.error('Fetch Error:', err);
        setRecordData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeView, isRecordsView]);

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col font-sans text-[#333333]">
      <NavBar />

      <div className="flex flex-col lg:flex-row flex-1 p-4 lg:p-6 gap-6 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 flex flex-col gap-6 flex-shrink-0">
          <UserProfileCard user={user} empCode={user?.empCode} role="Admin" />
          <AdminSidebarNav views={VIEWS} activeView={activeView} onSelect={setActiveView} />
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-8 min-h-[550px] flex flex-col">
          {/* Forms */}
          {!isRecordsView && (
            <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center">
              {activeView === 'ADD_HALL' && <AddHallForm />}
              {activeView === 'DISABLE_HALL' && <DisableHallForm />}
              {activeView === 'ADD_MEET_TYPE' && <AddMeetTypeForm />}
            </div>
          )}

          {/* Records */}
          {isRecordsView && (
            <>
              <h3 className="text-lg font-bold text-[#003366] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#007BFF] rounded-full" />
                {currentView?.label}
              </h3>
              <div className="overflow-y-auto flex-1 pr-2">
                {loading ? (
                  <div className="flex justify-center items-center h-full animate-pulse text-[#007BFF] font-bold">
                    Loading records...
                  </div>
                ) : (
                  <RecordsTable
                    view={activeView}
                    data={recordData}
                    onRefresh={() => {
                      const v = activeView;
                      setActiveView('');
                      setTimeout(() => setActiveView(v), 50);
                    }}
                  />
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;