import { ENDPOINTS } from '../config/api';

const admin = ENDPOINTS.ADMIN;

const fetchJSON = async (url, options = {}) => {
    const response = await fetch(url, { credentials: 'include', ...options });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || data.message || 'Request failed');
    return data;
};

export const adminService = {
    //  Pending Approvals currently all, but It needs to only fetch Director hall
    getPendingBookings: () =>
        fetchJSON(`${admin}/pending`),

    //  Approve or Reject
    decideBooking: (bookingId, status) =>
        fetchJSON(`${admin}/decide`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId, status })
        }),

    // Add Hall
    addHall: (hallData) =>
        fetchJSON(`${admin}/hall`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(hallData)
        }),

    // Edit Hall
    editHall: (hallData) =>
        fetchJSON(`${admin}/hall`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(hallData)
        }),

    // Add User
    addUser: (userData) =>
        fetchJSON(`${admin}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        }),

    // Add Meeting Type
    addMeetingType: (typeData) =>
        fetchJSON(`${ENDPOINTS.MEETING_TYPES}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(typeData) // { name, desc }
        }),

    // Edit Meeting Type
    editMeetingType: (typeData) =>
        fetchJSON(`${admin}/meet-type`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(typeData)
        }),
};