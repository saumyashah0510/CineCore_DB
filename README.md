
# cinecore/

│
├── backend/
│   ├── .env.example                      # Template — copy to .env and fill credentials
│   ├── requirements.txt                  # All Python dependencies
│   ├── run.py                            # Entry point: python run.py
│   │
│   └── app/
│       ├── __init__.py
│       ├── main.py                       # FastAPI app, CORS, router registration, lifespan
│       ├── config.py                     # Reads .env → typed Settings object
│       ├── database.py                   # Async SQLAlchemy engine + get_db() dependency
│       ├── redis_client.py               # Redis connection + cache_get/set/delete helpers
│       ├── dependencies.py               # Shared deps: get_redis(), require_role()
│       │
│       ├── models/                       # SQLAlchemy ORM — maps Python classes to DB tables
│       │   ├── __init__.py
│       │   ├── production_house.py       # ProductionHouse
│       │   ├── project.py                # Project
│       │   ├── person.py                 # Person
│       │   ├── contract.py               # Contract, PaymentMilestone, BudgetHead, Expense
│       │   ├── song.py                   # Song, ProductionVendor
│       │   └── distribution.py           # OTTPlatform, OTTDeal, TheatreRelease
│       │
│       ├── schemas/                      # Pydantic — defines API request/response shapes
│       │   ├── __init__.py
│       │   └── project.py                # All schemas: Project, Contract, Expense, Person,
│       │                                 # PersonCreate, Analytics responses etc.
│       │
│       └── routers/                      # One file per domain — actual API endpoints
│           ├── __init__.py
│           ├── projects.py               # GET/POST /projects, /projects/{id}/budget
│           ├── contracts.py              # GET/POST /contracts, milestones
│           ├── expenses.py               # POST /expenses, PATCH approve
│           ├── persons.py                # GET/POST /persons, person contracts
│           └── analytics.py             # /analytics/dashboard, box-office, OTT, overdue
│
└── db/                                   # All SQL scripts (already done)
    ├── 01_stored_procedures.sql
    ├── 02_triggers.sql
    ├── insert_01_houses_and_people.sql
    ├── insert_02_projects_via_procedure.sql
    ├── insert_03_scripts_and_status_updates.sql
    ├── insert_04_contracts_via_procedure.sql
    ├── insert_05_locations_schedules_permits.sql
    ├── insert_06_expenses_trigger_test.sql
    ├── insert_06b_overspend_test.sql
    └── insert_07_songs_ott_theatre_finalize.sql
