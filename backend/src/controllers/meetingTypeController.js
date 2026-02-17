const db = require("../models");
const MeetingType = db.meetingTypes;
const SP=require('../../property/procedures');
const {callSP}=require('../queries/spWrapper');

exports.getAllMeetingTypes = async (req, res) => {
    try {
        const meetingTypes = await MeetingType.findAll();

        res.status(200).json(meetingTypes);
    } catch (error) {
        console.error("Error fetching meeting types:", error);
        res.status(500).send({
            message: "Error retrieving meeting types.",
            error: error.message
        });
    }
};

exports.addMeetingType=async(req,res)=>{
    try {
        const{meetName, meetDescription}=req.body;

    if(!meetName || !meetDescription){
        return res.status(400).json({message:"meetinng type and description required"});
    }
    let resFdB=await callSP(SP.ADMIN_ADD_TYPE,{
        p_MeetName:meetName,
        p_MeetDesc:meetDescription
    });

    res.status(201).json({message:resFdB[0]});

    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"});
    }

}
