-- sample_data.sql
SET search_path = cinecore;

DO $$ 
DECLARE
    v_house_id INTEGER;
    v_shawshank_id INTEGER;
    v_shutter_id INTEGER;
    v_morgan_id INTEGER;
    v_tim_id INTEGER;
    v_leo_id INTEGER;
    v_mark_id INTEGER;
    v_martin_id INTEGER;
    v_frank_id INTEGER;
    
    v_loc1_id INTEGER;
    v_loc2_id INTEGER;
    
    v_contract_id INTEGER;
BEGIN
    -- 1. Create a Production House (Castle Rock Entertainment & Paramount)
    INSERT INTO cinecore.Production_House (Name, Founded_Year, Headquarter_City, Headquarter_Country, GSTIN, Website, Contact_Email)
    VALUES ('Castle Rock Entertainment', 1987, 'Beverly Hills', 'USA', '99AABCC1234A1ZX', 'www.castlerock.com', 'contact@castlerock.com')
    RETURNING House_id INTO v_house_id;
    
    -- Create Shawshank
    CALL cinecore.sp_create_project(
        'The Shawshank Redemption',
        v_house_id,
        'Drama',
        'English',
        'Feature Film',
        25000000.00,
        '1993-06-01',
        '1994-09-23',
        v_shawshank_id
    );
    
    INSERT INTO cinecore.Production_House (Name, Founded_Year, Headquarter_City, Headquarter_Country, GSTIN, Website, Contact_Email)
    VALUES ('Paramount Pictures', 1912, 'Los Angeles', 'USA', '99AABCC5678B2ZY', 'www.paramount.com', 'info@paramount.com')
    RETURNING House_id INTO v_house_id;

    -- Create Shutter Island
    CALL cinecore.sp_create_project(
        'Shutter Island',
        v_house_id,
        'Psychological Thriller',
        'English',
        'Feature Film',
        80000000.00,
        '2008-03-06',
        '2010-02-19',
        v_shutter_id
    );

    -- Set both to appropriate statuses
    UPDATE cinecore.Project SET Status = 'RELEASED', Actual_Release_Date = '1994-09-23', Runtime_Minutes = 142, Censor_Rating = 'A' WHERE Project_id = v_shawshank_id;
    UPDATE cinecore.Project SET Status = 'RELEASED', Actual_Release_Date = '2010-02-19', Runtime_Minutes = 138, Censor_Rating = 'A' WHERE Project_id = v_shutter_id;

    -- 2. Add Persons
    INSERT INTO cinecore.Person (Full_Name, Screen_Name, Nationality, DOB, Gender, Primary_Profession, PAN_No, Contact_Email) VALUES 
        ('Morgan Freeman', 'Morgan', 'American', '1937-06-01', 'Male', 'Actor', 'MORG1234F', 'morgan@freeman.com') RETURNING Person_id INTO v_morgan_id;
    INSERT INTO cinecore.Person (Full_Name, Screen_Name, Nationality, DOB, Gender, Primary_Profession, PAN_No, Contact_Email) VALUES 
        ('Tim Robbins', 'Tim', 'American', '1958-10-16', 'Male', 'Actor', 'TIMR5678R', 'tim@robbins.com') RETURNING Person_id INTO v_tim_id;
    INSERT INTO cinecore.Person (Full_Name, Screen_Name, Nationality, DOB, Gender, Primary_Profession, PAN_No, Contact_Email) VALUES 
        ('Frank Darabont', 'Frank', 'American', '1959-01-28', 'Male', 'Director', 'FRAN9012D', 'frank@darabont.com') RETURNING Person_id INTO v_frank_id;
    
    INSERT INTO cinecore.Person (Full_Name, Screen_Name, Nationality, DOB, Gender, Primary_Profession, PAN_No, Contact_Email) VALUES 
        ('Leonardo DiCaprio', 'Leo', 'American', '1974-11-11', 'Male', 'Actor', 'LEOD3456D', 'leo@dicaprio.com') RETURNING Person_id INTO v_leo_id;
    INSERT INTO cinecore.Person (Full_Name, Screen_Name, Nationality, DOB, Gender, Primary_Profession, PAN_No, Contact_Email) VALUES 
        ('Mark Ruffalo', 'Mark', 'American', '1967-11-22', 'Male', 'Actor', 'MARK7890R', 'mark@ruffalo.com') RETURNING Person_id INTO v_mark_id;
    INSERT INTO cinecore.Person (Full_Name, Screen_Name, Nationality, DOB, Gender, Primary_Profession, PAN_No, Contact_Email) VALUES 
        ('Martin Scorsese', 'Martin', 'American', '1942-11-17', 'Male', 'Director', 'MART1234S', 'martin@scorsese.com') RETURNING Person_id INTO v_martin_id;

    -- 3. Contracts
    -- Shawshank
    CALL cinecore.sp_sign_contract(v_morgan_id, v_shawshank_id, 'ACTOR', 'Ellis Boyd Redding', 3000000, '1993-01-10', '1993-06-15', '1993-09-01', v_contract_id);
    CALL cinecore.sp_sign_contract(v_tim_id, v_shawshank_id, 'ACTOR', 'Andy Dufresne', 2000000, '1993-01-15', '1993-06-15', '1993-09-01', v_contract_id);
    CALL cinecore.sp_sign_contract(v_frank_id, v_shawshank_id, 'DIRECTOR', NULL, 1500000, '1992-11-20', '1993-06-01', '1994-05-01', v_contract_id);

    -- Shutter Island
    CALL cinecore.sp_sign_contract(v_leo_id, v_shutter_id, 'ACTOR', 'Teddy Daniels', 15000000, '2007-10-05', '2008-03-06', '2008-07-01', v_contract_id);
    CALL cinecore.sp_sign_contract(v_mark_id, v_shutter_id, 'ACTOR', 'Chuck Aule', 4000000, '2007-11-10', '2008-03-06', '2008-07-01', v_contract_id);
    CALL cinecore.sp_sign_contract(v_martin_id, v_shutter_id, 'DIRECTOR', NULL, 10000000, '2007-05-20', '2008-01-01', '2009-11-01', v_contract_id);

    -- 4. Set some payment milestones to PAID for realistic dashboard data
    UPDATE cinecore.Payment_Milestone SET Payment_Status = 'PAID', Paid_Date = Due_Date WHERE Payment_Status = 'PENDING';

    -- 5. Scripts
    INSERT INTO cinecore.Script (Project_id, Version_No, Written_By, Word_Count, Status, Notes, Submitted_Date) VALUES
        (v_shawshank_id, 1, v_frank_id, 32000, 'APPROVED', 'Adapted from Stephen King novella', '1993-01-01'),
        (v_shutter_id, 2, v_martin_id, 28000, 'APPROVED', 'Final shooting draft', '2007-12-01');

    -- 6. Locations, Schedules, Permits
    INSERT INTO cinecore.Location (Location_Name, Address, City, State, Country, Type, Daily_Rental_Cost, Contact_Person, Contact_Phone, Facilities_Available, Permits_Required) VALUES
        ('Ohio State Reformatory', '100 Reformatory Rd', 'Mansfield', 'OH', 'USA', 'OUTDOOR', 15000, 'Warden Bob', '555-1234', 'Prison set, open yard', TRUE) RETURNING Location_id INTO v_loc1_id;
    INSERT INTO cinecore.Location (Location_Name, Address, City, State, Country, Type, Daily_Rental_Cost, Contact_Person, Contact_Phone, Facilities_Available, Permits_Required) VALUES
        ('Medfield State Hospital', '45 Hospital Rd', 'Medfield', 'MA', 'USA', 'OUTDOOR', 25000, 'Dr Cawley', '555-5678', 'Asylum blocks, rocky coast nearby', TRUE) RETURNING Location_id INTO v_loc2_id;

    INSERT INTO cinecore.Shoot_Schedule (Project_id, Location_id, Schedule_Date, Call_Time, Scene_Nos, Status) VALUES
        (v_shawshank_id, v_loc1_id, '1993-06-15', '06:00:00', '1, 2, 3', 'COMPLETED'),
        (v_shutter_id, v_loc2_id, '2008-03-10', '08:00:00', '4, 5, 8A', 'COMPLETED');

    INSERT INTO cinecore.Permit (Project_id, Location_id, Issuing_Authority, Permit_Type, Application_Date, Permit_Fee, Status) VALUES
        (v_shawshank_id, v_loc1_id, 'Mansfield City Council', 'SHOOTING', '1993-04-01', 5000, 'APPROVED'),
        (v_shutter_id, v_loc2_id, 'Massachusetts Film Office', 'SHOOTING', '2008-01-15', 12000, 'APPROVED');

    -- 7. Songs
    INSERT INTO cinecore.Song (Project_id, Title, Duration_Seconds, Music_Director_id) VALUES
        (v_shawshank_id, 'End Title', 240, v_frank_id),
        (v_shutter_id, 'Symphony No. 3', 380, v_martin_id);

    -- 8. OTT Deals
    INSERT INTO cinecore.OTT_Deal (Project_id, Platform_Id, Deal_Type, Territory, License_Fee, Languages, Deal_Signing_Date, Streaming_Start_Date, Deal_Expiry_Date) VALUES
        (v_shawshank_id, 1, 'NON_EXCLUSIVE', 'Global', 45000000, 'English', '1995-01-01', '1995-05-01', '2030-05-01'),
        (v_shutter_id, 2, 'EXCLUSIVE', 'Global', 25000000, 'English', '2010-05-01', '2010-08-01', '2030-08-01');

    -- 9. Theatre Releases
    INSERT INTO cinecore.Theatre_Release (Project_id, City, Theatre_Chain, No_Of_Screens, Opening_Weekend_Collection, Total_Collection, Release_Date) VALUES
        (v_shawshank_id, 'Global', 'Multiple', 3000, 2400000, 28300000, '1994-09-23'),
        (v_shutter_id, 'Global', 'Multiple', 4500, 41000000, 294800000, '2010-02-19');

    RAISE NOTICE 'SHAWSHANK_PROJECT_ID=%', v_shawshank_id;
    RAISE NOTICE 'SHUTTER_PROJECT_ID=%', v_shutter_id;
END $$;
