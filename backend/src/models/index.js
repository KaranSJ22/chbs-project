// const Sequelize = require('sequelize');
// require('dotenv').config();

// const sequelize=new Sequelize(process.env.DB_NAME,process.env.DB_USER, process.env.DB_PASSWORD,{
//     host:process.env.DB_HOST,
//     dialect:process.env.DB_DIALECT,
//     pool:{
//         max:parseInt(process.env.DB_POOL_MAX),
//         min:parseInt(process.env.DB_POOL_MIN),
//         min: parseInt(process.env.DB_POOL_MIN),
//         acquire: parseInt(process.env.DB_POOL_ACQUIRE),
//         idle: parseInt(process.env.DB_POOL_IDLE)
//     },
//     logging: false
// })


// const db = {};

// db.Sequelize = Sequelize;
// db.sequelize = sequelize;

// db.halls = require("./Hall")(sequelize, Sequelize);
// db.bookings = require("./Booking")(sequelize, Sequelize);
// db.slots = require("./SlotInfo")(sequelize, Sequelize);
// db.booking_slots = require("./BookingSlot")(sequelize, Sequelize);
// db.meetingTypes = require("./MeetingType")(sequelize, Sequelize);
// db.holidays=require("./Holiday")(sequelize,Sequelize);

// module.exports = db;

// const odbc = require('odbc');
// require('dotenv').config();

// // Construct the Sybase ODBC connection string
// // Make sure to add DB_PORT=5000 to your .env file!
// const connectionString = `Driver={Adaptive Server Enterprise};server=${process.env.DB_HOST};port=${process.env.DB_PORT};db=${process.env.DB_NAME};uid=${process.env.DB_USER};pwd=${process.env.DB_PASSWORD};`;

// let dbPool = null;

// const initDbPool = async () => {
//     try {
//         // Create the ODBC connection pool using your existing .env variables
//         dbPool = await odbc.pool({
//             connectionString: connectionString,
//             initialSize: parseInt(process.env.DB_POOL_MIN) || 2,
//             maxSize: parseInt(process.env.DB_POOL_MAX) || 10,
//             // odbc expects timeouts in seconds, so if your env var is in ms, divide by 1000
//             connectionTimeout: 10 
//         });
        
//         console.log("✅ Sybase ODBC Connection Pool initialized successfully.");
//     } catch (error) {
//         console.error("❌ Failed to initialize Sybase connection pool:", error);
//         process.exit(1); // Stop the server if the DB won't connect
//     }
// };

// const getPool = () => {
//     if (!dbPool) {
//         throw new Error("Database pool has not been initialized yet!");
//     }
//     return dbPool;
// };

// module.exports = {
//     initDbPool,
//     getPool
// };

const odbc = require('odbc');
require('dotenv').config();

// Build Sybase ASE connection string from .env
const connectionString =
`Driver={Adaptive Server Enterprise};servername=${process.env.DB_SERVER};Database=${process.env.DB_NAME};Uid=${process.env.DB_USER};Pwd=${process.env.DB_PASSWORD};`;

let dbPool = null;

const initDbPool = async () => {
    try {

        console.log("🔄 Initializing Sybase connection...");
        console.log("Server:", process.env.DB_SERVER);
        console.log("Database:", process.env.DB_NAME);

        dbPool = await odbc.pool({
            connectionString: connectionString,
            initialSize: parseInt(process.env.DB_POOL_MIN) || 2,
            maxSize: parseInt(process.env.DB_POOL_MAX) || 10,
            connectionTimeout: 10
        });

        console.log("✅ Sybase ODBC Connection Pool initialized successfully.");

    } catch (error) {

        console.error("❌ Failed to initialize Sybase connection pool");

        if (error.odbcErrors) {
            error.odbcErrors.forEach(err => {
                console.error(err.message);
            });
        } else {
            console.error(error);
        }

        process.exit(1);
    }
};

const getPool = () => {

    if (!dbPool) {
        throw new Error("Database pool not initialized");
    }

    return dbPool;
};

module.exports = {
    initDbPool,
    getPool
};