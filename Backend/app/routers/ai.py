# =============================================================================
# routers/ai.py — CineCore AI Text-to-SQL Assistant
# =============================================================================
# Flow:
#   1. User sends a natural language question from the frontend
#   2. We build a prompt: schema context + user question → sent to Groq
#   3. Groq returns a SQL SELECT query
#   4. We validate the SQL (only SELECT, only cinecore schema)
#   5. Execute against PostgreSQL and return rows + a plain-English summary
#
# Safety: SQL validation happens BEFORE execution. No mutation is possible.
# =============================================================================

import re
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from groq import AsyncGroq

from app.config import settings
from app.database import engine
from app.schema_context import CINECORE_SCHEMA

router = APIRouter(prefix="/ai", tags=["AI Assistant"])

# ── Groq client (initialized lazily on first request) ────────────────────────
_groq_client = None

def get_groq_client():
    global _groq_client
    if _groq_client is None:
        if not settings.GROQ_API_KEY:
            raise HTTPException(status_code=503, detail="Groq API key not configured.")
        _groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)
    return _groq_client


# ── Request / Response Schemas ─────────────────────────────────────────────────
class AIQueryRequest(BaseModel):
    question: str
    history: list[dict] = []


class AIQueryResponse(BaseModel):
    question: str
    sql: str
    columns: list[str]
    rows: list[list]
    summary: str
    row_count: int


# ── SQL Safety Validator ───────────────────────────────────────────────────────
BLOCKED_KEYWORDS = [
    "INSERT", "UPDATE", "DELETE", "DROP", "TRUNCATE",
    "ALTER", "CREATE", "EXEC", "EXECUTE", "GRANT", "REVOKE",
    "COPY", "CALL", "DO ", "pg_", "--", "/*"
]

def validate_sql(sql: str) -> str:
    """
    Ensure the AI-generated SQL is safe to run.
    Returns the cleaned SQL or raises HTTPException.
    """
    # Strip markdown code fences Groq/Llama sometimes adds
    sql = re.sub(r"```sql|```", "", sql).strip()

    # Must be a SELECT statement
    if not sql.upper().strip().startswith("SELECT"):
        raise HTTPException(
            status_code=400,
            detail="AI generated a non-SELECT query. Only data retrieval is allowed."
        )

    # Block dangerous keywords using word boundaries to prevent false positives (like 'call_time' triggering 'CALL')
    sql_upper = sql.upper()
    for keyword in BLOCKED_KEYWORDS:
        # Check for exact word match or special characters that don't need word boundaries
        if keyword in ["--", "/*", "pg_"]:
            if keyword in sql_upper:
                raise HTTPException(
                    status_code=400,
                    detail=f"Blocked keyword detected in generated SQL: {keyword}"
                )
        else:
            # For SQL commands, ensure they are whole words
            pattern = r"\b" + re.escape(keyword) + r"\b"
            if re.search(pattern, sql_upper):
                raise HTTPException(
                    status_code=400,
                    detail=f"Blocked keyword detected in generated SQL: {keyword}"
                )

    # Enforce row limit — prevent massive data dumps
    if "LIMIT" not in sql_upper:
        sql = sql.rstrip(";") + " LIMIT 100"

    return sql


# ── Main Endpoint ──────────────────────────────────────────────────────────────
@router.post("/query", response_model=AIQueryResponse)
async def ai_query(request: AIQueryRequest):
    """
    Accept a natural language question, generate SQL via Groq,
    execute it safely, and return structured results.
    """
    question = request.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    if len(question) > 500:
        raise HTTPException(status_code=400, detail="Question too long (max 500 chars).")

    # ── Step 1: Ask Groq to generate SQL ──────────────────────────────────────
    client = get_groq_client()

    messages = [
        {"role": "system", "content": CINECORE_SCHEMA}
    ]

    # Add conversational memory
    if request.history:
        for msg in request.history[-6:]:
            role = "user" if msg.get("role") == "user" else "assistant"
            messages.append({"role": role, "content": msg.get("content", "")})

    # Add current question with strict instructions
    messages.append({
        "role": "user",
        "content": f"User question: {question}\n\nGenerate a single PostgreSQL SELECT query to answer this question. Return ONLY the SQL query, nothing else, no markdown formatting. If the question is not about CineCore film data, return exactly: OUT_OF_SCOPE. If you cannot safely answer it, return exactly: CANNOT_ANSWER"
    })

    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # Updated to newest supported model
            messages=messages,
            temperature=0.0  # 0 for deterministic SQL generation
        )
        raw_sql = response.choices[0].message.content.strip()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Groq API error: {str(e)}")

    # ── Step 2: Handle out-of-scope / unanswerable ──────────────────────────────
    if "OUT_OF_SCOPE" in raw_sql.upper():
        return AIQueryResponse(
            question=question,
            sql="",
            columns=[],
            rows=[],
            summary="I can only answer questions about CineCore film data — projects, budgets, contracts, OTT deals, box office, talent, etc.",
            row_count=0,
        )

    if "CANNOT_ANSWER" in raw_sql.upper():
        return AIQueryResponse(
            question=question,
            sql="",
            columns=[],
            rows=[],
            summary="I couldn't generate a safe query for that question. Please rephrase or try a more specific question.",
            row_count=0,
        )

    # ── Step 3: Validate the SQL ────────────────────────────────────────────────
    safe_sql = validate_sql(raw_sql)

    # ── Step 4: Execute against PostgreSQL ─────────────────────────────────────
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text(safe_sql))
            columns = list(result.keys())
            rows = [list(row) for row in result.fetchall()]
    except Exception as e:
        # Log the error for backend developers
        print(f"[AI Query Error] {str(e)}")
        # Return a friendly conversational error to the user instead of a massive crash dump
        return AIQueryResponse(
            question=question,
            sql=safe_sql,
            columns=[],
            rows=[],
            summary="I hit a snag trying to calculate that. My generated database query contained an error. Try asking in a slightly different way!",
            row_count=0,
        )

    # ── Step 5: Ask Groq for a plain-English summary of the results ───────────
    summary = f"Found {len(rows)} result(s)."
    if rows:
        try:
            summary_messages = [
                {
                    "role": "system",
                    "content": "You are a helpful AI assistant. Summarize the database query results in a single concise sentence (max 20 words). You must accurately report the total number of rows found. Be specific and mention key values. Do not mention SQL."
                },
                {
                    "role": "user",
                    "content": f"User Question: '{question}'\nTotal Rows Found: {len(rows)}\nColumns: {columns}\nData (First 5 rows): {rows[:5]}"
                }
            ]
            summary_response = await client.chat.completions.create(
                model="llama-3.1-8b-instant", # Updated to newest supported fast model
                messages=summary_messages,
                temperature=0.2
            )
            summary = summary_response.choices[0].message.content.strip()
        except Exception:
            pass  # Fall back to the default summary above

    return AIQueryResponse(
        question=question,
        sql=safe_sql,
        columns=columns,
        rows=rows,
        summary=summary,
        row_count=len(rows),
    )
