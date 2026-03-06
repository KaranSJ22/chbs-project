// import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
// import {
//     SLOT_DURATION, TIMELINE_START, TIMELINE_END, TOTAL_SLOTS, minutesToTime,
// } from '../../lib/bookingData';
// import { getTimelineBookings, createBooking, adminCancelBooking } from '../../services/bookingService';
// import BookingModal from '../forms/BookingModal';

// // Convert DB slot (1-based) → minutes from midnight
// const slotToMinutes = (slot) => TIMELINE_START + (slot - 1) * SLOT_DURATION;
// // Convert minutes → DB startSlot (1-based)
// const minutesToSlot = (minutes) => (minutes - TIMELINE_START) / SLOT_DURATION + 1;

// export default function BookingTimeline({ halls, selectedDate, isAdmin = false, currentUser = null }) {
//     const pad = (n) => String(n).padStart(2, '0');
//     const dateStr = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;
//     const todayPad = (n) => String(n).padStart(2, '0');
//     const today = new Date();
//     const todayStr = `${today.getFullYear()}-${todayPad(today.getMonth() + 1)}-${todayPad(today.getDate())}`;
//     const isToday = dateStr === todayStr;

//     // Bookings from API 
//     const [bookings, setBookings] = useState([]);
//     const [bkLoading, setBkLoading] = useState(false);
//     const [bkError, setBkError] = useState(null);

//     // --- Admin Context Menu & Modal State ---
//     const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, booking: null });
//     const [viewDetailsModal, setViewDetailsModal] = useState(false);
//     const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
//     const [activeAdminBooking, setActiveAdminBooking] = useState(null);

//     // Close context menu on outside click
//     useEffect(() => {
//         const handleClick = () => {
//             if (contextMenu.visible) setContextMenu({ ...contextMenu, visible: false });
//         };
//         window.addEventListener('click', handleClick);
//         return () => window.removeEventListener('click', handleClick);
//     }, [contextMenu.visible]);

//     useEffect(() => {
//         setBkLoading(true);
//         setBkError(null);
//         getTimelineBookings(dateStr)
//             .then((rows) => {
//                 setBookings(rows.map((r) => ({
//                     id: r.BOOKINGID,
//                     hallId: String(r.HALLID),
//                     date: dateStr,
//                     startTime: slotToMinutes(r.STARTSLOT),
//                     endTime: slotToMinutes(r.ENDSLOT) + SLOT_DURATION,
//                     title: r.MEETTITLE || '(untitled)',
//                     organizer: r.BOOKEDBY || '',
//                     meetType: r.MeetType || '',
//                 })));
//             })
//             .catch((err) => setBkError(err.message))
//             .finally(() => setBkLoading(false));
//     }, [dateStr]);

//     // Drag state 
//     const [selection, setSelection] = useState(null);
//     const [isDragging, setIsDragging] = useState(false);
//     const [dragHallId, setDragHallId] = useState(null);
//     const [dragStartSlot, setDragStartSlot] = useState(null);

//     // Modal + submit state 
//     const [modalOpen, setModalOpen] = useState(false);
//     const [pendingBooking, setPendingBooking] = useState(null);
//     const [submitting, setSubmitting] = useState(false);

//     // Toast
//     const [toast, setToast] = useState(null);
//     const showToast = (title, sub, type = 'success') => {
//         setToast({ title, sub, type });
//         setTimeout(() => setToast(null), 4000);
//     };

//     // Current time 
//     const [now, setNow] = useState(new Date());
//     useEffect(() => {
//         if (!isToday) return;
//         const id = setInterval(() => setNow(new Date()), 60_000);
//         return () => clearInterval(id);
//     }, [isToday]);

//     const nowMinutes = now.getHours() * 60 + now.getMinutes();
//     const nowPct = isToday && nowMinutes >= TIMELINE_START && nowMinutes <= TIMELINE_END
//         ? ((nowMinutes - TIMELINE_START) / (TIMELINE_END - TIMELINE_START)) * 100
//         : null;

//     const gridRef = useRef(null);

//     const getSlot = useCallback((e) => {
//         if (!gridRef.current) return null;
//         const rect = gridRef.current.getBoundingClientRect();
//         const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
//         const x = clientX - rect.left;
//         const dynamicSlotWidth = rect.width / TOTAL_SLOTS;
//         return Math.max(0, Math.min(TOTAL_SLOTS - 1, Math.floor(x / dynamicSlotWidth)));
//     }, []);

//     const dayBookings = useMemo(() => bookings, [bookings]);

//     const clampSelection = useCallback((hallId, anchorSlot, currentSlot) => {
//         const minSlot = Math.min(anchorSlot, currentSlot);
//         const maxSlot = Math.max(anchorSlot, currentSlot);
//         let clampedStart = TIMELINE_START + minSlot * SLOT_DURATION;
//         let clampedEnd = TIMELINE_START + (maxSlot + 1) * SLOT_DURATION;

//         const hallBookings = dayBookings
//             .filter((b) => b.hallId === hallId)
//             .sort((a, b) => a.startTime - b.startTime);

//         for (const b of hallBookings) {
//             if (b.startTime < clampedEnd && b.endTime > clampedStart) {
//                 if (anchorSlot <= currentSlot) clampedEnd = Math.min(clampedEnd, b.startTime);
//                 else clampedStart = Math.max(clampedStart, b.endTime);
//             }
//         }
//         if (clampedStart >= clampedEnd) return null;
//         return {
//             hallId,
//             startSlot: (clampedStart - TIMELINE_START) / SLOT_DURATION,
//             endSlot: (clampedEnd - TIMELINE_START) / SLOT_DURATION - 1,
//         };
//     }, [dayBookings]);

//     const handlePointerDown = (hallId, slot) => {
//         const time = TIMELINE_START + slot * SLOT_DURATION;
//         if (dayBookings.some((b) => b.hallId === hallId && time >= b.startTime && time < b.endTime)) return;
//         setIsDragging(true);
//         setDragHallId(hallId);
//         setDragStartSlot(slot);
//         setSelection({ hallId, startSlot: slot, endSlot: slot });
//     };

//     const handlePointerMove = (e) => {
//         if (!isDragging || dragHallId === null || dragStartSlot === null) return;
//         const slot = getSlot(e);
//         if (slot === null) return;
//         const newSel = clampSelection(dragHallId, dragStartSlot, slot);
//         if (newSel) setSelection(newSel);
//     };

//     const handlePointerUp = () => {
//         if (!isDragging || !selection) { setIsDragging(false); return; }
//         setIsDragging(false);
//         const startTime = TIMELINE_START + selection.startSlot * SLOT_DURATION;
//         const endTime = TIMELINE_START + (selection.endSlot + 1) * SLOT_DURATION;
//         setPendingBooking({ hallId: selection.hallId, startTime, endTime });
//         setModalOpen(true);
//     };

//     // isAdmin → can view + cancel any booking
//     // regular user → can only right-click their OWN bookings (view details only)
//     const canRightClick = (booking) => isAdmin || (currentUser && booking.organizer === currentUser.empCode);

//     const handleRightClick = (e, booking) => {
//         if (!canRightClick(booking)) return;
//         e.preventDefault();
//         e.stopPropagation();

//         setContextMenu({
//             visible: true,
//             x: e.clientX,
//             y: e.clientY,
//             booking: booking
//         });
//     };

//     const handleConfirm = async ({ title, meetType, linkRequired, onBehalfOf }) => {
//         if (!pendingBooking) return;
//         setSubmitting(true);
//         try {
//             const hallName = halls.find((h) => String(h.HALLID) === pendingBooking.hallId)?.HALLNAME ?? '';
//             const result = await createBooking({
//                 hallId: pendingBooking.hallId,
//                 date: dateStr,
//                 startSlot: minutesToSlot(pendingBooking.startTime),
//                 endSlot: minutesToSlot(pendingBooking.endTime) - 1,
//                 title,
//                 meetType,
//                 onBehalfOf: onBehalfOf || null,
//                 linkRequired: linkRequired,
//             });

//             setModalOpen(false);
//             setSelection(null);
//             setPendingBooking(null);

//             const isPending = result.status === 'PENDING';
//             showToast(
//                 isPending ? 'Booking Pending Approval' : 'Booking Confirmed! ✅',
//                 `${title} · ${hallName}`,
//                 isPending ? 'warn' : 'success'
//             );

//             getTimelineBookings(dateStr).then((rows) => {
//                 setBookings(rows.map((r) => ({
//                     id: r.BOOKINGID,
//                     hallId: String(r.HALLID),
//                     date: dateStr,
//                     startTime: slotToMinutes(r.STARTSLOT),
//                     endTime: slotToMinutes(r.ENDSLOT) + SLOT_DURATION,
//                     title: r.MEETTITLE || '(untitled)',
//                     organizer: r.BOOKEDBY || '',
//                     meetType: r.MeetType || '',
//                 })));
//             }).catch(() => { });
//         } catch (err) {
//             showToast('Booking Failed ❌', err.message, 'error');
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     const handleModalClose = (open) => {
//         setModalOpen(open);
//         if (!open) { setSelection(null); setPendingBooking(null); }
//     };

//     // Time labels: Showing labels every 1 hour (4 slots) to avoid overlap
//     const timeLabels = [];
//     for (let i = 0; i <= TOTAL_SLOTS; i++) {
//         if (i % 4 === 0) {
//             timeLabels.push({ slot: i, label: minutesToTime(TIMELINE_START + i * SLOT_DURATION) });
//         }
//     }

//     return (
//         <>
//             {/* Loading / Error banners */}
//             {bkLoading && (
//                 <div className="flex items-center gap-2 mb-3 text-[13px] text-[#64748B]">
//                     <div className="w-4 h-4 border-2 border-[#007BFF] border-t-transparent rounded-full animate-spin" />
//                     Loading bookings…
//                 </div>
//             )}
//             {bkError && (
//                 <div className="mb-3 px-4 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[13px] text-rose-600">
//                     ⚠️ {bkError}
//                 </div>
//             )}

//             {/* Timeline */}
//             <div className="flex rounded-xl overflow-hidden border border-[#CBD5E1] bg-white shadow-lg">
//                 {/* Hall labels column */}
//                 <div className="flex-shrink-0 border-r border-[#CBD5E1] bg-white z-10 w-[160px]">
//                     <div className="h-10 border-b border-[#CBD5E1] bg-[#EEF2F8] flex items-center px-4">
//                         <span className="text-[10px] font-semibold tracking-widest uppercase text-[#64748B]">Halls</span>
//                     </div>
//                     {halls.map((hall) => (
//                         <div key={hall.HALLID} className="h-16 border-b border-[#E2E8F0] flex flex-col justify-center px-4 w-full">
//                             <span className="text-sm font-medium text-[#003366] leading-tight truncate">{hall.HALLNAME}</span>
//                             <span className="text-[11px] text-[#64748B] truncate">{hall.BUILDNAME}</span>
//                         </div>
//                     ))}
//                 </div>

//                 {/* Grid Wrapper */}
//                 <div ref={gridRef} className="flex-1 select-none w-full"
//                     onMouseMove={handlePointerMove} onMouseUp={handlePointerUp} onMouseLeave={handlePointerUp}>
//                     <div className="relative w-full h-full">

//                         {/* Time header */}
//                         <div className="h-10 border-b border-[#CBD5E1] bg-[#EEF2F8] relative">
//                             {timeLabels.map(({ slot, label }) => {
//                                 const isLast = slot === TOTAL_SLOTS;
//                                 return (
//                                     <div
//                                         key={slot}
//                                         className={`absolute top-0 h-full flex items-center text-[11px] font-medium text-[#64748B] pointer-events-none ${isLast ? 'pr-1.5' : 'pl-1.5'}`}
//                                         style={{
//                                             left: isLast ? 'auto' : `${(slot / TOTAL_SLOTS) * 100}%`,
//                                             right: isLast ? '0' : 'auto'
//                                         }}
//                                     >
//                                         {label}
//                                     </div>
//                                 );
//                             })}
//                         </div>

//                         {/* Hall rows */}
//                         {halls.map((hall) => {
//                             const hallId = String(hall.HALLID);
//                             const hallBookings = dayBookings.filter((b) => b.hallId === hallId);
//                             return (
//                                 <div key={hall.HALLID} className="h-16 border-b border-[#E2E8F0] relative">
//                                     {/* Slot cells (Logical 15 mins, Visual borders every 30 mins) */}
//                                     {Array.from({ length: TOTAL_SLOTS }).map((_, i) => (
//                                         <div key={i}
//                                             className={`absolute top-0 h-full cursor-crosshair hover:bg-[#007BFF]/5 transition-colors ${i % 2 === 0 ? 'border-l border-[#CBD5E1]' : ''}`}
//                                             style={{ left: `${(i / TOTAL_SLOTS) * 100}%`, width: `${(1 / TOTAL_SLOTS) * 100}%` }}
//                                             onMouseDown={() => handlePointerDown(hallId, i)}
//                                         />
//                                     ))}

//                                     {/* Booked blocks */}
//                                     {hallBookings.map((b) => {
//                                         const startSlot = (b.startTime - TIMELINE_START) / SLOT_DURATION;
//                                         const endSlot = (b.endTime - TIMELINE_START) / SLOT_DURATION;
//                                         return (
//                                             <div key={b.id}
//                                                 className={`absolute top-1.5 bottom-1.5 rounded-lg bg-[#007BFF]/10 border border-[#007BFF]/30 hash-pattern flex flex-col justify-center px-2 overflow-hidden transition-colors ${canRightClick(b) ? 'cursor-context-menu hover:border-[#007BFF]/60 hover:bg-[#007BFF]/20' : 'pointer-events-none'}`}
//                                                 style={{ left: `${(startSlot / TOTAL_SLOTS) * 100}%`, width: `${((endSlot - startSlot) / TOTAL_SLOTS) * 100}%` }}
//                                                 onContextMenu={(e) => handleRightClick(e, b)}
//                                                 onMouseDown={(e) => e.stopPropagation()}
//                                             >
//                                                 <p className="text-[11px] font-semibold text-[#003366]/80 truncate pointer-events-none">{b.title}</p>
//                                                 <p className="text-[10px] text-[#64748B] truncate pointer-events-none">{b.organizer}</p>
//                                             </div>
//                                         );
//                                     })}

//                                     {/* Selection */}
//                                     {selection && selection.hallId === hallId && (
//                                         <div className="absolute top-1.5 bottom-1.5 rounded-lg bg-[#007BFF]/20 border-2 border-[#007BFF]/50 pointer-events-none z-10 flex items-center justify-center sel-pulse overflow-hidden"
//                                             style={{ left: `${(selection.startSlot / TOTAL_SLOTS) * 100}%`, width: `${((selection.endSlot - selection.startSlot + 1) / TOTAL_SLOTS) * 100}%` }}>
//                                             <span className="text-[11px] font-semibold text-[#007BFF] whitespace-nowrap px-1 hidden sm:block">
//                                                 {minutesToTime(TIMELINE_START + selection.startSlot * SLOT_DURATION)}
//                                                 {' – '}
//                                                 {minutesToTime(TIMELINE_START + (selection.endSlot + 1) * SLOT_DURATION)}
//                                             </span>
//                                         </div>
//                                     )}
//                                 </div>
//                             );
//                         })}

//                         {/* Current time line */}
//                         {nowPct !== null && (
//                             <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-20 pointer-events-none" style={{ left: `${nowPct}%` }}>
//                                 <div className="absolute -top-0 -left-[5px] w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_6px_2px_rgba(244,63,94,0.4)]" />
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* Context Menu */}
//             {contextMenu.visible && (
//                 <div
//                     className="fixed z-[100] bg-white border border-[#CBD5E1] rounded-lg shadow-xl py-1 w-48 text-[13px] text-[#003366] overflow-hidden"
//                     style={{ top: contextMenu.y, left: contextMenu.x }}
//                 >
//                     <button
//                         className="w-full text-left px-4 py-2 hover:bg-[#EEF2F8] transition-colors flex items-center gap-2"
//                         onClick={() => {
//                             setActiveAdminBooking(contextMenu.booking);
//                             setViewDetailsModal(true);
//                             setContextMenu({ ...contextMenu, visible: false });
//                         }}
//                     >
//                         <span>🔍</span> View Details
//                     </button>
//                     {/* Cancel option — only admin can cancel any booking */}
//                     {isAdmin && (
//                         <>
//                             <div className="h-px bg-[#E2E8F0] w-full my-1"></div>
//                             <button
//                                 className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 transition-colors flex items-center gap-2"
//                                 onClick={() => {
//                                     setActiveAdminBooking(contextMenu.booking);
//                                     setDeleteConfirmModal(true);
//                                     setContextMenu({ ...contextMenu, visible: false });
//                                 }}
//                             >
//                                 <span>🗑️</span> Cancel Booking
//                             </button>
//                         </>
//                     )}
//                 </div>
//             )}

//             {/* ── View Details Modal ─────────────────────────────────────── */}
//             {viewDetailsModal && activeAdminBooking && (
//                 <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
//                     onClick={() => setViewDetailsModal(false)}>
//                     <div
//                         className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
//                         style={{ animation: 'modalIn 0.2s cubic-bezier(.22,1,.36,1)' }}
//                         onClick={e => e.stopPropagation()}
//                     >
//                         {/* Header — dark navy gradient */}
//                         <div className="relative bg-gradient-to-br from-[#003366] to-[#005599] px-6 pt-6 pb-10">
//                             {/* Close button */}
//                             <button
//                                 onClick={() => setViewDetailsModal(false)}
//                                 className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all text-sm"
//                             >✕</button>

//                             {/* Icon + label */}
//                             <div className="flex items-center gap-2 mb-3">
//                                 <span className="text-[10px] font-bold tracking-widest uppercase text-blue-300">Booking Details</span>
//                             </div>

//                             {/* Title */}
//                             <h2 className="text-xl font-bold text-white leading-snug pr-6">
//                                 {activeAdminBooking.title}
//                             </h2>

//                             {/* Status badge */}
//                             <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold tracking-wide uppercase">
//                                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
//                                 Confirmed
//                             </span>
//                         </div>

//                         {/* Info card — overlaps header */}
//                         <div className="relative -mt-5 mx-4 bg-white rounded-xl border border-slate-100 shadow-lg px-5 py-4 grid grid-cols-2 gap-x-6 gap-y-4">

//                             {/* Organizer */}
//                             <div className="flex items-start gap-3">
//                                 <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
//                                     <svg className="w-4 h-4 text-[#003366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                                     </svg>
//                                 </div>
//                                 <div className="min-w-0">
//                                     <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-0.5">Booked By</p>
//                                     <p className="text-[13px] font-semibold text-[#003366] truncate">{activeAdminBooking.organizer || '—'}</p>
//                                 </div>
//                             </div>

//                             {/* Meet type */}
//                             <div className="flex items-start gap-3">
//                                 <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0 mt-0.5">
//                                     <svg className="w-4 h-4 text-[#FF6600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
//                                     </svg>
//                                 </div>
//                                 <div>
//                                     <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-0.5">Type</p>
//                                     <p className="text-[13px] font-semibold text-[#003366]">{activeAdminBooking.meetType || 'N/A'}</p>
//                                 </div>
//                             </div>

//                             {/* Time range */}
//                             <div className="flex items-start gap-3">
//                                 <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
//                                     <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                     </svg>
//                                 </div>
//                                 <div>
//                                     <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-0.5">Time</p>
//                                     <p className="text-[13px] font-semibold text-[#003366] whitespace-nowrap">
//                                         {minutesToTime(activeAdminBooking.startTime)} – {minutesToTime(activeAdminBooking.endTime)}
//                                     </p>
//                                 </div>
//                             </div>

//                             {/* Duration */}
//                             <div className="flex items-start gap-3">
//                                 <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 mt-0.5">
//                                     <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                     </svg>
//                                 </div>
//                                 <div>
//                                     <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-0.5">Duration</p>
//                                     <p className="text-[13px] font-semibold text-[#003366]">
//                                         {(() => {
//                                             const mins = activeAdminBooking.endTime - activeAdminBooking.startTime;
//                                             const h = Math.floor(mins / 60), m = mins % 60;
//                                             return [h && `${h}h`, m && `${m}m`].filter(Boolean).join(' ');
//                                         })()}
//                                     </p>
//                                 </div>
//                             </div>

//                             {/* Booking ID — full width */}
//                             <div className="col-span-2 pt-3 border-t border-slate-100">
//                                 <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">Booking ID</p>
//                                 <p className="text-[12px] font-mono text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 truncate select-all">
//                                     {activeAdminBooking.id}
//                                 </p>
//                             </div>
//                         </div>

//                         {/* Footer */}
//                         <div className="px-4 py-4 flex justify-end gap-3">
//                             <button
//                                 onClick={() => setViewDetailsModal(false)}
//                                 className="px-5 py-2.5 bg-[#003366] hover:bg-[#002244] rounded-xl text-white text-sm font-semibold transition-all shadow-sm"
//                             >
//                                 Close
//                             </button>
//                         </div>
//                     </div>

//                     <style>{`
//                         @keyframes modalIn {
//                             from { opacity: 0; transform: scale(0.93) translateY(8px); }
//                             to   { opacity: 1; transform: scale(1)    translateY(0);   }
//                         }
//                     `}</style>
//                 </div>
//             )}

//             {/* Delete Confirmation Modal */}
//             {deleteConfirmModal && activeAdminBooking && (
//                 <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
//                     <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-6 animate-in fade-in zoom-in-95 duration-200">
//                         <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4 border-4 border-rose-50">
//                             <span className="text-rose-600 text-2xl">⚠️</span>
//                         </div>
//                         <h3 className="font-bold text-lg text-[#003366] mb-2">Cancel Booking?</h3>
//                         <p className="text-[14px] text-[#64748B] mb-6">
//                             Are you sure you want to cancel the booking <strong className="text-[#003366]">"{activeAdminBooking.title}"</strong>? This action cannot be undone.
//                         </p>
//                         <div className="flex gap-3 justify-center">
//                             <button
//                                 onClick={() => setDeleteConfirmModal(false)}
//                                 className="px-4 py-2 bg-white border border-[#CBD5E1] rounded-lg text-[#003366] hover:bg-gray-50 text-sm font-medium transition-colors w-full"
//                             >
//                                 Keep It
//                             </button>
//                             <button
//                                 onClick={async () => {
//                                     try {
//                                         await adminCancelBooking(activeAdminBooking.id);
//                                         showToast('Booking Cancelled', `"${activeAdminBooking.title}" has been removed.`, 'error');
//                                         setDeleteConfirmModal(false);
//                                         setActiveAdminBooking(null);
//                                         // Refresh timeline bookings
//                                         getTimelineBookings(dateStr).then((rows) => {
//                                             setBookings(rows.map((r) => ({
//                                                 id: r.BOOKINGID,
//                                                 hallId: String(r.HALLID),
//                                                 date: dateStr,
//                                                 startTime: slotToMinutes(r.STARTSLOT),
//                                                 endTime: slotToMinutes(r.ENDSLOT) + SLOT_DURATION,
//                                                 title: r.MEETTITLE || '(untitled)',
//                                                 organizer: r.BOOKEDBY || '',
//                                                 meetType: r.MeetType || '',
//                                             })));
//                                         }).catch(() => { });
//                                     } catch (err) {
//                                         showToast('Cancel Failed ❌', err.message, 'error');
//                                         setDeleteConfirmModal(false);
//                                     }
//                                 }}
//                                 className="px-4 py-2 bg-rose-500 hover:bg-rose-600 rounded-lg text-white text-sm font-medium transition-colors w-full shadow-sm"
//                             >
//                                 Yes, Cancel It
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Modal */}
//             {modalOpen && (
//                 <BookingModal
//                     hallName={halls.find((h) => String(h.HALLID) === pendingBooking?.hallId)?.HALLNAME ?? ''}
//                     date={dateStr}
//                     startTime={pendingBooking?.startTime ?? 0}
//                     endTime={pendingBooking?.endTime ?? 0}
//                     onConfirm={handleConfirm}
//                     onClose={() => handleModalClose(false)}
//                 />
//             )}

//             {/* Submitting overlay */}
//             {submitting && (
//                 <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
//                     <div className="flex items-center gap-3 bg-white border border-[#CBD5E1] rounded-xl px-6 py-4 text-[14px] text-[#003366] shadow-xl">
//                         <div className="w-5 h-5 border-2 border-[#007BFF] border-t-transparent rounded-full animate-spin" />
//                         Submitting booking…
//                     </div>
//                 </div>
//             )}

//             {/* Toast */}
//             {toast && (
//                 <div className={`modal-in fixed bottom-6 right-6 z-[9999] flex items-start gap-3 bg-white border border-[#CBD5E1] rounded-xl px-5 py-4 shadow-xl max-w-xs pointer-events-none border-l-4 ${toast.type === 'error' ? 'border-l-rose-500' : toast.type === 'warn' ? 'border-l-amber-500' : 'border-l-[#007BFF]'
//                     }`}>
//                     <div>
//                         <p className="text-[13px] font-semibold text-[#003366]">{toast.title}</p>
//                         <p className="text-[12px] text-[#64748B] mt-0.5">{toast.sub}</p>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// }

import { TOTAL_SLOTS, minutesToTime, SLOT_DURATION, TIMELINE_START } from '../../lib/bookingData';
import { useBookingTimeline } from '../../hooks/useBookingTimeline';
import BookingModal from '../modals/BookingModal';
import ViewDetailsModal from '../modals/ViewDetailsModal';
import DeleteConfirmModal from '../modals/DeleteConfirmModal';
import Toast from '../ui/Toast';
import OverlayLoader from '../ui/OverlayLoader';

export default function BookingTimeline({ halls, selectedDate, isAdmin = false, currentUser = null }) {
    const {
        bookings, bkLoading, bkError, dateStr, timeLabels, nowPct,
        contextMenu, setContextMenu, viewDetailsModal, setViewDetailsModal,
        deleteConfirmModal, setDeleteConfirmModal, activeAdminBooking, setActiveAdminBooking,
        selection, gridRef, handlePointerDown, handlePointerMove, handlePointerUp,
        canRightClick, handleRightClick, handleConfirm, handleDeleteBooking, handleModalClose,
        modalOpen, pendingBooking, submitting, toast
    } = useBookingTimeline({ halls, selectedDate, isAdmin, currentUser });

    return (
        <>
            {/* Status Indicators */}
            {bkLoading && <div className="text-[13px] text-[#64748B] mb-3">Loading bookings…</div>}
            {bkError && <div className="mb-3 px-4 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[13px] text-rose-600">⚠️ {bkError}</div>}

            {/* Timeline UI */}
            <div className="flex rounded-xl overflow-hidden border border-[#CBD5E1] bg-white shadow-lg">

                {/* Halls Column */}
                <div className="flex-shrink-0 border-r border-[#CBD5E1] bg-white z-10 w-[160px]">
                    <div className="h-10 border-b border-[#CBD5E1] bg-[#EEF2F8] flex items-center px-4">
                        <span className="text-[10px] font-semibold tracking-widest uppercase text-[#64748B]">Halls</span>
                    </div>
                    {halls.map((hall) => (
                        <div key={hall.HALLID} className="h-16 border-b border-[#E2E8F0] flex flex-col justify-center px-4 w-full">
                            <span className="text-sm font-medium text-[#003366] leading-tight truncate">{hall.HALLNAME}</span>
                            <span className="text-[11px] text-[#64748B] truncate">{hall.BUILDNAME}</span>
                        </div>
                    ))}
                </div>

                {/* Grid Wrapper */}
                <div ref={gridRef} className="flex-1 select-none w-full"
                    onMouseMove={handlePointerMove} onMouseUp={handlePointerUp} onMouseLeave={handlePointerUp}>
                    <div className="relative w-full h-full">

                        {/* Time header */}
                        <div className="h-10 border-b border-[#CBD5E1] bg-[#EEF2F8] relative">
                            {timeLabels.map(({ slot, label }) => {
                                const isLast = slot === TOTAL_SLOTS;
                                return (
                                    <div key={slot}
                                        className={`absolute top-0 h-full flex items-center text-[11px] font-medium text-[#64748B] pointer-events-none ${isLast ? 'pr-1.5' : 'pl-1.5'}`}
                                        style={{ left: isLast ? 'auto' : `${(slot / TOTAL_SLOTS) * 100}%`, right: isLast ? '0' : 'auto' }}>
                                        {label}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Hall rows */}
                        {halls.map((hall) => {
                            const hallId = String(hall.HALLID);
                            const hallBookings = bookings.filter((b) => b.hallId === hallId);

                            return (
                                <div key={hall.HALLID} className="h-16 border-b border-[#E2E8F0] relative">
                                    {/* Slot cells */}
                                    {Array.from({ length: TOTAL_SLOTS }).map((_, i) => (
                                        <div key={i}
                                            className={`absolute top-0 h-full cursor-crosshair hover:bg-[#007BFF]/5 transition-colors ${i % 2 === 0 ? 'border-l border-[#CBD5E1]' : ''}`}
                                            style={{ left: `${(i / TOTAL_SLOTS) * 100}%`, width: `${(1 / TOTAL_SLOTS) * 100}%` }}
                                            onMouseDown={() => handlePointerDown(hallId, i)} />
                                    ))}

                                    {/* Booked blocks */}
                                    {hallBookings.map((b) => {
                                        const startSlot = (b.startTime - TIMELINE_START) / SLOT_DURATION;
                                        const endSlot = (b.endTime - TIMELINE_START) / SLOT_DURATION;
                                        return (
                                            <div key={b.id}
                                                className={`absolute top-1.5 bottom-1.5 rounded-lg bg-[#007BFF]/10 border border-[#007BFF]/30 hash-pattern flex flex-col justify-center px-2 overflow-hidden transition-colors ${canRightClick(b) ? 'cursor-context-menu hover:border-[#007BFF]/60 hover:bg-[#007BFF]/20' : 'pointer-events-none'}`}
                                                style={{ left: `${(startSlot / TOTAL_SLOTS) * 100}%`, width: `${((endSlot - startSlot) / TOTAL_SLOTS) * 100}%` }}
                                                onContextMenu={(e) => handleRightClick(e, b)}
                                                onMouseDown={(e) => e.stopPropagation()}>
                                                <p className="text-[11px] font-semibold text-[#003366]/80 truncate pointer-events-none">{b.title}</p>
                                                <p className="text-[10px] text-[#64748B] truncate pointer-events-none">{b.organizer}</p>
                                            </div>
                                        );
                                    })}

                                    {/* Selection Feedback */}
                                    {selection && selection.hallId === hallId && (
                                        <div className="absolute top-1.5 bottom-1.5 rounded-lg bg-[#007BFF]/20 border-2 border-[#007BFF]/50 pointer-events-none z-10 flex items-center justify-center sel-pulse overflow-hidden"
                                            style={{ left: `${(selection.startSlot / TOTAL_SLOTS) * 100}%`, width: `${((selection.endSlot - selection.startSlot + 1) / TOTAL_SLOTS) * 100}%` }}>
                                            <span className="text-[11px] font-semibold text-[#007BFF] whitespace-nowrap px-1 hidden sm:block">
                                                {minutesToTime(TIMELINE_START + selection.startSlot * SLOT_DURATION)} {' – '} {minutesToTime(TIMELINE_START + (selection.endSlot + 1) * SLOT_DURATION)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Current time tracker line */}
                        {nowPct !== null && (
                            <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-20 pointer-events-none" style={{ left: `${nowPct}%` }}>
                                <div className="absolute -top-0 -left-[5px] w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_6px_2px_rgba(244,63,94,0.4)]" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Context Menu Popup */}
            {contextMenu.visible && (
                <div className="fixed z-[100] bg-white border border-[#CBD5E1] rounded-lg shadow-xl py-1 w-48 text-[13px] text-[#003366] overflow-hidden"
                    style={{ top: contextMenu.y, left: contextMenu.x }}>
                    <button className="w-full text-left px-4 py-2 hover:bg-[#EEF2F8] transition-colors flex items-center gap-2"
                        onClick={() => {
                            setActiveAdminBooking(contextMenu.booking);
                            setViewDetailsModal(true);
                            setContextMenu({ ...contextMenu, visible: false });
                        }}>
                        <span>🔍</span> View Details
                    </button>
                    {isAdmin && (
                        <>
                            <div className="h-px bg-[#E2E8F0] w-full my-1"></div>
                            <button className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 transition-colors flex items-center gap-2"
                                onClick={() => {
                                    setActiveAdminBooking(contextMenu.booking);
                                    setDeleteConfirmModal(true);
                                    setContextMenu({ ...contextMenu, visible: false });
                                }}>
                                <span>🗑️</span> Cancel Booking
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Modals & Overlays */}
            <ViewDetailsModal booking={viewDetailsModal ? activeAdminBooking : null} onClose={() => setViewDetailsModal(false)} />
            <DeleteConfirmModal booking={deleteConfirmModal ? activeAdminBooking : null} onCancel={() => setDeleteConfirmModal(false)} onConfirm={handleDeleteBooking} />

            {modalOpen && (
                <BookingModal
                    hallName={halls.find((h) => String(h.HALLID) === pendingBooking?.hallId)?.HALLNAME ?? ''}
                    date={dateStr}
                    startTime={pendingBooking?.startTime ?? 0}
                    endTime={pendingBooking?.endTime ?? 0}
                    onConfirm={handleConfirm}
                    onClose={() => handleModalClose(false)}
                />
            )}

            {submitting && <OverlayLoader message="Submitting booking…" />}
            <Toast toast={toast} />
        </>
    );
}