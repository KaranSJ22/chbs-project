module.exports = (sequelize, Sequelize) => {
    const SlotInfo = sequelize.define("slot_info", {
      SLOTID: {
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      START_TIME: {
        type: Sequelize.TIME,
        allowNull: false
      },
      END_TIME: {
        type: Sequelize.TIME,
        allowNull: false
      }
    }, {
      tableName: 'CHBS_SLOTINFO', //  actual SQL table name in database
      timestamps: false,           
      freezeTableName: true
    });
  
    return SlotInfo;
};