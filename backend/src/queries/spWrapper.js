const { sequelize } = require('../models'); 

const callSP = async (procName, params = {}) => {
    try {
        
        const replacements = Object.keys(params);
        const args = replacements.length > 0 ? replacements.map(r => `:${r}`).join(',') : '';
        
        return await sequelize.query(`CALL ${procName}(${args})`, {
            replacements: params
        });
    } catch (error) {
        console.error(`Error executing SP: ${procName}`, error);
        throw error;
    }
};

module.exports = { callSP };