// const { sequelize, Sequelize } = require(".");

module.exports=(sequelize,Sequelize)=>{
    const Holiday=sequelize.define("holiday",{
        HOLIDAYDATE:{
            type:Sequelize.DATEONLY,
            primaryKey:true
        },
        HOLIDAYNAME:{
            type:Sequelize.STRING(100),
            allowNull:false
        },
        HOLIDAYTYPE:{
            type:Sequelize.STRING(20),
            allowNull:false,
            defaultValue: 'NATIONAL'
        },
        ISRECURRING:{
            type: Sequelize.BOOLEAN, 
            allowNull: false,
            defaultValue: false
        }

    },{
        tableName:'CHBS_HOLIDAYS'
    });

    return Holiday;
};