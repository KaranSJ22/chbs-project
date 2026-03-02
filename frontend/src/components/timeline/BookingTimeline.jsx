import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
    SLOT_DURATION, SLOT_WIDTH, TIMELINE_START, TIMELINE_END, TOTAL_SLOTS, minutesToTime,
} from '../../lib/bookingData';
import { getTimelineBookings, createBooking } from '../../services/bookingService';
import BookingModal from '../forms/BookingModal';

// Convert DB slot (1-based) → minutes from midnight
const slotToMinutes = (slot) => TIMELINE_START + (slot - 1) * SLOT_DURATION;
// Convert minutes → DB startSlot (1-based)
const minutesToSlot = (minutes) => (minutes - TIMELINE_START) / SLOT_DURATION + 1;

export default function BookingTimeline({ halls, selectedDate }) {
    const pad = (n) => String(n).padStart(2, '0');
    const dateStr = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;
    const todayPad = (n) => String(n).padStart(2, '0');
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${todayPad(today.getMonth() + 1)}-${todayPad(today.getDate())}`;
    const isToday = dateStr === todayStr;

    // ── Bookings from API ───────────────────────────────────────────────
    const [bookings, setBookings] = useState([]);
    const [bkLoading, setBkLoading] = useState(false);
    const [bkError, setBkError] = useState(null);

    useEffect(() => {
        setBkLoading(true);
        setBkError(null);
        getTimelineBookings(dateStr)
            .then((rows) => {
                // Normalise DB rows → internal { hallId, startTime, endTime, title, organizer }
                setBookings(rows.map((r) => ({
                    id: r.BOOKINGID,
                    hallId: String(r.HALLID),
                    date: dateStr,
                    startTime: slotToMinutes(r.STARTSLOT),
                    endTime: slotToMinutes(r.ENDSLOT) + SLOT_DURATION, // end slot is inclusive
                    title: r.MEETTITLE || '(untitled)',
                    organizer: r.BOOKEDBY || '',
                    meetType: r.MeetType || '',
                })));
            })
            .catch((err) => setBkError(err.message))
            .finally(() => setBkLoading(false));
    }, [dateStr]);

    // ── Drag state ──────────────────────────────────────────────────────
    const [selection, setSelection] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragHallId, setDragHallId] = useState(null);
    const [dragStartSlot, setDragStartSlot] = useState(null);

    // ── Modal + submit state ────────────────────────────────────────────
    const [modalOpen, setModalOpen] = useState(false);
    const [pendingBooking, setPendingBooking] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // ── Toast ───────────────────────────────────────────────────────────
    const [toast, setToast] = useState(null);
    const showToast = (title, sub, type = 'success') => {
        setToast({ title, sub, type });
        setTimeout(() => setToast(null), 4000);
    };

    // ── Current time ────────────────────────────────────────────────────
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        if (!isToday) return;
        const id = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(id);
    }, [isToday]);

    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const nowPct = isToday && nowMinutes >= TIMELINE_START && nowMinutes <= TIMELINE_END
        ? ((nowMinutes - TIMELINE_START) / (TIMELINE_END - TIMELINE_START)) * 100
        : null;

    const gridRef = useRef(null);

    const getSlot = useCallback((e) => {
        if (!gridRef.current) return null;
        const rect = gridRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
        const x = clientX - rect.left + gridRef.current.scrollLeft;
        return Math.max(0, Math.min(TOTAL_SLOTS - 1, Math.floor(x / SLOT_WIDTH)));
    }, []);

    // All fetched bookings are already for dateStr — no need to re-filter by date
    const dayBookings = useMemo(() => bookings, [bookings]);

    // ── Clamp selection around booked blocks ────────────────────────────
    const clampSelection = useCallback((hallId, anchorSlot, currentSlot) => {
        const minSlot = Math.min(anchorSlot, currentSlot);
        const maxSlot = Math.max(anchorSlot, currentSlot);
        let clampedStart = TIMELINE_START + minSlot * SLOT_DURATION;
        let clampedEnd = TIMELINE_START + (maxSlot + 1) * SLOT_DURATION;

        const hallBookings = dayBookings
            .filter((b) => b.hallId === hallId)
            .sort((a, b) => a.startTime - b.startTime);

        for (const b of hallBookings) {
            if (b.startTime < clampedEnd && b.endTime > clampedStart) {
                if (anchorSlot <= currentSlot) clampedEnd = Math.min(clampedEnd, b.startTime);
                else clampedStart = Math.max(clampedStart, b.endTime);
            }
        }
        if (clampedStart >= clampedEnd) return null;
        return {
            hallId,
            startSlot: (clampedStart - TIMELINE_START) / SLOT_DURATION,
            endSlot: (clampedEnd - TIMELINE_START) / SLOT_DURATION - 1,
        };
    }, [dayBookings]);

    // ── Pointer handlers ────────────────────────────────────────────────
    const handlePointerDown = (hallId, slot) => {
        const time = TIMELINE_START + slot * SLOT_DURATION;
        if (dayBookings.some((b) => b.hallId === hallId && time >= b.startTime && time < b.endTime)) return;
        setIsDragging(true);
        setDragHallId(hallId);
        setDragStartSlot(slot);
        setSelection({ hallId, startSlot: slot, endSlot: slot });
    };
    const handlePointerMove = (e) => {
        if (!isDragging || dragHallId === null || dragStartSlot === null) return;
        const slot = getSlot(e);
        if (slot === null) return;
        const newSel = clampSelection(dragHallId, dragStartSlot, slot);
        if (newSel) setSelection(newSel);
    };
    const handlePointerUp = () => {
        if (!isDragging || !selection) { setIsDragging(false); return; }
        setIsDragging(false);
        const startTime = TIMELINE_START + selection.startSlot * SLOT_DURATION;
        const endTime = TIMELINE_START + (selection.endSlot + 1) * SLOT_DURATION;
        setPendingBooking({ hallId: selection.hallId, startTime, endTime });
        setModalOpen(true);
    };

    // ── Booking confirm → POST to backend ───────────────────────────────
    const handleConfirm = async ({ title, organizer, meetType, linkRequired, onBehalfOf }) => {
        if (!pendingBooking) return;
        setSubmitting(true);
        try {
            const hallName = halls.find((h) => String(h.HALLID) === pendingBooking.hallId)?.HALLNAME ?? '';
            const result = await createBooking({
                hallId: pendingBooking.hallId,
                date: dateStr,
                startSlot: minutesToSlot(pendingBooking.startTime),
                endSlot: minutesToSlot(pendingBooking.endTime) - 1, // endSlot is inclusive in DB
                title,
                meetType,
                onBehalfOf: onBehalfOf || null,
                linkRequired: linkRequired,
            });

            setModalOpen(false);
            setSelection(null);
            setPendingBooking(null);

            const isPending = result.status === 'PENDING';
            showToast(
                isPending ? 'Booking Pending Approval' : 'Booking Confirmed! ✅',
                `${title} · ${hallName}`,
                isPending ? 'warn' : 'success'
            );

            // Refresh timeline
            getTimelineBookings(dateStr).then((rows) => {
                setBookings(rows.map((r) => ({
                    id: r.BOOKINGID,
                    hallId: String(r.HALLID),
                    date: dateStr,
                    startTime: slotToMinutes(r.STARTSLOT),
                    endTime: slotToMinutes(r.ENDSLOT) + SLOT_DURATION,
                    title: r.MEETTITLE || '(untitled)',
                    organizer: r.BOOKEDBY || '',
                    meetType: r.MeetType || '',
                })));
            }).catch(() => { });
        } catch (err) {
            showToast('Booking Failed ❌', err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleModalClose = (open) => {
        setModalOpen(open);
        if (!open) { setSelection(null); setPendingBooking(null); }
    };

    // ── Time labels ─────────────────────────────────────────────────────
    const timeLabels = [];
    for (let i = 0; i <= TOTAL_SLOTS; i++) {
        if (i % 4 === 0)
            timeLabels.push({ slot: i, label: minutesToTime(TIMELINE_START + i * SLOT_DURATION) });
    }

    const totalWidth = TOTAL_SLOTS * SLOT_WIDTH;

    return (
        <>
            {/* Loading / Error banners */}
            {bkLoading && (
                <div className="flex items-center gap-2 mb-3 text-[13px] text-[#64748B]">
                    <div className="w-4 h-4 border-2 border-[#007BFF] border-t-transparent rounded-full animate-spin" />
                    Loading bookings…
                </div>
            )}
            {bkError && (
                <div className="mb-3 px-4 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[13px] text-rose-600">
                    ⚠️ {bkError}
                </div>
            )}

            {/* Timeline */}
            <div className="flex rounded-xl overflow-hidden border border-[#CBD5E1] bg-white shadow-lg">
                {/* Hall labels column */}
                <div className="flex-shrink-0 border-r border-[#CBD5E1] bg-white z-10">
                    <div className="h-10 border-b border-[#CBD5E1] bg-[#EEF2F8] flex items-center px-4">
                        <span className="text-[10px] font-semibold tracking-widest uppercase text-[#64748B]">Halls</span>
                    </div>
                    {halls.map((hall) => (
                        <div key={hall.HALLID} className="h-16 border-b border-[#E2E8F0] flex flex-col justify-center px-4 min-w-[160px]">
                            <span className="text-sm font-medium text-[#003366] leading-tight">{hall.HALLNAME}</span>
                            <span className="text-[11px] text-[#64748B]">{hall.BUILDNAME}</span>
                        </div>
                    ))}
                </div>

                {/* Scrollable grid */}
                <div ref={gridRef} className="flex-1 overflow-x-auto timeline-scroll select-none"
                    onMouseMove={handlePointerMove} onMouseUp={handlePointerUp} onMouseLeave={handlePointerUp}>
                    <div style={{ width: totalWidth, minWidth: '100%' }} className="relative">

                        {/* Time header */}
                        <div className="h-10 border-b border-[#CBD5E1] bg-[#EEF2F8] relative">
                            {timeLabels.map(({ slot, label }) => (
                                <div key={slot} className="absolute top-0 h-full flex items-center text-[11px] font-medium text-[#64748B] pl-1.5 pointer-events-none" style={{ left: slot * SLOT_WIDTH }}>
                                    {label}
                                </div>
                            ))}
                        </div>

                        {/* Hall rows */}
                        {halls.map((hall) => {
                            const hallId = String(hall.HALLID);
                            const hallBookings = dayBookings.filter((b) => b.hallId === hallId);
                            return (
                                <div key={hall.HALLID} className="h-16 border-b border-[#E2E8F0] relative">
                                    {/* Slot cells */}
                                    {Array.from({ length: TOTAL_SLOTS }).map((_, i) => (
                                        <div key={i}
                                            className={`absolute top-0 h-full cursor-crosshair hover:bg-[#007BFF]/5 transition-colors ${i % 4 === 0 ? 'border-l border-[#CBD5E1]' : 'border-l border-[#E2E8F0]'}`}
                                            style={{ left: i * SLOT_WIDTH, width: SLOT_WIDTH }}
                                            onMouseDown={() => handlePointerDown(hallId, i)}
                                        />
                                    ))}

                                    {/* Booked blocks */}
                                    {hallBookings.map((b) => {
                                        const startSlot = (b.startTime - TIMELINE_START) / SLOT_DURATION;
                                        const endSlot = (b.endTime - TIMELINE_START) / SLOT_DURATION;
                                        return (
                                            <div key={b.id}
                                                className="absolute top-1.5 bottom-1.5 rounded-lg bg-[#007BFF]/10 border border-[#007BFF]/30 hash-pattern pointer-events-none flex flex-col justify-center px-2 overflow-hidden"
                                                style={{ left: startSlot * SLOT_WIDTH, width: (endSlot - startSlot) * SLOT_WIDTH }}>
                                                <p className="text-[11px] font-semibold text-[#003366]/80 truncate">{b.title}</p>
                                                <p className="text-[10px] text-[#64748B] truncate">{b.organizer}</p>
                                            </div>
                                        );
                                    })}

                                    {/* Selection */}
                                    {selection && selection.hallId === hallId && (
                                        <div className="absolute top-1.5 bottom-1.5 rounded-lg bg-[#007BFF]/20 border-2 border-[#007BFF]/50 pointer-events-none z-10 flex items-center justify-center sel-pulse"
                                            style={{ left: selection.startSlot * SLOT_WIDTH, width: (selection.endSlot - selection.startSlot + 1) * SLOT_WIDTH }}>
                                            <span className="text-[11px] font-semibold text-[#007BFF] whitespace-nowrap px-1">
                                                {minutesToTime(TIMELINE_START + selection.startSlot * SLOT_DURATION)}
                                                {' – '}
                                                {minutesToTime(TIMELINE_START + (selection.endSlot + 1) * SLOT_DURATION)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Current time line */}
                        {nowPct !== null && (
                            <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-20 pointer-events-none" style={{ left: `${nowPct}%` }}>
                                <div className="absolute -top-0 -left-[5px] w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_6px_2px_rgba(244,63,94,0.4)]" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
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

            {/* Submitting overlay */}
            {submitting && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="flex items-center gap-3 bg-white border border-[#CBD5E1] rounded-xl px-6 py-4 text-[14px] text-[#003366] shadow-xl">
                        <div className="w-5 h-5 border-2 border-[#007BFF] border-t-transparent rounded-full animate-spin" />
                        Submitting booking…
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className={`modal-in fixed bottom-6 right-6 z-[9999] flex items-start gap-3 bg-white border border-[#CBD5E1] rounded-xl px-5 py-4 shadow-xl max-w-xs pointer-events-none border-l-4 ${toast.type === 'error' ? 'border-l-rose-500' : toast.type === 'warn' ? 'border-l-amber-500' : 'border-l-[#007BFF]'
                    }`}>
                    <div>
                        <p className="text-[13px] font-semibold text-[#003366]">{toast.title}</p>
                        <p className="text-[12px] text-[#64748B] mt-0.5">{toast.sub}</p>
                    </div>
                </div>
            )}
        </>
    );
}
