import React, { useState } from 'react';
import { adminService } from '../../../services/adminService';

const RecordsTable = ({ view, data, onRefresh }) => {
  const [actionLoading, setActionLoading] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-[#F8FAFC] rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
        <div className="text-4xl mb-3 opacity-20 text-[#003366]">📂</div>
        <p className="text-gray-400 font-medium italic">
          No records found for {view.replace(/_/g, ' ').toLowerCase()}.
        </p>
      </div>
    );
  }

  const isHallView = view === 'VIEW_HALLS';
  const isPendingView = view === 'PENDING';

  const handleDecide = async (bookingId, status) => {
    setActionLoading(bookingId);
    try {
      await adminService.decideBooking(bookingId, status);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="w-full">
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead className="sticky top-0 z-10 bg-white">
          <tr className="bg-[#003366] text-white">
            <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest rounded-l-xl">
              {isHallView ? 'Hall Details' : 'Booking Details'}
            </th>
            {!isHallView && (
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-center">
                Schedule
              </th>
            )}
            <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-center rounded-r-xl">
              {isPendingView ? 'Actions' : 'Status'}
            </th>
          </tr>
        </thead>
        <tbody className="before:block before:h-1">
          {data.map((item) => {
            // ISAVAILABLE is returned as a MySQL BIT(1) → TINYINT, or boolean
            const rawVal = item.ISAVAILABLE;
            const isActive =
              rawVal === 1 ||
              rawVal === true ||
              (rawVal?.data && rawVal.data[0] === 1);

            return (
              <tr
                key={item.HALLID || item.BOOKINGID}
                className="group bg-white hover:bg-[#F0F7FF] transition-all duration-200 shadow-sm"
              >
                {/* Info column */}
                <td className="px-5 py-4 border-y border-l border-gray-100 rounded-l-xl">
                  {isHallView ? (
                    <>
                      <div className="font-bold text-[#003366] text-sm group-hover:text-[#007BFF]">
                        {item.HALLNAME}
                        {(item.ISDIRECTORHALL === 1 || item.ISDIRECTORHALL?.data?.[0] === 1) && (
                          <span className="ml-1 text-[9px] text-amber-600 font-black">★ DIR</span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400 font-medium mt-0.5 uppercase">
                        {item.HALLCODE} — {item.BUILDNAME}
                      </div>
                      {!isActive && item.DISABLED_FROM && (
                        <div className="text-[10px] text-red-400 mt-0.5">
                          Maintenance: {new Date(item.DISABLED_FROM).toLocaleDateString('en-GB')} → {new Date(item.DISABLED_TO).toLocaleDateString('en-GB')}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="font-bold text-[#003366] text-sm uppercase tracking-tight">
                        {item.MEETTITLE || 'Conference Meeting'}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {item.HALLNAME}{' '}
                        <span className="text-orange-500 font-bold ml-1">({item.MEETTYPE || 'General'})</span>
                      </div>
                      <div className="text-[9px] text-gray-400 font-bold uppercase mt-1 italic">
                        By: {item.BOOKEDBY}
                        {item.ONBEHALFOF && item.ONBEHALFOF !== item.BOOKEDBY && (
                          <span className="ml-1 text-blue-500">→ on behalf of {item.ONBEHALFOF}</span>
                        )}
                      </div>
                    </>
                  )}
                </td>

                {/* Schedule column — uses MeetDate and TIME_RANGE from views */}
                {!isHallView && (
                  <td className="px-5 py-4 border-y border-gray-100 text-center">
                    <div className="font-bold text-[#003366] text-xs">
                      {item.MeetDate
                        ? new Date(item.MeetDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold mt-1 tracking-tighter">
                      {item.TIME_RANGE || '—'}
                    </div>
                  </td>
                )}

                {/* Actions / Status column */}
                <td className="px-5 py-4 border-y border-r border-gray-100 text-center rounded-r-xl">
                  {isHallView ? (
                    <StatusBadge type={isActive ? 'ACTIVE' : 'MAINTENANCE'} />
                  ) : isPendingView ? (
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleDecide(item.BOOKINGID, 'CONFIRMED')}
                        disabled={actionLoading === item.BOOKINGID}
                        className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white p-1.5 rounded-lg transition-colors shadow-sm"
                        title="Approve (CONFIRMED)"
                      >
                        <CheckIcon />
                      </button>
                      <button
                        onClick={() => handleDecide(item.BOOKINGID, 'REJECTED')}
                        disabled={actionLoading === item.BOOKINGID}
                        className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white p-1.5 rounded-lg transition-colors shadow-sm"
                        title="Reject"
                      >
                        <CrossIcon />
                      </button>
                    </div>
                  ) : (
                    <StatusBadge type={item.BOOKINGSTATUS} />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Icons 
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const CrossIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const StatusBadge = ({ type }) => {
  const styles = {
    ACTIVE: 'bg-green-100 text-green-700 border-green-200',
    CONFIRMED: 'bg-green-100 text-green-700 border-green-200',
    MAINTENANCE: 'bg-red-100 text-red-700 border-red-200',
    REJECTED: 'bg-red-100 text-red-700 border-red-200',
    CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200',
    PENDING: 'bg-orange-100 text-orange-700 border-orange-200',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest border ${styles[type] || 'bg-blue-100 text-blue-700 border-blue-200'}`}>
      {type}
    </span>
  );
};

export default RecordsTable;


// remove icons and external links search for good UI package apart from lucide-react