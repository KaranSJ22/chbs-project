const { callSP } = require('../queries/spWrapper');
const SP = require('../../property/procedures');

// 1. Get Pending Approvals
exports.getPendingBookings = async (req, res) => {
    console.log("Hitting");
    try {
        const result = await callSP(SP.ADMIN_GET_PENDING);
        const rows = result && result[0] ? result : [];        
        res.status(200).json(rows); 
    } catch (err) {
        console.error("Admin Pending Error:", err);
        res.status(500).json({ error: "Failed to fetch pending bookings" });
    }
};


// 2. Decide Booking (Reject)
exports.decideBooking = async (req, res) => {
    const { bookingId, status } = req.body; 

    if (!bookingId || !['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ error: "Invalid Booking ID or Status" });
    }

    try {
        await callSP(SP.ADMIN_DECIDE_BOOKING, { 
            p_BookingID: bookingId, 
            p_Status: status 
        });

        res.status(200).json({ message: `Booking ${status} successfully` });
    } catch (err) {
        console.error("Admin Decide Error:", err);
        res.status(500).json({ error: "Failed to update booking status" });
    }
};

exports.addHall = async (req, res) => {
    const { name, building, code } = req.body;

    try {
        const result = await callSP(SP.ADMIN_ADD_HALL, {
            p_HallName: name,
            p_BuildName: building,
            p_HallCode: code
        });
        
        const newId = result[0] ? result[0].CreatedHallID : null;
        
        res.status(201).json({ message: "Hall Created", hallId: newId });
    } catch (err) {
        console.error("Add Hall Error:", err);
        res.status(500).json({ error: "Failed to create hall" });
    }
};

// 4. Add User 
exports.addUser = async (req, res) => {
    const { empCode, password, role, status } = req.body;

    try {
        await callSP(SP.ADMIN_ADD_USER, {
            p_EmpCode: empCode,
            p_Password: password,
            p_RoleId: role,
            p_Status: status
        });

        res.status(201).json({ message: "User Created Successfully" });
    } catch (err) {
        console.error("Add User Error:", err);
        res.status(500).json({ error: "Failed to create user" });
    }
};