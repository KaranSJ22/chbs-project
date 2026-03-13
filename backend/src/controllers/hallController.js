const SP = require('../../property/procedures');
const { callSP } = require('../queries/spWrapper');

const getRows = (result) => (result && Array.isArray(result[0]) ? result[0] : result || []);

// All Halls even disabled one also
exports.getAllHalls = async (req, res) => {
  try {
    const result = await callSP(SP.GET_ALL_HALLS);
    res.status(200).json(getRows(result));
  } catch (error) {
    console.error('Get All Halls Error:', error);
    res.status(500).json({ error: 'Failed to fetch halls.' });
  }
};

// Available Halls for a given date -- used in Booking Form drop down
exports.getAvailableHalls = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'date query param is required (YYYY-MM-DD).' });
    }

    const result = await callSP(SP.GET_ALL_HALLSB, { p_Date: date });
    res.status(200).json(getRows(result));
  } catch (error) {
    console.error('Get Available Halls Error:', error);
    res.status(500).json({ error: 'Failed to fetch available halls.' });
  }
};

exports.checkAvailability = async (req, res) => {
  try {
    const { hallId, date, startSlot, endSlot } = req.query;

    if (!hallId || !date || !startSlot || !endSlot) {
      return res.status(400).json({ error: 'hallId, date, startSlot, and endSlot are required.' });
    }

    const result = await callSP(SP.CHECK_AVAILABILITY, {
      p_HallID: hallId,
      p_Date: date,
      p_Start: startSlot,
      p_End: endSlot
    });

    const rows = getRows(result);
    const conflictCount = rows[0]?.ConflictCount ?? 0;
    res.status(200).json({ available: conflictCount === 0, conflictCount });
  } catch (error) {
    console.error('Check Availability Error:', error);
    res.status(500).json({ error: 'Failed to check availability.' });
  }
};

// Disable Hall
exports.updateHallStatus = async (req, res) => {
  try {
    const { hallId, fromDate, toDate } = req.body;

    if (!hallId || !fromDate || !toDate) {
      return res.status(400).json({ error: 'hallId, fromDate, and toDate are required.' });
    }

    await callSP(SP.ADMIN_DISABLE_HALL, {
      p_HID: hallId,
      p_From: fromDate,
      p_To: toDate
    });

    res.status(200).json({ message: 'Hall disabled. It will auto-enable after the maintenance window.' });
  } catch (error) {
    console.error('Update Hall Status Error:', error);
    res.status(500).json({ error: 'Failed to update hall status.' });
  }
};

// Enable Hall
exports.enableHall = async (req, res) => {
  try {
    const { hallId } = req.body;

    if (!hallId) {
      return res.status(400).json({ error: 'hallId is required.' });
    }

    await callSP(SP.ADMIN_ENABLE_HALL, {
      p_HID: hallId,
      p_Avail: 1
    });

    res.status(200).json({ message: 'Hall enabled successfully.' });
  } catch (error) {
    console.error('Enable Hall Error:', error);
    res.status(500).json({ error: 'Failed to enable hall.' });
  }
};