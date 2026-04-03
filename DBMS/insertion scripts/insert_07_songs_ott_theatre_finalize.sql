-- =================================================================
-- INSERT SCRIPT 7: Songs, OTT Deals, Theatre Releases
-- Tests Trigger 3 (OTT Audit) and sp_finalize_project
-- =================================================================
SET search_path = cinecore;

-- -----------------------------------------------------------------
-- SONGS — Project 1 
-- -----------------------------------------------------------------
INSERT INTO cinecore.Song
    (Project_id, Title, Duration_Seconds, Music_Director_Id, Lyricist_Id, Recording_Studio, Recording_Date, ISRC_Code)
VALUES
    (1, 'Lamhe Baaqi Hain',  312, 4, 5, 'YRF Studios, Mumbai',   '2024-02-10', 'INR242400001'),
    (1, 'Teri Yaad Aaye',    268, 4, 5, 'YRF Studios, Mumbai',   '2024-02-15', 'INR242400002'),
    (1, 'Waah kya Ajooba',   245, 4, 5, 'T-Series Studio, Noida','2024-02-20', 'INR242400003'),
    (1, 'Alvida Na Kehna',   354, 4, 5, 'YRF Studios, Mumbai',   '2024-03-01', 'INR242400004');

-- Songs — Project 3 
INSERT INTO cinecore.Song
    (Project_id, Title, Duration_Seconds, Music_Director_Id, Lyricist_Id, Recording_Studio, Recording_Date, ISRC_Code)
VALUES
    (3, 'Title track',    298, 4, 7, 'AVM Studios, Chennai', '2024-10-15', 'INN242400001'),
    (3, 'AstroMode',      334, 4, 7, 'AVM Studios, Chennai', '2024-10-22', 'INN242400002');

-- -----------------------------------------------------------------
-- SONG_SINGERS
-- (Person 3) and (Person 2) also sang in their own film
-- (Person 8) sang in project 3
-- -----------------------------------------------------------------
INSERT INTO cinecore.Song_Singer (Song_id, Singer_id, Voice_Type)
VALUES
    (1, 3, 'LEAD_MALE'),    
    (1, 2, 'LEAD_FEMALE'),  
    (2, 2, 'LEAD_FEMALE'),  
    (3, 3, 'LEAD_MALE'),    
    (4, 2, 'LEAD_FEMALE'),  
    (4, 3, 'LEAD_MALE'),
    (5, 8, 'LEAD_FEMALE'),  
    (5, 9, 'LEAD_MALE'),    
    (6, 8, 'LEAD_FEMALE');

-- -----------------------------------------------------------------
-- OTT PLATFORMS
-- -----------------------------------------------------------------
INSERT INTO cinecore.OTT_Platform
    (Name, Hq_Country, Subscriber_Base_Millions, Contact_Person, Contact_Email)
VALUES
    ('Netflix India',   'USA',   250.00, 'Monika Shergill',  'content@netflix.in'),
    ('Amazon Prime',    'USA',   200.00, 'Aparna Purohit',   'content@primevideo.in'),
    ('Disney+ Hotstar', 'USA',   100.00, 'Gaurav Banerjee',  'content@hotstar.in'),
    ('ZEE5',            'India',  80.00, 'Manish Kalra',     'content@zee5.in'),
    ('SonyLIV',         'India',  60.00, 'Rohit Parida',     'content@sonyliv.in');

-- -----------------------------------------------------------------
-- OTT DEALS — this fires Trigger 3 (Audit log) on every INSERT
-- -----------------------------------------------------------------
INSERT INTO cinecore.OTT_Deal
    (Project_id, Platform_Id, Deal_Type, Territory, License_Fee, Revenue_Share_Percent,
     Deal_Signing_Date, Streaming_Start_Date, Deal_Expiry_Date, Languages)
VALUES
    -- Project 1: (released) — Netflix India + ZEE5
    (1, 1, 'EXCLUSIVE',     'India',       80000000.00, NULL,  '2024-04-10', '2024-08-05', '2026-08-05', 'Hindi'),
    (1, 1, 'NON_EXCLUSIVE', 'Worldwide',   20000000.00, NULL,  '2024-04-10', '2024-08-05', '2026-08-05', 'Hindi, English Subtitles'),
    (1, 4, 'NON_EXCLUSIVE', 'India',       15000000.00, NULL,  '2024-04-15', '2024-09-01', '2025-09-01', 'Hindi'),

    -- Project 3:  Disney+ Hotstar + SonyLIV
    (3, 3, 'EXCLUSIVE',     'India',       30000000.00, NULL,  '2025-01-15', '2025-05-01', '2027-05-01', 'English'),
    (3, 5, 'NON_EXCLUSIVE', 'India',       8000000.00,  NULL,  '2025-01-20', '2025-06-01', '2026-06-01', 'English');

-- Trigger 3 (OTT Audit) fires on every INSERT above
-- Check after: SELECT * FROM cinecore.OTT_Deal_Audit;

-- Now let's TEST the UPDATE audit too:
-- Simulate a deal renegotiation — Netflix increased their fee
UPDATE cinecore.OTT_Deal
SET License_Fee = 90000000.00,   -- bumped from 8cr to 9cr
    Deal_Expiry_Date = '2027-08-05'
WHERE Project_id = 1 AND Platform_Id = 1 AND Territory = 'India';

-- This UPDATE should create an AUDIT row showing old vs new values

-- -----------------------------------------------------------------
-- THEATRE RELEASES
-- -----------------------------------------------------------------
INSERT INTO cinecore.Theatre_Release
    (Project_id, City, Theatre_Chain, No_Of_Screens, Release_Date,
     Opening_Weekend_Collection, Total_Collection, Weeks_Running)
VALUES
    -- Project 1: released in 4 cities
    (1, 'Mumbai',    'PVR',      120, '2024-07-05', 45000000.00, 380000000.00, 14),
    (1, 'Delhi',     'INOX',     85,  '2024-07-05', 32000000.00, 240000000.00, 11),
    (1, 'Bangalore', 'Cinepolis',60,  '2024-07-05', 18000000.00, 140000000.00, 9),
    (1, 'Hyderabad', 'PVR',      40,  '2024-07-05', 12000000.00, 85000000.00,  7),

    -- Project 3: planned theatrical release
    (3, 'Chennai',   'AGS Cinemas', 90, '2025-04-10', NULL, NULL, NULL),
    (3, 'Madurai',   'Rohini',      45, '2025-04-10', NULL, NULL, NULL),
    (3, 'Bangalore', 'PVR',         30, '2025-04-10', NULL, NULL, NULL);


