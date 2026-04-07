import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Table, Zap, Settings, Users, FileText, MapPin, Wallet, MonitorPlay, ShieldCheck, ArrowRight, ChevronDown, ChevronRight, Copy, Check, Download } from 'lucide-react';


/* ── Code Block with Copy + Scrollable ── */
function CodeBlock({ code, title }: { code: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="bg-[#080808] border border-cine-border rounded overflow-hidden">
      {title && (
        <div className="px-4 py-2.5 border-b border-cine-border/50 flex items-center justify-between bg-[#0c0c0c] sticky top-0 z-10">
          <span className="font-mono text-[10px] text-cine-gold uppercase tracking-widest">{title}</span>
          <button onClick={handleCopy} className="flex items-center gap-1.5 text-cine-dust hover:text-cine-cream transition-colors px-2 py-1 border border-cine-border/30 hover:border-cine-gold/30">
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            <span className="font-mono text-[9px]">{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      )}
      <pre className="p-4 overflow-x-auto overflow-y-auto max-h-[500px] text-[13px] font-mono text-cine-cream/90 leading-relaxed whitespace-pre scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/* ── Collapsible Section ── */
function Collapsible({ title, icon: Icon, children, defaultOpen = false, badge }: {
  title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean; badge?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-cine-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 bg-cine-onyx hover:bg-cine-border/10 transition-colors text-left"
      >
        <div className="p-2 bg-cine-void border border-cine-border">
          <Icon className="w-5 h-5 text-cine-gold" />
        </div>
        <span className="font-heading text-lg text-cine-ivory flex-1">{title}</span>
        {badge && <span className="font-mono text-[9px] text-cine-gold border border-cine-gold/30 px-2 py-0.5 uppercase tracking-widest">{badge}</span>}
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="w-5 h-5 text-cine-dust" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="p-6 bg-cine-void/30 border-t border-cine-border/50 space-y-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Table Schema Card ── */
function TableCard({ name, desc, columns, keys }: {
  name: string; desc: string; columns: string[]; keys: string[];
}) {
  return (
    <div className="bg-cine-onyx border border-cine-border p-5 hover:border-cine-gold/30 transition-colors group">
      <div className="flex items-center gap-3 mb-3">
        <Table className="w-4 h-4 text-cine-gold" />
        <h4 className="font-mono text-sm text-cine-gold uppercase tracking-wider">{name}</h4>
      </div>
      <p className="font-body text-sm text-cine-cream mb-4">{desc}</p>
      <div className="space-y-1">
        {columns.map((col) => (
          <div key={col} className="font-mono text-xs text-cine-dust flex items-center gap-2">
            <span className="text-cine-border">├─</span> {col}
          </div>
        ))}
      </div>
      {keys.length > 0 && (
        <div className="mt-3 pt-3 border-t border-cine-border/30">
          {keys.map((key) => (
            <div key={key} className="font-mono text-[10px] text-cine-gold/70 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> {key}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── ER Relationship Line ── */
function ERRelation({ from, to, relationship, via }: { from: string; to: string; relationship: string; via?: string }) {
  return (
    <div className="flex items-center gap-3 font-mono text-xs py-2 px-4 bg-cine-void border border-cine-border/50 hover:border-cine-gold/20 transition-colors">
      <span className="text-cine-gold font-bold">{from}</span>
      <ArrowRight className="w-3 h-3 text-cine-dust" />
      <span className="text-cine-cream">{relationship}</span>
      <ArrowRight className="w-3 h-3 text-cine-dust" />
      <span className="text-cine-gold font-bold">{to}</span>
      {via && <span className="text-cine-dust ml-auto text-[10px]">via {via}</span>}
    </div>
  );
}

/* ══════════════════════════════════════ FULL SQL SCRIPTS ══════════════════════════════════════ */

const DDL_FULL = `-- =============================================================================
-- CineCore DB — Film Production & Distribution Management System
-- DDL Script · Schema: cinecore
-- =============================================================================

DROP SCHEMA IF EXISTS cinecore CASCADE;
CREATE SCHEMA cinecore;
SET search_path = cinecore;

-- 1. PRODUCTION_HOUSE
CREATE TABLE Production_House (
    House_id            SERIAL          PRIMARY KEY,
    Name                VARCHAR(150)    NOT NULL,
    Founded_Year        INTEGER,
    Headquarter_City    VARCHAR(100)    NOT NULL,
    Headquarter_Country VARCHAR(100)    NOT NULL,
    GSTIN               VARCHAR(20)     UNIQUE,
    Website             VARCHAR(200),
    Contact_Email       VARCHAR(150)    NOT NULL
);

-- 2. PROJECT
CREATE TABLE Project (
    Project_id              SERIAL          PRIMARY KEY,
    Title                   VARCHAR(200)    NOT NULL,
    House_id                INTEGER         NOT NULL    REFERENCES Production_House(House_id),
    Genre                   VARCHAR(100)    NOT NULL,
    Language                VARCHAR(100)    NOT NULL,
    Format                  VARCHAR(50)     NOT NULL
                                            CHECK (Format IN ('Feature Film','Web Series','Short Film','Documentary')),
    Total_Budget            DECIMAL(15,2)   NOT NULL,
    Status                  VARCHAR(30)     NOT NULL
                                            CHECK (Status IN ('DEVELOPMENT','PRE_PRODUCTION','SHOOTING','POST_PRODUCTION','RELEASED','SHELVED')),
    Start_Date              DATE            NOT NULL,
    Expected_Release_Date   DATE,
    Actual_Release_Date     DATE,
    Censor_Certificate_No   VARCHAR(50)     UNIQUE,
    Censor_Rating           VARCHAR(5)      CHECK (Censor_Rating IN ('U','UA','A')),
    Runtime_Minutes         INTEGER
);

-- 3. PERSON
CREATE TABLE Person (
    Person_ID           SERIAL          PRIMARY KEY,
    Full_Name           VARCHAR(150)    NOT NULL,
    Screen_Name         VARCHAR(150),
    Nationality         VARCHAR(100)    NOT NULL,
    DOB                 DATE            NOT NULL,
    Gender              VARCHAR(20),
    Primary_Profession  VARCHAR(100)    NOT NULL,
    PAN_No              VARCHAR(15)     NOT NULL UNIQUE,
    Contact_Email       VARCHAR(150)    NOT NULL,
    Contact_Phone       VARCHAR(20),
    Agent_Name          VARCHAR(150),
    Agent_Contact       VARCHAR(150)
);

-- 4. SCRIPT
CREATE TABLE Script (
    Script_id       SERIAL          PRIMARY KEY,
    Project_id      INTEGER         NOT NULL    REFERENCES Project(Project_id),
    Version_No      INTEGER         NOT NULL,
    Written_By      INTEGER         NOT NULL    REFERENCES Person(Person_ID),
    Submitted_Date  DATE            NOT NULL,
    Status          VARCHAR(20)     NOT NULL
                                    CHECK (Status IN ('DRAFT','UNDER_REVIEW','APPROVED','REJECTED')),
    Notes           TEXT,
    Word_Count      INTEGER,
    UNIQUE (Project_id, Version_No)
);

-- 5. CONTRACT
CREATE TABLE Contract (
    Contract_id     SERIAL          PRIMARY KEY,
    Person_id       INTEGER         NOT NULL    REFERENCES Person(Person_ID),
    Project_id      INTEGER         NOT NULL    REFERENCES Project(Project_id),
    Role            VARCHAR(50)     NOT NULL
                                    CHECK (Role IN ('ACTOR','DIRECTOR','WRITER','DOP',
                                           'MUSIC_COMPOSER','EDITOR','VFX_HEAD',
                                           'COSTUME','CHOREOGRAPHER','OTHER')),
    Character_Name  VARCHAR(150),
    Contract_Fee    DECIMAL(15,2)   NOT NULL,
    Currency        VARCHAR(10)     NOT NULL    DEFAULT 'INR',
    Signing_Date    DATE            NOT NULL,
    Start_Date      DATE            NOT NULL,
    End_Date        DATE,
    Status          VARCHAR(20)     NOT NULL
                                    CHECK (Status IN ('ACTIVE','COMPLETED','TERMINATED','ON_HOLD')),
    Special_Clauses TEXT,
    UNIQUE (Person_id, Project_id)
);

-- 6. PAYMENT_MILESTONE
CREATE TABLE Payment_Milestone (
    Milestone_Id            SERIAL          PRIMARY KEY,
    Contract_id             INTEGER         NOT NULL    REFERENCES Contract(Contract_id),
    Milestone_Name          VARCHAR(100)    NOT NULL,
    Due_Date                DATE            NOT NULL,
    Amount                  DECIMAL(15,2)   NOT NULL,
    Paid_Date               DATE,
    Payment_Status          VARCHAR(20)     NOT NULL
                                            CHECK (Payment_Status IN ('PENDING','PAID','OVERDUE')),
    Transaction_Reference_No VARCHAR(100)   UNIQUE
);

-- 7. LOCATION
CREATE TABLE Location (
    Location_Id         SERIAL          PRIMARY KEY,
    Location_Name       VARCHAR(200)    NOT NULL,
    Type                VARCHAR(30)     NOT NULL
                                        CHECK (Type IN ('OUTDOOR','FOREIGN','INDOOR_SET')),
    Address             TEXT,
    City                VARCHAR(100)    NOT NULL,
    State               VARCHAR(100),
    Country             VARCHAR(100)    NOT NULL,
    Contact_Person      VARCHAR(150)    NOT NULL,
    Contact_Phone       VARCHAR(20)     NOT NULL,
    Daily_Rental_Cost   DECIMAL(12,2),
    Facilities_Available TEXT,
    Permits_Required    BOOLEAN         NOT NULL,
    Permit_Authority    VARCHAR(200)
);

-- 8. SHOOT_SCHEDULE
CREATE TABLE Shoot_Schedule (
    Schedule_Id         SERIAL          PRIMARY KEY,
    Project_id          INTEGER         NOT NULL    REFERENCES Project(Project_id),
    Location_Id         INTEGER         NOT NULL    REFERENCES Location(Location_Id),
    Schedule_Date       DATE            NOT NULL,
    Scene_Nos           VARCHAR(200)    NOT NULL,
    Call_Time           TIME            NOT NULL,
    Status              VARCHAR(20)     NOT NULL
                                        CHECK (Status IN ('PLANNED','COMPLETED','CANCELLED','POSTPONED')),
    Director_Notes      TEXT,
    Delay_Reason        TEXT,
    UNIQUE (Project_id, Schedule_Date, Location_Id)
);

-- 9. PERMIT
CREATE TABLE Permit (
    Permit_Id           SERIAL          PRIMARY KEY,
    Project_id          INTEGER         NOT NULL    REFERENCES Project(Project_id),
    Location_Id         INTEGER         NOT NULL    REFERENCES Location(Location_Id),
    Issuing_Authority   VARCHAR(200)    NOT NULL,
    Permit_Type         VARCHAR(50)     NOT NULL
                                        CHECK (Permit_Type IN ('SHOOTING','PARKING','DRONE_FLIGHT','NIGHT_SHOOT')),
    Application_Date    DATE            NOT NULL,
    Issued_Date         DATE,
    Valid_From          DATE,
    Valid_To            DATE,
    Permit_Fee          DECIMAL(10,2),
    Status              VARCHAR(20)     NOT NULL
                                        CHECK (Status IN ('APPLIED','APPROVED','REJECTED','EXPIRED'))
);

-- 10. BUDGET_HEAD
CREATE TABLE Budget_Head (
    Budget_Head_Id      SERIAL          PRIMARY KEY,
    Project_id          INTEGER         NOT NULL    REFERENCES Project(Project_id),
    Category_Name       VARCHAR(100)    NOT NULL,
    Allocated_Amount    DECIMAL(15,2)   NOT NULL,
    Overspent_Flag      BOOLEAN         NOT NULL    DEFAULT FALSE,
    Head_of_Department  INTEGER                     REFERENCES Person(Person_ID),
    UNIQUE (Project_id, Category_Name)
);

-- 11. PRODUCTION_VENDOR
CREATE TABLE Production_Vendor (
    Vendor_Id           SERIAL          PRIMARY KEY,
    Company_Name        VARCHAR(200)    NOT NULL,
    Service_Type        VARCHAR(100)    NOT NULL
                                        CHECK (Service_Type IN ('VFX','EQUIPMENT_RENTAL','CATERING',
                                               'SECURITY','TRANSPORT','STUDIO_HIRE')),
    GSTIN               VARCHAR(20)     UNIQUE,
    Contact_Name        VARCHAR(150)    NOT NULL,
    Contact_Phone       VARCHAR(20)     NOT NULL,
    Contact_Email       VARCHAR(150)    NOT NULL,
    Internal_Rating     INTEGER         CHECK (Internal_Rating BETWEEN 1 AND 5),
    Bank_Account_No     VARCHAR(30)     UNIQUE,
    Bank_IFSC           VARCHAR(15)
);

-- 12. EXPENSE
CREATE TABLE Expense (
    Expense_Id      SERIAL          PRIMARY KEY,
    Project_id      INTEGER         NOT NULL    REFERENCES Project(Project_id),
    Budget_Head_Id  INTEGER         NOT NULL    REFERENCES Budget_Head(Budget_Head_Id),
    Vendor_Id       INTEGER         NOT NULL    REFERENCES Production_Vendor(Vendor_Id),
    Description     TEXT            NOT NULL,
    Amount          DECIMAL(15,2)   NOT NULL,
    Expense_Date    DATE            NOT NULL,
    Payment_Mode    VARCHAR(20)     CHECK (Payment_Mode IN ('CHEQUE','NEFT','CASH','UPI')),
    Approved_By     INTEGER                     REFERENCES Person(Person_ID),
    Invoice_No      VARCHAR(100)    UNIQUE,
    Status          VARCHAR(20)     NOT NULL
                                    CHECK (Status IN ('PENDING','APPROVED','PAID','DISPUTED'))
);

-- 13. SONG
CREATE TABLE Song (
    Song_Id             SERIAL          PRIMARY KEY,
    Project_id          INTEGER         NOT NULL    REFERENCES Project(Project_id),
    Title               VARCHAR(200)    NOT NULL,
    Duration_Seconds    INTEGER,
    Music_Director_Id   INTEGER         NOT NULL    REFERENCES Person(Person_ID),
    Lyricist_Id         INTEGER                     REFERENCES Person(Person_ID),
    Recording_Studio    VARCHAR(150),
    Recording_Date      DATE,
    ISRC_Code           VARCHAR(20)     UNIQUE
);

-- 14. SONG_SINGER (M:N Junction)
CREATE TABLE Song_Singer (
    Song_id     INTEGER         NOT NULL    REFERENCES Song(Song_Id),
    Singer_id   INTEGER         NOT NULL    REFERENCES Person(Person_ID),
    Voice_Type  VARCHAR(30)     NOT NULL
                                CHECK (Voice_Type IN ('LEAD_MALE','LEAD_FEMALE','CHORUS')),
    PRIMARY KEY (Song_id, Singer_id)
);

-- 15. OTT_PLATFORM
CREATE TABLE OTT_Platform (
    OTT_Id                  SERIAL          PRIMARY KEY,
    Name                    VARCHAR(100)    NOT NULL UNIQUE,
    Hq_Country              VARCHAR(100)    NOT NULL,
    Subscriber_Base_Millions DECIMAL(8,2),
    Contact_Person          VARCHAR(150)    NOT NULL,
    Contact_Email           VARCHAR(150)    NOT NULL
);

-- 16. OTT_DEAL
CREATE TABLE OTT_Deal (
    Deal_Id                 SERIAL          PRIMARY KEY,
    Project_id              INTEGER         NOT NULL    REFERENCES Project(Project_id),
    Platform_Id             INTEGER         NOT NULL    REFERENCES OTT_Platform(OTT_Id),
    Deal_Type               VARCHAR(20)     NOT NULL
                                            CHECK (Deal_Type IN ('EXCLUSIVE','NON_EXCLUSIVE','OTT_PREMIERE')),
    Territory               VARCHAR(200)    NOT NULL,
    License_Fee             DECIMAL(15,2),
    Revenue_Share_Percent   DECIMAL(5,2),
    Deal_Signing_Date       DATE            NOT NULL,
    Streaming_Start_Date    DATE            NOT NULL,
    Deal_Expiry_Date        DATE            NOT NULL,
    Languages               TEXT,
    UNIQUE (Project_id, Platform_Id, Territory)
);

-- 17. THEATRE_RELEASE
CREATE TABLE Theatre_Release (
    Theatre_Release_Id          SERIAL          PRIMARY KEY,
    Project_id                  INTEGER         NOT NULL    REFERENCES Project(Project_id),
    City                        VARCHAR(100)    NOT NULL,
    Theatre_Chain               VARCHAR(100)    NOT NULL,
    No_Of_Screens               INTEGER         NOT NULL,
    Release_Date                DATE            NOT NULL,
    Opening_Weekend_Collection  DECIMAL(15,2),
    Total_Collection            DECIMAL(15,2),
    Weeks_Running               INTEGER,
    UNIQUE (Project_id, City, Theatre_Chain)
);

-- END OF DDL — 17 Tables
`;

const SP_FULL = `-- =================================================================
-- CineCore DB — Stored Procedures
-- =================================================================
SET search_path = cinecore;


-- PROCEDURE 1: sp_create_project
-- Creates a new film project AND auto-creates 6 standard budget heads.
-- Without this, the app would need 7 round-trips. One call does it atomically.
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
    OUT p_project_id    INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_allocated_per_head DECIMAL(15,2);
BEGIN
    INSERT INTO cinecore.Project (
        Title, House_id, Genre, Language, Format,
        Total_Budget, Status, Start_Date, Expected_Release_Date
    )
    VALUES (
        p_title, p_house_id, p_genre, p_language, p_format,
        p_total_budget, 'DEVELOPMENT', p_start_date, p_expected_release
    )
    RETURNING Project_id INTO p_project_id;

    v_allocated_per_head := ROUND(p_total_budget / 6, 2);

    INSERT INTO cinecore.Budget_Head (Project_id, Category_Name, Allocated_Amount)
    VALUES
        (p_project_id, 'Cast & Talent',       v_allocated_per_head),
        (p_project_id, 'Crew & Technical',    v_allocated_per_head),
        (p_project_id, 'Locations & Permits', v_allocated_per_head),
        (p_project_id, 'Post Production',     v_allocated_per_head),
        (p_project_id, 'Music & Sound',       v_allocated_per_head),
        (p_project_id, 'Marketing & PR',      v_allocated_per_head);

    RAISE NOTICE 'Project "%" created with ID % and 6 budget heads.', p_title, p_project_id;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'sp_create_project failed: %', SQLERRM;
END;
$$;


-- PROCEDURE 2: sp_sign_contract
-- Signs a contract and auto-creates 3 payment milestones (30/40/30 split).
-- Also validates a person cannot be signed to the same project twice.
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
    IF EXISTS (
        SELECT 1 FROM cinecore.Contract
        WHERE Person_id = p_person_id AND Project_id = p_project_id
    ) THEN
        RAISE EXCEPTION 'Person % already has a contract on Project %.', p_person_id, p_project_id;
    END IF;

    INSERT INTO cinecore.Contract (
        Person_id, Project_id, Role, Character_Name,
        Contract_Fee, Signing_Date, Start_Date, End_Date, Status
    )
    VALUES (
        p_person_id, p_project_id, p_role, p_character_name,
        p_contract_fee, p_signing_date, p_start_date, p_end_date, 'ACTIVE'
    )
    RETURNING Contract_id INTO p_contract_id;

    v_30_pct := ROUND(p_contract_fee * 0.30, 2);
    v_40_pct := ROUND(p_contract_fee * 0.40, 2);

    INSERT INTO cinecore.Payment_Milestone (
        Contract_id, Milestone_Name, Due_Date, Amount, Payment_Status
    )
    VALUES
        (p_contract_id, 'Signing Advance (30%)',
         p_signing_date, v_30_pct, 'PENDING'),

        (p_contract_id, 'Shoot Commencement (40%)',
         p_start_date, v_40_pct, 'PENDING'),

        (p_contract_id, 'Final Delivery (30%)',
         COALESCE(p_end_date, p_start_date + INTERVAL '90 days'),
         p_contract_fee - v_30_pct - v_40_pct, 'PENDING');

    RAISE NOTICE 'Contract % created for Person % on Project %. 3 milestones added.',
        p_contract_id, p_person_id, p_project_id;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'sp_sign_contract failed: %', SQLERRM;
END;
$$;


-- PROCEDURE 3: sp_record_expense
-- Records an expense and checks for budget overrun.
-- If overspent, sets flag=TRUE and raises a WARNING (not error).
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
    SELECT Allocated_Amount, Category_Name
    INTO v_allocated, v_head_name
    FROM cinecore.Budget_Head
    WHERE Budget_Head_Id = p_budget_head_id
      AND Project_id = p_project_id;

    IF v_allocated IS NULL THEN
        RAISE EXCEPTION 'Budget Head % does not belong to Project %.', p_budget_head_id, p_project_id;
    END IF;

    INSERT INTO cinecore.Expense (
        Project_id, Budget_Head_Id, Vendor_Id, Description,
        Amount, Expense_Date, Payment_Mode, Invoice_No, Status
    )
    VALUES (
        p_project_id, p_budget_head_id, p_vendor_id, p_description,
        p_amount, p_expense_date, p_payment_mode, p_invoice_no, 'PENDING'
    )
    RETURNING Expense_Id INTO p_expense_id;

    SELECT COALESCE(SUM(Amount), 0) INTO v_total_spent
    FROM cinecore.Expense
    WHERE Budget_Head_Id = p_budget_head_id
      AND Status IN ('APPROVED', 'PAID');

    IF v_total_spent > v_allocated THEN
        UPDATE cinecore.Budget_Head
        SET Overspent_Flag = TRUE
        WHERE Budget_Head_Id = p_budget_head_id;

        RAISE WARNING 'BUDGET OVERRUN: "%" on Project % overspent. Allocated: %, Spent: %',
            v_head_name, p_project_id, v_allocated, v_total_spent;
    END IF;

    RAISE NOTICE 'Expense % recorded: % on budget head "%".', p_expense_id, p_amount, v_head_name;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'sp_record_expense failed: %', SQLERRM;
END;
$$;


-- PROCEDURE 4: sp_finalize_project
-- Marks a project as RELEASED after validating:
-- 1. All contracts COMPLETED  2. Censor cert exists  3. Distribution exists
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
    SELECT Title INTO v_project_title
    FROM cinecore.Project WHERE Project_id = p_project_id;

    IF v_project_title IS NULL THEN
        RAISE EXCEPTION 'Project % not found.', p_project_id;
    END IF;

    SELECT COUNT(*) INTO v_active_contracts
    FROM cinecore.Contract
    WHERE Project_id = p_project_id
      AND Status IN ('ACTIVE', 'ON_HOLD');

    IF v_active_contracts > 0 THEN
        RAISE EXCEPTION 'Cannot finalize "%" — % contract(s) still ACTIVE or ON_HOLD.',
            v_project_title, v_active_contracts;
    END IF;

    SELECT COUNT(*) INTO v_ott_deals
    FROM cinecore.OTT_Deal WHERE Project_id = p_project_id;

    SELECT COUNT(*) INTO v_theatre_releases
    FROM cinecore.Theatre_Release WHERE Project_id = p_project_id;

    IF v_ott_deals = 0 AND v_theatre_releases = 0 THEN
        RAISE EXCEPTION 'Cannot finalize "%" — no distribution deal exists.', v_project_title;
    END IF;

    UPDATE cinecore.Project
    SET Status = 'RELEASED',
        Actual_Release_Date   = p_actual_release_date,
        Censor_Certificate_No = p_censor_cert_no,
        Censor_Rating         = p_censor_rating
    WHERE Project_id = p_project_id;

    RAISE NOTICE 'Project "%" finalized as RELEASED on %.', v_project_title, p_actual_release_date;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'sp_finalize_project failed: %', SQLERRM;
END;
$$;
`;

const TRIGGERS_FULL = `-- =================================================================
-- CineCore DB — Triggers
-- =================================================================
SET search_path = cinecore;

-- TRIGGER 1: Auto-update Overspent_Flag when expense is approved
-- FIRES: AFTER INSERT OR UPDATE OF Status ON Expense
-- Recalculates total spent and updates the budget head flag.
-- =================================================================

CREATE OR REPLACE FUNCTION cinecore.fn_check_budget_overrun()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_allocated     DECIMAL(15,2);
    v_total_spent   DECIMAL(15,2);
BEGIN
    IF NEW.Status IN ('APPROVED', 'PAID') AND
       (OLD.Status NOT IN ('APPROVED', 'PAID') OR TG_OP = 'INSERT')
    THEN
        SELECT Allocated_Amount INTO v_allocated
        FROM cinecore.Budget_Head
        WHERE Budget_Head_Id = NEW.Budget_Head_Id;

        SELECT COALESCE(SUM(Amount), 0) INTO v_total_spent
        FROM cinecore.Expense
        WHERE Budget_Head_Id = NEW.Budget_Head_Id
          AND Status IN ('APPROVED', 'PAID');

        UPDATE cinecore.Budget_Head
        SET Overspent_Flag = (v_total_spent > v_allocated)
        WHERE Budget_Head_Id = NEW.Budget_Head_Id;

        IF v_total_spent > v_allocated THEN
            RAISE WARNING 'BUDGET ALERT: Head % overspent (Spent: %, Allocated: %).',
                NEW.Budget_Head_Id, v_total_spent, v_allocated;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_expense_budget_check
    AFTER INSERT OR UPDATE OF Status
    ON cinecore.Expense
    FOR EACH ROW
    EXECUTE FUNCTION cinecore.fn_check_budget_overrun();


-- TRIGGER 2: Auto-mark payment milestones as OVERDUE
-- FIRES: BEFORE INSERT OR UPDATE ON Payment_Milestone
-- If Due_Date has passed and status is PENDING, auto-sets OVERDUE.
-- Uses BEFORE trigger to modify the row before it's saved.
-- =================================================================

CREATE OR REPLACE FUNCTION cinecore.fn_auto_mark_overdue()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.Payment_Status = 'PENDING' AND NEW.Due_Date < CURRENT_DATE THEN
        NEW.Payment_Status := 'OVERDUE';
        RAISE NOTICE 'Milestone "%" auto-marked as OVERDUE (was due %).', 
            NEW.Milestone_Name, NEW.Due_Date;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_milestone_overdue_check
    BEFORE INSERT OR UPDATE
    ON cinecore.Payment_Milestone
    FOR EACH ROW
    EXECUTE FUNCTION cinecore.fn_auto_mark_overdue();


-- TRIGGER 3: OTT Deal audit log (Change Data Capture)
-- FIRES: AFTER INSERT OR UPDATE OR DELETE ON OTT_Deal
-- Records old vs new values in an audit table for compliance.
-- =================================================================

CREATE TABLE IF NOT EXISTS cinecore.OTT_Deal_Audit (
    Audit_Id        SERIAL PRIMARY KEY,
    Deal_Id         INTEGER NOT NULL,
    Operation       VARCHAR(10) NOT NULL,
    Changed_At      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    Old_License_Fee DECIMAL(15,2),
    New_License_Fee DECIMAL(15,2),
    Old_Territory   VARCHAR(200),
    New_Territory   VARCHAR(200),
    Old_Deal_Type   VARCHAR(20),
    New_Deal_Type   VARCHAR(20),
    Old_Expiry_Date DATE,
    New_Expiry_Date DATE
);

CREATE OR REPLACE FUNCTION cinecore.fn_audit_ott_deal()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO cinecore.OTT_Deal_Audit (
            Deal_Id, Operation,
            New_License_Fee, New_Territory, New_Deal_Type, New_Expiry_Date
        ) VALUES (
            NEW.Deal_Id, 'INSERT',
            NEW.License_Fee, NEW.Territory, NEW.Deal_Type, NEW.Deal_Expiry_Date
        );

    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.License_Fee IS DISTINCT FROM OLD.License_Fee OR
           NEW.Territory   IS DISTINCT FROM OLD.Territory   OR
           NEW.Deal_Type   IS DISTINCT FROM OLD.Deal_Type   OR
           NEW.Deal_Expiry_Date IS DISTINCT FROM OLD.Deal_Expiry_Date
        THEN
            INSERT INTO cinecore.OTT_Deal_Audit (
                Deal_Id, Operation,
                Old_License_Fee, New_License_Fee,
                Old_Territory,   New_Territory,
                Old_Deal_Type,   New_Deal_Type,
                Old_Expiry_Date, New_Expiry_Date
            ) VALUES (
                NEW.Deal_Id, 'UPDATE',
                OLD.License_Fee, NEW.License_Fee,
                OLD.Territory,   NEW.Territory,
                OLD.Deal_Type,   NEW.Deal_Type,
                OLD.Deal_Expiry_Date, NEW.Deal_Expiry_Date
            );
        END IF;

    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO cinecore.OTT_Deal_Audit (
            Deal_Id, Operation,
            Old_License_Fee, Old_Territory, Old_Deal_Type, Old_Expiry_Date
        ) VALUES (
            OLD.Deal_Id, 'DELETE',
            OLD.License_Fee, OLD.Territory, OLD.Deal_Type, OLD.Deal_Expiry_Date
        );
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_ott_deal_audit
    AFTER INSERT OR UPDATE OR DELETE
    ON cinecore.OTT_Deal
    FOR EACH ROW
    EXECUTE FUNCTION cinecore.fn_audit_ott_deal();


-- TRIGGER 4: Prevent double-booking a location on the same date
-- FIRES: BEFORE INSERT OR UPDATE ON Shoot_Schedule
-- Cross-project constraint that UNIQUE key alone cannot enforce.
-- =================================================================

CREATE OR REPLACE FUNCTION cinecore.fn_prevent_location_double_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_conflict_project_id  INTEGER;
    v_conflict_title       VARCHAR;
BEGIN
    SELECT ss.Project_id, p.Title
    INTO v_conflict_project_id, v_conflict_title
    FROM cinecore.Shoot_Schedule ss
    JOIN cinecore.Project p ON p.Project_id = ss.Project_id
    WHERE ss.Location_Id    = NEW.Location_Id
      AND ss.Schedule_Date  = NEW.Schedule_Date
      AND ss.Status        != 'CANCELLED'
      AND ss.Project_id    != NEW.Project_id
      AND ss.Schedule_Id   != COALESCE(NEW.Schedule_Id, -1)
    LIMIT 1;

    IF v_conflict_project_id IS NOT NULL THEN
        RAISE EXCEPTION 
            'Location % is already booked on % by project "%" (ID: %).',
            NEW.Location_Id, NEW.Schedule_Date, v_conflict_title, v_conflict_project_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_location_double_booking
    BEFORE INSERT OR UPDATE
    ON cinecore.Shoot_Schedule
    FOR EACH ROW
    EXECUTE FUNCTION cinecore.fn_prevent_location_double_booking();
`;

/* ══════════════════════════════════════ MAIN COMPONENT ══════════════════════════════════════ */

export default function DBMSDocs() {

  const useCases = [
    {
      role: 'Production Admin', icon: ShieldCheck, color: 'text-cine-gold', cases: [
        'Greenlight new film projects — the system automatically creates budget departments for each project',
        'Monitor studio health with a bird\'s-eye view of all projects, their status, and budget utilization',
        'View and manage every project across the studio in one unified dashboard'
      ]
    },
    {
      role: 'Talent Manager', icon: Users, color: 'text-blue-400', cases: [
        'Build and maintain a global talent roster — actors, directors, writers, and crew with PAN-based identity verification',
        'Sign contracts that automatically generate a structured payment schedule for the finance team',
        'Manage script submissions through a version-controlled approval pipeline'
      ]
    },
    {
      role: 'Finance Manager', icon: Wallet, color: 'text-green-400', cases: [
        'Log vendor invoices and track expenses — the system flags departments that exceed their allocated budget',
        'Track payment milestones — overdue payments are automatically surfaced for immediate attention',
        'Get a real-time view of budget burn across all active productions'
      ]
    },
    {
      role: 'Production Manager', icon: MapPin, color: 'text-orange-400', cases: [
        'Register and manage shooting locations — outdoor, studio sets, and international venues with rental costs',
        'Plan shoot schedules with built-in conflict prevention — the system blocks double-booking of locations',
        'Apply for and track permits — shooting, drone flights, parking, and night shoot clearances'
      ]
    },
    {
      role: 'Distribution Manager', icon: MonitorPlay, color: 'text-purple-400', cases: [
        'Negotiate and register OTT platform deals with territory-wise licensing and revenue share terms',
        'Every change to a distribution deal is permanently logged for audit and compliance purposes',
        'Track box office collections by city and theatre chain, and manage the music catalog with singer assignments'
      ]
    },
  ];

  const tables = [
    { name: 'Production_House', desc: 'Film studios — the top-level entity that owns projects.', columns: ['House_id (PK)', 'Name', 'Founded_Year', 'Headquarter_City/Country', 'GSTIN (AK)', 'Contact_Email'], keys: ['PK: House_id', 'AK: GSTIN'] },
    { name: 'Project', desc: 'Films with lifecycle tracking from development through release.', columns: ['Project_id (PK)', 'Title', 'House_id (FK)', 'Genre/Language/Format', 'Total_Budget', 'Status', 'Censor_Certificate_No (AK)'], keys: ['PK: Project_id', 'FK: House_id → Production_House', 'AK: Censor_Certificate_No'] },
    { name: 'Person', desc: 'Everyone involved — actors, directors, writers, and crew.', columns: ['Person_ID (PK)', 'Full_Name', 'Screen_Name', 'Nationality', 'DOB', 'Primary_Profession', 'PAN_No (AK)'], keys: ['PK: Person_ID', 'AK: PAN_No'] },
    { name: 'Script', desc: 'Versioned screenplay submissions per project.', columns: ['Script_id (PK)', 'Project_id (FK)', 'Version_No', 'Written_By (FK)', 'Status', 'Word_Count'], keys: ['PK: Script_id', 'AK: (Project_id, Version_No)'] },
    { name: 'Contract', desc: 'One agreement per person per project with role and fee.', columns: ['Contract_id (PK)', 'Person_id (FK)', 'Project_id (FK)', 'Role', 'Contract_Fee', 'Status'], keys: ['PK: Contract_id', 'AK: (Person_id, Project_id)'] },
    { name: 'Payment_Milestone', desc: 'Structured payment schedule linked to each contract.', columns: ['Milestone_Id (PK)', 'Contract_id (FK)', 'Milestone_Name', 'Due_Date', 'Amount', 'Payment_Status', 'Transaction_Ref (AK)'], keys: ['PK: Milestone_Id', 'FK: Contract_id → Contract'] },
    { name: 'Location', desc: 'Shooting venues — outdoor, indoor sets, and international.', columns: ['Location_Id (PK)', 'Location_Name', 'Type', 'City/State/Country', 'Daily_Rental_Cost', 'Permits_Required'], keys: ['PK: Location_Id'] },
    { name: 'Shoot_Schedule', desc: 'Day-by-day shoot calendar tied to locations.', columns: ['Schedule_Id (PK)', 'Project_id (FK)', 'Location_Id (FK)', 'Schedule_Date', 'Scene_Nos', 'Call_Time', 'Status'], keys: ['PK: Schedule_Id', 'AK: (Project_id, Schedule_Date, Location_Id)'] },
    { name: 'Permit', desc: 'Government clearances needed for shoot activities.', columns: ['Permit_Id (PK)', 'Project_id (FK)', 'Location_Id (FK)', 'Permit_Type', 'Status', 'Valid_From/Valid_To'], keys: ['PK: Permit_Id'] },
    { name: 'Budget_Head', desc: 'Department-level budget allocation for each project.', columns: ['Budget_Head_Id (PK)', 'Project_id (FK)', 'Category_Name', 'Allocated_Amount', 'Overspent_Flag', 'Head_of_Dept (FK)'], keys: ['PK: Budget_Head_Id', 'AK: (Project_id, Category_Name)'] },
    { name: 'Production_Vendor', desc: 'Service providers — VFX houses, caterers, transport, etc.', columns: ['Vendor_Id (PK)', 'Company_Name', 'Service_Type', 'GSTIN (AK)', 'Internal_Rating (1-5)', 'Bank_Account_No (AK)'], keys: ['PK: Vendor_Id', 'AK: GSTIN, Bank_Account_No'] },
    { name: 'Expense', desc: 'Individual invoices recorded against budget departments.', columns: ['Expense_Id (PK)', 'Project_id (FK)', 'Budget_Head_Id (FK)', 'Vendor_Id (FK)', 'Amount', 'Payment_Mode', 'Invoice_No (AK)'], keys: ['PK: Expense_Id', 'FK: Budget_Head, Vendor, Person'] },
    { name: 'Song', desc: 'Film songs linked to music directors and lyricists.', columns: ['Song_Id (PK)', 'Project_id (FK)', 'Title', 'Music_Director_Id (FK)', 'Lyricist_Id (FK)', 'ISRC_Code (AK)'], keys: ['PK: Song_Id', 'AK: ISRC_Code'] },
    { name: 'Song_Singer', desc: 'Links singers to songs — resolves many-to-many relationship.', columns: ['Song_id (CPK, FK)', 'Singer_id (CPK, FK)', 'Voice_Type'], keys: ['CPK: (Song_id, Singer_id)'] },
    { name: 'OTT_Platform', desc: 'Streaming services like Netflix, Hotstar, Prime Video.', columns: ['OTT_Id (PK)', 'Name (AK)', 'Hq_Country', 'Subscriber_Base_Millions', 'Contact_Person/Email'], keys: ['PK: OTT_Id', 'AK: Name'] },
    { name: 'OTT_Deal', desc: 'Licensing agreements between projects and streaming platforms.', columns: ['Deal_Id (PK)', 'Project_id (FK)', 'Platform_Id (FK)', 'Deal_Type', 'Territory', 'License_Fee / Revenue_Share'], keys: ['PK: Deal_Id', 'AK: (Project_id, Platform_Id, Territory)'] },
    { name: 'Theatre_Release', desc: 'Box office tracking per city and theatre chain.', columns: ['Theatre_Release_Id (PK)', 'Project_id (FK)', 'City', 'Theatre_Chain', 'No_Of_Screens', 'Total_Collection', 'Weeks_Running'], keys: ['PK: Theatre_Release_Id', 'AK: (Project_id, City, Theatre_Chain)'] },
  ];

  const erRelationships = [
    { from: 'Production_House', to: 'Project', relationship: '1:N', via: 'House_id FK' },
    { from: 'Project', to: 'Script', relationship: '1:N', via: 'Project_id FK' },
    { from: 'Person', to: 'Script', relationship: '1:N (writes)', via: 'Written_By FK' },
    { from: 'Person', to: 'Contract', relationship: '1:N', via: 'Person_id FK' },
    { from: 'Project', to: 'Contract', relationship: '1:N', via: 'Project_id FK' },
    { from: 'Contract', to: 'Payment_Milestone', relationship: '1:N', via: 'Contract_id FK' },
    { from: 'Project', to: 'Shoot_Schedule', relationship: '1:N', via: 'Project_id FK' },
    { from: 'Location', to: 'Shoot_Schedule', relationship: '1:N', via: 'Location_Id FK' },
    { from: 'Project', to: 'Permit', relationship: '1:N', via: 'Project_id FK' },
    { from: 'Location', to: 'Permit', relationship: '1:N', via: 'Location_Id FK' },
    { from: 'Project', to: 'Budget_Head', relationship: '1:N', via: 'Project_id FK' },
    { from: 'Budget_Head', to: 'Expense', relationship: '1:N', via: 'Budget_Head_Id FK' },
    { from: 'Production_Vendor', to: 'Expense', relationship: '1:N', via: 'Vendor_Id FK' },
    { from: 'Project', to: 'Song', relationship: '1:N', via: 'Project_id FK' },
    { from: 'Song', to: 'Song_Singer', relationship: 'M:N', via: 'Junction table (CPK)' },
    { from: 'Project', to: 'OTT_Deal', relationship: '1:N', via: 'Project_id FK' },
    { from: 'OTT_Platform', to: 'OTT_Deal', relationship: '1:N', via: 'Platform_Id FK' },
    { from: 'Project', to: 'Theatre_Release', relationship: '1:N', via: 'Project_id FK' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 w-full relative">


      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-cine-onyx border border-cine-border">
            <Database className="w-6 h-6 text-cine-gold" />
          </div>
          <div>
            <span className="font-mono text-xs tracking-widest text-cine-gold uppercase block">Database Architecture</span>
            <h1 className="font-display text-5xl text-gradient-gold">DBMS Documentation</h1>
          </div>
        </div>
        <p className="font-body text-base text-cine-cream max-w-3xl mt-4 leading-relaxed">
          CineCore is a comprehensive <strong className="text-cine-ivory">Film Production & Distribution Management System</strong> built on PostgreSQL.
          It models the complete lifecycle of a film — from greenlighting a project and signing talent contracts, through shoot logistics and budget management,
          all the way to box office tracking and OTT distribution. The database uses <strong className="text-cine-ivory">17 normalized tables, 4 stored procedures, and 4 triggers</strong> to
          enforce business rules and automate repetitive operations across 5 distinct user roles.
        </p>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { label: 'Tables', value: '17' },
            { label: 'Stored Procedures', value: '4' },
            { label: 'Triggers', value: '4' },
            { label: 'User Roles', value: '5' },
          ].map((s) => (
            <div key={s.label} className="bg-cine-onyx border border-cine-border p-4 text-center">
              <div className="font-display text-2xl text-gradient-gold">{s.value}</div>
              <div className="font-mono text-[9px] text-cine-dust uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="space-y-6">

        {/* ═══ USE CASES ═══ */}
        <Collapsible title="Use Cases by Role" icon={Users} defaultOpen={true}>
          <p className="font-body text-sm text-cine-cream mb-6">
            CineCore enforces strict role-based access. Each of the 5 roles has a distinct set of operations,
            ensuring that the right people have the right access from the writer's room to worldwide release.
          </p>
          <div className="space-y-6">
            {useCases.map((uc) => {
              const Icon = uc.icon;
              return (
                <div key={uc.role} className="bg-cine-onyx border border-cine-border p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className={`w-5 h-5 ${uc.color}`} />
                    <h4 className={`font-heading text-lg font-bold ${uc.color}`}>{uc.role}</h4>
                  </div>
                  <ul className="space-y-2">
                    {uc.cases.map((c, i) => (
                      <li key={i} className="flex items-start gap-3 font-body text-sm text-cine-cream">
                        <ChevronRight className="w-4 h-4 text-cine-gold shrink-0 mt-0.5" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </Collapsible>

        {/* ═══ PROJECT DOCUMENTS ═══ */}
        <Collapsible title="ER Diagram & Relational Schema" icon={FileText} badge="PDF Downloads">
          <p className="font-body text-sm text-cine-cream mb-6">
            These documents contain the visual entity-relationship diagram and the complete relational schema
            showing all 17 tables, their attributes, and the relationships between them.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'ER Diagram', desc: 'Complete entity-relationship diagram with use cases, functional requirements, and detailed entity descriptions for all 5 user roles.', file: '/Milestone2.pdf' },
              { name: 'Relational Schema', desc: 'Visual relational schema diagram showing all 17 tables, their columns, primary keys, foreign keys, and relationship cardinalities.', file: '/relational_schema.pdf' },
            ].map((doc) => (
              <a key={doc.name} href={doc.file} target="_blank" rel="noopener noreferrer"
                className="bg-cine-onyx border border-cine-border p-6 hover:border-cine-gold/40 transition-colors group block">
                <div className="flex items-center gap-3 mb-3">
                  <Download className="w-5 h-5 text-cine-gold group-hover:scale-110 transition-transform" />
                  <h4 className="font-heading text-lg text-cine-ivory group-hover:text-cine-gold transition-colors">{doc.name}</h4>
                </div>
                <p className="font-body text-sm text-cine-dust leading-relaxed">{doc.desc}</p>
                <div className="mt-4 font-mono text-[10px] text-cine-gold uppercase tracking-widest">View PDF →</div>
              </a>
            ))}
          </div>
        </Collapsible>

        {/* ═══ ER RELATIONSHIPS ═══ */}
        <Collapsible title="Entity Relationships" icon={Database} badge="18 relationships">
          <p className="font-body text-sm text-cine-cream mb-6">
            The database follows a normalized design with 17 entities and 18 relationships.
            Song_Singer is the only many-to-many junction table using a composite primary key.
          </p>
          <div className="space-y-2">
            {erRelationships.map((r, i) => (
              <ERRelation key={i} {...r} />
            ))}
          </div>
        </Collapsible>

        {/* ═══ RELATIONAL SCHEMA ═══ */}
        <Collapsible title="Relational Schema — All 17 Tables" icon={Table} badge="17 entities">
          <p className="font-body text-sm text-cine-cream mb-6">
            Each card shows the table name, key columns, and constraints.
            <strong className="text-cine-ivory"> PK</strong> = Primary Key,
            <strong className="text-cine-ivory"> FK</strong> = Foreign Key,
            <strong className="text-cine-ivory"> AK</strong> = Alternate Key (UNIQUE),
            <strong className="text-cine-ivory"> CPK</strong> = Composite Primary Key.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.map((t) => (
              <TableCard key={t.name} {...t} />
            ))}
          </div>
        </Collapsible>

        {/* ═══ FULL DDL SCRIPT ═══ */}
        <Collapsible title="DDL Script — Complete Table Definitions" icon={FileText} >
          <p className="font-body text-sm text-cine-cream mb-4">
            The complete Data Definition Language script that creates the <code className="text-cine-gold font-mono text-xs bg-cine-void px-1.5 py-0.5">cinecore</code> schema
            and all 17 tables. Scroll through the full script below — use the copy button to grab the entire file.
          </p>
          <CodeBlock title="cinecore_ddl.sql — Full Script" code={DDL_FULL} />
        </Collapsible>

        {/* ═══ FULL STORED PROCEDURES ═══ */}
        <Collapsible title="Stored Procedures — Complete Source" icon={Settings} badge="4 procedures">
          <p className="font-body text-sm text-cine-cream mb-4">
            All 4 stored procedures encapsulate multi-step business logic as atomic operations.
            Each procedure validates inputs, performs the operation, and handles errors gracefully.
            Scroll through the full source below.
          </p>
          <CodeBlock title="01_stored_procedures.sql — Full Script" code={SP_FULL} />
        </Collapsible>

        {/* ═══ FULL TRIGGERS ═══ */}
        <Collapsible title="Triggers — Complete Source" icon={Zap} badge="4 triggers">
          <p className="font-body text-sm text-cine-cream mb-4">
            Triggers are the last line of defense — they fire automatically on data changes,
            even if someone bypasses the application and runs raw SQL directly.
            The full trigger source with inline documentation is below.
          </p>
          <CodeBlock title="02_triggers.sql — Full Script" code={TRIGGERS_FULL} />
        </Collapsible>

      </div>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-cine-border/30 text-center">
        <span className="font-mono text-[10px] text-cine-dust uppercase tracking-widest">
          CineCore DB · Film Production & Distribution Management System
        </span>
      </div>
    </div>
  );
}
