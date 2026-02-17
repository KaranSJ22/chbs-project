import React from 'react';

const RecordsTable = ({ view, data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-400 italic">
        No records found for {view.replace('_', ' ')}.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 border-b text-gray-600 uppercase text-[10px] font-bold">
          <tr>
            <th className="px-4 py-3">Details</th>
            <th className="px-4 py-3 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
         
            const isActive = item.isAvailable?.data ? item.isAvailable.data[0] === 1 : item.isAvailable === 1;

            return (
              <tr key={item.HALLID || item.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-bold text-slate-800">{item.HALLNAME || item.name}</div>
                  <div className="text-[11px] text-slate-500">{item.BUILDNAME} | {item.HALLCODE}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {isActive ? 'ACTIVE' : 'MAINTENANCE'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RecordsTable;