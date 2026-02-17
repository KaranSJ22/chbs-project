import React, { useState, useEffect } from 'react';
import HolidayCalendar from '../components/domain/HolidayCalendar/HolidayCalendar';
import AddHallForm from '../components/forms/AddHallForm';
import AddUserForm from '../components/forms/AddUserForm';
import DisableHallForm from '../components/forms/DisableHallForm';
import { fetchAllHalls } from '../services/hallService';
import RecordsTable from '../components/domain/admin/RecordsTable';

const AdminDashboard = () => {
  const [activeView, setActiveView] = useState('ADD_HALL');
  const [recordData, setRecordData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch data for the Records Section when relevant views are selected
useEffect(() => {
  const getRecords = async () => {
    if (activeView === 'VIEW_HALLS') {
      setLoading(true);
      try {
        const data = await fetchAllHalls(); 
       console.log(data);
        setRecordData(data); 
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };
  getRecords();
}, [activeView]);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-[#333333]">
      <header className="bg-[#003366] text-white px-6 py-3 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-3">
        
          <h1 className="text-xl font-bold tracking-wide">
            HSFC Hall Booking System
          </h1>
        </div>

        <div className="flex items-center gap-6 font-medium">
          <button
            className="hover:text-[#FF6600] transition-colors"
            onClick={() => (window.location.href = "/")} // Navigate to Home
          >
            Home
          </button>

          {/* Temporary Navigation to Booking Form */}
          <button
            className="hover:text-[#FF6600] transition-colors"
            onClick={() => (window.location.href = "/book")}
          >
            Book Hall
          </button>

          <button className="bg-[#FF6600] px-4 py-1.5 rounded text-white font-bold hover:bg-orange-700 transition shadow">
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 mt-8 overflow-hidden">
        <aside className="w-72 bg-[#F8F9FA] border-r border-gray-200 p-4 space-y-4">
          {/*  Profile Card  Yet to be made */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-2">
            <h2 className="text-xs font-bold uppercase text-gray-400 mb-2 border-b pb-1">
              Menu Actions
            </h2>
            <MenuBtn
              label="Add Hall"
              active={activeView === "ADD_HALL"}
              onClick={() => setActiveView("ADD_HALL")}
            />
            <MenuBtn
              label="Add Employee"
              active={activeView === "ADD_USER"}
              onClick={() => setActiveView("ADD_USER")}
            />
            <MenuBtn
              label="Disable Hall"
              active={activeView === "DISABLE_HALL"}
              onClick={() => setActiveView("DISABLE_HALL")}
            />
            <div className="my-2 border-t border-gray-100"></div>
            <MenuBtn
              label="Get All Halls"
              active={activeView === "VIEW_HALLS"}
              onClick={() => setActiveView("VIEW_HALLS")}
            />
            <MenuBtn
              label="Get Pending Requests"
              active={activeView === "PENDING"}
              onClick={() => setActiveView("PENDING")}
            />
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden px-6">
          <section className="mb-8 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <HolidayCalendar />
          </section>

          <section className="flex-1 flex gap-6 overflow-hidden mb-6">
            {/*  Forms Panel (Inputs Only) */}
            <div className="w-1/2 p-6 bg-white border border-gray-200 rounded-xl shadow-sm overflow-y-auto">
              <h3 className="text-lg font-bold text-[#003366] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#FF6600] rounded-full"></span>
                {activeView.includes("VIEW") || activeView === "PENDING"
                  ? "Action"
                  : `${activeView.replace("_", " ")} Form`}
              </h3>
              {activeView === "ADD_HALL" && <AddHallForm />}
              {activeView === "ADD_USER" && <AddUserForm />}
              {activeView === "DISABLE_HALL" && <DisableHallForm />}
              {(activeView === "VIEW_HALLS" || activeView === "PENDING") && (
                <p className="text-gray-400 italic">
                  Select an entry from the records table to perform actions.
                </p>
              )}
            </div>

            {/*  Records Panel (Display Only) yet to add pending bookings */}
            <div className="w-1/2 p-6 bg-[#F8F9FA] border border-gray-200 rounded-xl shadow-sm overflow-y-auto">
              <h3 className="text-lg font-bold text-[#003366] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#007BFF] rounded-full"></span>
                {activeView === "PENDING" ? "Pending Requests" : "Hall Records"}
              </h3>

              {loading ? (
                <div className="text-center py-10 text-blue-600 font-bold">
                  Loading records...
                </div>
              ) : (
                <RecordsTable view={activeView} data={recordData} />
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};
const MenuBtn = ({ label, active, onClick }) => (
  <button 
    onClick={onClick} 
    className={`w-full text-left px-4 py-2.5 rounded text-sm font-medium transition-all ${
      active ? 'bg-[#FF6600] text-white shadow-md' : 'hover:bg-gray-100'
    }`}
  >
    {label}
  </button>
);
export default AdminDashboard