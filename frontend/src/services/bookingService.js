import { ENDPOINTS } from '../config/api';

export const createBooking = async (formData) => {
    // empCode is not sent — backend gets it from the JWT http only cookie
    const { ...bookingData } = formData;

    const response = await fetch(ENDPOINTS.BOOKINGS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(bookingData),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || result.message || 'Server Error');
    return result;
};

export const getUserDashboard = async () => {
    const response = await fetch(ENDPOINTS.BOOKINGS + '/dashboard', { credentials: 'include' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Server Error');
    return result;
};

export const getBookingHistory = async () => {
    const response = await fetch(ENDPOINTS.BOOKINGS + '/history', { credentials: 'include' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Server Error');
    return result;
};

export const cancelBooking = async ({ bookingId }) => {
    const response = await fetch(ENDPOINTS.BOOKINGS + '/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ bookingId }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || result.message || 'Cancel Failed');
    return result;
};