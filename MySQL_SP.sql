-- ============================================================
--  CHBS2 - FINAL STORED PROCEDURES FILE
--  Contains all 26 SPs currently in the database (cowaa)
--  plus required VIEWs and the scheduled maintenance event.
--  Generated : 2026-03-13
-- ============================================================

DELIMITER //


-- ============================================================
--  AUTHENTICATION
-- ============================================================

-- Login lookup for regular employees
CREATE PROCEDURE CHSP_USR_LOG(IN p_Code VARCHAR(7))
BEGIN
    SELECT EMPLOYEECODE, EMPLOYEENAME, PASSWRD, ROLEID, STATUS 
    FROM CHBS2_USERINFO WHERE EMPLOYEECODE = p_Code AND STATUS = 'ACTIVE';
END //

-- Login lookup for PA (Personal Assistant / Front-Office) users
CREATE PROCEDURE CHSP_PA_LOG(IN p_Code VARCHAR(7))
BEGIN
    SELECT PA_EMPCODE, PA_NAME, PASSWRD, STATUS 
    FROM CHBS2_PA WHERE PA_EMPCODE = p_Code AND STATUS = 'ACTIVE';
END //

-- Return all active employees (for drop-downs / on-behalf selection)
CREATE PROCEDURE CHSP_USR_ALL()
BEGIN
    SELECT EMPLOYEECODE, EMPLOYEENAME, ROLEID FROM CHBS2_USERINFO 
    WHERE STATUS = 'ACTIVE' ORDER BY EMPLOYEENAME ASC;
END //


-- ============================================================
--  HALL MANAGEMENT
-- ============================================================

-- Add a new hall
CREATE PROCEDURE CHSP_HAL_AMAD(IN p_HName VARCHAR(100), IN p_BName VARCHAR(100), IN p_HCode VARCHAR(10), IN p_isDir TINYINT(1))
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION SELECT 'ERROR' AS Status;
    INSERT INTO CHBS2_HALLS (BUILDNAME, HALLNAME, HALLCODE, ISDIRECTORHALL) 
    VALUES (p_BName, p_HName, p_HCode, p_isDir);
    SELECT LAST_INSERT_ID() AS CreatedID, 'SUCCESS' AS Status;
END //

-- Edit an existing hall's details
CREATE PROCEDURE CHSP_HAL_EDT(IN p_HID INT, IN p_HName VARCHAR(100), IN p_BName VARCHAR(100), IN p_isDir TINYINT(1))
BEGIN
    UPDATE CHBS2_HALLS SET HALLNAME = p_HName, BUILDNAME = p_BName, ISDIRECTORHALL = p_isDir WHERE HALLID = p_HID;
    SELECT 'SUCCESS' AS Status;
END //

-- Disable a hall for a maintenance window
CREATE PROCEDURE CHSP_HAL_DIS(IN p_HID INT, IN p_From DATE, IN p_To DATE)
BEGIN
    UPDATE CHBS2_HALLS SET ISAVAILABLE = 0, DISABLED_FROM = p_From, DISABLED_TO = p_To WHERE HALLID = p_HID;
    SELECT 'SUCCESS' AS Status;
END //

-- Manually enable (un-disable) a hall that is under maintenance
CREATE PROCEDURE CHSP_HAL_ANB(IN p_HID INT, IN p_Avail TINYINT)
BEGIN
    UPDATE CHBS2_HALLS SET ISAVAILABLE = 1, DISABLED_FROM = NULL, DISABLED_TO = NULL WHERE HALLID = p_HID;
    SELECT 'SUCCESS' AS Status;
END //

-- Return all halls with full availability details (admin view)
CREATE PROCEDURE CHSP_HAL_ALL()
BEGIN
    SELECT HALLID, HALLNAME, BUILDNAME, HALLCODE, ISAVAILABLE, ISDIRECTORHALL,
           DISABLED_FROM, DISABLED_TO
    FROM CHBS2_HALLS ORDER BY BUILDNAME, HALLNAME;
END //

-- Return halls available on a given booking date
-- Excludes halls whose maintenance window covers that date
CREATE PROCEDURE CHSP_HAL_AVAIL(IN p_Date DATE)
BEGIN
    SELECT HALLID, HALLNAME, BUILDNAME, HALLCODE, ISDIRECTORHALL
    FROM CHBS2_HALLS
    WHERE ISAVAILABLE = 1
      AND (
          DISABLED_FROM IS NULL                         
          OR p_Date NOT BETWEEN DISABLED_FROM AND DISABLED_TO  
      )
    ORDER BY BUILDNAME, HALLNAME;
END //

-- Return halls bookable for a given date (used by the booking form / timeline)
-- Shows halls that are available OR whose maintenance window does not cover the date
CREATE PROCEDURE CHSP_GET_HALB(IN p_MDate DATE)
BEGIN
    SELECT HALLID, HALLNAME, BUILDNAME, HALLCODE, ISDIRECTORHALL
    FROM CHBS2_HALLS
    WHERE
        -- Case 1: Hall is normally available with no maintenance window
        (ISAVAILABLE = 1 AND DISABLED_FROM IS NULL)

        OR

        -- Case 2: Hall has a maintenance window but the queried date falls OUTSIDE it
        (DISABLED_FROM IS NOT NULL AND DISABLED_TO IS NOT NULL
         AND p_MDate NOT BETWEEN DISABLED_FROM AND DISABLED_TO)

    ORDER BY BUILDNAME, HALLNAME;
END //


-- ============================================================
--  MEETING TYPE MANAGEMENT
-- ============================================================

-- Add a new meeting type
CREATE PROCEDURE CHSP_MTYP_ADD(IN p_MName VARCHAR(100), IN p_MDesc VARCHAR(100))
BEGIN
    INSERT INTO CHBS2_MEETINGTYPES (MEETNAME, MEETDESC) VALUES (p_MName, p_MDesc);
    SELECT LAST_INSERT_ID() AS CreatedID, 'SUCCESS' AS Status;
END //

-- Edit an existing meeting type
CREATE PROCEDURE CHSP_MTYP_EDT(IN p_MID INT, IN p_MName VARCHAR(100), IN p_MDesc VARCHAR(100))
BEGIN
    UPDATE CHBS2_MEETINGTYPES SET MEETNAME = p_MName, MEETDESC = p_MDesc WHERE MEETID = p_MID;
    SELECT 'SUCCESS' AS Status;
END //

-- Return all meeting types (for drop-downs)
CREATE PROCEDURE CHSP_MTYP_ALL()
BEGIN
    SELECT MEETID, MEETNAME, MEETDESC FROM CHBS2_MEETINGTYPES ORDER BY MEETNAME;
END //


-- ============================================================
--  LOOKUP / DROPDOWN DATA
-- ============================================================

-- Return all time slots
CREATE PROCEDURE CHSP_SLT_ALL()
BEGIN
    SELECT SLOTID, SLOTTIME FROM CHBS2_SLOTINFO ORDER BY SLOTID;
END //

-- Return holidays list (for calendar display)
CREATE PROCEDURE CHSP_GET_HOLS()
BEGIN
    SELECT HOLIDAYDATE, HOLIDAYNAME, HOLIDAYTYPE FROM CHBS2_HOLIDAYS;
END //


-- ============================================================
--  BOOKING
-- ============================================================

-- Check slot availability for a hall on a date
-- Returns 99 as ConflictCount if the hall is under maintenance on that date
CREATE PROCEDURE CHSP_CHK_AVAIL(IN p_HallID INT, IN p_Date DATE, IN p_Start INT, IN p_End INT)
BEGIN
    IF EXISTS (
        SELECT 1 FROM CHBS2_HALLS
        WHERE HALLID = p_HallID
          AND ISAVAILABLE = 0
          AND p_Date BETWEEN DISABLED_FROM AND DISABLED_TO
    ) THEN
        SELECT 99 AS ConflictCount; -- signals maintenance block
    ELSE
        SELECT COUNT(*) AS ConflictCount
        FROM CHBS2_BOOKINGINFO
        WHERE HALLID = p_HallID
          AND BOOKINGDATE = p_Date
          AND BOOKINGSTATUS IN ('CONFIRMED', 'PENDING')
          AND STARTSLOT < p_End
          AND ENDSLOT > p_Start;
    END IF;
END //

-- Create a hall booking
-- Enforces: holiday guard, maintenance guard, conflict detection
-- Director halls & conflicting slots auto-route to PENDING, others go to CONFIRMED
CREATE PROCEDURE CHSP_BK_HAL(
    IN p_HID INT, IN p_By VARCHAR(7), IN p_Behalf VARCHAR(7),
    IN p_Ttl VARCHAR(150), IN p_Typ INT, IN p_Start INT, 
    IN p_End INT, IN p_MeetDate DATE, IN p_Lnk VARCHAR(3)
)
BEGIN
    DECLARE n_uuid VARCHAR(50) DEFAULT UUID();
    DECLARE conflict_count, is_holiday, v_isDir, is_maintenance INT DEFAULT 0;
    DECLARE final_status ENUM('CONFIRMED', 'PENDING', 'CANCELLED', 'REJECTED');

    -- Check 1: Holiday guard
    SELECT COUNT(*) INTO is_holiday FROM CHBS2_HOLIDAYS WHERE HOLIDAYDATE = p_MeetDate;
    IF is_holiday > 0 THEN
        SELECT 'HOLIDAY_RESTRICTION' AS Status;

    -- Check 2: Maintenance guard (hall disabled and date falls within its maintenance window)
    ELSE
        SELECT COUNT(*) INTO is_maintenance FROM CHBS2_HALLS
        WHERE HALLID = p_HID
          AND ISAVAILABLE = 0
          AND p_MeetDate BETWEEN DISABLED_FROM AND DISABLED_TO;

        IF is_maintenance > 0 THEN
            SELECT 'HALL_UNDER_MAINTENANCE' AS Status;
        ELSE
            BEGIN
                DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; SELECT 'ERROR' AS Status; END;
                START TRANSACTION;
                SELECT ISDIRECTORHALL INTO v_isDir FROM CHBS2_HALLS WHERE HALLID = p_HID;
                SELECT COUNT(*) INTO conflict_count FROM CHBS2_BOOKINGINFO
                WHERE HALLID = p_HID AND BOOKINGDATE = p_MeetDate AND BOOKINGSTATUS IN ('CONFIRMED', 'PENDING')
                  AND (STARTSLOT < p_End AND ENDSLOT > p_Start) FOR UPDATE;

                IF v_isDir = 1 OR conflict_count > 0 THEN SET final_status = 'PENDING';
                ELSE SET final_status = 'CONFIRMED';
                END IF;

                INSERT INTO CHBS2_BOOKINGINFO (BOOKINGID, HALLID, BOOKEDBY, ONBEHALFOF, STARTSLOT, ENDSLOT, BOOKINGDATE, BOOKINGSTATUS)
                VALUES (n_uuid, p_HID, p_By, p_Behalf, p_Start, p_End, p_MeetDate, final_status);
                INSERT INTO CHBS2_MEETINFO (BOOKINGID, MEETTITLE, MEETTYPE, LINKREQUIRED)
                VALUES (n_uuid, p_Ttl, p_Typ, p_Lnk);
                COMMIT;
                SELECT n_uuid AS BookingID, final_status AS Status;
            END;
        END IF;
    END IF;
END //


-- Cancel a booking (user-initiated v2 - adds past-booking guard)
CREATE PROCEDURE CHSP_BK_CNCL_V2(IN p_BKID VARCHAR(50), IN p_EmpCode VARCHAR(7))
BEGIN
    DECLARE v_status VARCHAR(20);
    DECLARE v_owner  VARCHAR(7);
    DECLARE v_date   DATE;

    SELECT BOOKINGSTATUS, BOOKEDBY, BOOKINGDATE
    INTO   v_status, v_owner, v_date
    FROM   CHBS2_BOOKINGINFO
    WHERE  BOOKINGID = p_BKID;

    IF v_owner IS NULL THEN
        SELECT 'NOT_FOUND' AS Status;
    ELSEIF v_owner <> p_EmpCode THEN
        SELECT 'UNAUTHORIZED' AS Status;
    ELSEIF v_date <= CURDATE() THEN
        SELECT 'PAST_BOOKING' AS Status;
    ELSEIF v_status NOT IN ('CONFIRMED', 'PENDING') THEN
        SELECT 'ALREADY_CLOSED' AS Status;
    ELSE
        UPDATE CHBS2_BOOKINGINFO
        SET    BOOKINGSTATUS = 'CANCELLED'
        WHERE  BOOKINGID = p_BKID;
        SELECT 'SUCCESS' AS Status;
    END IF;
END //


-- ============================================================
--  ADMIN APPROVALS
-- ============================================================

-- Admin approves or rejects a pending booking
CREATE PROCEDURE CHSP_AD_DECD(IN p_BKID VARCHAR(50), IN p_Stat VARCHAR(20))
BEGIN
    DECLARE n_HID INT;
    DECLARE n_Date DATE;
    DECLARE n_Start, n_End, conflict, is_holiday INT DEFAULT 0;

    IF p_Stat NOT IN ('CONFIRMED', 'REJECTED') THEN
        SELECT 'INVALID_STATUS' AS Status;
    ELSE
        SELECT HALLID, BOOKINGDATE, STARTSLOT, ENDSLOT INTO n_HID, n_Date, n_Start, n_End 
        FROM CHBS2_BOOKINGINFO WHERE BOOKINGID = p_BKID AND BOOKINGSTATUS = 'PENDING';

        IF n_HID IS NULL THEN
            SELECT 'NOT_FOUND_OR_NOT_PENDING' AS Status;
        ELSE
            SELECT COUNT(*) INTO is_holiday FROM CHBS2_HOLIDAYS WHERE HOLIDAYDATE = n_Date;

            IF is_holiday > 0 AND p_Stat = 'CONFIRMED' THEN
                SELECT 'CANNOT_APPROVE_ON_HOLIDAY' AS Status;
            ELSE
                START TRANSACTION;
                IF p_Stat = 'CONFIRMED' THEN
                    SELECT COUNT(*) INTO conflict FROM CHBS2_BOOKINGINFO
                    WHERE HALLID = n_HID AND BOOKINGDATE = n_Date AND BOOKINGSTATUS = 'CONFIRMED'
                      AND BOOKINGID <> p_BKID AND (STARTSLOT < n_End AND ENDSLOT > n_Start) FOR UPDATE;
                END IF;

                IF conflict > 0 THEN
                    ROLLBACK; SELECT 'CONFLICT_EXISTS' AS Status;
                ELSE
                    UPDATE CHBS2_BOOKINGINFO SET BOOKINGSTATUS = p_Stat WHERE BOOKINGID = p_BKID;
                    COMMIT; SELECT 'SUCCESS' AS Status;
                END IF;
            END IF;
        END IF;
    END IF;
END //

-- Fetch the admin pending-approvals queue
CREATE PROCEDURE CHSP_AD_PEND()
BEGIN
    SELECT 
        B.BOOKINGID, B.BOOKINGDATE AS MeetDate, B.CREATED_AT AS SubmittedAt,
        H.HALLNAME, H.BUILDNAME, H.ISDIRECTORHALL,
        CONCAT(S1.SLOTTIME, ' to ', S2.SLOTTIME) AS TIME_RANGE,
        M.MEETTITLE, MT.MEETNAME AS MeetType,
        B.BOOKEDBY, B.ONBEHALFOF
    FROM CHBS2_BOOKINGINFO B
    JOIN CHBS2_HALLS H ON B.HALLID = H.HALLID
    JOIN CHBS2_SLOTINFO S1 ON B.STARTSLOT = S1.SLOTID
    JOIN CHBS2_SLOTINFO S2 ON B.ENDSLOT = S2.SLOTID
    LEFT JOIN CHBS2_MEETINFO M ON B.BOOKINGID = M.BOOKINGID
    LEFT JOIN CHBS2_MEETINGTYPES MT ON M.MEETTYPE = MT.MEETID
    WHERE B.BOOKINGSTATUS = 'PENDING'
    ORDER BY B.BOOKINGDATE ASC, S1.SLOTID ASC;
END //

-- Admin cancel of any future booking
CREATE PROCEDURE CHSP_AD_BK_CNCL(IN p_BKID VARCHAR(50))
BEGIN
    DECLARE v_status    VARCHAR(20);
    DECLARE v_date      DATE;

    SELECT BOOKINGSTATUS, BOOKINGDATE
    INTO   v_status, v_date
    FROM   CHBS2_BOOKINGINFO
    WHERE  BOOKINGID = p_BKID;

    IF v_date IS NULL THEN
        SELECT 'NOT_FOUND' AS Status;
    ELSEIF v_date <= CURDATE() THEN
        SELECT 'PAST_BOOKING' AS Status;
    ELSEIF v_status NOT IN ('CONFIRMED', 'PENDING') THEN
        SELECT 'ALREADY_CLOSED' AS Status;
    ELSE
        UPDATE CHBS2_BOOKINGINFO
        SET    BOOKINGSTATUS = 'CANCELLED'
        WHERE  BOOKINGID = p_BKID;
        SELECT 'SUCCESS' AS Status;
    END IF;
END //


-- ============================================================
--  DASHBOARDS
-- ============================================================

-- Employee live (active) bookings dashboard
CREATE PROCEDURE CHSP_BK_DSH_LIVE(IN p_EmpCode VARCHAR(7))
BEGIN
    SELECT * FROM VW_CHBS2_DASHBOARD
    WHERE BOOKEDBY = p_EmpCode OR ONBEHALFOF = p_EmpCode
    ORDER BY MeetDate DESC;
END //

-- Employee historical bookings dashboard
CREATE PROCEDURE CHSP_BK_DSH_HIST(IN p_EmpCode VARCHAR(7))
BEGIN
    SELECT * FROM VW_CHBS2_HISTORY
    WHERE BOOKEDBY = p_EmpCode OR ONBEHALFOF = p_EmpCode
    ORDER BY MeetDate DESC;
END //

-- Booking timeline: all confirmed bookings for a given date (used by timeline view)
CREATE PROCEDURE CHSP_BKDT(IN p_Date DATE)
BEGIN
    SELECT 
        B.BOOKINGID,
        B.HALLID,
        H.HALLNAME,
        H.BUILDNAME,
        B.BOOKINGDATE AS MeetDate,
        B.BOOKINGSTATUS,
        B.STARTSLOT,
        B.ENDSLOT,
        S1.SLOTTIME AS StartTime,
        S2.SLOTTIME AS EndTime,
        M.MEETTITLE,
        MT.MEETNAME AS MeetType,
        B.BOOKEDBY,
        B.ONBEHALFOF
    FROM CHBS2_BOOKINGINFO B
    JOIN CHBS2_HALLS H      ON B.HALLID    = H.HALLID
    JOIN CHBS2_SLOTINFO S1  ON B.STARTSLOT = S1.SLOTID
    JOIN CHBS2_SLOTINFO S2  ON B.ENDSLOT   = S2.SLOTID
    LEFT JOIN CHBS2_MEETINFO M        ON B.BOOKINGID = M.BOOKINGID
    LEFT JOIN CHBS2_MEETINGTYPES MT   ON M.MEETTYPE  = MT.MEETID
    WHERE B.BOOKINGDATE  = p_Date
      AND B.BOOKINGSTATUS = 'CONFIRMED'
    ORDER BY S1.SLOTID ASC, H.BUILDNAME ASC, H.HALLNAME ASC;
END //

-- Admin calendar heatmap: daily booking load between two dates
CREATE PROCEDURE CHSP_GET_MONTHLY_HEATMAP(IN p_StartDate DATE, IN p_EndDate DATE)
BEGIN
    SELECT 
        B.BOOKINGDATE AS MeetDate,
        SUM(B.ENDSLOT - B.STARTSLOT) AS ConsumedSlots,
        (
            (SELECT COUNT(*) FROM CHBS2_HALLS H 
             WHERE H.ISAVAILABLE = 1 
               AND (H.DISABLED_FROM IS NULL OR B.BOOKINGDATE NOT BETWEEN H.DISABLED_FROM AND H.DISABLED_TO)
            ) * (SELECT COUNT(*) FROM CHBS2_SLOTINFO)
        ) AS TotalDailySlots,
        CASE
            WHEN SUM(B.ENDSLOT - B.STARTSLOT) >= (
                (SELECT COUNT(*) FROM CHBS2_HALLS H WHERE H.ISAVAILABLE = 1 AND (H.DISABLED_FROM IS NULL OR B.BOOKINGDATE NOT BETWEEN H.DISABLED_FROM AND H.DISABLED_TO)) 
                * (SELECT COUNT(*) FROM CHBS2_SLOTINFO) * 0.9
            ) THEN 'FULL'
            ELSE 'PARTIAL'
        END AS DayStatus
    FROM CHBS2_BOOKINGINFO B
    WHERE B.BOOKINGDATE BETWEEN p_StartDate AND p_EndDate
      AND B.BOOKINGSTATUS IN ('CONFIRMED', 'PENDING')
    GROUP BY B.BOOKINGDATE;
END //


-- ============================================================
--  AUTOMATED MAINTENANCE JOB
-- ============================================================

-- Archives old cancelled/rejected bookings, cleans up, and auto-enables halls
-- Called by the daily scheduled event EVT_DAILY_CHBS2_MAINTENANCE
CREATE PROCEDURE CHSP_AD_MAINTENANCE_AUTO()
BEGIN
    START TRANSACTION;
    -- Safe Archive (Prevents PK Violation)
    INSERT INTO CHBS2_BK_HIST 
    SELECT * FROM CHBS2_BOOKINGINFO B
    WHERE B.BOOKINGDATE < DATE_SUB(CURDATE(), INTERVAL 30 DAY) 
      AND B.BOOKINGSTATUS IN ('CANCELLED', 'REJECTED')
      AND NOT EXISTS (SELECT 1 FROM CHBS2_BK_HIST BH WHERE BH.BOOKINGID = B.BOOKINGID);
    
    INSERT INTO CHBS2_MT_HIST 
    SELECT M.* FROM CHBS2_MEETINFO M JOIN CHBS2_BK_HIST H ON M.BOOKINGID = H.BOOKINGID
    WHERE NOT EXISTS (SELECT 1 FROM CHBS2_MT_HIST MH WHERE MH.BOOKINGID = M.BOOKINGID);
    
    DELETE FROM CHBS2_MEETINFO WHERE BOOKINGID IN (SELECT BOOKINGID FROM CHBS2_BK_HIST);
    DELETE FROM CHBS2_BOOKINGINFO WHERE BOOKINGID IN (SELECT BOOKINGID FROM CHBS2_BK_HIST);
    
    -- Auto-Enable Halls whose maintenance window has expired
    UPDATE CHBS2_HALLS SET ISAVAILABLE = 1, DISABLED_FROM = NULL, DISABLED_TO = NULL 
    WHERE ISAVAILABLE = 0 AND DISABLED_TO < CURDATE();
    COMMIT;
END //


DELIMITER ;


-- ============================================================
--  VIEWS
-- ============================================================

-- Live (active) bookings view used by CHSP_BK_DSH_LIVE
CREATE OR REPLACE VIEW VW_CHBS2_DASHBOARD AS
SELECT 
    B.BOOKINGID,
    B.BOOKINGDATE     AS MeetDate,
    B.BOOKINGSTATUS,
    H.HALLNAME,
    H.BUILDNAME,
    H.ISDIRECTORHALL,
    CONCAT(S1.SLOTTIME, ' to ', S2.SLOTTIME) AS TIME_RANGE,
    M.MEETTITLE,
    MT.MEETNAME       AS MeetType,
    B.BOOKEDBY,
    B.ONBEHALFOF,
    B.CREATED_AT      AS TransactionTime
FROM CHBS2_BOOKINGINFO B
JOIN  CHBS2_HALLS       H  ON B.HALLID    = H.HALLID
JOIN  CHBS2_SLOTINFO    S1 ON B.STARTSLOT = S1.SLOTID
JOIN  CHBS2_SLOTINFO    S2 ON B.ENDSLOT   = S2.SLOTID
LEFT JOIN CHBS2_MEETINFO      M  ON B.BOOKINGID = M.BOOKINGID
LEFT JOIN CHBS2_MEETINGTYPES  MT ON M.MEETTYPE  = MT.MEETID
WHERE B.BOOKINGSTATUS IN ('CONFIRMED', 'PENDING');

-- Historical bookings view (from archive tables) used by CHSP_BK_DSH_HIST
CREATE OR REPLACE VIEW VW_CHBS2_HISTORY AS
SELECT 
    BH.BOOKINGID,
    BH.BOOKINGDATE    AS MeetDate,
    BH.BOOKINGSTATUS,
    H.HALLNAME,
    H.BUILDNAME,
    H.ISDIRECTORHALL,
    CONCAT(S1.SLOTTIME, ' to ', S2.SLOTTIME) AS TIME_RANGE,
    MH.MEETTITLE,
    MT.MEETNAME       AS MeetType,
    BH.BOOKEDBY,
    BH.ONBEHALFOF,
    BH.CREATED_AT     AS TransactionTime
FROM CHBS2_BK_HIST BH
JOIN  CHBS2_HALLS       H  ON BH.HALLID    = H.HALLID
JOIN  CHBS2_SLOTINFO    S1 ON BH.STARTSLOT = S1.SLOTID
JOIN  CHBS2_SLOTINFO    S2 ON BH.ENDSLOT   = S2.SLOTID
LEFT JOIN CHBS2_MT_HIST       MH ON BH.BOOKINGID = MH.BOOKINGID
LEFT JOIN CHBS2_MEETINGTYPES  MT ON MH.MEETTYPE  = MT.MEETID;


-- ============================================================
--  SCHEDULED EVENT
-- ============================================================

SET GLOBAL event_scheduler = ON;

CREATE EVENT IF NOT EXISTS EVT_DAILY_CHBS2_MAINTENANCE
ON SCHEDULE EVERY 1 DAY
STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 1 DAY)
DO CALL CHSP_AD_MAINTENANCE_AUTO();
