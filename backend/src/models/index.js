const Sequelize = require('sequelize');
require('dotenv').config();
// const dbConfig = require("../../property/db.properties");

// const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
//     host: dbConfig.HOST,
//     dialect: dbConfig.dialect,
//     pool: {
//         max: dbConfig.pool.max,
//         min: dbConfig.pool.min,
//         acquire: dbConfig.pool.acquire,
//         idle: dbConfig.pool.idle
//     },
//     logging: false
// });
const sequelize=new Sequelize(process.env.DB_NAME,process.env.DB_USER, process.env.DB_PASSWORD,{
    host:process.env.DB_HOST,
    dialect:process.env.DB_DIALECT,
    pool:{
        max:parseInt(process.env.DB_POOL_MAX),
        min:parseInt(process.env.DB_POOL_MIN),
        min: parseInt(process.env.DB_POOL_MIN),
        acquire: parseInt(process.env.DB_POOL_ACQUIRE),
        idle: parseInt(process.env.DB_POOL_IDLE)
    
     
    },
    logging: false
})


const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.halls = require("./Hall")(sequelize, Sequelize);
db.bookings = require("./Booking")(sequelize, Sequelize);
db.slots = require("./SlotInfo")(sequelize, Sequelize);
db.booking_slots = require("./BookingSlot")(sequelize, Sequelize);
db.meetingTypes = require("./MeetingType")(sequelize, Sequelize);
db.holidays=require("./Holiday")(sequelize,Sequelize);

module.exports = db;
