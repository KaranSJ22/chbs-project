const { callSP } = require('../queries/spWrapper');
const SP = require('../../property/procedures');

exports.getAllHolidays = async (req, res) => {
    try {
        const { year } = req.query; 

        if (!year) {
            return res.status(400).json({ message: "Year parameter is missing" });
        }

        let results = await callSP(SP.GET_ALL_HOLIDAYS, {
            targetYear: year
        });
        const holidays = Array.isArray(results[0]) ? results[0] : results;

        res.status(200).json(holidays);
        
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};