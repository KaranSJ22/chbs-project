import { ENDPOINTS } from '../config/api';

export const holidayService = {
 
  getHolidaysByYear: async (year) => {
    try {
      const url = `${ENDPOINTS.CALENDAR}?year=${year}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : (data[0] || []);
    } catch (error) {
      console.error("Holiday Service Error:", error);
      return [];
    }
  }
};