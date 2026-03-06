import { ENDPOINTS } from '../config/api';

export const calendarService = {

  // getHolidaysByYear: async (year) => {
  //   try {
  //     const url = `${ENDPOINTS.CALENDAR}?year=${year}`;
  //     const response = await fetch(url, {
  //       method: 'GET',
  //       headers: { 'Content-Type': 'application/json' },
  //       credentials: 'include'
  //     });

  //     if (!response.ok) {
  //       throw new Error(`Server error: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     return Array.isArray(data) ? data : (data[0] || []);
  //   } catch (error) {
  //     console.error("Holiday Service Error:", error);
  //     return [];
  //   }
  // },
  getMonthlyData: async (year, month) => {
    try {
      // Appends '/monthly' to your base endpoint and passes both parameters
      const url = `${ENDPOINTS.CALENDAR}/monthly?year=${year}&month=${month}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      // Since our new backend controller returns an Object (dictionary map) 
      // instead of an Array, we just return the data directly!
      return data; 
      
    } catch (error) {
      console.error("Calendar Monthly Service Error:", error);
      return {}; // Return an empty object on failure so the calendar doesn't crash
    }
  }
};
