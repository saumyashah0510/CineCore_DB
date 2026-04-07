from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db

router = APIRouter(prefix="/production", tags=["Production"])

@router.get("/dashboard-stats")
async def get_production_stats(db: AsyncSession = Depends(get_db)):
    """Fetches real-time daily stats exactly matching the DDL schema."""
    try:
        result = await db.execute(text("""
            SELECT 
                -- 1. Active Units (Matches Project Status)
                (SELECT COUNT(*) FROM cinecore.project WHERE status = 'SHOOTING')::int AS active_units,
                
                -- 2. Call Times Today (Matches schedule_date)
                (SELECT COUNT(*) FROM cinecore.shoot_schedule WHERE schedule_date = CURRENT_DATE)::int AS scheduled_today,
                
                -- 3. Pending Permits (Matches Permit Status 'APPLIED')
                (SELECT COUNT(*) FROM cinecore.permit WHERE status = 'APPLIED')::int AS pending_permits,
                
                -- 4. Weather / Delays (Matches delay_reason and POSTPONED status)
                (SELECT COUNT(*) FROM cinecore.shoot_schedule 
                 WHERE schedule_date = CURRENT_DATE 
                 AND (delay_reason IS NOT NULL OR status = 'POSTPONED'))::int AS weather_alerts
        """))
        
        row = result.mappings().first()
        return dict(row) if row else {
            "active_units": 0, "scheduled_today": 0, "pending_permits": 0, "weather_alerts": 0
        }
    except Exception as e:
        # Added a print statement so you can see in your terminal if any other SQL error happens
        print(f"🔥 Error fetching production stats: {e}")
        return {"active_units": 0, "scheduled_today": 0, "pending_permits": 0, "weather_alerts": 0}