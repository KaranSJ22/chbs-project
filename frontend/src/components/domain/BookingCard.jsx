import React from 'react';

const BookingCard = ({ booking }) => {
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':   return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REJECTED':  return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELLED': return 'bg-gray-100 text-gray-600 border-gray-200';
      default:          return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded border border-gray-200 shadow-sm p-5 hover:shadow-md transition-all duration-200">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-blue-900 leading-tight">
            {booking.MEETTITLE || "Untitled Meeting"}
          </h3>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">
            {booking.HALLNAME}
          </p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider border ${getStatusColor(booking.BOOKINGSTATUS)}`}>
          {booking.BOOKINGSTATUS}
        </span>
      </div>

      {/* Details Grid */}
      <div className="border-t border-gray-100 pt-3 text-sm text-gray-600 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-400 font-medium">Date</span>
          <span className="font-semibold text-gray-700">
            {new Date(booking.BOOKINGDATE).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400 font-medium">Time</span>
          <span className="font-semibold text-gray-700">
            {booking.STARTTIME} - {booking.ENDTIME}
          </span>
        </div>
      </div>
      
    </div>
  );
};

export default BookingCard;