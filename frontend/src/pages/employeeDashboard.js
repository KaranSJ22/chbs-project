import { getUserDashboard, getBookingHistory, cancelBooking } from '../services/bookingService';

export const fetchDashboardData = async () => {
  try {
    const live = await getUserDashboard();
    const history = await getBookingHistory();

    const pendingTable = live.filter(b => b.BOOKINGSTATUS === 'PENDING');
    const confirmedTable = live.filter(b => b.BOOKINGSTATUS === 'CONFIRMED');
    const historyTable = [...confirmedTable, ...history];

    return { pendingTable, historyTable };
  } catch (error) {
    console.error('Dashboard data load failed', error);
    return { pendingTable: [], historyTable: [] };
  }
};

export const handleBookingAction = async (bookingId, action) => {
  try {
    return await cancelBooking({ bookingId });
  } catch (error) {
    console.error(`Action ${action} failed:`, error);
    throw error;
  }
};

// need to make it to show only today and future bookings no need to history history