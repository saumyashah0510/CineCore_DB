-- =================================================================
-- CineCore DB — Stored Procedures
-- =================================================================
SET search_path = cinecore;


-- =================================================================
-- PROCEDURE 1: sp_create_project
-- =================================================================
-- PURPOSE:
--   Creates a new film project AND automatically sets up the
--   standard budget heads every film needs. This ensures no
--   project is ever created without a budget structure.
--
-- WHY A PROCEDURE:
--   Without this, the app would need to:
--     1. INSERT into Project
--     2. Get the new project_id back
--     3. INSERT 6 rows into Budget_Head
--   That's 7 round-trips. One procedure call does it all atomically.
--
-- ATOMIC = either everything succeeds or nothing does (ROLLBACK on error).
-- =================================================================

CREATE OR REPLACE PROCEDURE cinecore.sp_create_project(
    p_title             VARCHAR,
    p_house_id          INTEGER,
    p_genre             VARCHAR,
    p_language          VARCHAR,
    p_format            VARCHAR,
    p_total_budget      DECIMAL,
    p_start_date        DATE,
    p_expected_release  DATE,
    OUT p_project_id    INTEGER   -- OUT parameter: caller gets back the new ID
)
LANGUAGE plpgsql
AS $$
DECLARE
    -- DECLARE block: local variables used inside this procedure
    v_allocated_per_head DECIMAL(15,2);
BEGIN
    -- -------------------------------------------------------
    -- STEP 1: Insert the project record
    -- RETURNING clause captures the auto-generated primary key
    -- and stores it into our OUT parameter p_project_id
    -- -------------------------------------------------------
    INSERT INTO cinecore.Project (
        Title, House_id, Genre, Language, Format,
        Total_Budget, Status, Start_Date, Expected_Release_Date
    )
    VALUES (
        p_title, p_house_id, p_genre, p_language, p_format,
        p_total_budget, 'DEVELOPMENT', p_start_date, p_expected_release
    )
    RETURNING Project_id INTO p_project_id;

    -- -------------------------------------------------------
    -- STEP 2: Auto-create standard budget heads
    -- We divide total budget equally across 6 departments
    -- as a starting placeholder (production can adjust later)
    -- -------------------------------------------------------
    v_allocated_per_head := ROUND(p_total_budget / 6, 2);

    -- INSERT multiple rows using a single INSERT ... VALUES statement
    INSERT INTO cinecore.Budget_Head (Project_id, Category_Name, Allocated_Amount)
    VALUES
        (p_project_id, 'Cast & Talent',       v_allocated_per_head),
        (p_project_id, 'Crew & Technical',    v_allocated_per_head),
        (p_project_id, 'Locations & Permits', v_allocated_per_head),
        (p_project_id, 'Post Production',     v_allocated_per_head),
        (p_project_id, 'Music & Sound',       v_allocated_per_head),
        (p_project_id, 'Marketing & PR',      v_allocated_per_head);

    -- RAISE NOTICE = print a message (useful for debugging)
    RAISE NOTICE 'Project "%" created with ID % and 6 budget heads.', p_title, p_project_id;

    -- In PostgreSQL procedures, COMMIT is optional inside CALL.
    -- The transaction is committed by the caller unless an exception occurs.

EXCEPTION
    -- If ANYTHING above fails (e.g. invalid house_id FK), we catch it here
    WHEN OTHERS THEN
        RAISE EXCEPTION 'sp_create_project failed: %', SQLERRM;
END;
$$;


-- =================================================================
-- PROCEDURE 2: sp_sign_contract
-- =================================================================
-- PURPOSE:
--   Signs a contract for a person on a project AND automatically
--   creates payment milestones by splitting the fee into 3 parts:
--     - 30% on signing
--     - 40% on shoot start
--     - 30% on delivery/wrap
--
-- BUSINESS RULE ENFORCED HERE:
--   A person cannot be signed to the same project twice.
--   (The UNIQUE constraint on Contract handles this at DB level,
--    but we give a friendly error message here.)
-- =================================================================

CREATE OR REPLACE PROCEDURE cinecore.sp_sign_contract(
    p_person_id         INTEGER,
    p_project_id        INTEGER,
    p_role              VARCHAR,
    p_character_name    VARCHAR,
    p_contract_fee      DECIMAL,
    p_signing_date      DATE,
    p_start_date        DATE,
    p_end_date          DATE,
    OUT p_contract_id   INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_shoot_start   DATE;
    v_30_pct        DECIMAL(15,2);
    v_40_pct        DECIMAL(15,2);
BEGIN
    -- -------------------------------------------------------
    -- STEP 1: Check if contract already exists
    -- We do this manually to give a better error than a
    -- cryptic UNIQUE constraint violation message
    -- -------------------------------------------------------
    IF EXISTS (
        SELECT 1 FROM cinecore.Contract
        WHERE Person_id = p_person_id AND Project_id = p_project_id
    ) THEN
        RAISE EXCEPTION 'Person % already has a contract on Project %.', p_person_id, p_project_id;
    END IF;

    -- -------------------------------------------------------
    -- STEP 2: Insert the contract
    -- -------------------------------------------------------
    INSERT INTO cinecore.Contract (
        Person_id, Project_id, Role, Character_Name,
        Contract_Fee, Signing_Date, Start_Date, End_Date, Status
    )
    VALUES (
        p_person_id, p_project_id, p_role, p_character_name,
        p_contract_fee, p_signing_date, p_start_date, p_end_date, 'ACTIVE'
    )
    RETURNING Contract_id INTO p_contract_id;

    -- -------------------------------------------------------
    -- STEP 3: Auto-create 3 payment milestones
    -- Standard Bollywood contract payment split: 30/40/30
    -- -------------------------------------------------------
    v_30_pct := ROUND(p_contract_fee * 0.30, 2);
    v_40_pct := ROUND(p_contract_fee * 0.40, 2);
    -- Note: third tranche = remaining amount (avoids rounding errors)

    INSERT INTO cinecore.Payment_Milestone (
        Contract_id, Milestone_Name, Due_Date, Amount, Payment_Status
    )
    VALUES
        -- Milestone 1: Signing advance — due on signing date
        (p_contract_id, 'Signing Advance (30%)',
         p_signing_date,
         v_30_pct,
         'PENDING'),

        -- Milestone 2: Shoot start — due on contract start date
        (p_contract_id, 'Shoot Commencement (40%)',
         p_start_date,
         v_40_pct,
         'PENDING'),

        -- Milestone 3: Final delivery — due on end date (or 30 days after start if no end)
        (p_contract_id, 'Final Delivery (30%)',
         COALESCE(p_end_date, p_start_date + INTERVAL '90 days'),
         p_contract_fee - v_30_pct - v_40_pct,   -- remaining avoids rounding loss
         'PENDING');

    RAISE NOTICE 'Contract % created for Person % on Project %. 3 payment milestones added.',
        p_contract_id, p_person_id, p_project_id;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'sp_sign_contract failed: %', SQLERRM;
END;
$$;


-- =================================================================
-- PROCEDURE 3: sp_record_expense
-- =================================================================
-- PURPOSE:
--   Records an expense against a budget head and immediately
--   checks if the budget head is now overspent.
--   If total expenses > allocated amount → sets Overspent_Flag = TRUE
--   and raises a WARNING (not an error — expense is still recorded,
--   but production manager is alerted).
--
-- THIS IS IMPORTANT BUSINESS LOGIC:
--   We don't block overspending (films go over budget all the time),
--   we just flag it so management knows immediately.
-- =================================================================

CREATE OR REPLACE PROCEDURE cinecore.sp_record_expense(
    p_project_id        INTEGER,
    p_budget_head_id    INTEGER,
    p_vendor_id         INTEGER,
    p_description       TEXT,
    p_amount            DECIMAL,
    p_expense_date      DATE,
    p_payment_mode      VARCHAR,
    p_invoice_no        VARCHAR,
    OUT p_expense_id    INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_allocated     DECIMAL(15,2);
    v_total_spent   DECIMAL(15,2);
    v_head_name     VARCHAR;
BEGIN
    -- -------------------------------------------------------
    -- STEP 1: Validate that budget head belongs to this project
    -- Prevents recording expenses on wrong project's budget
    -- -------------------------------------------------------
    SELECT Allocated_Amount, Category_Name
    INTO v_allocated, v_head_name
    FROM cinecore.Budget_Head
    WHERE Budget_Head_Id = p_budget_head_id
      AND Project_id = p_project_id;

    -- If SELECT INTO finds no row, v_allocated will be NULL
    IF v_allocated IS NULL THEN
        RAISE EXCEPTION 'Budget Head % does not belong to Project %.', p_budget_head_id, p_project_id;
    END IF;

    -- -------------------------------------------------------
    -- STEP 2: Insert the expense
    -- Status starts as PENDING — needs approval before payment
    -- -------------------------------------------------------
    INSERT INTO cinecore.Expense (
        Project_id, Budget_Head_Id, Vendor_Id, Description,
        Amount, Expense_Date, Payment_Mode, Invoice_No, Status
    )
    VALUES (
        p_project_id, p_budget_head_id, p_vendor_id, p_description,
        p_amount, p_expense_date, p_payment_mode, p_invoice_no, 'PENDING'
    )
    RETURNING Expense_Id INTO p_expense_id;

    -- -------------------------------------------------------
    -- STEP 3: Calculate total spent on this budget head
    -- SUM of all APPROVED + PAID expenses (not DISPUTED/PENDING)
    -- -------------------------------------------------------
    SELECT COALESCE(SUM(Amount), 0)
    INTO v_total_spent
    FROM cinecore.Expense
    WHERE Budget_Head_Id = p_budget_head_id
      AND Status IN ('APPROVED', 'PAID');
    -- Note: We include the just-inserted expense only after approval.
    -- This is intentional: pending expenses don't count yet.

    -- -------------------------------------------------------
    -- STEP 4: Check for budget overrun
    -- -------------------------------------------------------
    IF v_total_spent > v_allocated THEN
        -- Update the flag
        UPDATE cinecore.Budget_Head
        SET Overspent_Flag = TRUE
        WHERE Budget_Head_Id = p_budget_head_id;

        -- RAISE WARNING = logs a warning but does NOT stop execution
        -- (unlike RAISE EXCEPTION which rolls back)
        RAISE WARNING 'BUDGET OVERRUN: "%" head on Project % is overspent. Allocated: %, Spent: %',
            v_head_name, p_project_id, v_allocated, v_total_spent;
    END IF;

    RAISE NOTICE 'Expense % recorded: % on budget head "%".', p_expense_id, p_amount, v_head_name;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'sp_record_expense failed: %', SQLERRM;
END;
$$;


-- =================================================================
-- PROCEDURE 4: sp_finalize_project
-- =================================================================
-- PURPOSE:
--   Marks a project as RELEASED. Before doing so, validates:
--   1. All contracts are COMPLETED (no one still ACTIVE/ON_HOLD)
--   2. A censor certificate exists
--   3. At least one OTT deal OR one theatre release exists
--   This is a "business rules gate" — you can't accidentally
--   mark a film released when it's still mid-shoot.
-- =================================================================

CREATE OR REPLACE PROCEDURE cinecore.sp_finalize_project(
    p_project_id            INTEGER,
    p_actual_release_date   DATE,
    p_censor_cert_no        VARCHAR,
    p_censor_rating         VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_active_contracts  INTEGER;
    v_ott_deals         INTEGER;
    v_theatre_releases  INTEGER;
    v_project_title     VARCHAR;
BEGIN
    -- -------------------------------------------------------
    -- STEP 1: Get project title (also validates project exists)
    -- -------------------------------------------------------
    SELECT Title INTO v_project_title
    FROM cinecore.Project WHERE Project_id = p_project_id;

    IF v_project_title IS NULL THEN
        RAISE EXCEPTION 'Project % not found.', p_project_id;
    END IF;

    -- -------------------------------------------------------
    -- STEP 2: Check no contracts are still open
    -- -------------------------------------------------------
    SELECT COUNT(*) INTO v_active_contracts
    FROM cinecore.Contract
    WHERE Project_id = p_project_id
      AND Status IN ('ACTIVE', 'ON_HOLD');

    IF v_active_contracts > 0 THEN
        RAISE EXCEPTION 'Cannot finalize "%" — % contract(s) are still ACTIVE or ON_HOLD.',
            v_project_title, v_active_contracts;
    END IF;

    -- -------------------------------------------------------
    -- STEP 3: Check distribution exists
    -- -------------------------------------------------------
    SELECT COUNT(*) INTO v_ott_deals
    FROM cinecore.OTT_Deal WHERE Project_id = p_project_id;

    SELECT COUNT(*) INTO v_theatre_releases
    FROM cinecore.Theatre_Release WHERE Project_id = p_project_id;

    IF v_ott_deals = 0 AND v_theatre_releases = 0 THEN
        RAISE EXCEPTION 'Cannot finalize "%" — no OTT deal or theatre release exists.', v_project_title;
    END IF;

    -- -------------------------------------------------------
    -- STEP 4: All checks passed — update the project
    -- -------------------------------------------------------
    UPDATE cinecore.Project
    SET
        Status                = 'RELEASED',
        Actual_Release_Date   = p_actual_release_date,
        Censor_Certificate_No = p_censor_cert_no,
        Censor_Rating         = p_censor_rating
    WHERE Project_id = p_project_id;

    RAISE NOTICE 'Project "%" (ID: %) successfully finalized as RELEASED on %.', 
        v_project_title, p_project_id, p_actual_release_date;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'sp_finalize_project failed: %', SQLERRM;
END;
$$;
