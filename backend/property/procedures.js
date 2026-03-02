module.exports = {
    // 1 AUTHENTICATION
    USER_LOGIN: 'CHSP_USR_LOG',    // Employee login
    PA_LOGIN: 'CHSP_PA_LOG',     // PA login
    GET_ALL_USERS: 'CHSP_USR_ALL',    // All active employees (for PA on-behalf dropdown)

    // 2 HALL MANAGEMENT (Admin)
    ADMIN_ADD_HALL: 'CHSP_HAL_AMAD',  // Add new hall
    ADMIN_EDIT_HALL: 'CHSP_HAL_EDT',   // Edit existing hall
    ADMIN_DISABLE_HALL: 'CHSP_HAL_DIS',   // Disable hall with date range

    // 3 MEETING TYPE MANAGEMENT (Admin)
    ADMIN_ADD_TYPE: 'CHSP_MTYP_ADD',  // Add meeting type
    ADMIN_EDIT_TYPE: 'CHSP_MTYP_EDT',  // Edit meeting type

    // 4 BOOKING
    CREATE_BOOKING: 'CHSP_BK_HAL',    // Create booking (slot-based, director logic inside)
    CANCEL_BOOKING: 'CHSP_BK_CNCL',   // User cancels own booking

    //ADMIN 
    ADMIN_GET_PENDING: 'CHSP_AD_PEND',   // Fetch pending bookings for approval queue
    ADMIN_DECIDE_BOOKING: 'CHSP_AD_DECD',   // Approve (CONFIRMED) for director hall

    // DASHBOARDS
    USER_DASHBOARD: 'CHSP_BK_DSH_LIVE', // current bookings for user
    USER_HISTORY: 'CHSP_BK_DSH_HIST', //  bookings history for user report generation
    TIMELINE_BY_DATE: 'CHSP_BKDT',    // all CONFIRMED bookings for a given date (timeline view)

    //LOOKUPS / DROPDOWNS
    GET_ALL_HALLS: 'CHSP_HAL_ALL',    // All halls (admin management view)
    GET_ALL_HALLSB: 'CHSP_GET_HALB', // All halls available for booking on a selected date --for dropdown in booking form
    GET_AVAIL_HALLS: 'CHSP_HAL_AVAIL',  // Available halls for a given date checks slots conflict
    GET_ALL_SLOTS: 'CHSP_SLT_ALL',    // All time slots
    GET_ALL_TYPES: 'CHSP_MTYP_ALL',   // All meeting types
    CHECK_AVAILABILITY: 'CHSP_CHK_AVAIL',  // Check if a slot range is free

    //CALENDAR
    GET_HOLIDAYS: 'CHSP_GET_HOLS',   // All holidays for calendar
};