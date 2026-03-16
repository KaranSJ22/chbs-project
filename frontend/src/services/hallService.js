import { ENDPOINTS } from '../config/api';

// All halls — admin management view
export const fetchAllHalls = async () => {
    const response = await fetch(ENDPOINTS.HALLS, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to load halls');
    return response.json();
};

// Available halls for a specific date — booking form dropdown
export const fetchAvailableHalls = async (date) => {
    const url = `${ENDPOINTS.HALLS}/available?date=${encodeURIComponent(date)}`;
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to load available halls');
    return response.json();
};

// Check if a slot range is free for a hall + date
export const checkAvailability = async (hallId, date, startSlot, endSlot) => {
    const url = new URL(`${ENDPOINTS.HALLS}/availability`, window.location.origin);
    url.searchParams.set('hallId', hallId);
    url.searchParams.set('date', date);
    url.searchParams.set('startSlot', startSlot);
    url.searchParams.set('endSlot', endSlot);

    const response = await fetch(url.toString(), { credentials: 'include' });
    return response.json();
};

// Disable a hall for maintenance
export const updateHallStatus = async (statusData) => {
    const response = await fetch(`${ENDPOINTS.HALLS}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(statusData),
    });
    return response.json();
};

// Enable a hall manually
export const enableHall = async (hallId) => {
    const response = await fetch(`${ENDPOINTS.HALLS}/enable`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ hallId }),
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || err.message || 'Failed to enable hall');
    }
    return response.json();
};