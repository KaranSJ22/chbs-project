import React from 'react';

const StatusCard = ({ label, date, title, color }) => (
  <div className="relative pl-6">
    <div className={`absolute left-0 top-1.5 w-2 h-2 rounded-full ${color}`} />
    <div className="flex justify-between items-center mb-1">
      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-[10px] text-blue-600 font-bold">{date}</span>
    </div>
    <h4 className="text-sm font-bold text-slate-800 leading-tight">{title}</h4>
    <p className="text-[11px] text-slate-500 mt-2 leading-normal border-l-2 border-slate-200 pl-4">
      Standard holiday closure protocols apply. Normal operations resume following the observed date.
    </p>
  </div>
);

export default StatusCard;