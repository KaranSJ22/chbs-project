import React from 'react';
import NavBar from '../components/common/NavBar';
import BookingForm from '../components/forms/BookingForm';
import { useAuth } from '../context/AuthContext';


const PAPage = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-[#333333]">
            <NavBar />
            <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 flex items-center justify-between">
                <p className="text-sm text-blue-700 font-medium">
                    Signed in as <span className="font-bold">{user?.name || user?.empCode}</span>
                </p>
                <p className="text-xs text-blue-500">Front Officier accounts can only submit bookings on behalf of officers.</p>
            </div>

            <div className="flex-1 bg-gray-100 py-10 overflow-y-auto">
                <div className="container mx-auto">
                    <BookingForm isPA={true} />
                </div>
            </div>
        </div>
    );
};

export default PAPage;
