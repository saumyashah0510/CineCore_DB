-- =================================================================
-- INSERT SCRIPT 6: Expenses via sp_record_expense
-- This TESTS TRIGGER 1 (Overspent_Flag auto-update)
-- =================================================================
SET search_path = cinecore;


-- Update Project 1 budget heads to be more realistic
-- (Cast & Talent on 15cr film should be higher than 25L)
UPDATE cinecore.Budget_Head SET Allocated_Amount = 70000000.00 WHERE Budget_Head_Id = 1;   -- Cast 7cr
UPDATE cinecore.Budget_Head SET Allocated_Amount = 25000000.00 WHERE Budget_Head_Id = 2;   -- Crew 2.5cr
UPDATE cinecore.Budget_Head SET Allocated_Amount = 10000000.00 WHERE Budget_Head_Id = 3;   -- Locations 1cr
UPDATE cinecore.Budget_Head SET Allocated_Amount = 20000000.00 WHERE Budget_Head_Id = 4;   -- Post 2cr
UPDATE cinecore.Budget_Head SET Allocated_Amount = 10000000.00 WHERE Budget_Head_Id = 5;   -- Music 1cr
UPDATE cinecore.Budget_Head SET Allocated_Amount = 15000000.00 WHERE Budget_Head_Id = 6;   -- Marketing 1.5cr

-- -----------------------------------------------------------------
-- PROJECT 1 EXPENSES — using sp_record_expense
-- Vendor IDs: 1=Filmcity, 2=Caterers, 3=Transport, 4=VFX, 5=ProGear, 6=Security
-- -----------------------------------------------------------------

DO $$
DECLARE v_id INTEGER;
BEGIN
    CALL cinecore.sp_record_expense(
        1, 2, 5,            -- project_id, budget_head_id (Crew), vendor (ProGear)
        'Camera equipment rental for 60-day schedule',
        4500000.00,         -- 45 lakhs
        '2023-08-15', 'NEFT', 'INV-PG-2023-001', v_id
    );
    RAISE NOTICE 'Expense 1 created, ID: %', v_id;
END $$;

DO $$
DECLARE v_id INTEGER;
BEGIN
    CALL cinecore.sp_record_expense(
        1, 3, 1,            -- Locations budget, Filmcity Studios vendor
        'Studio Stage 4 — 45 day rental',
        6750000.00,         -- 6.75cr
        '2023-08-20', 'NEFT', 'INV-FC-2023-100', v_id
    );
    RAISE NOTICE 'Expense 2 created, ID: %', v_id;
END $$;

DO $$
DECLARE v_id INTEGER;
BEGIN
    CALL cinecore.sp_record_expense(
        1, 2, 3,            -- Crew budget, QuickMove Transport
        'Unit transport — full schedule duration',
        1800000.00,
        '2023-08-22', 'NEFT', 'INV-QM-2023-055', v_id
    );
    RAISE NOTICE 'Expense 3 created, ID: %', v_id;
END $$;

DO $$
DECLARE v_id INTEGER;
BEGIN
    CALL cinecore.sp_record_expense(
        1, 2, 2,            -- Crew budget, Reel Caterers
        'On-set catering — 90 shooting days',
        2700000.00,
        '2023-09-01', 'NEFT', 'INV-RC-2023-080', v_id
    );
    RAISE NOTICE 'Expense 4 created, ID: %', v_id;
END $$;

DO $$
DECLARE v_id INTEGER;
BEGIN
    CALL cinecore.sp_record_expense(
        1, 4, 4,            -- Post Production budget, VisionVFX
        'VFX work — 120 shots, composite and grade',
        9000000.00,
        '2024-01-10', 'NEFT', 'INV-VX-2024-001', v_id
    );
    RAISE NOTICE 'Expense 5 created, ID: %', v_id;
END $$;

DO $$
DECLARE v_id INTEGER;
BEGIN
    CALL cinecore.sp_record_expense(
        1, 5, 1,            -- Music budget (using Filmcity for studio recording)
        'Music recording studio hire — 20 days',
        3000000.00,
        '2024-02-01', 'NEFT', 'INV-FC-2024-015', v_id
    );
    RAISE NOTICE 'Expense 6 created, ID: %', v_id;
END $$;

-- Now APPROVE & PAY all Project 1 expenses (film is done and released)
UPDATE cinecore.Expense
SET Status = 'PAID', Approved_By = 1   
WHERE Project_id = 1;


-- -----------------------------------------------------------------
-- PROJECT 2 EXPENSES (big sci-fi budget, some overrun)
-- -----------------------------------------------------------------

DO $$
DECLARE v_id INTEGER;
BEGIN
    CALL cinecore.sp_record_expense(
        2, 8, 5,            -- Crew budget, ProGear
        'Specialized sci-fi camera rigs and lenses — RED Dragon cameras',
        12000000.00,
        '2024-11-01', 'NEFT', 'INV-PG-2024-200', v_id
    );
    RAISE NOTICE 'p2 Expense 1, ID: %', v_id;
END $$;

DO $$
DECLARE v_id INTEGER;
BEGIN
    CALL cinecore.sp_record_expense(
        2, 10, 4,           -- Post Production budget, VisionVFX
        'Pre-vis VFX for first schedule — 300 shots',
        35000000.00,        -- 3.5cr — huge VFX bill
        '2024-12-01', 'NEFT', 'INV-VX-2024-050', v_id
    );
    RAISE NOTICE 'p2 Expense 2 (VFX), ID: %', v_id;
END $$;

DO $$
DECLARE v_id INTEGER;
BEGIN
    CALL cinecore.sp_record_expense(
        2, 9, 1,            -- Locations budget, Filmcity Stage 7
        'Stage 7 rental — 30 days for futuristic sets',
        6000000.00,
        '2024-11-05', 'NEFT', 'INV-FC-2024-120', v_id
    );
    RAISE NOTICE 'p2 Expense 3, ID: %', v_id;
END $$;

-- Approve Project 2 expenses too (they are in progress)
UPDATE cinecore.Expense
SET Status = 'APPROVED', Approved_By = 1
WHERE Project_id = 2 AND Status = 'PENDING';



-- -----------------------------------------------------------------
-- PROJECT 3 EXPENSES (smaller budget, post-production costs)
-- -----------------------------------------------------------------

DO $$
DECLARE v_id INTEGER;
BEGIN
    CALL cinecore.sp_record_expense(
        3, 14, 5,           -- Crew budget, ProGear
        'Tamil Nadu location equipment logistics',
        2500000.00,
        '2024-06-05', 'NEFT', 'INV-PG-2024-300', v_id
    );
END $$;

DO $$
DECLARE v_id INTEGER;
BEGIN
    CALL cinecore.sp_record_expense(
        3, 13, 2,           -- Cast budget head, Reel Caterers
        'On-set catering Tamil Nadu schedule — 60 days',
        1200000.00,
        '2024-06-10', 'NEFT', 'INV-RC-2024-110', v_id
    );
END $$;

DO $$
DECLARE v_id INTEGER;
BEGIN
    CALL cinecore.sp_record_expense(
        3, 16, 4,           -- Post Production, VisionVFX
        'Color grading and DI — full feature film',
        4000000.00,
        '2025-01-10', 'NEFT', 'INV-VX-2025-010', v_id
    );
END $$;

UPDATE cinecore.Expense
SET Status = 'APPROVED', Approved_By = 7   
WHERE Project_id = 3 AND Status = 'PENDING';

