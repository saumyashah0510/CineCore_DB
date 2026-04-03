-- =================================================================
-- INSERT SCRIPT 4: Contracts via sp_sign_contract
-- This tests Stored Procedure 2 AND Trigger 2 (auto-OVERDUE)
-- =================================================================
SET search_path = cinecore;

-- -----------------------------------------------------------------
-- PROJECT 1 — "Ajoobe ka Jaado" (RELEASED)
-- Full cast + crew signed. All contracts completed.
-- Milestones will be back-dated so some will be marked OVERDUE
-- by Trigger 2 (fn_auto_mark_overdue) — watch for that!
-- -----------------------------------------------------------------

-- Director: Sharvil Shah (Person 1)
DO $$
DECLARE v_id INTEGER;
BEGIN
    CALL cinecore.sp_sign_contract(
        1,              -- person_id: Sharvil Shah
        1,              -- project_id: Ajoobe ka Jaado
        'DIRECTOR',
        NULL,           -- character_name (not applicable for crew)
        8000000.00,     -- fee: 80 lakhs
        '2023-06-01',   -- signing date
        '2023-08-20',   -- start date (shoot start)
        '2024-05-30',   -- end date
        v_id
    );
    RAISE NOTICE '>>> Director contract created, ID: %', v_id;
END $$;

-- Female Lead: Nidhi Thakkar (Person 2) as 'Stuti'
DO $$
DECLARE v_id INTEGER;
BEGIN
    CALL cinecore.sp_sign_contract(
        2, 1, 'ACTOR', 'Stuti',
        25000000.00,    -- 2.5 crore
        '2023-06-05', '2023-08-20', '2024-04-15',
        v_id
    );
    RAISE NOTICE '>>> Female lead contract created, ID: %', v_id;
END $$;

-- Male Lead: Saumya Shah (Person 3) as 'Shrey'
DO $$
DECLARE v_id INTEGER;
BEGIN
    CALL cinecore.sp_sign_contract(
        3, 1, 'ACTOR', 'Shrey',
        30000000.00,    -- 3 crore
        '2023-06-05', '2023-08-20', '2024-04-15',
        v_id
    );
    RAISE NOTICE '>>> Male lead contract created, ID: %', v_id;
END $$;

-- Music Composer: Bhavya Modi (Person 4)
DO $$
DECLARE v_id INTEGER;
BEGIN
    CALL cinecore.sp_sign_contract(
        4, 1, 'MUSIC_COMPOSER', NULL,
        5000000.00,     -- 50 lakhs
        '2023-06-10', '2023-09-01', '2024-03-01',
        v_id
    );
    RAISE NOTICE '>>> Music composer contract created, ID: %', v_id;
END $$;

-- Supporting Actor: Trisha (Person 6) as 'Niyati'
DO $$
DECLARE v_id INTEGER;
BEGIN
    CALL cinecore.sp_sign_contract(
        6, 1, 'ACTOR', 'Niyati',
        3000000.00,     -- 30 lakhs
        '2023-06-15', '2023-09-01', '2023-12-15',
        v_id
    );
    RAISE NOTICE '>>> Supporting actor contract created, ID: %', v_id;
END $$;

-- DOP: Samyak (Person 11)
DO $$
DECLARE v_id INTEGER;
BEGIN
    CALL cinecore.sp_sign_contract(
        11, 1, 'DOP', NULL,
        4000000.00,
        '2023-06-20', '2023-08-20', '2024-04-30',
        v_id
    );
    RAISE NOTICE '>>> DOP contract created, ID: %', v_id;
END $$;

-- Editor: Yashvi Doshi (Person 12)
DO $$
DECLARE v_id INTEGER;
BEGIN
    CALL cinecore.sp_sign_contract(
        12, 1, 'EDITOR', NULL,
        1000000.00,
        '2023-06-20', '2024-01-01', '2024-06-01',
        v_id
    );
    RAISE NOTICE '>>> Editor contract created, ID: %', v_id;
END $$;

-- Writer : Dev Doshi (Person 5)
DO $$
DECLARE v_id INTEGER;
BEGIN
    CALL cinecore.sp_sign_contract(
        5, 1, 'WRITER', NULL,
        1500000.00,
        '2023-06-20', '2024-01-01', '2024-06-01',
        v_id
    );
    RAISE NOTICE '>>> Writer contract created, ID: %', v_id;
END $$;

-- Now mark all Project 1 contracts as COMPLETED (film is released)
UPDATE cinecore.Contract
SET Status = 'COMPLETED'
WHERE Project_id = 1;

-- Mark all Project 1 payment milestones as PAID
-- (since film is released and presumably everyone got paid)
UPDATE cinecore.Payment_Milestone pm
SET
    Payment_Status = 'PAID',
    Paid_Date = pm.Due_Date + INTERVAL '5 days',
    Transaction_Reference_No = 'TXN' || pm.Milestone_Id || '2024RF'
WHERE pm.Contract_id IN (
    SELECT Contract_id FROM cinecore.Contract WHERE Project_id = 1
);

-- -----------------------------------------------------------------
-- PROJECT 2 — "Stuck between Dimensions" (SHOOTING — contracts ACTIVE)
-- -----------------------------------------------------------------

-- Director: Sharvil Shah (Person 1) — same director, different film
DO $$
DECLARE v_id INTEGER;
BEGIN
    CALL cinecore.sp_sign_contract(
        1, 2, 'DIRECTOR', NULL,
        15000000.00,   
        '2024-09-01', '2024-11-01', '2025-10-31',
        v_id
    );
    RAISE NOTICE '>>> Director contract, ID: %', v_id;
END $$;

-- Female Lead: Dhyani (Person 10)
DO $$
DECLARE v_id INTEGER;
BEGIN
    CALL cinecore.sp_sign_contract(
        10, 2, 'ACTOR', 'Detective Andrea',
        20000000.00,
        '2024-09-05', '2024-11-01', '2025-10-31',
        v_id
    );
    RAISE NOTICE '>>> female lead contract, ID: %', v_id;
END $$;

-- VFX Head: Pranshu Vaghani (Person 13)
DO $$
DECLARE v_id INTEGER;
BEGIN
    CALL cinecore.sp_sign_contract(
        13, 2, 'VFX_HEAD', NULL,
        10500000.00,    
        '2024-09-10', '2024-10-01', '2025-11-30',
        v_id
    );
    RAISE NOTICE '>>> VFX head contract, ID: %', v_id;
END $$;

-- Writer : Dev Doshi (Person 5)
DO $$
DECLARE v_id INTEGER;
BEGIN
    CALL cinecore.sp_sign_contract(
        5, 2, 'WRITER', NULL,
        1500000.00,
        '2023-06-20', '2024-01-01', '2024-06-01',
        v_id
    );
    RAISE NOTICE '>>> Writer contract created, ID: %', v_id;
END $$;

-- -----------------------------------------------------------------
-- PROJECT 3 — "Diary of a lazy kid" (POST_PRODUCTION)
-- -----------------------------------------------------------------

-- Director: Kulanjay Chavda (Person 7)
DO $$
DECLARE v_id INTEGER;
BEGIN
    CALL cinecore.sp_sign_contract(
        7, 3, 'DIRECTOR', NULL,
        6000000.00,
        '2024-04-01', '2024-06-01', '2025-02-28',
        v_id
    );
    RAISE NOTICE '>>> director contract, ID: %', v_id;
END $$;

-- Female Lead: Isha (Person 8)
DO $$
DECLARE v_id INTEGER;
BEGIN
    CALL cinecore.sp_sign_contract(
        8, 3, 'ACTOR', 'Donna',
        10000000.00,
        '2024-04-05', '2024-06-01', '2024-12-31',
        v_id
    );
    RAISE NOTICE '>>> female lead contract, ID: %', v_id;
END $$;

-- Male Lead: Nisarg (Person 9)
DO $$
DECLARE v_id INTEGER;
BEGIN
    CALL cinecore.sp_sign_contract(
        9, 3, 'ACTOR', 'Tom',
        12000000.00,
        '2024-04-05', '2024-06-01', '2024-12-31',
        v_id
    );
    RAISE NOTICE '>>> male lead contract, ID: %', v_id;
END $$;

-- Mark Project 3 shoot contracts as COMPLETED (post-production means shoot is done)
UPDATE cinecore.Contract
SET Status = 'COMPLETED'
WHERE Project_id = 3 AND Role = 'ACTOR';


