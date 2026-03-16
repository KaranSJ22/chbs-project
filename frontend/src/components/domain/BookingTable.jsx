// Reusable booking table for EmployeeDashboard (history and pending panels)

const BookingTable = ({
    title,
    accentColor = 'bg-[#007BFF]',
    rows = [],
    emptyMessage = 'No records found.',
    showStatus = false,
    onCancel,
    isFuture,
    alwaysShowCancel = false,
}) => (
    <div className="flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-y-auto">
        {/* Panel header */}
        <div className="bg-[#F8F9FA] px-4 py-2 border-b border-gray-200 flex items-center gap-2 flex-shrink-0">
            <span className={`w-1.5 h-5 ${accentColor} rounded-full`} />
            <h3 className="text-[#003366] font-bold text-sm uppercase">{title}</h3>
        </div>

        {rows.length === 0 ? (
            <p className="p-6 text-center text-gray-400 text-sm italic">{emptyMessage}</p>
        ) : (
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-[#333333] border-b uppercase text-xs">
                    <tr>
                        <th className="p-3">Title</th>
                        <th className="p-3">Hall</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Slot</th>
                        {showStatus && <th className="p-3">Status</th>}
                        <th className="p-3 text-center">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((item) => {
                        const canCancel =
                            alwaysShowCancel ||
                            (item.BOOKINGSTATUS === 'CONFIRMED' && isFuture?.(item.MeetDate));

                        return (
                            <tr key={item.BOOKINGID} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="p-3 font-medium">{item.MEETTITLE}</td>
                                <td className="p-3">{item.HALLNAME}</td>
                                <td className="p-3">{new Date(item.MeetDate).toLocaleDateString()}</td>
                                <td className="p-3">{item.TIME_RANGE}</td>
                                {showStatus && (
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${item.BOOKINGSTATUS === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                item.BOOKINGSTATUS === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                    item.BOOKINGSTATUS === 'CANCELLED' ? 'bg-gray-100 text-gray-600' :
                                                        'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {item.BOOKINGSTATUS}
                                        </span>
                                    </td>
                                )}
                                <td className="p-3 text-center">
                                    {canCancel && (
                                        <button
                                            onClick={() => onCancel?.(item.BOOKINGID)}
                                            className="text-red-700 hover:bg-red-50 px-3 py-1 rounded border border-red-200 text-xs font-semibold"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        )}
    </div>
);

export default BookingTable;
