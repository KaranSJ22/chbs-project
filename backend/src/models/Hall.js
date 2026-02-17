module.exports = (sequelize, Sequelize) => {
    const Hall = sequelize.define("hall", {
      HALLID: {
        type: Sequelize.STRING(50),
        primaryKey: true
      },
      BUILDNAME: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      HALLNAME: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      HALLCODE: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true
      },
      isAvailable:{
        type:Sequelize.BOOLEAN,
        defaultValue:true
      }
    }, {
      tableName: 'CHBS_HALLS',
      timestamps: false,      
      freezeTableName: true
    });
  
    return Hall;
};