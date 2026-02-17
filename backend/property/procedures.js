module.exports = {
    // 1. AUTHENTICATION & USERS
    USER_LOGIN: "CHSP_USR_LOGN",      // Logs user in, returns Role
    
    // 2. FORM DROPDOWNS (READ)
    GET_ALL_HALLS: "CHSP_GET_HALL",   // Populates Hall Select Box
    GET_ALL_TYPES: "CHSP_GET_MTYP",   // Populates Meeting Type Box

    // 3. BOOKING ACTIONS (EMPLOYEE)
    CREATE_BOOKING: "CHSP_BOOK_CONF", // Submit Booking
    CHECK_AVAILABILITY: "CHSP_CHK_AVAIL", // Check for clashes
    CANCEL_BOOKING: "CHSP_CANCL_BK",  // Cancel my booking
    USER_DASHBOARD: "CHSP_GET_DASH",  //need to remove this for now

    // 4. ADMIN CONFIGURATION (WRITE)
    ADMIN_ADD_HALL: "CHSP_AMAD_HALL", // Add New Hall
    ADMIN_ADD_TYPE: "CHSP_AMAD_MTYP", // Add Meeting Type
    ADMIN_ADD_USER: "CHSP_AMAD_USER", // Add New User
    ADMIN_GRANT_RIGHTS: "CHSP_ADM_GRNT", // Assign Permissions

    // 5. ADMIN MANAGEMENT (WORKFLOW)
    ADMIN_GET_PENDING: "CHSP_ADM_PEND", // View Approval Queue
    ADMIN_DECIDE_BOOKING: "CHSP_ADM_DECD", // Approve/Reject Action
    ADMIN_UPDATE_GENERIC: "CHSP_ADM_UPDT" , // Fallback update
    ADMIN_DISABLE_HALL:"CHSP_DISABLE_HALL",
    ADMIN_MANAGE_HALL:"CHSP_MNG_AVAIL",

    //6. Holiday Calendar
    GET_ALL_HOLIDAYS:"CHSP_GET_HOLID",
};