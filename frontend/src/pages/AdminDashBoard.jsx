import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import HolidayCalendar from '../components/domain/HolidayCalendar/HolidayCalendar';
import AddHallForm from '../components/forms/AddHallForm';
import AddMeetTypeForm from '../components/forms/AddMeetTypeForm';
import DisableHallForm from '../components/forms/DisableHallForm';
import { fetchAllHalls } from '../services/hallService';
import { adminService } from '../services/adminService';
import { getUserDashboard } from '../services/bookingService';
import RecordsTable from '../components/domain/admin/RecordsTable';
import NavBar from '../components/common/NavBar';

const AdminDashboard = () => {
  const { user } = useAuth();

  const [leftView, setLeftView] = useState('ADD_HALL');
  const [rightView, setRightView] = useState('VIEW_HALLS');

  const [recordData, setRecordData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getRecords = async () => {
      // Data fetching now only depends on the rightView
      const targetViews = ['VIEW_HALLS', 'PENDING', 'MY_HISTORY'];
      if (!targetViews.includes(rightView)) return;

      setLoading(true);
      try {
        let data = [];
        if (rightView === 'VIEW_HALLS') data = await fetchAllHalls();
        else if (rightView === 'PENDING') data = await adminService.getPendingBookings();
        else if (rightView === 'MY_HISTORY') data = await getUserDashboard();
        setRecordData(data);
      } catch (err) {
        console.error("Fetch Error:", err);
        setRecordData([]);
      } finally {
        setLoading(false);
      }
    };
    getRecords();
  }, [rightView]); // Fetch triggered by rightView changes

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col font-sans text-[#333333]">
      <NavBar />

      {/* Main Container */}
      <div className="flex flex-col lg:flex-row flex-1 p-4 lg:p-6 gap-6 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 flex flex-col gap-6 flex-shrink-0">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center">
            <div className="w-16 h-16 bg-[#003366] rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold shadow-inner">
              {user?.empCode?.charAt(0) || "H"}
            </div>
            <h2 className="text-[#003366] font-bold text-base">
              {user?.empCode || "HSFC105"}
            </h2>
            <span className="inline-block mt-2 px-3 py-1 bg-[#FF6600] text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
              Administrator
            </span>
          </div>

          <nav className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-1">
            <h2 className="text-[10px] font-bold uppercase text-gray-400 px-3 mb-2 border-b pb-1">
              Actions (Left Panel)
            </h2>
            <MenuBtn
              label="Add Hall"
              active={leftView === "ADD_HALL"}
              onClick={() => setLeftView("ADD_HALL")}
            />
            <MenuBtn
              label="Disable Hall"
              active={leftView === "DISABLE_HALL"}
              onClick={() => setLeftView("DISABLE_HALL")}
            />
            <MenuBtn
              label="Add Meet Type"
              active={leftView === "ADD_MEET_TYPE"}
              onClick={() => setLeftView("ADD_MEET_TYPE")}
            />

            <h2 className="text-[10px] font-bold uppercase text-gray-400 px-3 mt-4 mb-2 border-b pb-1">
              Records (Right Panel)
            </h2>
            <MenuBtn
              label="Get All Halls"
              active={rightView === "VIEW_HALLS"}
              onClick={() => setRightView("VIEW_HALLS")}
            />
            <MenuBtn
              label="Pending Requests"
              active={rightView === "PENDING"}
              onClick={() => setRightView("PENDING")}
            />
            <MenuBtn
              label="My Booking History"
              active={rightView === "MY_HISTORY"}
              onClick={() => setRightView("MY_HISTORY")}
            />
          </nav>
        </aside>

        {/* Main Content Grid */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Section: Centered Forms (Col Span 5) */}
          <section className="lg:col-span-5 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm min-h-[550px] flex flex-col items-center justify-center">
            <div className="w-full max-w-md">
              {/* Form rendering only depends on leftView */}
              {leftView === "ADD_HALL" && <AddHallForm />}
              {leftView === "DISABLE_HALL" && <DisableHallForm />}
              {leftView === "ADD_MEET_TYPE" && <AddMeetTypeForm />}

              {/* Placeholder for left panel when no action is active */}
              {leftView === "INFO" && (
                <div className="flex flex-col items-center justify-center text-slate-300">
                  <span className="text-8xl font-black opacity-5 tracking-tighter select-none">
                    CHBS
                  </span>
                  <p className="text-sm font-medium italic text-gray-400 -mt-4">
                    Select an action from the menu
                  </p>
                </div>
              )}
            </div>
          </section>

          <div className="lg:col-span-7 flex flex-col gap-6">
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[400px]">
              <h3 className="text-lg font-bold text-[#003366] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#007BFF] rounded-full"></span>
                {rightView === "PENDING"
                  ? "Pending Requests"
                  : rightView === "MY_HISTORY"
                    ? "My History"
                    : "Hall Records"}
              </h3>
              <div className="overflow-y-auto flex-1 pr-2">
                {loading ? (
                  <div className="flex justify-center items-center h-full animate-pulse text-[#007BFF] font-bold">
                    Loading records...
                  </div>
                ) : (
                  <RecordsTable
                    view={rightView}
                    data={recordData}
                    onRefresh={() => {
                      const v = rightView;
                      setRightView('');
                      setTimeout(() => setRightView(v), 50);
                    }}
                  />
                )}
              </div>
            </section>

            {/* Calendar Section (Bottom Right) */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">
                Upcoming Holidays
              </h3>
              <div className="w-full overflow-x-auto">
                <HolidayCalendar />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

const MenuBtn = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${active ? 'bg-[#FF6600] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
      }`}
  >
    {label}
  </button>
);

export default AdminDashboard;