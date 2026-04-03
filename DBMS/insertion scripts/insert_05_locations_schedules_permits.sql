-- =================================================================
-- INSERT SCRIPT 5: Vendors, Locations, Shoot Schedules, Permits
-- Tests Trigger 4 (double-booking prevention)
-- =================================================================
SET search_path = cinecore;

-- -----------------------------------------------------------------
-- PRODUCTION VENDORS
-- -----------------------------------------------------------------
INSERT INTO cinecore.Production_Vendor
    (Company_Name, Service_Type, GSTIN, Contact_Name, Contact_Phone, Contact_Email, Internal_Rating, Bank_Account_No, Bank_IFSC)
VALUES
    ('Filmcity Studios Pvt Ltd',  'STUDIO_HIRE',       '27AABCF1111A1Z1', 'Rajesh Malhotra', '+91 22 4567 8901', 'bookings@filmcity.in',     5, 'FCST001122334', 'HDFC0001234'),
    ('Reel Caterers',             'CATERING',          '27AABCR2222B2Z2', 'Kavita Singh',    '+91 98301 11111',  'reel@caterers.in',          4, 'RCTR001122334', 'ICIC0005678'),
    ('QuickMove Transport',       'TRANSPORT',         '27AABCQ3333C3Z3', 'Suresh Patil',    '+91 98301 22222',  'ops@quickmove.in',          4, 'QMTR001122334', 'SBIN0009012'),
    ('VisionVFX India',           'VFX',               '27AABCV4444D4Z4', 'Anil Kapoor',     '+91 98301 33333',  'work@visionvfx.in',         5, 'VVFX001122334', 'AXIS0003456'),
    ('ProGear Equipment Rental',  'EQUIPMENT_RENTAL',  '27AABCP5555E5Z5', 'Mohan Das',       '+91 98301 44444',  'rent@progear.in',           3, 'PGER001122334', 'KOTAK007890'),
    ('SecureSet Security',        'SECURITY',          '27AABCS6666F6Z6', 'Ramesh Kumar',    '+91 98301 55555',  'info@secureset.in',         4, 'SSET001122334', 'PNB0001234');

-- -----------------------------------------------------------------
-- LOCATIONS
-- -----------------------------------------------------------------
INSERT INTO cinecore.Location
    (Location_Name, Type, Address, City, State, Country, Contact_Person, Contact_Phone, Daily_Rental_Cost, Facilities_Available, Permits_Required, Permit_Authority)
VALUES
    ('Filmcity Studio - Stage 4',    'INDOOR_SET', 'Filmcity Road, Goregaon East', 'Mumbai',    'Maharashtra', 'India', 'Rajesh Malhotra', '+91 22 4567 8901', 150000.00, 'AC, parking, generator, green room', FALSE, NULL),
    ('Marine Drive Promenade',       'OUTDOOR',    'Marine Drive',                 'Mumbai',    'Maharashtra', 'India', 'BMC Office',      '+91 22 2345 6789', 0.00,      'Open seafront, evening lighting',    TRUE,  'Brihanmumbai Municipal Corporation'),
    ('Lonavala Hill Station',        'OUTDOOR',    'Near Bhushi Dam, Lonavala',    'Pune',      'Maharashtra', 'India', 'Forest Dept',     '+91 98401 11111',  25000.00,  'Natural scenery, waterfalls',        TRUE,  'Maharashtra Forest Department'),
    ('Filmcity Studio - Stage 7',    'INDOOR_SET', 'Filmcity Road, Goregaon East', 'Mumbai',    'Maharashtra', 'India', 'Rajesh Malhotra', '+91 22 4567 8901', 200000.00, 'Large stage, VFX green screen',      FALSE, NULL),
    ('Chennai Beach (Elliot Beach)', 'OUTDOOR',    'Elliot Beach, Besant Nagar',   'Chennai',   'Tamil Nadu',  'India', 'Chennai Corp',    '+91 44 2345 6789', 0.00,      'Natural beach, sunrise shots',       TRUE,  'Chennai Corporation'),
    ('Ooty Tea Gardens',             'OUTDOOR',    'Dodabetta Road, Ooty',         'Ooty',      'Tamil Nadu',  'India', 'Tea Estate Mgr',  '+91 98401 22222',  35000.00,  'Lush greenery, cool weather',        TRUE,  'Tamil Nadu Forest Department'),
    ('Hyderabad Ramoji Film City',   'INDOOR_SET', 'Ramoji Film City, Hyderabad',  'Hyderabad', 'Telangana',   'India', 'Ramoji Bookings', '+91 40 2345 6789', 180000.00, 'Multiple sets, full production support', FALSE, NULL);



-- -----------------------------------------------------------------
-- SHOOT SCHEDULES — Project 1 (Ajoobe ka Jaado — RELEASED, past dates)
-- -----------------------------------------------------------------
INSERT INTO cinecore.Shoot_Schedule
    (Project_id, Location_Id, Schedule_Date, Scene_Nos, Call_Time, Status, Director_Notes)
VALUES
    (1, 1, '2023-08-21', '1,2,3,4',        '07:00', 'COMPLETED', 'Opening domestic scenes. Good energy from leads.'),
    (1, 2, '2023-09-10', '15,16',           '05:30', 'COMPLETED', 'Sunrise at Marine Drive. Magic hour shots.'),
    (1, 3, '2023-10-05', '22,23,24',        '08:00', 'COMPLETED', 'Rain sequence. Waterfall background. Extra generators needed.'),
    (1, 1, '2023-11-12', '30,31,32,33,34', '07:00', 'COMPLETED', 'Climax indoor scenes.'),
    (1, 2, '2023-12-01', '40,41',           '05:30', 'COMPLETED', 'Final romantic sequence. Night shoot.');

-- Shoot Schedules — Project 2 (SHOOTING, mix of completed + upcoming)
INSERT INTO cinecore.Shoot_Schedule
    (Project_id, Location_Id, Schedule_Date, Scene_Nos, Call_Time, Status, Director_Notes)
VALUES
    (2, 4, '2024-11-05', '1,2,3',   '08:00', 'COMPLETED', 'Intro scenes on green screen stage.'),
    (2, 4, '2024-11-20', '5,6,7,8', '07:00', 'COMPLETED', 'Chase sequence. VFX markers placed.'),
    (2, 7, '2025-01-15', '12,13',   '09:00', 'COMPLETED', 'City night exterior. Ramoji set used as futuristic cityscape.'),
    (2, 4, '2025-06-01', '20,21,22','08:00', 'PLANNED',   'Climax VFX-heavy scenes. Coordinate with VisionVFX.'),
    (2, 7, '2025-07-10', '25,26',   '07:00', 'PLANNED',   'Final action sequence.');

-- Shoot Schedules — Project 3 (POST_PRODUCTION, all completed)
INSERT INTO cinecore.Shoot_Schedule
    (Project_id, Location_Id, Schedule_Date, Scene_Nos, Call_Time, Status, Director_Notes)
VALUES
    (3, 5, '2024-06-10', '1,2,3,4',   '05:00', 'COMPLETED', 'Beach opening. Shot during low tide.'),
    (3, 6, '2024-07-15', '10,11,12',  '07:00', 'COMPLETED', 'Ooty romance montage. Fog machine not needed — natural fog!'),
    (3, 5, '2024-08-20', '18,19',     '05:00', 'COMPLETED', 'Emotional climax scene at beach. Multiple takes.'),
    (3, 6, '2024-09-05', '22,23,24',  '08:00', 'COMPLETED', 'Tea garden proposal scene.');



-- -----------------------------------------------------------------
-- PERMITS
-- -----------------------------------------------------------------
INSERT INTO cinecore.Permit
    (Project_id, Location_Id, Issuing_Authority, Permit_Type, Application_Date, Issued_Date, Valid_From, Valid_To, Permit_Fee, Status)
VALUES
    -- Project 1 permits (all approved, expired — film is done)
    (1, 2, 'Brihanmumbai Municipal Corporation', 'SHOOTING',    '2023-08-25', '2023-09-05', '2023-09-08', '2023-09-15', 15000.00, 'EXPIRED'),
    (1, 3, 'Maharashtra Forest Department',       'SHOOTING',    '2023-09-10', '2023-09-28', '2023-10-03', '2023-10-10', 25000.00, 'EXPIRED'),
    (1, 2, 'Mumbai Traffic Police',               'NIGHT_SHOOT', '2023-11-20', '2023-11-28', '2023-11-30', '2023-12-02', 8000.00,  'EXPIRED'),

    -- Project 2 permits (upcoming planned shoots)
    (2, 4, 'Filmcity Management',                 'SHOOTING',    '2025-05-01', '2025-05-15', '2025-06-01', '2025-06-05', 0.00,     'APPROVED'),
    (2, 7, 'Ramoji Film City Authority',           'DRONE_FLIGHT','2025-06-15', NULL,          NULL,          NULL,         5000.00,  'APPLIED'),

    -- Project 3 permits (completed shoot)
    (3, 5, 'Chennai Corporation',                  'SHOOTING',    '2024-05-25', '2024-06-05', '2024-06-08', '2024-06-15', 12000.00, 'EXPIRED'),
    (3, 6, 'Tamil Nadu Forest Department',          'SHOOTING',    '2024-06-30', '2024-07-10', '2024-07-13', '2024-07-20', 20000.00, 'EXPIRED');


