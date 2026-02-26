const { callSP } = require('../queries/spWrapper');
const SP = require('../../property/procedures');

// all holidays
exports.getAllHolidays = async (req, res) => {
    try {
        let results = await callSP(SP.GET_HOLIDAYS);
        const holidays = Array.isArray(results[0]) ? results[0] : results;
        res.status(200).json(holidays);
    } catch (error) {
        console.error('Holiday Controller Error:', error);
        res.status(500).json({ error: 'Failed to fetch holidays.' });
    }
};