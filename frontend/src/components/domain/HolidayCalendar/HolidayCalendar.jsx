import React, { useState, useEffect } from 'react';
import { holidayService } from '../../../services/holidayService';
import '../../../styles/calendar.css';

const HolidayCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [holidays, setHolidays] = useState({});
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const loadHolidays = async () => {
      setLoading(true);
      const year = currentDate.getFullYear();
      const data = await holidayService.getHolidaysByYear(year);
      
      
      const formatted = data.reduce((acc, curr) => {
        acc[curr.date] = acc[curr.date] || [];
        acc[curr.date].push(curr);
        return acc;
      }, {});
      
      setHolidays(formatted);
      setLoading(false);
    };
    loadHolidays();
  }, [currentDate.getFullYear()]);

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const renderDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let x = firstDayIndex; x > 0; x--) {
      days.push(<div key={`prev-${x}`} className="day other-month" />);
    }

    // Current month days
    for (let i = 1; i <= lastDay; i++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const hasHoliday = !!holidays[dateKey];
      const isToday = new Date().toDateString() === new Date(year, month, i).toDateString();

      days.push(
        <div 
          key={i} 
          className={`day ${isToday ? 'today' : ''} ${hasHoliday ? 'has-events' : ''} ${selectedDate === dateKey ? 'selected' : ''}`}
          onClick={() => setSelectedDate(dateKey)}
        >
          {i}
          {hasHoliday && <div className="event-dot" />}
        </div>
      );
    }
    return days;
  };

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="chbs-calendar-widget">
      <div className={`calendar-container ${loading ? 'opacity-50' : ''}`}>
        <div className="calendar-header">
          <div className="nav-buttons">
            <button className="nav-btn" onClick={() => changeMonth(-1)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button className="nav-btn" onClick={() => changeMonth(1)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
          <div className="month-year">{months[currentDate.getMonth()]} {currentDate.getFullYear()}</div>
        </div>
        
        <div className="weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="weekday">{d}</div>)}
        </div>
        <div className="days">{renderDays()}</div>
      </div>

      <div className="event-panel">
        <div className="event-header">
          <div className="event-date">
            {selectedDate ? new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Select Date'}
          </div>
        </div>
        <div className="event-list">
          {holidays[selectedDate] ? (
            holidays[selectedDate].map((h, i) => (
              <div key={i} className="event-item">
                <div className={`event-color ${h.type === 'NATIONAL' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                <div>
                  <div className="event-text font-bold">{h.name}</div>
                  <div className="text-[10px] uppercase text-slate-500">{h.type}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-events">No holidays scheduled</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HolidayCalendar;