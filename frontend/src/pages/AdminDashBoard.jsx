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
  }, [activeView]);

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col font-sans text-[#333333]">
      <NavBar />

      <div className="flex flex-col lg:flex-row flex-1 p-4 lg:p-6 gap-6 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 flex flex-col gap-6 flex-shrink-0">
          {/* User card */}
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
                {user?.name || user?.empCode || 'Admin'}
              </h2>
              <p className="mb-3 text-xs font-bold tracking-wide text-orange-600">
                EMP ID: {user?.empCode || '—'}
              </p>
              <div className="inline-flex items-center justify-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#0b3d91]">Admin</span>
              </div>
            </div>
          </div>

          {/* Flat nav */}
          <nav className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-1">
            <h2 className="text-[10px] font-bold uppercase text-gray-400 px-3 mb-2 border-b pb-1">
              Actions &amp; Records
            </h2>
            {VIEWS.map(v => (
              <MenuBtn
                key={v.key}
                label={v.label}
                active={activeView === v.key}
                isRecords={v.type === 'records'}
                onClick={() => setActiveView(v.key)}
              />
            ))}
          </nav>
        </aside>

        {/* Single main content area */}
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

const MenuBtn = ({ label, active, isRecords, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2
      ${active
        ? 'bg-[#FF6600] text-white shadow-md'
        : isRecords
          ? 'text-gray-600 hover:bg-blue-50 hover:text-[#003366]'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
  >
    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? 'bg-white' : isRecords ? 'bg-[#007BFF]' : 'bg-[#FF6600]'}`} />
    {label}
  </button>
);

export default AdminDashboard;