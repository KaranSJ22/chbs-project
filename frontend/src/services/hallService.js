import { ENDPOINTS } from '../config/api';

export const fetchAllHalls = async () => {
    const response = await fetch(ENDPOINTS.HALLS);
    if (!response.ok) throw new Error("Failed to load halls");
    return await response.json();
};

export const checkAvailability = async (hallId, date, slot) => {
    const url = new URL(`${ENDPOINTS.HALLS}/availability`);
    url.searchParams.append("hallId", hallId);
    url.searchParams.append("date", date);
    url.searchParams.append("slot", slot);
    
    const response = await fetch(url);
    return await response.json();
};

export const updateHallStatus = async (statusData) => {
    const response = await fetch(`${ENDPOINTS.HALLS}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(statusData), // { hallId, action, fromDate, toDate }
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update hall status");
    }
    return await response.json();
};