from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.redis_client import cache_get, cache_set, CACHE_TTL_MEDIUM
from app.schemas.analytics import DashboardStats, OverduePayment, BoxOfficeRow, OTTDealRow, HouseStats

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    """Top-level KPIs. Every role sees this on login."""
    cache_key = "analytics:dashboard"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    result = await db.execute(text("""
        SELECT
            (SELECT COUNT(*) FROM cinecore.project)                                          AS total_projects,
            (SELECT COUNT(*) FROM cinecore.project WHERE status = 'SHOOTING')                AS projects_shooting,
            (SELECT COUNT(*) FROM cinecore.project WHERE status = 'RELEASED')                AS projects_released,
            (SELECT COUNT(*) FROM cinecore.contract WHERE status = 'ACTIVE')                 AS active_contracts,
            (SELECT COUNT(*) FROM cinecore.payment_milestone WHERE payment_status = 'OVERDUE') AS overdue_payments,
            (SELECT COUNT(*) FROM cinecore.budget_head WHERE overspent_flag = TRUE)          AS overspent_heads,
            (SELECT COALESCE(SUM(total_collection), 0) FROM cinecore.theatre_release)        AS total_box_office,
            (SELECT COALESCE(SUM(license_fee), 0)      FROM cinecore.ott_deal)               AS total_ott_revenue
    """))
    data = dict(result.mappings().first())
    await cache_set(cache_key, data, CACHE_TTL_MEDIUM)
    return data


@router.get("/box-office", response_model=list[BoxOfficeRow])
async def get_box_office(db: AsyncSession = Depends(get_db)):
    """Theatre collection breakdown. Public/Audience view."""
    cache_key = "analytics:box-office"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    result = await db.execute(text("""
        SELECT
            p.title,
            tr.city,
            tr.theatre_chain,
            tr.no_of_screens,
            tr.release_date,
            tr.opening_weekend_collection,
            tr.total_collection,
            tr.weeks_running
        FROM cinecore.theatre_release tr
        JOIN cinecore.project p ON p.project_id = tr.project_id
        ORDER BY tr.total_collection DESC NULLS LAST
    """))
    data = [dict(r) for r in result.mappings().all()]
    await cache_set(cache_key, data, CACHE_TTL_MEDIUM)
    return data


@router.get("/ott-deals", response_model=list[OTTDealRow])
async def get_ott_summary(db: AsyncSession = Depends(get_db)):
    """All OTT deals with platform info."""
    cache_key = "analytics:ott-deals"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    result = await db.execute(text("""
        SELECT
            p.title         AS project_title,
            op.name         AS platform,
            od.deal_type,
            od.territory,
            od.license_fee,
            od.streaming_start_date,
            od.deal_expiry_date
        FROM cinecore.ott_deal od
        JOIN cinecore.project p       ON p.project_id  = od.project_id
        JOIN cinecore.ott_platform op ON op.ott_id     = od.platform_id
        ORDER BY od.license_fee DESC NULLS LAST
    """))
    data = [dict(r) for r in result.mappings().all()]
    await cache_set(cache_key, data, CACHE_TTL_MEDIUM)
    return data


@router.get("/overdue-payments", response_model=list[OverduePayment])
async def get_all_overdue_payments(db: AsyncSession = Depends(get_db)):
    """All overdue payments across all projects. Finance Manager view."""
    result = await db.execute(text("""
        SELECT
            pm.milestone_id,
            per.full_name                         AS person_name,
            pr.title                              AS project_title,
            pm.milestone_name,
            pm.amount,
            pm.due_date,
            (CURRENT_DATE - pm.due_date)::int     AS days_overdue
        FROM cinecore.payment_milestone pm
        JOIN cinecore.contract c   ON c.contract_id = pm.contract_id
        JOIN cinecore.person per   ON per.person_id  = c.person_id
        JOIN cinecore.project pr   ON pr.project_id  = c.project_id
        WHERE pm.payment_status = 'OVERDUE'
        ORDER BY pm.due_date ASC
    """))
    return [dict(r) for r in result.mappings().all()]


@router.get("/production-houses", response_model=list[HouseStats])
async def get_house_stats(db: AsyncSession = Depends(get_db)):
    """Revenue breakdown per production house."""
    cache_key = "analytics:houses"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    result = await db.execute(text("""
        SELECT
            ph.house_id,
            ph.name,
            ph.headquarter_city,
            COUNT(DISTINCT p.project_id)                                    AS total_projects,
            COUNT(DISTINCT p.project_id) FILTER (WHERE p.status='RELEASED') AS released,
            COALESCE(SUM(tr.total_collection), 0)                           AS total_box_office,
            COALESCE(SUM(od.license_fee), 0)                                AS total_ott_revenue
        FROM cinecore.production_house ph
        LEFT JOIN cinecore.project p          ON p.house_id    = ph.house_id
        LEFT JOIN cinecore.theatre_release tr ON tr.project_id = p.project_id
        LEFT JOIN cinecore.ott_deal od        ON od.project_id = p.project_id
        GROUP BY ph.house_id, ph.name, ph.headquarter_city
        ORDER BY total_box_office DESC
    """))
    data = [dict(r) for r in result.mappings().all()]
    await cache_set(cache_key, data, CACHE_TTL_MEDIUM)
    return data


@router.get("/budget-health")
async def get_budget_health(db: AsyncSession = Depends(get_db)):
    """
    All budget heads across all active projects with spend vs allocation.
    Finance Manager dashboard widget.
    """
    result = await db.execute(text("""
        SELECT
            p.project_id,
            p.title                              AS project_title,
            p.status                             AS project_status,
            bh.budget_head_id,
            bh.category_name,
            bh.allocated_amount,
            COALESCE(SUM(e.amount) FILTER (WHERE e.status IN ('APPROVED','PAID')), 0)
                                                 AS total_spent,
            bh.overspent_flag,
            ROUND(
                COALESCE(SUM(e.amount) FILTER (WHERE e.status IN ('APPROVED','PAID')), 0)
                / NULLIF(bh.allocated_amount, 0) * 100, 1
            )                                    AS spend_percent
        FROM cinecore.budget_head bh
        JOIN cinecore.project p ON p.project_id = bh.project_id
        LEFT JOIN cinecore.expense e ON e.budget_head_id = bh.budget_head_id
        WHERE p.status NOT IN ('SHELVED', 'RELEASED')
        GROUP BY p.project_id, p.title, p.status,
                 bh.budget_head_id, bh.category_name,
                 bh.allocated_amount, bh.overspent_flag
        ORDER BY bh.overspent_flag DESC, spend_percent DESC
    """))
    return [dict(r) for r in result.mappings().all()]


@router.get("/shoot-calendar")
async def get_shoot_calendar(db: AsyncSession = Depends(get_db)):
    """
    Upcoming shoot schedules across all projects.
    Production Manager view — shows what's shooting where and when.
    """
    result = await db.execute(text("""
        SELECT
            ss.schedule_id,
            p.title          AS project_title,
            l.location_name,
            l.city,
            ss.schedule_date,
            ss.call_time,
            ss.scene_nos,
            ss.status,
            ss.director_notes
        FROM cinecore.shoot_schedule ss
        JOIN cinecore.project p  ON p.project_id   = ss.project_id
        JOIN cinecore.location l ON l.location_id  = ss.location_id
        WHERE ss.status NOT IN ('CANCELLED','COMPLETED')
        ORDER BY ss.schedule_date, ss.call_time
    """))
    return [dict(r) for r in result.mappings().all()]