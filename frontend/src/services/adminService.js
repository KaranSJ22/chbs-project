import {ENDPOINTS } from '../config/api';


export const adminService = {
    // 1. Fetch Pending Approvals
    getPendingBookings: async () => {
        const response = await fetch(`${ENDPOINTS.ADMIN}/pending`);
        if (!response.ok) throw new Error('Failed to fetch bookings');
        return await response.json();
    },

    // 2. Approve or Reject Needs to changed only reject
    decideBooking: async (bookingId, status) => {
        const response = await fetch(`${ENDPOINTS.ADMIN}/decide`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId, status })
        });
        if (!response.ok) throw new Error('Action failed');
        return await response.json();
    },

    // 3. Add New Hall
    addHall: async (hallData) => {
        const response = await fetch(`${ENDPOINTS.ADMIN}/hall`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(hallData)
        });
        if (!response.ok) throw new Error('Failed to create hall');
        return await response.json();
    },

    // 4. Add New User
    addUser: async (userData) => {
        const response = await fetch(`${ENDPOINTS.ADMIN}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!response.ok) throw new Error('Failed to create user');
        return await response.json();
    }

    
};