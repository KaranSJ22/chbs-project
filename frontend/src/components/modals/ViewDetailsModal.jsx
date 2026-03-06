import { minutesToTime } from '../../lib/bookingData';

export default function ViewDetailsModal({ booking, onClose }) {
    if (!booking) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" style={{ animation: 'modalIn 0.2s cubic-bezier(.22,1,.36,1)' }} onClick={e => e.stopPropagation()}>
                <div className="relative bg-gradient-to-br from-[#003366] to-[#005599] px-6 pt-6 pb-10">
                    <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all text-sm">✕</button>
                    <div className="flex items-center gap-2 mb-3"><span className="text-[10px] font-bold tracking-widest uppercase text-blue-300">Booking Details</span></div>
                    <h2 className="text-xl font-bold text-white leading-snug pr-6">{booking.title}</h2>
                    <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold tracking-wide uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Confirmed
                    </span>
                </div>

                <div className="relative -mt-5 mx-4 bg-white rounded-xl border border-slate-100 shadow-lg px-5 py-4 grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-[#003366] text-sm">👤</span></div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-0.5">Booked By</p>
                            <p className="text-[13px] font-semibold text-[#003366] truncate">{booking.organizer || '—'}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-[#FF6600] text-sm">🏷️</span></div>
                        <div>
                            <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-0.5">Type</p>
                            <p className="text-[13px] font-semibold text-[#003366]">{booking.meetType || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-green-600 text-sm">🕒</span></div>
                        <div>
                            <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-0.5">Time</p>
                            <p className="text-[13px] font-semibold text-[#003366] whitespace-nowrap">{minutesToTime(booking.startTime)} – {minutesToTime(booking.endTime)}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-purple-500 text-sm">⏳</span></div>
                        <div>
                            <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-0.5">Duration</p>
                            <p className="text-[13px] font-semibold text-[#003366]">
                                {(() => {
                                    const mins = booking.endTime - booking.startTime;
                                    const h = Math.floor(mins / 60), m = mins % 60;
                                    return [h && `${h}h`, m && `${m}m`].filter(Boolean).join(' ');
                                })()}
                            </p>
                        </div>
                    </div>
                    <div className="col-span-2 pt-3 border-t border-slate-100">
                        <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">Booking ID</p>
                        <p className="text-[12px] font-mono text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 truncate select-all">{booking.id}</p>
                    </div>
                </div>
                <div className="px-4 py-4 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 bg-[#003366] hover:bg-[#002244] rounded-xl text-white text-sm font-semibold transition-all shadow-sm">Close</button>
                </div>
            </div>
            <style>{`@keyframes modalIn { from { opacity: 0; transform: scale(0.93) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
        </div>
    );
}