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