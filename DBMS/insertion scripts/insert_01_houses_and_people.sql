-- =================================================================
-- INSERT SCRIPT 1: Production Houses + Persons
-- =================================================================
SET search_path = cinecore;

-- -----------------------------------------------------------------
-- PRODUCTION HOUSES
-- -----------------------------------------------------------------

INSERT INTO cinecore.Production_House
    (Name, Founded_Year, Headquarter_City, Headquarter_Country, GSTIN, Website, Contact_Email)
VALUES
    ('Saumya Studios',  2006, 'Ahmedabad',  'India', '27AABCR1234A1ZX', 'www.saumya_studios.in',  'info@saumya_studios.in'),
    ('Aura Films',    2010, 'Mumbai', 'India', '33AABCC5678B2ZY', 'www.aurafilms.in',    'info@aurafilms.in')
RETURNING House_id, Name;

-- -----------------------------------------------------------------
-- PERSONS
-- -----------------------------------------------------------------

INSERT INTO cinecore.Person
    (Full_Name, Screen_Name, Nationality, DOB, Gender, Primary_Profession, PAN_No, Contact_Email, Contact_Phone, Agent_Name, Agent_Contact)
VALUES
    ('Saumya Shah',          'Saumya',     'Indian', '2006-10-05', 'Male',   'Director',         'ABCPM1234D', 'saumya@talent.in',   '+91 98201 11111', 'Talent First Agency', 'agency@talentfirst.in'),
    ('Nidhi Thakkar',         'Nidhi',         'Indian', '2006-09-28', 'Female', 'Actor',             'ABCPK5678E', 'nidhi@stars.in',    '+91 98201 22222', 'Star Circle',         'sc@starcircle.in'),
    ('Sharvil Shah',          'Shash',         'Indian', '2006-11-21', 'Male',   'Actor',             'ABCPV9012F', 'sharvil@stars.in',    '+91 98201 33333', 'Star Circle',         'sc@starcircle.in'),
    ('Bhavya Modi',           'Prelioz',      'Indian', '2006-05-15', 'Male', 'Music Composer',    'ABCPR3456G', 'bhavya@music.in',   '+91 98201 44444', NULL,                  NULL),
    ('Dev Doshi',     'Dev',      'Indian', '2006-01-04', 'Male',   'Writer',            'ABCPS7890H', 'dev@writers.in',    '+91 98201 55555', NULL,                  NULL),
    ('Trisha Godhasara',           'Topo',         'Indian', '2006-08-02', 'Female', 'Actor',             'ABCPN2345I', 'trisha@talent.in',    '+91 98201 66666', 'Talent First Agency',   'agency@talentfirst.in'),
    ('Kulanjay Chavda',  'KJ',       'Indian', '2006-03-09', 'Male',   'Director',          'ABCPK6789J', 'kj@films.in',  '+91 98201 77777', NULL,                  NULL),
    ('Isha Dholariya',      'Isha',        'Indian', '2006-06-22', 'Female', 'Actor',             'ABCPK1357K', 'isha@stars.in',   '+91 98201 88888', 'South Side Talent',   'sst@sst.in'),
    ('Nisarg Malhotra',        'Nisarg',        'Indian', '2006-04-15', 'Male',   'Actor',             'ABCPP2468L', 'nisarg@stars.in',   '+91 98201 99999', 'South Side Talent',   'sst@sst.in'),
    ('Dhyani Patel',          'Dhyani',          'Indian', '2006-02-23', 'Female', 'Actor',             'ABCPS3579M', 'dhyani@stars.in',     '+91 98202 11111', 'Talent First Agency', 'agency@talentfirst.in'),
    ('Samyak Shah',         'Alkhori',         'Indian', '2006-05-05', 'Male',   'Cinematographer',   'ABCPT4680N', 'samyak@crew.in',     '+91 98202 22222', NULL,                  NULL),
    ('Yashvi Doshi',           'YashDon',          'Indian', '2006-08-05', 'Female', 'Editor',            'ABCPJ5791O', 'yashvi@crew.in',      '+91 98202 33333', NULL,                  NULL),
    ('Pranshu Vaghani',         'Bored',        'Indian', '2006-07-31', 'Male',   'VFX Artist',        'ABCPG6802P', 'pranshu@vfx.in',     '+91 98202 44444', NULL,                  NULL)
RETURNING Person_ID, Full_Name, Primary_Profession;
