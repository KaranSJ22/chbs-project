import React from 'react';

const PendingBookingsTable = ({ bookings, userRole, onAction }) => {
  return (
    <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="bg-[#F8F9FA] px-4 py-2 border-b border-gray-200">
        <h3 className="text-[#003366] font-bold text-sm uppercase">Pending Approvals</h3>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-[#333333] border-b uppercase text-xs">
          <tr>
            <th className="p-3">Booking ID</th>
            <th className="p-3">Date</th>
            <th className="p-3">Hall</th>
            <th className="p-3">Slots</th>
            <th className="p-3 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((item) => (
            <tr key={item.BOOKINGID} className="border-b last:border-0 hover:bg-gray-50">
              <td className="p-3 font-mono text-xs">{item.BOOKINGID}</td>
              <td className="p-3">{new Date(item.BOOKINGDATE).toLocaleDateString()}</td>
              <td className="p-3">{item.HALLNAME}</td>
              <td className="p-3">{item.TIME_SLOT}</td>
              <td className="p-3 text-center">
                {userRole === 'R01' ? (
                  <button 
                    onClick={() => onAction(item.BOOKINGID, 'REJECTED')}
                    className="text-red-700 hover:bg-red-50 px-3 py-1 rounded border border-red-200 text-xs font-semibold"
                  >
                    Reject
                  </button>
                ) : (
                  <button 
                    onClick={() => onAction(item.BOOKINGID, 'CANCEL')}
                    className="text-gray-600 hover:bg-gray-50 px-3 py-1 rounded border border-gray-200 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PendingBookingsTable;