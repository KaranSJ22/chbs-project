// const { callSP } = require('../queries/spWrapper');
// const SP = require('../../property/procedures');

// // all holidays
// exports.getAllHolidays = async (req, res) => {
//     try {
//         let results = await callSP(SP.GET_HOLIDAYS);
//         const holidays = Array.isArray(results[0]) ? results[0] : results;
//         res.status(200).json(holidays);
//     } catch (error) {
//         console.error('Holiday Controller Error:', error);
//         res.status(500).json({ error: 'Failed to fetch holidays.' });
//     }
// };

const { callSP } = require('../queries/spWrapper');
const SP = require('../../property/procedures');

// Fetch merged calendar data (Bookings + Holidays)
exports.getMonthlyCalendarData = async (req, res) => {
    try {
        const { year, month } = req.query; 

        if (!year || !month) {
            return res.status(400).json({ error: 'Year and month are required parameters.' });
        }

        // 1. Calculate the exact start and end dates for the SQL query
        const paddedMonth = String(month).padStart(2, '0');
        const startDate = `${year}-${paddedMonth}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${paddedMonth}-${lastDay}`;

        // 2. Call your wrapper for both procedures concurrently
        // Assuming your wrapper takes: callSP(procedureName, [arrayOfParams])
        // const [heatmapRaw, holidaysRaw] = await Promise.all([
        //     callSP(SP.GET_CALENDAR, [startDate, endDate]),
        //     callSP(SP.GET_HOLIDAYS) 
        // ]);
        const [heatmapRaw, holidaysRaw] = await Promise.all([
            // Pass it as an object to match your wrapper!
            callSP(SP.GET_CALENDAR, { 
                p_StartDate: startDate, 
                p_EndDate: endDate 
            }), 
            callSP(SP.GET_HOLIDAYS) 
        ]);
        // 3. Extract the actual data arrays (matching your wrapper's return style)
        const heatmapData = Array.isArray(heatmapRaw[0]) ? heatmapRaw[0] : heatmapRaw;
        const holidayData = Array.isArray(holidaysRaw[0]) ? holidaysRaw[0] : holidaysRaw;

        const availabilityMap = {};

        // 4. Map the Booking Heatmap Data
        if (heatmapData && heatmapData.length > 0) {
            heatmapData.forEach(row => {
                // Ensure correct date parsing without timezone offset issues
                const dateKey = new Date(row.MeetDate).toISOString().split('T')[0];
                availabilityMap[dateKey] = {
                    status: row.DayStatus, // 'PARTIAL' or 'FULL'
                    events: []
                };
            });
        }

        // 5. Map the Holidays (Overrides bookings with 'HOLIDAY' status)
        if (holidayData && holidayData.length > 0) {
            holidayData.forEach(holiday => {
                const dateKey = new Date(holiday.HOLIDAYDATE).toISOString().split('T')[0];
                
                // Only inject holidays that match the currently requested month
                if (dateKey.startsWith(`${year}-${paddedMonth}`)) {
                    availabilityMap[dateKey] = {
                        status: 'HOLIDAY',
                        events: availabilityMap[dateKey]?.events || [] 
                    };
                    availabilityMap[dateKey].events.push({
                        name: holiday.HOLIDAYNAME,
                        type: holiday.HOLIDAYTYPE
                    });
                }
            });
        }

        res.status(200).json(availabilityMap);

    } catch (error) {
        console.error('Calendar Controller Error:', error);
        res.status(500).json({ error: 'Failed to fetch calendar data.' });
    }
};