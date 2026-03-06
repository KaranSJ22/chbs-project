import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
    SLOT_DURATION, TIMELINE_START, TIMELINE_END, TOTAL_SLOTS, minutesToTime
} from '../lib/bookingData';
import { getTimelineBookings, createBooking, adminCancelBooking } from '../services/bookingService';

const slotToMinutes = (slot) => TIMELINE_START + (slot - 1) * SLOT_DURATION;
const minutesToSlot = (minutes) => (minutes - TIMELINE_START) / SLOT_DURATION + 1;

export function useBookingTimeline({ halls, selectedDate, isAdmin, currentUser }) {
    const pad = (n) => String(n).padStart(2, '0');
    const dateStr = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const isToday = dateStr === todayStr;

    const [bookings, setBookings] = useState([]);
    const [bkLoading, setBkLoading] = useState(false);
    const [bkError, setBkError] = useState(null);

    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, booking: null });
    const [viewDetailsModal, setViewDetailsModal] = useState(false);
    const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
    const [activeAdminBooking, setActiveAdminBooking] = useState(null);

    const [selection, setSelection] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragHallId, setDragHallId] = useState(null);
    const [dragStartSlot, setDragStartSlot] = useState(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [pendingBooking, setPendingBooking] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [toast, setToast] = useState(null);
    const [now, setNow] = useState(new Date());
    const gridRef = useRef(null);

    const showToast = (title, sub, type = 'success') => {
        setToast({ title, sub, type });
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        const handleClick = () => {
            if (contextMenu.visible) setContextMenu((prev) => ({ ...prev, visible: false }));
        };
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [contextMenu.visible]);

    const fetchBookings = useCallback(() => {
        setBkLoading(true);
        setBkError(null);
        getTimelineBookings(dateStr)
            .then((rows) => {
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
            })
            .catch((err) => setBkError(err.message))
            .finally(() => setBkLoading(false));
    }, [dateStr]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    useEffect(() => {
        if (!isToday) return;
        const id = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(id);
    }, [isToday]);

    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const nowPct = isToday && nowMinutes >= TIMELINE_START && nowMinutes <= TIMELINE_END
        ? ((nowMinutes - TIMELINE_START) / (TIMELINE_END - TIMELINE_START)) * 100
        : null;

    const getSlot = useCallback((e) => {
        if (!gridRef.current) return null;
        const rect = gridRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
        const x = clientX - rect.left;
        const dynamicSlotWidth = rect.width / TOTAL_SLOTS;
        return Math.max(0, Math.min(TOTAL_SLOTS - 1, Math.floor(x / dynamicSlotWidth)));
    }, []);

    const clampSelection = useCallback((hallId, anchorSlot, currentSlot) => {
        const minSlot = Math.min(anchorSlot, currentSlot);
        const maxSlot = Math.max(anchorSlot, currentSlot);
        let clampedStart = TIMELINE_START + minSlot * SLOT_DURATION;
        let clampedEnd = TIMELINE_START + (maxSlot + 1) * SLOT_DURATION;

        const hallBookings = bookings
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
    }, [bookings]);

    const handlePointerDown = (hallId, slot) => {
        const time = TIMELINE_START + slot * SLOT_DURATION;
        if (bookings.some((b) => b.hallId === hallId && time >= b.startTime && time < b.endTime)) return;
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

    const canRightClick = (booking) => isAdmin || (currentUser && booking.organizer === currentUser.empCode);

    const handleRightClick = (e, booking) => {
        if (!canRightClick(booking)) return;
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ visible: true, x: e.clientX, y: e.clientY, booking });
    };

    const handleConfirm = async ({ title, meetType, linkRequired, onBehalfOf }) => {
        if (!pendingBooking) return;
        setSubmitting(true);
        try {
            const hallName = halls.find((h) => String(h.HALLID) === pendingBooking.hallId)?.HALLNAME ?? '';
            const result = await createBooking({
                hallId: pendingBooking.hallId,
                date: dateStr,
                startSlot: minutesToSlot(pendingBooking.startTime),
                endSlot: minutesToSlot(pendingBooking.endTime) - 1,
                title, meetType, onBehalfOf: onBehalfOf || null, linkRequired,
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
            fetchBookings();
        } catch (err) {
            showToast('Booking Failed ❌', err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteBooking = async () => {
        if (!activeAdminBooking) return;
        try {
            await adminCancelBooking(activeAdminBooking.id);
            showToast('Booking Cancelled', `"${activeAdminBooking.title}" has been removed.`, 'error');
            setDeleteConfirmModal(false);
            setActiveAdminBooking(null);
            fetchBookings();
        } catch (err) {
            showToast('Cancel Failed ❌', err.message, 'error');
            setDeleteConfirmModal(false);
        }
    };

    const handleModalClose = (open) => {
        setModalOpen(open);
        if (!open) { setSelection(null); setPendingBooking(null); }
    };

    const timeLabels = useMemo(() => {
        const labels = [];
        for (let i = 0; i <= TOTAL_SLOTS; i++) {
            if (i % 4 === 0) {
                labels.push({ slot: i, label: minutesToTime(TIMELINE_START + i * SLOT_DURATION) });
            }
        }
        return labels;
    }, []);

    return {
        bookings, bkLoading, bkError, dateStr, timeLabels, nowPct,
        contextMenu, setContextMenu, viewDetailsModal, setViewDetailsModal,
        deleteConfirmModal, setDeleteConfirmModal, activeAdminBooking, setActiveAdminBooking,
        selection, gridRef, handlePointerDown, handlePointerMove, handlePointerUp,
        canRightClick, handleRightClick, handleConfirm, handleDeleteBooking, handleModalClose,
        modalOpen, pendingBooking, submitting, toast
    };
}