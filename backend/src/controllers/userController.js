const SP = require('../../property/procedures');
const { callSP } = require('../queries/spWrapper');

const getRows = (result) => (result && Array.isArray(result[0]) ? result[0] : result || []);

// get all user for dropdown in PA booking form
exports.getAllUsers = async (req, res) => {
    try {
        const result = await callSP(SP.GET_ALL_USERS);
        res.status(200).json(getRows(result));
    } catch (error) {
        console.error('Get All Users Error:', error);
        res.status(500).json({ error: 'Failed to fetch users.' });
    }
};
