-- =============================================================================
-- CineCore DB — Film Production & Distribution Management System
-- DDL Script
-- Schema: cinecore
-- =============================================================================

-- Drop and recreate schema 
DROP SCHEMA IF EXISTS cinecore CASCADE;
CREATE SCHEMA cinecore;
SET search_path = cinecore;

-- =============================================================================
-- 1. PRODUCTION_HOUSE
-- Parent table — no FK dependencies
-- =============================================================================
CREATE TABLE Production_House (
    House_id            SERIAL          PRIMARY KEY,
    Name                VARCHAR(150)    NOT NULL,
    Founded_Year        INTEGER,
    Headquarter_City    VARCHAR(100)    NOT NULL,
    Headquarter_Country VARCHAR(100)    NOT NULL,
    GSTIN               VARCHAR(20)     UNIQUE,         -- alternate key
    Website             VARCHAR(200),
    Contact_Email       VARCHAR(150)    NOT NULL
);

-- =============================================================================
-- 2. PROJECT
-- Depends on: Production_House
-- =============================================================================
CREATE TABLE Project (
    Project_id              SERIAL          PRIMARY KEY,
    Title                   VARCHAR(200)    NOT NULL,
    House_id                INTEGER         NOT NULL    REFERENCES Production_House(House_id),
    Genre                   VARCHAR(100)    NOT NULL,
    Language                VARCHAR(100)    NOT NULL,
    Format                  VARCHAR(50)     NOT NULL
                                            CHECK (Format IN ('Feature Film', 'Web Series', 'Short Film', 'Documentary')),
    Total_Budget            DECIMAL(15,2)   NOT NULL,
    Status                  VARCHAR(30)     NOT NULL
                                            CHECK (Status IN ('DEVELOPMENT', 'PRE_PRODUCTION', 'SHOOTING', 'POST_PRODUCTION', 'RELEASED', 'SHELVED')),
    Start_Date              DATE            NOT NULL,
    Expected_Release_Date   DATE,
    Actual_Release_Date     DATE,
    Censor_Certificate_No   VARCHAR(50)     UNIQUE,     -- alternate key
    Censor_Rating           VARCHAR(5)
                                            CHECK (Censor_Rating IN ('U', 'UA', 'A')),
    Runtime_Minutes         INTEGER
);

-- =============================================================================
-- 3. PERSON
-- Parent table — no FK dependencies
-- =============================================================================
CREATE TABLE Person (
    Person_ID           SERIAL          PRIMARY KEY,
    Full_Name           VARCHAR(150)    NOT NULL,
    Screen_Name         VARCHAR(150),
    Nationality         VARCHAR(100)    NOT NULL,
    DOB                 DATE            NOT NULL,
    Gender              VARCHAR(20),
    Primary_Profession  VARCHAR(100)    NOT NULL,
    PAN_No              VARCHAR(15)     NOT NULL UNIQUE, -- alternate key
    Contact_Email       VARCHAR(150)    NOT NULL,
    Contact_Phone       VARCHAR(20),
    Agent_Name          VARCHAR(150),
    Agent_Contact       VARCHAR(150)
);

-- =============================================================================
-- 4. SCRIPT
-- Depends on: Project, Person
-- =============================================================================
CREATE TABLE Script (
    Script_id       SERIAL          PRIMARY KEY,
    Project_id      INTEGER         NOT NULL    REFERENCES Project(Project_id),
    Version_No      INTEGER         NOT NULL,
    Written_By      INTEGER         NOT NULL    REFERENCES Person(Person_ID),
    Submitted_Date  DATE            NOT NULL,
    Status          VARCHAR(20)     NOT NULL
                                    CHECK (Status IN ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'REJECTED')),
    Notes           TEXT,
    Word_Count      INTEGER,
    UNIQUE (Project_id, Version_No)             -- alternate key
);

-- =============================================================================
-- 5. CONTRACT
-- Depends on: Person, Project
-- =============================================================================
CREATE TABLE Contract (
    Contract_id     SERIAL          PRIMARY KEY,
    Person_id       INTEGER         NOT NULL    REFERENCES Person(Person_ID),
    Project_id      INTEGER         NOT NULL    REFERENCES Project(Project_id),
    Role            VARCHAR(50)     NOT NULL
                                    CHECK (Role IN ('ACTOR', 'DIRECTOR', 'WRITER', 'DOP',
                                           'MUSIC_COMPOSER', 'EDITOR', 'VFX_HEAD',
                                           'COSTUME', 'CHOREOGRAPHER', 'OTHER')),
    Character_Name  VARCHAR(150),
    Contract_Fee    DECIMAL(15,2)   NOT NULL,
    Currency        VARCHAR(10)     NOT NULL    DEFAULT 'INR',
    Signing_Date    DATE            NOT NULL,
    Start_Date      DATE            NOT NULL,
    End_Date        DATE,
    Status          VARCHAR(20)     NOT NULL
                                    CHECK (Status IN ('ACTIVE', 'COMPLETED', 'TERMINATED', 'ON_HOLD')),
    Special_Clauses TEXT,
    UNIQUE (Person_id, Project_id)              -- alternate key: one contract per person per project
);

-- =============================================================================
-- 6. PAYMENT_MILESTONE
-- Depends on: Contract
-- =============================================================================
CREATE TABLE Payment_Milestone (
    Milestone_Id            SERIAL          PRIMARY KEY,
    Contract_id             INTEGER         NOT NULL    REFERENCES Contract(Contract_id),
    Milestone_Name          VARCHAR(100)    NOT NULL,
    Due_Date                DATE            NOT NULL,
    Amount                  DECIMAL(15,2)   NOT NULL,
    Paid_Date               DATE,                       -- NULL until paid
    Payment_Status          VARCHAR(20)     NOT NULL
                                            CHECK (Payment_Status IN ('PENDING', 'PAID', 'OVERDUE')),
    Transaction_Reference_No VARCHAR(100)   UNIQUE      -- alternate key, NULL until paid
);

-- =============================================================================
-- 7. LOCATION
-- Parent table — no FK dependencies
-- =============================================================================
CREATE TABLE Location (
    Location_Id         SERIAL          PRIMARY KEY,
    Location_Name       VARCHAR(200)    NOT NULL,
    Type                VARCHAR(30)     NOT NULL
                                        CHECK (Type IN ('OUTDOOR', 'FOREIGN', 'INDOOR_SET')),
    Address             TEXT,
    City                VARCHAR(100)    NOT NULL,
    State               VARCHAR(100),
    Country             VARCHAR(100)    NOT NULL,
    Contact_Person      VARCHAR(150)    NOT NULL,
    Contact_Phone       VARCHAR(20)     NOT NULL,
    Daily_Rental_Cost   DECIMAL(12,2),
    Facilities_Available TEXT,
    Permits_Required    BOOLEAN         NOT NULL,
    Permit_Authority    VARCHAR(200)    -- NULL if Permits_Required = FALSE
);

-- =============================================================================
-- 8. SHOOT_SCHEDULE
-- Depends on: Project, Location
-- =============================================================================
CREATE TABLE Shoot_Schedule (
    Schedule_Id         SERIAL          PRIMARY KEY,
    Project_id          INTEGER         NOT NULL    REFERENCES Project(Project_id),
    Location_Id         INTEGER         NOT NULL    REFERENCES Location(Location_Id),
    Schedule_Date       DATE            NOT NULL,
    Scene_Nos           VARCHAR(200)    NOT NULL,
    Call_Time           TIME            NOT NULL,
    Status              VARCHAR(20)     NOT NULL
                                        CHECK (Status IN ('PLANNED', 'COMPLETED', 'CANCELLED', 'POSTPONED')),
    Director_Notes      TEXT,
    Delay_Reason        TEXT,           -- NULL unless POSTPONED or CANCELLED
    UNIQUE (Project_id, Schedule_Date, Location_Id) -- alternate key
);

-- =============================================================================
-- 9. PERMIT
-- Depends on: Project, Location
-- =============================================================================
CREATE TABLE Permit (
    Permit_Id           SERIAL          PRIMARY KEY,
    Project_id          INTEGER         NOT NULL    REFERENCES Project(Project_id),
    Location_Id         INTEGER         NOT NULL    REFERENCES Location(Location_Id),
    Issuing_Authority   VARCHAR(200)    NOT NULL,
    Permit_Type         VARCHAR(50)     NOT NULL
                                        CHECK (Permit_Type IN ('SHOOTING', 'PARKING', 'DRONE_FLIGHT', 'NIGHT_SHOOT')),
    Application_Date    DATE            NOT NULL,
    Issued_Date         DATE,           -- NULL until approved
    Valid_From          DATE,           -- NULL until approved
    Valid_To            DATE,           -- NULL until approved
    Permit_Fee          DECIMAL(10,2),
    Status              VARCHAR(20)     NOT NULL
                                        CHECK (Status IN ('APPLIED', 'APPROVED', 'REJECTED', 'EXPIRED'))
);

-- =============================================================================
-- 10. BUDGET_HEAD
-- Depends on: Project, Person
-- =============================================================================
CREATE TABLE Budget_Head (
    Budget_Head_Id      SERIAL          PRIMARY KEY,
    Project_id          INTEGER         NOT NULL    REFERENCES Project(Project_id),
    Category_Name       VARCHAR(100)    NOT NULL,
    Allocated_Amount    DECIMAL(15,2)   NOT NULL,
    Overspent_Flag      BOOLEAN         NOT NULL    DEFAULT FALSE,
    Head_of_Department  INTEGER                     REFERENCES Person(Person_ID), -- nullable: may not be assigned immediately
    UNIQUE (Project_id, Category_Name)              -- alternate key
);

-- =============================================================================
-- 11. PRODUCTION_VENDOR
-- Parent table — no FK dependencies
-- =============================================================================
CREATE TABLE Production_Vendor (
    Vendor_Id           SERIAL          PRIMARY KEY,
    Company_Name        VARCHAR(200)    NOT NULL,
    Service_Type        VARCHAR(100)    NOT NULL
                                        CHECK (Service_Type IN ('VFX', 'EQUIPMENT_RENTAL', 'CATERING',
                                               'SECURITY', 'TRANSPORT', 'STUDIO_HIRE')),
    GSTIN               VARCHAR(20)     UNIQUE,     -- alternate key
    Contact_Name        VARCHAR(150)    NOT NULL,
    Contact_Phone       VARCHAR(20)     NOT NULL,
    Contact_Email       VARCHAR(150)    NOT NULL,
    Internal_Rating     INTEGER
                                        CHECK (Internal_Rating BETWEEN 1 AND 5),
    Bank_Account_No     VARCHAR(30)     UNIQUE,     -- alternate key
    Bank_IFSC           VARCHAR(15)
);

-- =============================================================================
-- 12. EXPENSE
-- Depends on: Project, Budget_Head, Person, Production_Vendor
-- =============================================================================
CREATE TABLE Expense (
    Expense_Id      SERIAL          PRIMARY KEY,
    Project_id      INTEGER         NOT NULL    REFERENCES Project(Project_id),
    Budget_Head_Id  INTEGER         NOT NULL    REFERENCES Budget_Head(Budget_Head_Id),
    Vendor_Id       INTEGER         NOT NULL    REFERENCES Production_Vendor(Vendor_Id),
    Description     TEXT            NOT NULL,
    Amount          DECIMAL(15,2)   NOT NULL,
    Expense_Date    DATE            NOT NULL,
    Payment_Mode    VARCHAR(20)
                                    CHECK (Payment_Mode IN ('CHEQUE', 'NEFT', 'CASH', 'UPI')),
    Approved_By     INTEGER                     REFERENCES Person(Person_ID),
    Invoice_No      VARCHAR(100)    UNIQUE,     -- alternate key, nullable initially
    Status          VARCHAR(20)     NOT NULL
                                    CHECK (Status IN ('PENDING', 'APPROVED', 'PAID', 'DISPUTED'))
);

-- =============================================================================
-- 13. SONG
-- Depends on: Project, Person (twice — music director and lyricist)
-- =============================================================================
CREATE TABLE Song (
    Song_Id             SERIAL          PRIMARY KEY,
    Project_id          INTEGER         NOT NULL    REFERENCES Project(Project_id),
    Title               VARCHAR(200)    NOT NULL,
    Duration_Seconds    INTEGER,
    Music_Director_Id   INTEGER         NOT NULL    REFERENCES Person(Person_ID),
    Lyricist_Id         INTEGER                     REFERENCES Person(Person_ID), -- nullable: instrumental songs
    Recording_Studio    VARCHAR(150),
    Recording_Date      DATE,
    ISRC_Code           VARCHAR(20)     UNIQUE      -- alternate key
);

-- =============================================================================
-- 14. SONG_SINGER
-- Junction table — resolves M:N between Song and Person
-- Depends on: Song, Person
-- =============================================================================
CREATE TABLE Song_Singer (
    Song_id     INTEGER         NOT NULL    REFERENCES Song(Song_Id),
    Singer_id   INTEGER         NOT NULL    REFERENCES Person(Person_ID),
    Voice_Type  VARCHAR(30)     NOT NULL
                                CHECK (Voice_Type IN ('LEAD_MALE', 'LEAD_FEMALE', 'CHORUS')),
    PRIMARY KEY (Song_id, Singer_id)        -- composite PK
);

-- =============================================================================
-- 15. OTT_PLATFORM
-- Parent table — no FK dependencies
-- =============================================================================
CREATE TABLE OTT_Platform (
    OTT_Id                  SERIAL          PRIMARY KEY,
    Name                    VARCHAR(100)    NOT NULL UNIQUE, -- alternate key
    Hq_Country              VARCHAR(100)    NOT NULL,
    Subscriber_Base_Millions DECIMAL(8,2),
    Contact_Person          VARCHAR(150)    NOT NULL,
    Contact_Email           VARCHAR(150)    NOT NULL
);

-- =============================================================================
-- 16. OTT_DEAL
-- Depends on: Project, OTT_Platform
-- =============================================================================
CREATE TABLE OTT_Deal (
    Deal_Id                 SERIAL          PRIMARY KEY,
    Project_id              INTEGER         NOT NULL    REFERENCES Project(Project_id),
    Platform_Id             INTEGER         NOT NULL    REFERENCES OTT_Platform(OTT_Id),
    Deal_Type               VARCHAR(20)     NOT NULL
                                            CHECK (Deal_Type IN ('EXCLUSIVE', 'NON_EXCLUSIVE', 'OTT_PREMIERE')),
    Territory               VARCHAR(200)    NOT NULL,
    License_Fee             DECIMAL(15,2),              -- NULL if revenue share model
    Revenue_Share_Percent   DECIMAL(5,2),               -- NULL if flat fee model
    Deal_Signing_Date       DATE            NOT NULL,
    Streaming_Start_Date    DATE            NOT NULL,
    Deal_Expiry_Date        DATE            NOT NULL,
    Languages               TEXT,
    UNIQUE (Project_id, Platform_Id, Territory)         -- alternate key
);

-- =============================================================================
-- 17. THEATRE_RELEASE
-- Depends on: Project
-- =============================================================================
CREATE TABLE Theatre_Release (
    Theatre_Release_Id          SERIAL          PRIMARY KEY,
    Project_id                  INTEGER         NOT NULL    REFERENCES Project(Project_id),
    City                        VARCHAR(100)    NOT NULL,
    Theatre_Chain               VARCHAR(100)    NOT NULL,
    No_Of_Screens               INTEGER         NOT NULL,
    Release_Date                DATE            NOT NULL,
    Opening_Weekend_Collection  DECIMAL(15,2),  -- NULL until weekend passes
    Total_Collection            DECIMAL(15,2),  -- updated over time
    Weeks_Running               INTEGER,        -- updated over time
    UNIQUE (Project_id, City, Theatre_Chain)    -- alternate key
);

-- =============================================================================
-- END OF DDL
-- CineCore DB | 17 Tables | IT214 Winter 2026
-- =============================================================================
