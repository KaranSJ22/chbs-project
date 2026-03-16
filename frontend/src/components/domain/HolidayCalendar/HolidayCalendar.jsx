import React, { useState, useEffect, useMemo } from 'react';
import { calendarService } from '../../../services/holidayService'; // Ensure this path is correct for your project

// Sub-component for the legend
const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-1">
    <span className={`h-1.5 w-1.5 rounded-full ${color}`}></span>
    <span className="text-[9px] font-bold uppercase text-slate-500">{label}</span>
  </div>
);

const HolidayCalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const todayKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);

  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(false);


  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  useEffect(() => {
    const loadMonthData = async () => {
      setLoading(true);
      try {
        const data = await calendarService.getMonthlyData(currentYear, currentMonth + 1);
        setCalendarData(data || {});
      } catch (error) {
        console.error("Failed to fetch calendar data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMonthData();
  }, [currentYear, currentMonth]);

  const { days, monthName, year } = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const lastDateOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const daysArray = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      daysArray.push(null);
    }

    for (let d = 1; d <= lastDateOfMonth; d++) {
      daysArray.push(new Date(currentYear, currentMonth, d));
    }

    return {
      days: daysArray,
      monthName: currentDate.toLocaleString('default', { month: 'long' }),
      year: currentYear
    };
  }, [currentDate, currentYear, currentMonth]);

  const formatDateKey = (date) => {
    if (!date) return null;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const selectedDayData = calendarData[selectedDateKey];
  const selectedDateObj = new Date(selectedDateKey);

  return (
    <div className="min-h-screen bg-slate-100 p-4 font-sans md:p-10">
      <div className="mx-auto max-w-5xl">

        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Calendar</h1>
            <p className="text-sm text-slate-500">{monthName} {year} Overview</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

          {/* LEFT: CALENDAR WIDGET */}
          <div className="lg:col-span-5">
            <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-opacity duration-200 ${loading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>

              {/* Calendar Controls */}
              <div className="flex items-center justify-between bg-[#042847] px-5 py-4 text-white">
                <button onClick={() => changeMonth(-1)} className="rounded-md p-1 transition-colors hover:bg-blue-500">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <span className="text-sm font-bold uppercase tracking-wider">{monthName} {year}</span>
                <button onClick={() => changeMonth(1)} className="rounded-md p-1 transition-colors hover:bg-blue-500">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>

              {/* Days Grid */}
              <div className="p-4">
                <div className="mb-2 grid grid-cols-7 text-center text-[10px] font-bold uppercase text-slate-400">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                    <div key={day}>{day}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {days.map((date, index) => {
                    if (!date) return <div key={`empty-${index}`} className="aspect-square" />;
                    const dateKey = formatDateKey(date);
                    const dayData = calendarData[dateKey];
                    const isSelected = selectedDateKey === dateKey;
                    const isToday = new Date().toDateString() === date.toDateString();
                    let statusClasses = 'text-slate-600 hover:bg-slate-100';
                    if (isSelected) {
                      statusClasses = 'bg-blue-600 font-bold text-white shadow-md z-10';
                    } else if (dayData?.status === 'HOLIDAY') {
                      statusClasses = 'bg-red-50 text-red-600 font-bold ring-1 ring-red-100 hover:bg-red-100';
                    } else if (dayData?.status === 'PARTIAL') {
                      statusClasses = 'bg-cyan-50 text-cyan-600 font-bold ring-1 ring-cyan-100 hover:bg-cyan-100';
                    } else if (dayData?.status === 'FULL') {
                      statusClasses = 'bg-slate-50 text-slate-300 cursor-not-allowed';
                    } else if (isToday) {
                      statusClasses = 'ring-1 ring-blue-600 text-blue-600 font-bold hover:bg-blue-50';
                    }

                    return (
                      <button
                        key={dateKey}
                        onClick={() => dayData?.status !== 'FULL' && setSelectedDateKey(dateKey)}
                        disabled={dayData?.status === 'FULL'}
                        className={`relative flex aspect-square items-center justify-center rounded-lg text-sm transition-all ${statusClasses}`}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Legend Bottom Bar */}
              <div className="flex items-center justify-around border-t border-slate-100 bg-slate-50 px-2 py-3">
                <LegendItem color="bg-slate-300" label="Free" />
                <LegendItem color="bg-cyan-400" label="Part" />
                <LegendItem color="bg-slate-200" label="Full" />
                <LegendItem color="bg-red-500" label="Holi" />
              </div>
            </div>
          </div>

          {/* RIGHT: details */}
          <div className="lg:col-span-7">
            <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              {/* header */}
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    {isNaN(selectedDateObj) ? 'Select a Date' : selectedDateObj.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h3>
                  <p className="text-xs text-slate-400">Selected Date Details</p>
                </div>
                {selectedDayData && (
                  <span className={`rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-wider 
                    ${selectedDayData.status === 'HOLIDAY' ? 'bg-red-100 text-red-600' :
                      selectedDayData.status === 'PARTIAL' ? 'bg-cyan-100 text-cyan-700' :
                        selectedDayData.status === 'FULL' ? 'bg-slate-100 text-slate-600' : 'hidden'}`}>
                    {selectedDayData.status}
                  </span>
                )}
              </div>

              <div className="flex-grow space-y-4">
                {selectedDayData?.status === 'HOLIDAY' && selectedDayData.events ? (
                  selectedDayData.events.map((event, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-xl border border-red-50 bg-red-50/50 p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-xl shadow-sm">🗓️</div>
                      <div>
                        <h4 className="font-bold text-slate-800">{event.name}</h4>
                        <p className="text-[10px] font-semibold uppercase text-red-500">{event.type}</p>
                      </div>
                    </div>
                  ))
                ) : selectedDayData?.status === 'FULL' ? (
                  <div className="py-10 text-center">
                    <p className="text-sm italic text-slate-500">All halls are fully booked on this date.</p>
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-sm italic text-slate-500">No special events. Normal booking operations apply.</p>
                  </div>
                )}

                {/*Note */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs leading-relaxed text-slate-600">
                    <span className="font-bold text-slate-800">Note: </span>
                    {selectedDayData?.status === 'PARTIAL'
                      ? "Some halls are already booked. Please check the Timeline Page for specific hourly availability."
                      : selectedDayData?.status === 'HOLIDAY'
                        ? "Holiday No Bookings Can be Made on this date"
                        : "General booking rules apply. Ensure you have submitted your request 48 hours in advance."}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HolidayCalendarPage;