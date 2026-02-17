module.exports = (sequelize, Sequelize) => {
    const BookingSlot = sequelize.define("booking_slot", {
      BOOKINGID: {
        type: Sequelize.STRING(50),
        primaryKey: true
      },
      SLOTID: {
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      HALLID: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      BOOKINGDATE: {
        type: Sequelize.DATEONLY, 
        allowNull: false
      }
    }, {
      tableName: 'CHBS_BOOKING_SLOTS',
      timestamps: false,
      freezeTableName: true
    });
  
    return BookingSlot;
};