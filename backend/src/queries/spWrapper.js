// const { sequelize } = require('../models');

// const callSP = async (procName, params = {}) => {
//     try {

//         const replacements = Object.keys(params);
//         const args = replacements.length > 0 ? replacements.map(r => `:${r}`).join(',') : '';

//         return await sequelize.query(`CALL ${procName}(${args})`, {
//             replacements: params
//         });
//     } catch (error) {
//         console.error(`Error executing SP: ${procName}`, error);
//         throw error;
//     }
// };

// module.exports = { callSP };

// const { getPool } = require('../models/index'); // Grab the pool getter

// const callSP = async (procName, params = {}) => {
//     let connection;
//     try {
//         // 1. Grab an available connection from the pool
//         const pool = getPool();
//         connection = await pool.connect();

//         const paramNames = Object.keys(params);
//         const paramValues = Object.values(params);

//         // 2. Format for Sybase (@param=?)
//         const args = paramNames.length > 0 
//             ? paramNames.map(key => `@${key}=?`).join(', ') 
//             : '';

//         const query = `EXEC ${procName} ${args}`;

//         // 3. Execute
//         const result = await connection.query(query, paramValues);
//         return result;

//     } catch (error) {
//         console.error(`Error executing SP: ${procName}`, error);
//         throw error;
//     } finally {
//         // 4. Return the connection back to the pool!
//         if (connection) {
//             await connection.close(); 
//         }
//     }
// };

// module.exports = { callSP };

const { getPool } = require('../models/index'); // Grab the pool getter

const callSP = async (procName, params = {}) => {
    let connection;
    try {
        // 1. Grab an available connection from the pool
        const pool = getPool();
        connection = await pool.connect();

        const paramValues = Object.values(params);

        // 2. Format for ODBC Escape Syntax: {CALL ProcName(?, ?, ?)}
        const placeholders = paramValues.length > 0
            ? paramValues.map(() => '?').join(', ')
            : '';

        const query = `{CALL ${procName}(${placeholders})}`;

        // 3. Execute
        const result = await connection.query(query, paramValues);
        return result;

    } catch (error) {
        console.error(`Error executing SP: ${procName}`, error);
        throw error;
    } finally {
        // 4. Return the connection back to the pool!
        if (connection) {
            await connection.close();
        }
    }
};

module.exports = { callSP };