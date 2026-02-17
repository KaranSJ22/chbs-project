const db = require("../models");
const Hall = db.halls;
const SP = require('../../property/procedures');
const { callSP } = require('../queries/spWrapper');


exports.getAllHalls = async (req, res) => {
  try {
    const halls = await Hall.findAll();
    const formattedHalls = halls.map(hall => {
      const h = hall.get({ plain: true }); 
      return {
        ...h,
        
        isAvailable: h.isAvailable && h.isAvailable.data 
          ? h.isAvailable.data[0] 
          : (h.isAvailable == 1 ? 1 : 0)
      };
    });

    res.status(200).json(formattedHalls);
  } catch (error) {
    console.error("Error fetching halls:", error);
    res.status(500).send({
      message: "Error retrieving halls.",
      error: error.message
    });
  }
};


exports.checkAvailability = async (req, res) => {
  try {
    const { hallId, date, slot } = req.query;
    
    const result = await callSP(SP.CHECK_AVAILABILITY, {
      p_HallID: hallId,
      p_Date: date,
      p_Slot: slot
    });
    
    res.json(result);
  } catch (error) {
    console.error("Error checking availability:", error);
    res.status(500).json({ 
      message: "Error checking availability",
      error: error.message 
    });
  }
};


exports.updateHallStatus = async (req, res) => {
    try {
        const { hallId, action, fromDate, toDate } = req.body;

        if (action === 'DISABLE' && (!fromDate || !toDate)) {
            return res.status(400).json({ 
                success: false,
                message: "Maintenance start and end dates are required." 
            });
        }

        await callSP(SP.ADMIN_MANAGE_HALL, {
            p_HallID: hallId,
            p_Action: action,
            p_FDate: action === 'DISABLE' ? fromDate : null,
            p_TDate: action === 'DISABLE' ? toDate : null
        });

        res.status(200).json({ 
            success: true, 
            message: `Hall ${action === 'ENABLE' ? 'activated' : 'placed in maintenance'}.` 
        });
    } catch (error) {
        console.error("Management Controller Error:", error); 
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};