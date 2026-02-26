const SP = require('../../property/procedures');
const { callSP } = require('../queries/spWrapper');

const getRows = (result) => (result && Array.isArray(result[0]) ? result[0] : result || []);

// Create Booking
exports.createBooking = async (req, res) => {
    try {
        // slotIds replaced with startSlot/endSlot (integer SLOTID values from CHBS_SLOTINFO)
        const { hallId, startSlot, endSlot, date, onBehalfOf, title, meetType, linkRequired } = req.body;
        const empCode = req.user.empCode;

        if (!hallId || !startSlot || !endSlot || !date || !title || !meetType) {
            return res.status(400).json({ error: 'hallId, startSlot, endSlot, date, title, and meetType are required.' });
        }

        const result = await callSP(SP.CREATE_BOOKING, {
            p_HID: hallId,
            p_By: empCode,
            p_Behalf: onBehalfOf || null,
            p_Ttl: title,
            p_Typ: meetType,
            p_Start: startSlot,
            p_End: endSlot,
            p_MeetDate: date,
            p_Lnk: linkRequired || 'NO'
        });

        const rows = getRows(result);
        const spStatus = rows[0]?.Status;
        
        if (spStatus === 'HOLIDAY_RESTRICTION') {
            return res.status(422).json({ error: 'Bookings cannot be made on public holidays.' });
        }
        if (spStatus === 'ERROR') {
            return res.status(500).json({ error: 'Booking failed due to a database error.' });
        }

        const isPending = spStatus === 'PENDING';
        res.status(201).json({
            message: isPending
                ? 'Booking submitted and pending admin approval.'
                : 'Booking confirmed successfully.',
            bookingId: rows[0]?.BookingID,
            status: spStatus
        });
    } catch (error) {
        console.error('Create Booking Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// User Live Dashboard
exports.getUserDashboard = async (req, res) => {
    try {
        const empCode = req.user.empCode;
        const result = await callSP(SP.USER_DASHBOARD, { p_EmpCode: empCode });
        res.status(200).json(getRows(result));
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// 3 User History 
exports.getBookingHistory = async (req, res) => {
    try {
        const empCode = req.user.empCode;
        const result = await callSP(SP.USER_HISTORY, { p_EmpCode: empCode });
        res.status(200).json(getRows(result));
    } catch (error) {
        console.error('History Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Cancel
exports.cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const empCode = req.user.empCode;

        if (!bookingId) {
            return res.status(400).json({ error: 'Booking ID is required.' });
        }

        const result = await callSP(SP.CANCEL_BOOKING, {
            p_BKID: bookingId,
            p_EmpCode: empCode
        });

        const rows = getRows(result);
        const spStatus = rows[0]?.Status;

        if (spStatus === 'NOT_FOUND') return res.status(404).json({ error: 'Booking not found.' });
        if (spStatus === 'UNAUTHORIZED') return res.status(403).json({ error: 'You can only cancel your own bookings.' });
        if (spStatus === 'ALREADY_CLOSED') return res.status(409).json({ error: 'Booking is already cancelled or rejected.' });

        res.status(200).json({ message: 'Booking cancelled successfully.' });
    } catch (error) {
        console.error('Cancel Booking Error:', error);
        res.status(500).json({ error: error.message });
    }
};


// can redis be used to store holidays in cache for faster cheicking so that some load from db can be reduced
// booking made must be show from todays date, not before it
// redis lock for hallid to prevent race condition