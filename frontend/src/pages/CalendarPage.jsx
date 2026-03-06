import React from 'react';
import HolidayCalendar from '../components/domain/HolidayCalendar/HolidayCalendar';
import NavBar from '../components/common/NavBar';
const CalendarPage = () => {
    return (
        <div>
            <NavBar />
            <div className="min-h-screen bg-white flex flex-col font-sans text-[#333333]">
                <div className="flex-1 bg-gray-100 py-10 relative overflow-y-auto">
                    <div className="container mx-auto">
                        <HolidayCalendar />
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CalendarPage;