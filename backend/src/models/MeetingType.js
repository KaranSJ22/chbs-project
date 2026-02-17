module.exports = (sequelize, Sequelize) => {
    const MeetingType = sequelize.define("meetingType", {
        MEETID: {
            type: Sequelize.STRING(50),
            primaryKey: true
        },
        MEETNAME: {
            type: Sequelize.STRING(100),
            allowNull: false
        },
        MEETDESC: {
            type: Sequelize.STRING(100),
            allowNull: false
        }
    }, {
        tableName: 'CHBS_MEETINGTYPES',
        timestamps: false,
        freezeTableName: true
    });

    return MeetingType;
};
