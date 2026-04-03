-- =================================================================
-- INSERT SCRIPT 3: Scripts + Move Projects out of DEVELOPMENT
-- Populates the Script table and advances project statuses
-- =================================================================
SET search_path = cinecore;


-- -----------------------------------------------------------------
-- SCRIPTS (screenplay versions)
-- Person 5 = Dev Doshi (Writer)
-- Person 7 = Kulanjay Chavda (also doubles as writer for his own film)
-- -----------------------------------------------------------------

-- Project 1(Ajoobe ka Jaado)  — 3 script versions (draft → approved)
INSERT INTO cinecore.Script
    (Project_id, Version_No, Written_By, Submitted_Date, Status, Notes, Word_Count)
VALUES
    (1, 1, 5, '2023-06-10', 'REJECTED',
     'First draft. Director felt second act too slow. Major revision needed.', 18500),

    (1, 2, 5, '2023-07-25', 'UNDER_REVIEW',
     'Revised second act. Added comic subplot. Under director review.', 21200),

    (1, 3, 5, '2023-08-15', 'APPROVED',
     'Final approved version. Minor dialogue polish done.', 20800);

-- Project 2 (Stuck between Dimensions) — 2 script versions
INSERT INTO cinecore.Script
    (Project_id, Version_No, Written_By, Submitted_Date, Status, Notes, Word_Count)
VALUES
    (2, 1, 5, '2024-09-10', 'REJECTED',
     'Too derivative of Western sci-fi. Needs Indianization.', 24000),

    (2, 2, 5, '2024-10-20', 'APPROVED',
     'Strong second draft. VFX team has been briefed on script requirements.', 26500);

-- Project 3 (Diary of a lazy kid) — 1 approved script
INSERT INTO cinecore.Script
    (Project_id, Version_No, Written_By, Submitted_Date, Status, Notes, Word_Count)
VALUES
    (3, 1, 7, '2024-04-15', 'APPROVED',
     'Kulanjay wrote this directly. Approved in first attempt.', 19000);


-- =================================================================================================



-- -----------------------------------------------------------------
-- ADVANCE PROJECT STATUSES
-- Ajoobe ka Jaado is fully released — it went through all stages
-- Stuck between Dimensions is in SHOOTING now
-- Diary of a lazy kid is in POST_PRODUCTION
-- -----------------------------------------------------------------

UPDATE cinecore.Project SET Status = 'RELEASED',
    Actual_Release_Date = '2024-07-05',
    Censor_Certificate_No = 'CBFC/MUM/2024/4521',
    Censor_Rating = 'UA',
    Runtime_Minutes = 148
WHERE Project_id = 1;

UPDATE cinecore.Project SET Status = 'SHOOTING'
WHERE Project_id = 2;

UPDATE cinecore.Project SET Status = 'POST_PRODUCTION'
WHERE Project_id = 3;


