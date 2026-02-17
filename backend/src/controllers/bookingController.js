const { v4: uuidv4 } = require('uuid');
const SP = require('../../property/procedures');
const { callSP } = require('../queries/spWrapper'); 

// Helper function: Convert slot ID to time string (HH:MM format)
const slotIdToTime = (slotId) => {
    
    const baseHour = 9;
    const baseMinute = 0;

    const totalMinutes = baseMinute + ((slotId - 1) * 15);
    const hours = baseHour + Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// 1. CREATE BOOKING (Transactions handled inside SP)
exports.createBooking = async (req, res) => {
    try {
        const { hallId, empCode, slotIds, date, title, meetType, linkRequired } = req.body;

        if (!meetType) {
            return res.status(400).json({ message: "Meeting type is required" });
        }

        // Array [1, 2] to String "1,2"
        const slotString = slotIds.join(',');

        // Calculate start and end times from slot IDs O(1);
        const startTime = slotIdToTime(slotIds[0]);
        const endTime = slotIdToTime(slotIds[slotIds.length - 1]);

        const newBookingId = uuidv4();

        // call: (CHSP_BOOK_CONF)
        await callSP(SP.CREATE_BOOKING, {
            p_BookingID: newBookingId,
            p_HallID: hallId,
            p_EmpCode: empCode,
            p_Slots: slotString,      // VARCHAR(50)
            p_Date: date,             // DATETIME
            p_MeetTitle: title,
            p_MeetType: meetType,     // VARCHAR(50) - NEW
            p_StartTime: startTime,   // VARCHAR(5) - NEW
            p_EndTime: endTime,       // VARCHAR(5) - NEW
            p_LinkReq: linkRequired || "NO"
        });

        res.status(201).json({
            message: "Booking Request Submitted",
            bookingId: newBookingId
        });

    } catch (error) {
        // console.error("Booking Error:", error);
        res.status(500).json({ message: "Database Error", error: error.message });
    }
};


// 3. GET USER DASHBOARD
exports.getUserDashboard = async (req, res) => {
    try {
        const { empCode } = req.params;
        const dashboardData = await callSP(SP.USER_DASHBOARD, {
            p_EmpCode: empCode
        });

        res.json(dashboardData);
        // console.log(dashboardData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. CANCEL BOOKING
exports.cancelBooking = async (req, res) => {
    try {
        const { bookingId, empCode } = req.body;

        // Calling: sp_CancelBooking
        await callSP(SP.CANCEL_BOOKING, {
            p_BookingID: bookingId,
            p_EmpCode: empCode
        });

        res.json({ message: "Booking Cancelled Successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. ADMIN UPDATE STATUS (Approve/Reject)
exports.updateStatus = async (req, res) => {
    try {
        const { bookingId, status } = req.body; // Status: 'REJECTED'

        // Calling: sp_UpdateBookingStatus
        await callSP(SP.UPDATE_STATUS, {
            p_BookingID: bookingId,
            p_NewStatus: status
        });

        res.json({ message: `Booking marked as ${status}` });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};