module.exports = (sequelize, Sequelize) => {
    const Booking = sequelize.define("booking", {
      BOOKINGID: {
        type: Sequelize.STRING(50),
        primaryKey: true
      },
      HALLID: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      BOOKEDBY: {
        type: Sequelize.STRING(7), 
        allowNull: false
      },
      BOOKEDENTITY: {
        type: Sequelize.STRING(10), 
        allowNull: false
      },
      BOOKINGDATE: {
        type: Sequelize.DATE,
        allowNull: false
      },
      BOOKINGSTATUS: {
        type: Sequelize.STRING(20),
        allowNull: false
      }
    }, {
      tableName: 'CHBS_BOOKINGS',
      timestamps: false,
      freezeTableName: true
    });
  
    return Booking;
};