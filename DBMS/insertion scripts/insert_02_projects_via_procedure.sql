-- =================================================================
-- INSERT SCRIPT 2: Projects via sp_create_project
-- =================================================================
SET search_path = cinecore;


-- PROJECT A: "Ajoobe ka Jaado" — House 1 
-- This will be our fully-released project
DO $$
DECLARE
    v_project_id INTEGER;
BEGIN
    CALL cinecore.sp_create_project(
        'Ajoobe ka Jaado',   -- title
        1,                     -- house_id 
        'Drama',               -- genre
        'Hindi',               -- language
        'Feature Film',        -- format
        150000000.00,          -- total budget: 15 crore
        '2023-06-01',          -- start date
        '2024-06-15',          -- expected release
        v_project_id           -- OUT: captures new project_id
    );
    RAISE NOTICE '>>> Project A created with ID: %', v_project_id;
END $$;

-- PROJECT B: "Stuck betweeen dimensions" — House 1 
-- Sci-fi thriller, currently in SHOOTING phase
DO $$
DECLARE
    v_project_id INTEGER;
BEGIN
    CALL cinecore.sp_create_project(
        'Stuck between Dimensions',
        1,                     -- house_id (Risefall Pictures)
        'Sci-Fi Thriller',
        'English',
        'Feature Film',
        300000000.00,          -- 30 crore (bigger budget, VFX heavy)
        '2024-09-01',
        '2025-12-20',
        v_project_id
    );
    RAISE NOTICE '>>> Project B created with ID: %', v_project_id;
END $$;

-- PROJECT C: "Diary of a lazy kid" — House 2 
DO $$
DECLARE
    v_project_id INTEGER;
BEGIN
    CALL cinecore.sp_create_project(
        'Diary of a lazy kid',
        2,                     -- house_id (Coastline Films)
        'Sitcom',
        'English',
        'Web Series',
        80000000.00,           -- 8 crore
        '2024-04-01',
        '2025-04-10',
        v_project_id
    );
    RAISE NOTICE '>>> Project C created with ID: %', v_project_id;
END $$;

