const { callSP } = require('../queries/spWrapper');
const SP = require('../../property/procedures');
const bcrypt = require('bcrypt');

// helper function
const getRows = (result) => (result && Array.isArray(result[0]) ? result[0] : result || []);

// Pending Approvals 
exports.getPendingBookings = async (req, res) => {
    try {
        const result = await callSP(SP.ADMIN_GET_PENDING);
        res.status(200).json(getRows(result));
    } catch (err) {
        console.error('Admin Pending Error:', err);
        res.status(500).json({ error: 'Failed to fetch pending bookings' });
    }
};

//2 Approve / Reject -- Approval for Director Hall mentioned in SRS
exports.decideBooking = async (req, res) => {
    const { bookingId, status } = req.body;
    if (!bookingId || !['CONFIRMED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid booking ID or status. Use CONFIRMED or REJECTED.' });
    }

    try {
        const result = await callSP(SP.ADMIN_DECIDE_BOOKING, { p_BKID: bookingId, p_Stat: status });
        const rows = getRows(result);
        const spStatus = rows[0]?.Status;

        if (spStatus === 'CONFLICT_EXISTS') {
            return res.status(409).json({ error: 'Another confirmed booking already exists for this slot.' });
        }
        if (spStatus === 'CANNOT_APPROVE_ON_HOLIDAY') {
            return res.status(422).json({ error: 'Cannot approve a booking on a public holiday.' });
        }
        if (spStatus === 'NOT_FOUND_OR_NOT_PENDING') {
            return res.status(404).json({ error: 'Booking not found or not in PENDING state.' });
        }

        res.status(200).json({ message: `Booking ${status === 'CONFIRMED' ? 'approved' : 'rejected'} successfully.` });
    } catch (err) {
        console.error('Admin Decide Error:', err);
        res.status(500).json({ error: 'Failed to update booking status' });
    }
};

// Add Hall 
exports.addHall = async (req, res) => {
    const { name, building, code, isDirectorHall } = req.body;

    if (!name || !building || !code) {
        return res.status(400).json({ error: 'Hall name, building, and code are required.' });
    }

    try {
        const result = await callSP(SP.ADMIN_ADD_HALL, {
            p_HName: name,
            p_BName: building,
            p_HCode: code,
            p_isDir: isDirectorHall ? 1 : 0
        });
        const rows = getRows(result);
        const newId = rows[0]?.CreatedID;
        res.status(201).json({ message: 'Hall created successfully.', hallId: newId });
    } catch (err) {
        console.error('Add Hall Error:', err);
        res.status(500).json({ error: 'Failed to create hall.' });
    }
};

//  Edit Hall
exports.editHall = async (req, res) => {
    const { hallId, name, building, isDirectorHall } = req.body;

    if (!hallId || !name || !building) {
        return res.status(400).json({ error: 'Hall ID, name, and building are required.' });
    }

    try {
        await callSP(SP.ADMIN_EDIT_HALL, {
            p_HID: hallId,
            p_HName: name,
            p_BName: building,
            p_isDir: isDirectorHall ? 1 : 0
        });
        res.status(200).json({ message: 'Hall updated successfully.' });
    } catch (err) {
        console.error('Edit Hall Error:', err);
        res.status(500).json({ error: 'Failed to update hall.' });
    }
};

// Edit Meeting Type 
exports.editMeetingType = async (req, res) => {
    const { meetId, name, desc } = req.body;

    if (!meetId || !name || !desc) {
        return res.status(400).json({ error: 'Meeting type ID, name, and description are required.' });
    }

    try {
        await callSP(SP.ADMIN_EDIT_TYPE, {
            p_MID: meetId,
            p_MName: name,
            p_MDesc: desc
        });
        res.status(200).json({ message: 'Meeting type updated successfully.' });
    } catch (err) {
        console.error('Edit Meeting Type Error:', err);
        res.status(500).json({ error: 'Failed to update meeting type.' });
    }
};