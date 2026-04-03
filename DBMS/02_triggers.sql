-- =================================================================
-- CineCore DB — Triggers
-- =================================================================
-- HOW TRIGGERS WORK IN POSTGRESQL:
--
-- A trigger has TWO parts:
--   1. TRIGGER FUNCTION — a regular PL/pgSQL function that returns
--      a special type called `trigger`. Contains the actual logic.
--      Inside it, you get access to magic variables:
--        NEW  = the new row being inserted/updated
--        OLD  = the old row before update/delete
--        TG_OP = operation type: 'INSERT', 'UPDATE', 'DELETE'
--        TG_TABLE_NAME = which table fired this trigger
--
--   2. TRIGGER DEFINITION — attaches the function to a table,
--      and specifies WHEN to fire:
--        BEFORE / AFTER  = before or after the row operation
--        FOR EACH ROW    = fires once per affected row (row-level)
--        FOR EACH STATEMENT = fires once per SQL statement (stmt-level)
--
-- IMPORTANT: Trigger functions MUST return NEW (for INSERT/UPDATE)
-- or OLD (for DELETE) — or NULL to cancel the operation (BEFORE only).
-- =================================================================

SET search_path = cinecore;


-- =================================================================
-- TRIGGER 1: Auto-update Overspent_Flag when expense is approved
-- =================================================================
-- FIRES: AFTER UPDATE on Expense
-- WHEN:  Status changes to 'APPROVED' or 'PAID'
-- DOES:  Recalculates total spent on that budget head and updates flag
--
-- WHY TRIGGER INSTEAD OF JUST THE PROCEDURE:
--   sp_record_expense handles new inserts. But what if someone
--   directly updates an expense status via SQL? The trigger catches
--   that case too. Triggers are the last line of defense.
-- =================================================================

CREATE OR REPLACE FUNCTION cinecore.fn_check_budget_overrun()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_allocated     DECIMAL(15,2);
    v_total_spent   DECIMAL(15,2);
BEGIN
    -- We only care when status becomes APPROVED or PAID
    -- TG_OP = 'UPDATE' is guaranteed by trigger definition below
    IF NEW.Status IN ('APPROVED', 'PAID') AND
       (OLD.Status NOT IN ('APPROVED', 'PAID') OR TG_OP = 'INSERT')
    THEN
        -- Get the allocated budget for this head
        SELECT Allocated_Amount INTO v_allocated
        FROM cinecore.Budget_Head
        WHERE Budget_Head_Id = NEW.Budget_Head_Id;

        -- Sum all approved/paid expenses for this budget head
        SELECT COALESCE(SUM(Amount), 0) INTO v_total_spent
        FROM cinecore.Expense
        WHERE Budget_Head_Id = NEW.Budget_Head_Id
          AND Status IN ('APPROVED', 'PAID');

        -- Update the overspent flag accordingly
        -- (also resets it to FALSE if somehow came back under budget)
        UPDATE cinecore.Budget_Head
        SET Overspent_Flag = (v_total_spent > v_allocated)
        WHERE Budget_Head_Id = NEW.Budget_Head_Id;

        IF v_total_spent > v_allocated THEN
            RAISE WARNING 'BUDGET ALERT: Budget Head % is now overspent (Spent: %, Allocated: %).',
                NEW.Budget_Head_Id, v_total_spent, v_allocated;
        END IF;
    END IF;

    -- MUST return NEW for AFTER row-level triggers on INSERT/UPDATE
    RETURN NEW;
END;
$$;

-- Attach the function to the Expense table
-- AFTER UPDATE means the row is already saved when our function runs
CREATE OR REPLACE TRIGGER trg_expense_budget_check
    AFTER INSERT OR UPDATE OF Status   -- only fires when Status column changes
    ON cinecore.Expense
    FOR EACH ROW
    EXECUTE FUNCTION cinecore.fn_check_budget_overrun();


-- =================================================================
-- TRIGGER 2: Auto-mark payment milestones as OVERDUE
-- =================================================================
-- FIRES: BEFORE INSERT OR UPDATE on Payment_Milestone
-- DOES:  If Due_Date has passed and status is still PENDING,
--        automatically set it to OVERDUE
--
-- WHY BEFORE (not AFTER):
--   We want to modify the row BEFORE it's saved. A BEFORE trigger
--   can change NEW.column_value and that changed value gets saved.
--   An AFTER trigger runs after the save — too late to modify the row.
-- =================================================================

CREATE OR REPLACE FUNCTION cinecore.fn_auto_mark_overdue()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- If the milestone is still PENDING and the due date has passed today
    IF NEW.Payment_Status = 'PENDING' AND NEW.Due_Date < CURRENT_DATE THEN
        NEW.Payment_Status := 'OVERDUE';
        RAISE NOTICE 'Milestone "%" auto-marked as OVERDUE (was due %).', 
            NEW.Milestone_Name, NEW.Due_Date;
    END IF;

    -- Return NEW with possibly modified Payment_Status
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_milestone_overdue_check
    BEFORE INSERT OR UPDATE
    ON cinecore.Payment_Milestone
    FOR EACH ROW
    EXECUTE FUNCTION cinecore.fn_auto_mark_overdue();


-- =================================================================
-- TRIGGER 3: OTT Deal audit log
-- =================================================================
-- PURPOSE:
--   Every change to an OTT_Deal (who changed it, when, old values
--   vs new values) gets recorded in an audit table.
--   This is a very common real-world pattern called "Change Data Capture".
--
-- WHY THIS IS RESUME-WORTHY:
--   Auditing shows you understand data governance, compliance,
--   and the importance of change history in business systems.
-- =================================================================

-- First, create the audit table
CREATE TABLE IF NOT EXISTS cinecore.OTT_Deal_Audit (
    Audit_Id        SERIAL PRIMARY KEY,
    Deal_Id         INTEGER NOT NULL,
    Operation       VARCHAR(10) NOT NULL,   -- INSERT / UPDATE / DELETE
    Changed_At      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Snapshot of key fields before and after
    Old_License_Fee DECIMAL(15,2),
    New_License_Fee DECIMAL(15,2),
    Old_Territory   VARCHAR(200),
    New_Territory   VARCHAR(200),
    Old_Deal_Type   VARCHAR(20),
    New_Deal_Type   VARCHAR(20),
    Old_Expiry_Date DATE,
    New_Expiry_Date DATE
);

CREATE OR REPLACE FUNCTION cinecore.fn_audit_ott_deal()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- TG_OP automatically contains 'INSERT', 'UPDATE', or 'DELETE'
    IF TG_OP = 'INSERT' THEN
        INSERT INTO cinecore.OTT_Deal_Audit (
            Deal_Id, Operation,
            New_License_Fee, New_Territory, New_Deal_Type, New_Expiry_Date
        )
        VALUES (
            NEW.Deal_Id, 'INSERT',
            NEW.License_Fee, NEW.Territory, NEW.Deal_Type, NEW.Deal_Expiry_Date
        );

    ELSIF TG_OP = 'UPDATE' THEN
        -- Only log if something meaningful actually changed
        IF NEW.License_Fee IS DISTINCT FROM OLD.License_Fee OR
           NEW.Territory   IS DISTINCT FROM OLD.Territory   OR
           NEW.Deal_Type   IS DISTINCT FROM OLD.Deal_Type   OR
           NEW.Deal_Expiry_Date IS DISTINCT FROM OLD.Deal_Expiry_Date
        THEN
            INSERT INTO cinecore.OTT_Deal_Audit (
                Deal_Id, Operation,
                Old_License_Fee, New_License_Fee,
                Old_Territory,   New_Territory,
                Old_Deal_Type,   New_Deal_Type,
                Old_Expiry_Date, New_Expiry_Date
            )
            VALUES (
                NEW.Deal_Id, 'UPDATE',
                OLD.License_Fee, NEW.License_Fee,
                OLD.Territory,   NEW.Territory,
                OLD.Deal_Type,   NEW.Deal_Type,
                OLD.Deal_Expiry_Date, NEW.Deal_Expiry_Date
            );
        END IF;

    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO cinecore.OTT_Deal_Audit (
            Deal_Id, Operation,
            Old_License_Fee, Old_Territory, Old_Deal_Type, Old_Expiry_Date
        )
        VALUES (
            OLD.Deal_Id, 'DELETE',
            OLD.License_Fee, OLD.Territory, OLD.Deal_Type, OLD.Deal_Expiry_Date
        );
        -- For DELETE trigger, we return OLD (not NEW — NEW doesn't exist)
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_ott_deal_audit
    AFTER INSERT OR UPDATE OR DELETE
    ON cinecore.OTT_Deal
    FOR EACH ROW
    EXECUTE FUNCTION cinecore.fn_audit_ott_deal();


-- =================================================================
-- TRIGGER 4: Prevent double-booking a location on the same date
-- =================================================================
-- FIRES: BEFORE INSERT OR UPDATE on Shoot_Schedule
-- DOES:  Checks if ANY OTHER project is already scheduled at the
--        same location on the same date. If yes, RAISES EXCEPTION.
--
-- NOTE: This is a cross-project constraint the UNIQUE key can't enforce
-- because UNIQUE only prevents same (Project_id, Date, Location) combo.
-- Two DIFFERENT projects could still book the same location same day.
-- =================================================================

CREATE OR REPLACE FUNCTION cinecore.fn_prevent_location_double_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_conflict_project_id  INTEGER;
    v_conflict_title       VARCHAR;
BEGIN
    -- Check if any OTHER project (not this one) is already booked
    -- at the same location on the same date
    SELECT ss.Project_id, p.Title
    INTO v_conflict_project_id, v_conflict_title
    FROM cinecore.Shoot_Schedule ss
    JOIN cinecore.Project p ON p.Project_id = ss.Project_id
    WHERE ss.Location_Id    = NEW.Location_Id
      AND ss.Schedule_Date  = NEW.Schedule_Date
      AND ss.Status        != 'CANCELLED'     -- cancelled schedules don't block
      AND ss.Project_id    != NEW.Project_id  -- different project (not self)
      -- On UPDATE: exclude the current row being updated
      AND ss.Schedule_Id   != COALESCE(NEW.Schedule_Id, -1)
    LIMIT 1;

    IF v_conflict_project_id IS NOT NULL THEN
        RAISE EXCEPTION 
            'Location % is already booked on % by project "%" (ID: %). Choose another date or location.',
            NEW.Location_Id, NEW.Schedule_Date, v_conflict_title, v_conflict_project_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_location_double_booking
    BEFORE INSERT OR UPDATE
    ON cinecore.Shoot_Schedule
    FOR EACH ROW
    EXECUTE FUNCTION cinecore.fn_prevent_location_double_booking();
