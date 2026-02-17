import { ENDPOINTS } from '../config/api';

export const fetchAllMeetingTypes = async () => {
    const response = await fetch(ENDPOINTS.MEETING_TYPES);
    if (!response.ok) throw new Error("Failed to load meeting types");
    return await response.json();
};

